import { useMemo } from "react";

import { buildEncounters } from "@/components/zukan/encounters";
import { isSameJstMonth, jstNow } from "@/lib/date";
import type { DrinkRecord } from "@/schemas/records";

// 最頻値とその出現数。候補が無ければ null。
function mostCommon(values: string[]): { name: string; count: number } | null {
  const tally = new Map<string, number>();
  for (const v of values) tally.set(v, (tally.get(v) ?? 0) + 1);
  let top: { name: string; count: number } | null = null;
  for (const [name, count] of tally) {
    if (!top || count > top.count) top = { name, count };
  }
  return top;
}

function Stat({
  label,
  value,
  unit,
  sub,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
}) {
  return (
    <div className="lp-stat">
      <p className="text-rice-dim text-xs">{label}</p>
      <p className="font-jp-serif mt-0.5 truncate text-2xl leading-tight font-semibold">
        {value}
        {unit ? (
          <span className="text-rice-dim ml-1 text-sm">{unit}</span>
        ) : null}
      </p>
      {sub ? <p className="text-amber-bright mt-0.5 text-xs">{sub}</p> : null}
    </div>
  );
}

export function ShelfStats({ records }: { records: DrinkRecord[] }) {
  const stats = useMemo(() => {
    const now = jstNow();
    const places = records
      .map((r) => r.placeName?.trim())
      .filter((p): p is string => !!p);
    const categorized = records.filter((r) => r.category);
    const topCategory = mostCommon(
      categorized.map((r) => r.category?.name ?? ""),
    );

    return {
      thisMonth: records.filter((r) => isSameJstMonth(r.drunkAt, now)).length,
      encounters: buildEncounters(records).length,
      topPlace: mostCommon(places),
      topCategory,
      categoryShare:
        topCategory && records.length > 0
          ? Math.round((topCategory.count / records.length) * 100)
          : 0,
    };
  }, [records]);

  return (
    <div className="lp-stat-rail">
      <Stat label="今月" value={`${stats.thisMonth}`} unit="杯" />
      <Stat label="出会った銘柄" value={`${stats.encounters}`} unit="種" />
      <Stat
        label="よく出会う場所"
        value={stats.topPlace?.name ?? "—"}
        sub={stats.topPlace ? `${stats.topPlace.count} 回` : undefined}
      />
      <Stat
        label="いちばん飲む"
        value={stats.topCategory?.name ?? "—"}
        sub={stats.topCategory ? `全体の ${stats.categoryShare}%` : undefined}
      />
    </div>
  );
}
