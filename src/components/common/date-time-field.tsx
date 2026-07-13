import { CalendarDays, Clock } from "lucide-react";
import { Popover } from "radix-ui";
import { useEffect, useRef, useState } from "react";

import { Calendar } from "@/components/common/calendar";
import { toJstInput } from "@/lib/date";
import { cn } from "@/lib/utils";

// 値は datetime-local と同じ "YYYY-MM-DDTHH:mm"（ローカル時刻）で受け渡す。
const pad = (n: number) => String(n).padStart(2, "0");

function toValue(date: Date, time: string): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${time}`;
}

function parse(value: string): { date: Date | undefined; time: string } {
  const [d, t] = value.split("T");
  const date = d ? new Date(`${d}T00:00:00`) : undefined;
  return {
    date: date && !Number.isNaN(date.getTime()) ? date : undefined,
    time: t?.slice(0, 5) || "00:00",
  };
}

const dateLabel = (date: Date) =>
  `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;

// 銘柄・カテゴリの入力欄と同じゴシック。数字は等幅で桁を揃える。
const trigger =
  "font-jp-sans flex items-center gap-2 rounded-xl border border-ink-line bg-white/[0.04] px-[0.9rem] py-[0.7rem] text-[0.95rem] text-rice tabular-nums transition-[border-color,box-shadow,background] duration-150 hover:border-[rgba(207,146,71,0.5)] focus-visible:border-[rgba(207,146,71,0.6)] focus-visible:bg-white/[0.06] focus-visible:shadow-[0_0_0_3px_rgba(207,146,71,0.18)] focus-visible:outline-none";

// Portal は .tashinami-lp の外に出るので、書体と地色をここで与える。
const popover =
  "font-jp-sans bg-ink-raise animate-lp-pop-in z-50 rounded-2xl border border-[rgba(207,146,71,0.28)] shadow-[0_18px_40px_rgba(0,0,0,0.5)]";

const HOURS = Array.from({ length: 24 }, (_, i) => pad(i));
const MINUTES = Array.from({ length: 60 }, (_, i) => pad(i));

export function DateTimeField({
  id,
  name,
  value,
  onBlur,
  onChange,
}: {
  id?: string;
  name?: string;
  /** "YYYY-MM-DDTHH:mm" */
  value: string;
  onBlur?: () => void;
  onChange: (value: string) => void;
}) {
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const { date, time } = parse(value);
  const [hh, mm] = time.split(":");

  // 日付未選択のまま時刻だけ触られたら、今日（日本時間）を補う。
  const setTime = (next: string) =>
    onChange(
      date ? toValue(date, next) : `${toJstInput().slice(0, 10)}T${next}`,
    );

  return (
    <div className="flex gap-2">
      <Popover.Root open={dateOpen} onOpenChange={setDateOpen}>
        <Popover.Trigger
          id={id}
          name={name}
          type="button"
          onBlur={onBlur}
          className={cn(trigger, "flex-1 text-left")}
        >
          <CalendarDays size={15} className="text-rice-dim shrink-0" />
          {date ? dateLabel(date) : "日付を選ぶ"}
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content align="start" sideOffset={8} className={popover}>
            <Calendar
              mode="single"
              selected={date}
              defaultMonth={date}
              onSelect={(next) => {
                if (!next) return;
                onChange(toValue(next, time));
                setDateOpen(false);
              }}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <Popover.Root open={timeOpen} onOpenChange={setTimeOpen}>
        <Popover.Trigger
          type="button"
          aria-label="時刻"
          onBlur={onBlur}
          className={trigger}
        >
          <Clock size={15} className="text-rice-dim shrink-0" />
          {time}
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content align="end" sideOffset={8} className={popover}>
            <div className="flex h-56 gap-1 p-2">
              <TimeColumn
                label="時"
                values={HOURS}
                selected={hh}
                onSelect={(h) => setTime(`${h}:${mm}`)}
              />
              <div className="bg-ink-line w-px" />
              <TimeColumn
                label="分"
                values={MINUTES}
                selected={mm}
                onSelect={(m) => {
                  setTime(`${hh}:${m}`);
                  setTimeOpen(false);
                }}
              />
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}

function TimeColumn({
  label,
  values,
  selected,
  onSelect,
}: {
  label: string;
  values: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // 開いた瞬間に現在値を中央へ。scrollIntoView は祖先まで巻き込んでページごと飛ぶので、
  // この列の scrollTop だけを動かす。
  useEffect(() => {
    const list = ref.current;
    const current = list?.querySelector<HTMLElement>('[data-selected="true"]');
    if (!list || !current) return;
    list.scrollTop =
      current.offsetTop - list.clientHeight / 2 + current.clientHeight / 2;
  }, []);

  return (
    <div className="flex flex-col">
      <span className="text-rice-dim px-2 pb-1 text-center text-[0.62rem] font-semibold tracking-[0.14em]">
        {label}
      </span>
      <div
        ref={ref}
        className="flex-1 [scrollbar-width:none] overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:hidden"
      >
        {values.map((v) => (
          <button
            key={v}
            type="button"
            data-selected={v === selected}
            onClick={() => onSelect(v)}
            className={cn(
              "block w-12 rounded-lg py-1.5 text-center text-sm tabular-nums transition-colors",
              v === selected
                ? "from-amber-bright to-amber bg-linear-to-b font-bold text-[#1a1109]"
                : "text-rice hover:text-amber-bright hover:bg-[rgba(207,146,71,0.12)]",
            )}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}
