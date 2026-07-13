import { normalizeName } from "@/lib/match";
import type { DrinkRecord } from "@/schemas/records";

// 銘柄ごとの「いちばん良かった一杯」。TOP10 の**候補を推薦する順**として使う。
//
// 順位そのものは評価から計算しない（本人が選ぶ ＝ top_drinks）。
// 10 点が 20 個並んだとき、順位を決めているのはタイブレークのルールであって
// 本人の好みではなくなる。評価は入口を提案するところまでを担う。
//
// 銘柄単位で畳む（同じ酒を 3 回飲んでも 1 件）。スコアは平均ではなく **最高評価**。
// 平均だと、たまたま状態の悪い一杯を引いたときに好きな酒が沈む。
export type Ranked = {
  key: string; // 正規化した銘柄キー
  name: string; // 最高評価をつけたときの綴り
  categoryId: string | null;
  categoryName: string | null;
  score: number; // 最高評価（0〜10）
  count: number; // 評価を付けて記録した杯数
  isFavorite: boolean; // 一度でもお気に入りにしたか
  bestAt: string; // 最高評価をつけた日時
  memo: string | null; // その一杯のメモ
  placeName: string | null; // その一杯と出会った場所
};

// 評価のない記録は候補に出さない（未評価は「まだ決めていない」であって 0 点ではない）。
export function buildRanking(records: DrinkRecord[]): Ranked[] {
  const map = new Map<string, Ranked>();

  for (const r of records) {
    if (r.rating == null) continue;
    const name = r.name.trim();
    if (!name) continue;

    const key = normalizeName(name);
    const found = map.get(key);

    if (!found) {
      map.set(key, {
        key,
        name,
        categoryId: r.category?.id ?? null,
        categoryName: r.category?.name ?? null,
        score: r.rating,
        count: 1,
        isFavorite: r.isFavorite,
        bestAt: r.drunkAt,
        memo: r.memo,
        placeName: r.placeName,
      });
      continue;
    }

    found.count += 1;
    found.isFavorite = found.isFavorite || r.isFavorite;
    // 同点なら新しい一杯を代表にする（同じ酒でも、最近の夜のほうが手触りが近い）。
    if (
      r.rating > found.score ||
      (r.rating === found.score && r.drunkAt > found.bestAt)
    ) {
      found.score = r.rating;
      found.name = name;
      found.categoryId = r.category?.id ?? found.categoryId;
      found.categoryName = r.category?.name ?? found.categoryName;
      found.bestAt = r.drunkAt;
      found.memo = r.memo;
      found.placeName = r.placeName;
    }
  }

  return [...map.values()].sort(
    (a, b) =>
      b.score - a.score ||
      b.count - a.count ||
      b.bestAt.localeCompare(a.bestAt) ||
      a.name.localeCompare(b.name),
  );
}
