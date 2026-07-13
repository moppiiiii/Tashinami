import { jstMonth } from "@/lib/date";
import { normalizeName, searchByKey } from "@/lib/match";
import type { DrinkRecord } from "@/schemas/records";

// 図鑑の 1 マス＝「銘柄との初めての出会い」。records の集約で作る。
// 同一性は正規化した銘柄名だけで決め、カテゴリはキーに含めない。
// 「1 杯目はカテゴリ未選択・2 杯目はワイン」のような入力揺れで
// 同じ酒が 2 マスに割れるのを防ぐため（カテゴリは表示のための属性として持つ）。
export type Encounter = {
  key: string; // 正規化した照合キー
  name: string; // 表示名＝初めて記録したときの綴り
  categoryId: string | null; // 最も早く付いたカテゴリ（ずっと未選択なら null）
  categoryName: string | null;
  firstAt: string; // 初めて記録した日時（ISO・最古）
  lastAt: string; // 最後に記録した日時（ISO・最新）
  count: number; // 記録回数（初回含む）
  isFavorite: boolean; // 一度でもお気に入りにしたか
};

// 集約中だけ使う下書き。カテゴリを「いつ付いたか」を覚えておき、最も早いものを採る。
type Draft = Encounter & { categoryAt: string | null };

// records を銘柄（正規化キー）で畳んで出会いの一覧にする。
export function buildEncounters(records: DrinkRecord[]): Encounter[] {
  const map = new Map<string, Draft>();
  for (const r of records) {
    const name = r.name.trim();
    if (!name) continue;
    const key = normalizeName(name);
    const categoryId = r.category?.id ?? null;
    const found = map.get(key);

    if (!found) {
      map.set(key, {
        key,
        name,
        categoryId,
        categoryName: r.category?.name ?? null,
        categoryAt: categoryId ? r.drunkAt : null,
        firstAt: r.drunkAt,
        lastAt: r.drunkAt,
        count: 1,
        isFavorite: r.isFavorite,
      });
      continue;
    }

    found.count += 1;
    // 表示名は「初めて記録したときの綴り」を正とする（並び順に依存させない）。
    if (r.drunkAt < found.firstAt) {
      found.firstAt = r.drunkAt;
      found.name = name;
    }
    if (r.drunkAt > found.lastAt) found.lastAt = r.drunkAt;
    // カテゴリは最も早く付いたものを採用。初回が未選択でも、後から付ければ図鑑が灯る。
    if (
      categoryId &&
      (found.categoryAt === null || r.drunkAt < found.categoryAt)
    ) {
      found.categoryId = categoryId;
      found.categoryName = r.category?.name ?? null;
      found.categoryAt = r.drunkAt;
    }
    found.isFavorite = found.isFavorite || r.isFavorite;
  }

  return [...map.values()].map((d) => ({
    key: d.key,
    name: d.name,
    categoryId: d.categoryId,
    categoryName: d.categoryName,
    firstAt: d.firstAt,
    lastAt: d.lastAt,
    count: d.count,
    isFavorite: d.isFavorite,
  }));
}

// すでに出会っている銘柄か（完全一致＝再会）。入力中の判定にも保存時の判定にも使う。
export function findEncounter(
  name: string,
  encounters: Encounter[],
): Encounter | undefined {
  const key = normalizeName(name.trim());
  if (!key) return undefined;
  return encounters.find((e) => e.key === key);
}

// 入力中のサジェスト（照合規則は @/lib/match と共通）。
export function searchEncounters(
  query: string,
  encounters: Encounter[],
  limit = 6,
): Encounter[] {
  return searchByKey(query, encounters, limit);
}

// 初めての出会いが「またいだ季節」の数（1〜4）。
export function seasonsTouched(encounters: Encounter[]): number {
  const seasons = new Set<number>();
  for (const e of encounters) {
    const m = jstMonth(e.firstAt); // 0-11
    if (m == null) continue;
    seasons.add(m === 11 || m <= 1 ? 0 : m <= 4 ? 1 : m <= 7 ? 2 : 3);
  }
  return seasons.size;
}

// カテゴリごとの差し色（slug 基準）。未知は琥珀。
const ACCENT: Record<string, string> = {
  beer: "#d6a24a",
  wine: "#b06579",
  sake: "#83a68c",
  shochu: "#c8a86a",
  whisky: "#cf9247",
  cocktail: "#c77fa0",
  other: "#a2957f",
};

export function accentForSlug(slug?: string | null): string {
  return (slug && ACCENT[slug]) || "#cf9247";
}
