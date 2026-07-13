import { type ReactNode, useMemo } from "react";

import { Chip } from "@/components/common/chip";
import { Field, Label } from "@/components/common/field";
import { Input } from "@/components/common/input";
import { DrinkImage } from "@/components/zukan/drink-image";
import {
  type Encounter,
  findEncounter,
  searchEncounters,
} from "@/components/zukan/encounters";
import { formatJstMonthDay } from "@/lib/date";
import type { Category } from "@/schemas/categories";

import { useSuggestBox } from "./use-suggest-box";

// 既知の銘柄を候補に出し、選べば綴りとカテゴリごと引き継ぐ（＝図鑑が割れない）。
// あいまい一致も候補に混ぜるが、保存は止めない。
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
  /** 編集モード。初対面の案内は出さない。 */
  isEdit: boolean;
  encounters: Encounter[];
  categories: Category[];
  onChange: (value: string) => void;
  onBlur: () => void;
  /** 候補を選んだとき。 */
  onPick: (encounter: Encounter) => void;
  /** 検証エラーの表示。 */
  error?: ReactNode;
}) {
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

  const box = useSuggestBox(options, onPick);

  return (
    <Field ref={box.rootRef} className="relative sm:col-span-2">
      <Label htmlFor={id}>銘柄・名前</Label>

      <Input
        id={id}
        name={name}
        placeholder="例：シャブリ プルミエ・クリュ"
        value={value}
        {...box.inputProps}
        aria-invalid={invalid}
        onChange={(e) => {
          onChange(e.target.value);
          box.onInput();
        }}
        onBlur={onBlur}
      />

      {box.expanded ? (
        <div className="lp-pop absolute top-full right-0 left-0 z-20 mt-2">
          <p className="text-rice-dim px-3 pt-3 pb-2 text-[0.68rem] font-bold tracking-[0.28em] uppercase">
            {value.trim() ? "この銘柄では？" : "最近の一杯"}
          </p>
          <ul
            id={box.listId}
            role="listbox"
            aria-label="記録済みの銘柄"
            className="pb-2"
          >
            {options.map((e, i) => (
              <li
                key={e.key}
                id={`${box.listId}-${i}`}
                role="option"
                aria-selected={i === box.active}
                className={`lp-option ${i === box.active ? "is-active" : ""}`}
                // click では blur が先に走って閉じてしまうので pointerdown で受ける。
                onPointerDown={(ev) => {
                  ev.preventDefault();
                  box.pick(e);
                }}
                onPointerEnter={() => box.setActive(i)}
              >
                <DrinkImage
                  slug={(e.categoryId && slugById.get(e.categoryId)) || null}
                  size={34}
                  glow={false}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{e.name}</span>
                  <span className="text-rice-dim block truncate text-[11px]">
                    {e.categoryName ?? "未分類"} ・ {e.count}杯
                  </span>
                </span>
                <span className="font-latin text-rice-dim shrink-0 text-[11px] tabular-nums">
                  前回 {formatJstMonthDay(e.lastAt)}
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
            <Chip>
              記録済み ・{" "}
              {isEdit
                ? "この銘柄に重なります"
                : `${known.count + 1}杯目になります`}
            </Chip>
          </p>
        ) : isEdit ? null : (
          <p className="text-rice-dim mt-0.5 text-xs">
            はじめての銘柄です — 図鑑に新しく灯ります。
          </p>
        )
      ) : null}
    </Field>
  );
}
