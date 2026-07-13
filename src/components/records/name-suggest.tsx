import {
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { DrinkImage } from "@/components/zukan/drink-image";
import {
  type Encounter,
  findEncounter,
  searchEncounters,
} from "@/components/zukan/encounters";
import type { Category } from "@/schemas/categories";

// 「前回 2.14」。年は出さない（棚の話に西暦は要らない）。
function formatLast(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getMonth() + 1}.${d.getDate()}`;
}

// 銘柄の入力欄。打ちながら「もう出会っているか」が分かるのが仕事。
// 既知の銘柄を候補に出し、選べば綴りとカテゴリごと引き継ぐ（＝図鑑が割れない）。
// 候補にはあいまい一致（打ち間違い）も混ぜるが、保存は止めない。
// 打ち間違いに気づく機会をここで一度だけ差し出し、選ぶかどうかは本人に委ねる。
export function NameSuggest({
  id,
  name,
  value,
  invalid,
  isEdit,
  encounters,
  categories,
  onChange,
  onBlur,
  onPick,
  error,
}: {
  id: string;
  name: string;
  value: string;
  invalid: boolean;
  /** 編集モード。既知＝「別の記録と重なる」の意味になり、初対面の案内は出さない。 */
  isEdit: boolean;
  encounters: Encounter[];
  categories: Category[];
  onChange: (value: string) => void;
  onBlur: () => void;
  /** 候補を選んだとき。綴りとカテゴリをフォームへ流し込む。 */
  onPick: (encounter: Encounter) => void;
  /** 検証エラーの表示（フォーム側の FieldError をそのまま受ける）。 */
  error?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  // -1＝どれも選んでいない。矢印キーで動かしたときだけ Enter で確定させる
  // （新しい銘柄を打ち切って Enter したとき、候補に化けてしまわないように）。
  const [active, setActive] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const options = useMemo(
    () => searchEncounters(value, encounters),
    [value, encounters],
  );
  const known = useMemo(
    () => findEncounter(value, encounters),
    [value, encounters],
  );
  const slugById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) map.set(c.id, c.slug);
    return map;
  }, [categories]);

  // 外側に触れたら閉じる。
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const expanded = open && options.length > 0;

  const pick = (encounter: Encounter) => {
    onPick(encounter);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setActive((i) => Math.min(i + 1, options.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
      return;
    }
    if (e.key === "Enter" && expanded && active >= 0) {
      const option = options[active];
      if (option) {
        e.preventDefault(); // 候補の確定であって、フォームの送信ではない。
        pick(option);
      }
      return;
    }
    if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
      setActive(-1);
    }
  };

  return (
    <div ref={rootRef} className="lp-field relative sm:col-span-2">
      <label htmlFor={id} className="lp-label">
        銘柄・名前
      </label>

      <input
        id={id}
        name={name}
        className="lp-input"
        placeholder="例：シャブリ プルミエ・クリュ"
        value={value}
        role="combobox"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        aria-invalid={invalid}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      />

      {expanded ? (
        <div className="lp-pop absolute top-full right-0 left-0 z-20 mt-2">
          <p className="lp-eyebrow px-3 pt-3 pb-2">
            {value.trim() ? "この銘柄では？" : "最近の一杯"}
          </p>
          <ul
            id={listId}
            role="listbox"
            aria-label="記録済みの銘柄"
            className="pb-2"
          >
            {options.map((e, i) => (
              <li
                key={e.key}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                className={`lp-option ${i === active ? "is-active" : ""}`}
                // click では blur が先に走って閉じてしまうので pointerdown で受ける。
                onPointerDown={(ev) => {
                  ev.preventDefault();
                  pick(e);
                }}
                onPointerEnter={() => setActive(i)}
              >
                <DrinkImage
                  slug={(e.categoryId && slugById.get(e.categoryId)) || null}
                  size={34}
                  glow={false}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{e.name}</span>
                  <span className="lp-dim block truncate text-[11px]">
                    {e.categoryName ?? "未分類"} ・ {e.count}杯
                  </span>
                </span>
                <span className="lp-latin lp-dim shrink-0 text-[11px] tabular-nums">
                  前回 {formatLast(e.lastAt)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {error}

      {/* 打っている今、それが初対面なのか再会なのかを、その場で返す。
          編集中は「この一杯」自身を数から除いてあるので、既知＝別の記録と重なるということ。 */}
      {invalid ? null : value.trim() ? (
        known ? (
          <p className="mt-0.5">
            <span className="lp-chip">
              記録済み ・{" "}
              {isEdit
                ? "この銘柄に重なります"
                : `${known.count + 1}杯目になります`}
            </span>
          </p>
        ) : isEdit ? null : (
          <p className="lp-dim mt-0.5 text-xs">
            はじめての銘柄です — 図鑑に新しく灯ります。
          </p>
        )
      ) : null}
    </div>
  );
}
