import { normalizeName, searchByKey } from "@/lib/match";
import type { DrinkRecord } from "@/schemas/records";

// 出会った場所（買った酒屋・飲んだ店・旅先の蔵・通販）。records.place_name の集約。
// 表記が揺れると「酒屋ごとの棚」が割れるので、同一性は銘柄と同じ正規化キーで決める。
export type Place = {
  key: string; // 正規化した照合キー
  name: string; // 表示名＝初めて記録したときの綴り
  firstAt: string; // その場所で初めて記録した日時（ISO・最古）
  lastAt: string; // 最後に記録した日時（ISO・最新）
  count: number; // その場所で記録した杯数
  drinkCount: number; // その場所で出会った銘柄数（ユニーク）
};

// 集約中だけ使う下書き。銘柄の重複を畳むために正規化キーの集合を持つ。
type Draft = Place & { drinks: Set<string> };

export function buildPlaces(records: DrinkRecord[]): Place[] {
  const map = new Map<string, Draft>();
  for (const r of records) {
    const name = r.placeName?.trim();
    if (!name) continue;
    const key = normalizeName(name);
    const drink = r.name.trim() ? normalizeName(r.name.trim()) : null;
    const found = map.get(key);

    if (!found) {
      map.set(key, {
        key,
        name,
        firstAt: r.drunkAt,
        lastAt: r.drunkAt,
        count: 1,
        drinkCount: 0,
        drinks: new Set(drink ? [drink] : []),
      });
      continue;
    }

    found.count += 1;
    if (drink) found.drinks.add(drink);
    // 表示名は「初めて記録したときの綴り」を正とする（並び順に依存させない）。
    if (r.drunkAt < found.firstAt) {
      found.firstAt = r.drunkAt;
      found.name = name;
    }
    if (r.drunkAt > found.lastAt) found.lastAt = r.drunkAt;
  }

  return [...map.values()].map(({ drinks, ...place }) => ({
    ...place,
    drinkCount: drinks.size,
  }));
}

// その場所で記録した一杯（表記揺れを畳んだキーで引く）。
export function recordsAtPlace(
  records: DrinkRecord[],
  key: string,
): DrinkRecord[] {
  return records.filter((r) => {
    const name = r.placeName?.trim();
    return !!name && normalizeName(name) === key;
  });
}

export function searchPlaces(
  query: string,
  places: Place[],
  limit = 6,
): Place[] {
  return searchByKey(query, places, limit);
}
