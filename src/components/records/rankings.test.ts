import { describe, expect, it } from "vitest";

import type { DrinkRecord } from "@/schemas/records";

import { buildRanking } from "./rankings";

const WINE = { id: "11111111-1111-1111-1111-111111111111", name: "ワイン" };

function record(patch: Partial<DrinkRecord> & { name: string }): DrinkRecord {
  return {
    id: crypto.randomUUID(),
    rating: null,
    isFavorite: false,
    memo: null,
    meta: null,
    placeName: null,
    price: null,
    abv: null,
    drunkAt: "2026-01-01T00:00:00.000Z",
    photoUrl: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    category: null,
    ...patch,
  };
}

describe("buildRanking", () => {
  it("未評価の一杯は順位を持たない", () => {
    expect(buildRanking([record({ name: "白州", rating: null })])).toHaveLength(
      0,
    );
  });

  it("同じ銘柄は 1 席に畳み、最高評価を採る（平均で沈めない）", () => {
    const ranked = buildRanking([
      record({ name: "白州", rating: 9.4, drunkAt: "2026-01-01T00:00:00Z" }),
      record({ name: "白州", rating: 5.0, drunkAt: "2026-02-01T00:00:00Z" }),
    ]);

    expect(ranked).toHaveLength(1);
    expect(ranked[0]?.score).toBe(9.4);
    expect(ranked[0]?.count).toBe(2);
    expect(ranked[0]?.bestAt).toBe("2026-01-01T00:00:00Z");
  });

  it("代表はその最高評価をつけた一杯（メモ・場所ごと引き継ぐ）", () => {
    const ranked = buildRanking([
      record({ name: "白州", rating: 6, memo: "ふつう", placeName: "自宅" }),
      record({
        name: "白州",
        rating: 9,
        memo: "余韻に蜜と樽。",
        placeName: "BAR 灯",
        drunkAt: "2026-03-01T00:00:00Z",
      }),
    ]);

    expect(ranked[0]?.memo).toBe("余韻に蜜と樽。");
    expect(ranked[0]?.placeName).toBe("BAR 灯");
  });

  it("表記が揺れても同じ銘柄として畳む", () => {
    const ranked = buildRanking([
      record({ name: "ｼｬﾌﾞﾘ", rating: 8 }),
      record({ name: "シャブリ", rating: 7 }),
    ]);

    expect(ranked).toHaveLength(1);
  });

  it("高い順に並べ、同点なら杯数の多い方を上にする", () => {
    const ranked = buildRanking([
      record({ name: "A", rating: 8, category: WINE }),
      record({ name: "B", rating: 9 }),
      record({ name: "C", rating: 8 }),
      record({ name: "C", rating: 8, drunkAt: "2026-02-01T00:00:00Z" }),
    ]);

    expect(ranked.map((r) => r.name)).toEqual(["B", "C", "A"]);
  });
});

// 候補の推薦順（順位そのものは top_drinks が正本）。
describe("候補の並び", () => {
  it("評価を付けた銘柄だけが候補に挙がる", () => {
    const ranked = buildRanking([
      record({ name: "白州", rating: 9 }),
      record({ name: "未評価の一杯", rating: null }),
    ]);

    expect(ranked.map((r) => r.name)).toEqual(["白州"]);
  });
});
