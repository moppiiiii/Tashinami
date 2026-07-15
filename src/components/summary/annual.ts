import { buildEncounters } from "@/components/zukan/encounters";
import { jstMonth, jstYear } from "@/lib/date";
import { normalizeName } from "@/lib/match";
import type { DrinkRecord } from "@/schemas/records";

// 年次サマリーの集計。records だけから作る純関数。
// 「初めての出会い」は全期間で見ないと決まらないので、年で絞るのは集計の入口ではなく中。

export type MonthLight = {
  /** 0〜11。 */
  month: number;
  count: number;
  /** その月に最も多く記録したカテゴリ（未分類しかなければ null）。 */
  categoryId: string | null;
};

export type CategoryShare = {
  /** 未分類は null。 */
  categoryId: string | null;
  name: string;
  count: number;
  /** その年の全記録に対する割合（％・四捨五入）。 */
  percent: number;
};

export type Tally = { name: string; count: number };

export type BestPour = {
  name: string;
  rating: number;
  at: string;
  placeName: string | null;
};

/** 一年の傾向につける名前。判定条件は decideType を見る。 */
export type DrinkerType = { name: string; note: string };

export type AnnualSummary = {
  year: number;
  /** その年の記録数。 */
  pours: number;
  /** その年に初めて出会った銘柄の数。 */
  firstMeetings: number;
  /** 初めてではなかった杯（pours − firstMeetings）。 */
  revisits: number;
  /** その年に出会った場所の数。 */
  placeCount: number;
  topPlace: Tally | null;
  /** その年でいちばん多く記録した銘柄（2 回以上のときだけ）。 */
  mostReturned: Tally | null;
  /** その年の最高評価（同点なら早いほう）。 */
  best: BestPour | null;
  /** 多い順。未分類も 1 行として含む。 */
  categories: CategoryShare[];
  /** 12 か月ぶん（記録が無い月も 0 で埋める）。 */
  months: MonthLight[];
  type: DrinkerType | null;
};

function tally(values: string[]): Tally | null {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);

  let top: Tally | null = null;
  for (const [name, count] of counts) {
    if (!top || count > top.count) top = { name, count };
  }
  return top;
}

/** 記録のある年（新しい順）。年の切り替えと、既定で開く年に使う。 */
export function yearsWithRecords(records: DrinkRecord[]): number[] {
  const years = new Set<number>();
  for (const r of records) {
    const y = jstYear(r.drunkAt);
    if (y != null) years.add(y);
  }
  return [...years].sort((a, b) => b - a);
}

/**
 * 一年の傾向を 1 つだけ選ぶ。上から順に見て、最初に当たったものを採る
 * （複数当たる年のほうが普通なので、優先順位そのものが「何を物語にするか」の判断）。
 */
function decideType(
  summary: Omit<AnnualSummary, "type">,
  records: DrinkRecord[],
  yearRecords: DrinkRecord[],
): DrinkerType | null {
  if (summary.pours < 5) return null;

  // 余韻: 高く評価した銘柄に、実際もう一度会いに行っているか。
  const loved = new Map<string, string>(); // key → 表示名
  for (const r of yearRecords) {
    if (r.rating != null && r.rating >= 8.5) {
      loved.set(normalizeName(r.name.trim()), r.name);
    }
  }
  if (loved.size >= 2) {
    const counts = new Map<string, number>();
    for (const r of records) {
      const key = normalizeName(r.name.trim());
      if (loved.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const returned = [...counts.values()].filter((c) => c >= 2).length;
    if (returned / loved.size >= 0.5) {
      return {
        name: "余韻を追いかける",
        note: `高い点をつけた ${loved.size} 銘柄のうち、${returned} に会いに戻っている。`,
      };
    }
  }

  // 一途: ひとつのカテゴリに寄っている。
  const top = summary.categories[0];
  if (top && top.categoryId && top.percent >= 50) {
    return {
      name: "一途に注ぐ",
      note: `一年の ${top.percent}% が${top.name}。ぶれない一本を持っている。`,
    };
  }

  // 扉: 再会より、初めての一杯が多い。
  if (summary.firstMeetings / summary.pours >= 0.6) {
    return {
      name: "扉を開けつづける",
      note: `${summary.pours} 杯のうち ${summary.firstMeetings} 杯が、初めての銘柄だった。`,
    };
  }

  // 旅: 決まった店ではなく、いろいろな場所で出会っている。
  if (summary.placeCount >= 8 && summary.placeCount / summary.pours >= 0.5) {
    return {
      name: "夜を旅する",
      note: `${summary.placeCount} か所で一杯と出会った。同じ席に長居しない一年。`,
    };
  }

  return {
    name: "静かに重ねる",
    note: "派手な偏りはない。淡々と、一杯ずつ。",
  };
}

export function buildAnnualSummary(
  records: DrinkRecord[],
  year: number,
): AnnualSummary {
  const yearRecords = records.filter((r) => jstYear(r.drunkAt) === year);
  const pours = yearRecords.length;

  // 初出会いは全期間の集計から拾う（その年に firstAt を持つ銘柄）。
  const firstMeetings = buildEncounters(records).filter(
    (e) => jstYear(e.firstAt) === year,
  ).length;

  const places = yearRecords
    .map((r) => r.placeName?.trim())
    .filter((p): p is string => !!p);

  const returned = tally(
    yearRecords.flatMap((r) => {
      const name = r.name.trim();
      return name ? [name] : [];
    }),
  );

  let best: BestPour | null = null;
  for (const r of yearRecords) {
    if (r.rating == null) continue;
    const better =
      !best ||
      r.rating > best.rating ||
      (r.rating === best.rating && r.drunkAt < best.at);
    if (better) {
      best = {
        name: r.name,
        rating: r.rating,
        at: r.drunkAt,
        placeName: r.placeName,
      };
    }
  }

  const byCategory = new Map<string, { name: string; count: number }>();
  for (const r of yearRecords) {
    const id = r.category?.id ?? "";
    const name = r.category?.name ?? "未分類";
    const found = byCategory.get(id);
    if (found) found.count += 1;
    else byCategory.set(id, { name, count: 1 });
  }
  const categories: CategoryShare[] = [...byCategory.entries()]
    .map(([id, { name, count }]) => ({
      categoryId: id || null,
      name,
      count,
      percent: pours > 0 ? Math.round((count / pours) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const months: MonthLight[] = Array.from({ length: 12 }, (_, month) => {
    const inMonth = yearRecords.filter((r) => jstMonth(r.drunkAt) === month);
    const ids = inMonth
      .map((r) => r.category?.id)
      .filter((id): id is string => !!id);
    // tally は値の最頻値を返す。ここでは値がカテゴリ id。
    const top = tally(ids);
    return { month, count: inMonth.length, categoryId: top?.name ?? null };
  });

  const base = {
    year,
    pours,
    firstMeetings,
    revisits: Math.max(pours - firstMeetings, 0),
    placeCount: new Set(places).size,
    topPlace: tally(places),
    mostReturned: returned && returned.count >= 2 ? returned : null,
    best,
    categories,
    months,
  };

  return { ...base, type: decideType(base, records, yearRecords) };
}
