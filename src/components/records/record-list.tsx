import { Wine } from "lucide-react";

import { Card } from "@/components/common/card";
import { Chip } from "@/components/common/chip";
import type { Category } from "@/schemas/categories";
import type { DrinkRecord } from "@/schemas/records";

import { RecordItem } from "./record-item";

export function RecordList({
  records,
  categories,
}: {
  records: DrinkRecord[];
  categories?: Category[];
}) {
  if (records.length === 0) {
    return (
      <Card className="flex flex-col items-center px-6 py-14 text-center">
        <Chip className="mb-5 flex size-14 items-center justify-center rounded-full p-0">
          <Wine size={22} />
        </Chip>
        <h2 className="font-jp-serif text-lg font-semibold">
          まだ、一杯も注がれていません。
        </h2>
        <p className="text-rice-dim mt-2 max-w-xs text-sm leading-relaxed">
          最初の一杯を記録すると、ここに棚ができあがります。
        </p>
      </Card>
    );
  }

  const slugById = new Map((categories ?? []).map((c) => [c.id, c.slug]));

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
