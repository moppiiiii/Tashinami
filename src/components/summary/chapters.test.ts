import { describe, expect, it } from "vitest";

import type { DrinkRecord } from "@/schemas/records";

import { buildAnnualSummary } from "./annual";
import { buildChapters, canPlayReel, hasChapters } from "./chapters";

const WHISKY = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "ウイスキー",
};

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
    drunkAt: "2026-03-14T12:00:00.000Z",
    photoUrl: null,
    createdAt: "2026-03-14T12:00:00.000Z",
    category: null,
    ...patch,
  };
}

// 評価・場所・カテゴリまで揃った年（章が 4 つ立つ）。
const rich = [
  record({
    name: "山崎",
    category: WHISKY,
    rating: 9.4,
    placeName: "BAR 灯",
    drunkAt: "2026-03-14T12:00:00.000Z",
  }),
  record({ name: "山崎", category: WHISKY, placeName: "BAR 灯" }),
  record({ name: "白州", category: WHISKY, placeName: "BAR 灯" }),
  record({ name: "余市", category: WHISKY, rating: 8.0 }),
  record({ name: "而今", rating: 7.5 }),
  record({ name: "獺祭" }),
];

describe("buildChapters", () => {
  it("データの揃った年は、初出会い・カテゴリ・いちばんの一杯・場所の 4 章", () => {
    const chapters = buildChapters(buildAnnualSummary(rich, 2026));
    expect(chapters.map((c) => c.key)).toEqual([
      "encounters",
      "category",
      "best",
      "place",
    ]);
  });

  it("評価も場所も付いていない年は、その章を落とす", () => {
    const bare = ["A", "B", "C", "D", "E"].map((name) =>
      record({ name, category: WHISKY }),
    );

    const chapters = buildChapters(buildAnnualSummary(bare, 2026));
    expect(chapters.map((c) => c.key)).toEqual(["encounters", "category"]);
  });

  it("カテゴリの章は差し色をそのカテゴリに寄せる", () => {
    const chapters = buildChapters(buildAnnualSummary(rich, 2026));
    const category = chapters.find((c) => c.key === "category");
    expect(category?.categoryId).toBe(WHISKY.id);
  });
});

describe("canPlayReel（自動再生）", () => {
  it("章が揃っていれば流す", () => {
    expect(canPlayReel(buildAnnualSummary(rich, 2026))).toBe(true);
  });

  it("章が 3 つに満たない年は流さない（痩せた画面が続くだけになる）", () => {
    const bare = ["A", "B", "C", "D", "E"].map((name) =>
      record({ name, category: WHISKY }),
    );
    expect(canPlayReel(buildAnnualSummary(bare, 2026))).toBe(false);
  });

  it("記録が 3 杯に満たない年は、勝手に始めない", () => {
    const few = [
      record({ name: "A", category: WHISKY, rating: 9, placeName: "BAR 灯" }),
      record({ name: "B", category: WHISKY, rating: 8, placeName: "BAR 灯" }),
    ];
    expect(canPlayReel(buildAnnualSummary(few, 2026))).toBe(false);
  });
});

describe("hasChapters（手で再生）", () => {
  it("自動再生の条件に満たない年でも、押せば見られる", () => {
    const few = [
      record({ name: "A", category: WHISKY, rating: 9, placeName: "BAR 灯" }),
      record({ name: "B", category: WHISKY, rating: 8, placeName: "BAR 灯" }),
    ];
    const summary = buildAnnualSummary(few, 2026);

    expect(canPlayReel(summary)).toBe(false);
    expect(hasChapters(summary)).toBe(true);
  });

  it("記録の無い年には章が無い", () => {
    expect(hasChapters(buildAnnualSummary([], 2026))).toBe(false);
  });
});
