import { MapPin } from "lucide-react";
import { useMemo } from "react";

import { Field, Label } from "@/components/common/field";
import { Input } from "@/components/common/input";
import { formatJstMonthDay } from "@/lib/date";

import { type Place, searchPlaces } from "./places";
import { useSuggestBox } from "./use-suggest-box";

// 出会った場所の入力。既知の場所を候補に出し、綴りごと引き継ぐ（＝酒屋ごとの棚が割れない）。
export function PlaceSuggest({
  id,
  name,
  value,
  places,
  onChange,
  onBlur,
}: {
  id: string;
  name: string;
  value: string;
  places: Place[];
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  const options = useMemo(() => searchPlaces(value, places), [value, places]);
  const box = useSuggestBox(options, (place: Place) => onChange(place.name));

  return (
    <Field ref={box.rootRef} className="relative">
      <Label htmlFor={id}>出会った場所</Label>

      <Input
        id={id}
        name={name}
        placeholder="買った酒屋・飲んだ店・旅先の蔵・通販など"
        value={value}
        {...box.inputProps}
        onChange={(e) => {
          onChange(e.target.value);
          box.onInput();
        }}
        onBlur={onBlur}
      />

      {box.expanded ? (
        <div className="lp-pop absolute top-full right-0 left-0 z-20 mt-2">
          <p className="text-rice-dim px-3 pt-3 pb-2 text-[0.68rem] font-bold tracking-[0.28em] uppercase">
            {value.trim() ? "この場所では？" : "最近の場所"}
          </p>
          <ul
            id={box.listId}
            role="listbox"
            aria-label="記録済みの場所"
            className="pb-2"
          >
            {options.map((place, i) => (
              <li
                key={place.key}
                id={`${box.listId}-${i}`}
                role="option"
                aria-selected={i === box.active}
                className={`lp-option ${i === box.active ? "is-active" : ""}`}
                // click では blur が先に走って閉じてしまうので pointerdown で受ける。
                onPointerDown={(ev) => {
                  ev.preventDefault();
                  box.pick(place);
                }}
                onPointerEnter={() => box.setActive(i)}
              >
                <MapPin size={14} className="text-rice-dim shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{place.name}</span>
                  <span className="text-rice-dim block truncate text-[11px]">
                    {place.count}杯
                  </span>
                </span>
                <span className="font-latin text-rice-dim shrink-0 text-[11px] tabular-nums">
                  前回 {formatJstMonthDay(place.lastAt)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Field>
  );
}
