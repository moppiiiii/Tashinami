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

// 照合キーの正規化。表示は入力そのままを保ち、突き合わせだけこの値で行う。
// NFKC で全角英数・半角カナを畳み、かなをカナへ寄せ、空白・記号を落とす。
// 長音符（ー）は Lm なので \p{P}\p{S} では消えない＝「ビール」と「ビル」は別物のまま。
export function normalizeName(raw: string): string {
  const key = raw
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\p{White_Space}\p{P}\p{S}]/gu, "")
    .replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60));
  // 記号だけの名前などでキーが空になるときは、元の文字列で受ける。
  return key || raw.trim().toLowerCase();
}

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

// 編集距離（Levenshtein）。銘柄名は短いので 2 行 DP で十分。
function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length || !b.length) return a.length || b.length;

  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  let curr = Array.from({ length: b.length + 1 }, () => 0);

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        (curr[j - 1] ?? 0) + 1, // 挿入
        (prev[j] ?? 0) + 1, // 削除
        (prev[j - 1] ?? 0) + cost, // 置換
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length] ?? 0;
}

// 「似ている」と言い切ってよい距離の上限。短い名前ほど厳しくする
// （3 文字で 1 文字違いを許すと「ビール」と「ビーム」まで似ていることになるが、
//  2 文字以下は別物の可能性が高すぎるので一切拾わない）。
function maxDistanceFor(len: number): number {
  if (len <= 2) return 0;
  if (len <= 5) return 1;
  if (len <= 10) return 2;
  return 3;
}

// 入力中のサジェスト。前方一致 → 部分一致 → あいまい一致（打ち間違い）の順に並べる。
// 未入力なら「最近の一杯」を返す（再訪はここから拾えることが多い）。
export function searchEncounters(
  query: string,
  encounters: Encounter[],
  limit = 6,
): Encounter[] {
  const key = normalizeName(query.trim());
  if (!key) {
    return [...encounters]
      .sort((a, b) => b.lastAt.localeCompare(a.lastAt))
      .slice(0, limit);
  }

  const scored: { encounter: Encounter; rank: number; distance: number }[] = [];
  for (const e of encounters) {
    if (e.key.startsWith(key)) {
      scored.push({ encounter: e, rank: 0, distance: 0 });
      continue;
    }
    if (e.key.includes(key)) {
      scored.push({ encounter: e, rank: 1, distance: 0 });
      continue;
    }
    const allowed = maxDistanceFor(Math.max(key.length, e.key.length));
    if (allowed === 0 || Math.abs(key.length - e.key.length) > allowed)
      continue;
    const distance = editDistance(key, e.key);
    if (distance <= allowed) scored.push({ encounter: e, rank: 2, distance });
  }

  scored.sort(
    (a, b) =>
      a.rank - b.rank ||
      a.distance - b.distance ||
      b.encounter.count - a.encounter.count ||
      a.encounter.name.localeCompare(b.encounter.name),
  );
  return scored.slice(0, limit).map((s) => s.encounter);
}

// 初めての出会いが「またいだ季節」の数（1〜4）。
export function seasonsTouched(encounters: Encounter[]): number {
  const seasons = new Set<number>();
  for (const e of encounters) {
    const d = new Date(e.firstAt);
    if (Number.isNaN(d.getTime())) continue;
    const m = d.getMonth(); // 0-11
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
