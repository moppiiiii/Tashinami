import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { ja } from "react-day-picker/locale";

import { cn } from "@/lib/utils";

// shadcn と同じ react-day-picker を土台に、配色だけ墨×琥珀に置き換えたカレンダー。
// shadcn 既定のトークン（bg-primary など）は明るいパレットなので、この画面では使わない。
//
// 書体はフォームの入力欄（銘柄・カテゴリ）と同じゴシックに揃える。
// Portal で body 直下に出るため .tashinami-lp の font-family を継承しない。明示的に当てる。
// 見出しを「2025年7月」、曜日を「日月火」にすると和欧が混ざって落ち着かないので、
// 見出しは 2025.7、曜日は頭文字にして数字と記号だけで通す。
const WEEKDAY_INITIALS = ["S", "M", "T", "W", "T", "F", "S"];

export function Calendar({
  className,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      locale={ja}
      showOutsideDays
      className={cn("font-jp-sans text-rice p-3 tabular-nums", className)}
      formatters={{
        formatCaption: (month) =>
          `${month.getFullYear()}.${month.getMonth() + 1}`,
        formatWeekdayName: (weekday) => WEEKDAY_INITIALS[weekday.getDay()],
      }}
      classNames={{
        months: "flex flex-col gap-4",
        month: "flex flex-col gap-3",
        month_caption: "flex h-8 items-center justify-center",
        caption_label: "text-sm font-semibold tracking-[0.06em]",
        nav: "flex items-center justify-between absolute inset-x-3 top-3 h-8",
        button_previous:
          "inline-flex size-7 items-center justify-center rounded-full border border-ink-line text-rice-dim transition-colors hover:border-[rgba(207,146,71,0.5)] hover:text-amber-bright disabled:opacity-30",
        button_next:
          "inline-flex size-7 items-center justify-center rounded-full border border-ink-line text-rice-dim transition-colors hover:border-[rgba(207,146,71,0.5)] hover:text-amber-bright disabled:opacity-30",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "text-rice-dim w-9 text-[0.68rem] font-semibold tracking-[0.14em]",
        week: "mt-1 flex w-full",
        day: "size-9 p-0 text-center",
        day_button:
          "inline-flex size-9 items-center justify-center rounded-full text-sm transition-colors hover:bg-[rgba(207,146,71,0.12)] hover:text-amber-bright focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-bright",
        selected:
          "[&>button]:bg-linear-to-b [&>button]:from-amber-bright [&>button]:to-amber [&>button]:font-bold [&>button]:text-[#1a1109] [&>button]:hover:text-[#1a1109]",
        today: "[&>button]:text-amber-bright [&>button]:font-bold",
        outside: "[&>button]:text-rice-dim [&>button]:opacity-40",
        disabled: "[&>button]:opacity-30",
        hidden: "invisible",
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft size={14} />
          ) : (
            <ChevronRight size={14} />
          ),
      }}
      {...props}
    />
  );
}
