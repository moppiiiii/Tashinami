import { describe, expect, it } from "vitest";

import type { DrinkRecord } from "@/schemas/records";

import { buildPlaces, searchPlaces } from "./places";

// 場所の集約に効くのは placeName / drunkAt だけ。残りは既定で埋める。
function record(patch: Partial<DrinkRecord>): DrinkRecord {
  return {
    id: crypto.randomUUID(),
    name: "一杯",
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

describe("buildPlaces", () => {
  it("表記が揺れても 1 つの場所に畳む（棚が割れない）", () => {
    const places = buildPlaces([
      record({
        placeName: "カクヤス 神楽坂店",
        drunkAt: "2026-01-01T00:00:00Z",
      }),
      record({
        placeName: "かくやす神楽坂店",
        drunkAt: "2026-02-01T00:00:00Z",
      }),
    ]);

    expect(places).toHaveLength(1);
    expect(places[0]?.count).toBe(2);
  });

  it("表示名は初めて記録したときの綴りを正とする", () => {
    const places = buildPlaces([
      record({
        placeName: "かくやす神楽坂店",
        drunkAt: "2026-02-01T00:00:00Z",
      }),
      record({
        placeName: "カクヤス 神楽坂店",
        drunkAt: "2026-01-01T00:00:00Z",
      }),
    ]);

    expect(places[0]?.name).toBe("カクヤス 神楽坂店");
    expect(places[0]?.firstAt).toBe("2026-01-01T00:00:00Z");
    expect(places[0]?.lastAt).toBe("2026-02-01T00:00:00Z");
  });

  it("場所なしの記録は数えない", () => {
    expect(
      buildPlaces([record({ placeName: null }), record({ placeName: "  " })]),
    ).toHaveLength(0);
  });
});

describe("searchPlaces", () => {
  const places = buildPlaces([
    record({ placeName: "カクヤス 神楽坂店", drunkAt: "2026-01-01T00:00:00Z" }),
    record({ placeName: "BAR 灯", drunkAt: "2026-03-01T00:00:00Z" }),
    record({ placeName: "通販", drunkAt: "2026-02-01T00:00:00Z" }),
  ]);

  it("未入力なら最近使った場所を新しい順に返す", () => {
    expect(searchPlaces("", places).map((p) => p.name)).toEqual([
      "BAR 灯",
      "通販",
      "カクヤス 神楽坂店",
    ]);
  });

  it("前方一致で絞る", () => {
    expect(searchPlaces("カク", places).map((p) => p.name)).toEqual([
      "カクヤス 神楽坂店",
    ]);
  });

  it("打ち間違いも拾う", () => {
    expect(searchPlaces("カクヤヌ神楽坂店", places)[0]?.name).toBe(
      "カクヤス 神楽坂店",
    );
  });
});
