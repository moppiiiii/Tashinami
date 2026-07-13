import { Wine } from "lucide-react";

import type { Category } from "@/schemas/categories";
import type { DrinkRecord } from "@/schemas/records";

import { RecordItem } from "./record-item";

// categories は器の絵（カテゴリ slug）を引くために使う。
export function RecordList({
  records,
  categories,
}: {
  records: DrinkRecord[];
  categories?: Category[];
}) {
  if (records.length === 0) {
    // 空状態は「棚がこれから始まる」招待として置く。
    return (
      <div className="lp-card flex flex-col items-center px-6 py-14 text-center">
        <span className="lp-chip mb-5 flex size-14 items-center justify-center rounded-full p-0">
          <Wine size={22} />
        </span>
        <h2 className="lp-serif text-lg">まだ、一杯も注がれていません。</h2>
        <p className="lp-dim mt-2 max-w-xs text-sm leading-relaxed">
          最初の一杯を記録すると、ここに棚ができあがります。
        </p>
      </div>
    );
  }

  // 器の絵はカテゴリ slug で決まる。categories が無ければ未分類の絵で受ける。
  const slugById = new Map((categories ?? []).map((c) => [c.id, c.slug]));

  // 記録は「棚」に並ぶカード。広い画面では 2 列に。
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {records.map((record) => (
        <RecordItem
          key={record.id}
          record={record}
          editable
          slug={
            record.category ? (slugById.get(record.category.id) ?? null) : null
          }
        />
      ))}
    </ul>
  );
}
