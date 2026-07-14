import { describe, expect, it } from "vitest";

import type { DrinkRecord } from "@/schemas/records";

import { buildAnnualSummary, yearsWithRecords } from "./annual";

const WHISKY = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "ウイスキー",
};
const SAKE = { id: "22222222-2222-2222-2222-222222222222", name: "日本酒" };

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

describe("buildAnnualSummary", () => {
  it("前年に出会った銘柄は、その年の初出会いに数えない", () => {
    const records = [
      record({ name: "山崎", drunkAt: "2025-12-20T10:00:00.000Z" }),
      record({ name: "山崎", drunkAt: "2026-05-01T10:00:00.000Z" }),
      record({ name: "白州", drunkAt: "2026-06-01T10:00:00.000Z" }),
    ];

    const s = buildAnnualSummary(records, 2026);
    expect(s.pours).toBe(2);
    expect(s.firstMeetings).toBe(1); // 白州だけ
    expect(s.revisits).toBe(1); // 山崎
  });

  it("年境は日本時間で切る（UTC 12/31 15:00 は JST の元日）", () => {
    const records = [
      record({ name: "而今", drunkAt: "2025-12-31T15:30:00.000Z" }),
    ];

    expect(buildAnnualSummary(records, 2026).pours).toBe(1);
    expect(buildAnnualSummary(records, 2025).pours).toBe(0);
  });

  it("最高評価は同点なら早いほうを採る", () => {
    const records = [
      record({ name: "A", rating: 9.4, drunkAt: "2026-04-02T10:00:00.000Z" }),
      record({ name: "B", rating: 9.4, drunkAt: "2026-02-02T10:00:00.000Z" }),
      record({ name: "C", rating: 7 }),
    ];

    expect(buildAnnualSummary(records, 2026).best?.name).toBe("B");
  });

  it("カテゴリの比は多い順。未分類も 1 行として残す", () => {
    const records = [
      record({ name: "A", category: WHISKY }),
      record({ name: "B", category: WHISKY }),
      record({ name: "C", category: WHISKY }),
      record({ name: "D", category: SAKE }),
    ];

    const s = buildAnnualSummary(records, 2026);
    expect(s.categories[0]).toMatchObject({ name: "ウイスキー", percent: 75 });
    expect(s.categories[1]).toMatchObject({ name: "日本酒", percent: 25 });

    const withNull = buildAnnualSummary(
      [...records, record({ name: "E" })],
      2026,
    );
    expect(withNull.categories.at(-1)).toMatchObject({
      categoryId: null,
      name: "未分類",
    });
  });

  it("月の灯りは 12 か月ぶん。色はその月の最頻カテゴリ", () => {
    const records = [
      record({
        name: "A",
        category: SAKE,
        drunkAt: "2026-02-10T10:00:00.000Z",
      }),
      record({
        name: "B",
        category: SAKE,
        drunkAt: "2026-02-20T10:00:00.000Z",
      }),
      record({
        name: "C",
        category: WHISKY,
        drunkAt: "2026-02-25T10:00:00.000Z",
      }),
    ];

    const months = buildAnnualSummary(records, 2026).months;
    expect(months).toHaveLength(12);
    expect(months[1]).toMatchObject({ count: 3, categoryId: SAKE.id });
    expect(months[0]).toMatchObject({ count: 0, categoryId: null });
  });

  it("高評価の銘柄に会いに戻っていれば「余韻を追いかける」", () => {
    const records = [
      record({
        name: "山崎",
        rating: 9.0,
        drunkAt: "2026-01-05T10:00:00.000Z",
      }),
      record({ name: "山崎", drunkAt: "2026-03-05T10:00:00.000Z" }),
      record({
        name: "白州",
        rating: 8.8,
        drunkAt: "2026-04-05T10:00:00.000Z",
      }),
      record({ name: "白州", drunkAt: "2026-06-05T10:00:00.000Z" }),
      record({ name: "余市", drunkAt: "2026-07-05T10:00:00.000Z" }),
    ];

    expect(buildAnnualSummary(records, 2026).type?.name).toBe(
      "余韻を追いかける",
    );
  });

  it("初めての一杯ばかりなら「扉を開けつづける」", () => {
    const records = ["A", "B", "C", "D", "E", "F"].map((name) =>
      record({ name, drunkAt: "2026-08-01T10:00:00.000Z" }),
    );

    expect(buildAnnualSummary(records, 2026).type?.name).toBe(
      "扉を開けつづける",
    );
  });

  it("記録が少ない年には型をつけない", () => {
    const records = [record({ name: "A" }), record({ name: "B" })];
    expect(buildAnnualSummary(records, 2026).type).toBeNull();
  });

  it("記録の無い年でも壊れない", () => {
    const s = buildAnnualSummary([], 2026);
    expect(s.pours).toBe(0);
    expect(s.categories).toEqual([]);
    expect(s.months).toHaveLength(12);
    expect(s.best).toBeNull();
    expect(s.type).toBeNull();
  });
});

describe("yearsWithRecords", () => {
  it("記録のある年を新しい順に返す", () => {
    const records = [
      record({ name: "A", drunkAt: "2024-05-01T10:00:00.000Z" }),
      record({ name: "B", drunkAt: "2026-05-01T10:00:00.000Z" }),
      record({ name: "C", drunkAt: "2024-09-01T10:00:00.000Z" }),
    ];

    expect(yearsWithRecords(records)).toEqual([2026, 2024]);
  });
});
