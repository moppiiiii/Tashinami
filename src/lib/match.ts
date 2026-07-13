// 記録済みの語（銘柄・出会った場所）を入力中に引き当てるための照合エンジン。
// 図鑑（銘柄）と出会った場所で同じ規則を使う ── 表記が揺れると集計が割れるのは両者同じなので。

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

// 照合できる語の最小形。Encounter（銘柄）も Place（場所）もこれを満たす。
export type Matchable = {
  key: string;
  name: string;
  count: number;
  lastAt: string;
};

// 編集距離（Levenshtein）。銘柄名・店名は短いので 2 行 DP で十分。
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
// 未入力なら最近使ったものを返す（再訪はここから拾えることが多い）。
export function searchByKey<T extends Matchable>(
  query: string,
  items: T[],
  limit = 6,
): T[] {
  const key = normalizeName(query.trim());
  if (!key) {
    return [...items]
      .sort((a, b) => b.lastAt.localeCompare(a.lastAt))
      .slice(0, limit);
  }

  const scored: { item: T; rank: number; distance: number }[] = [];
  for (const item of items) {
    if (item.key.startsWith(key)) {
      scored.push({ item, rank: 0, distance: 0 });
      continue;
    }
    if (item.key.includes(key)) {
      scored.push({ item, rank: 1, distance: 0 });
      continue;
    }
    const allowed = maxDistanceFor(Math.max(key.length, item.key.length));
    if (allowed === 0 || Math.abs(key.length - item.key.length) > allowed)
      continue;
    const distance = editDistance(key, item.key);
    if (distance <= allowed) scored.push({ item, rank: 2, distance });
  }

  scored.sort(
    (a, b) =>
      a.rank - b.rank ||
      a.distance - b.distance ||
      b.item.count - a.item.count ||
      a.item.name.localeCompare(b.item.name),
  );
  return scored.slice(0, limit).map((s) => s.item);
}
