import { describe, expect, it } from "vitest";

import { normalizeName } from "@/lib/match";
import type { DrinkRecord } from "@/schemas/records";

import { buildEncounters, findEncounter, searchEncounters } from "./encounters";

const WINE = { id: "11111111-1111-1111-1111-111111111111", name: "ワイン" };
const BEER = { id: "22222222-2222-2222-2222-222222222222", name: "ビール" };

// 出会いの集約に効くのは name / category / drunkAt / isFavorite だけ。残りは既定で埋める。
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

describe("normalizeName", () => {
  it("表記ゆれ（全角/半角・大小・空白・中黒）を同じキーに畳む", () => {
    const key = normalizeName("シャブリ プルミエ・クリュ");
    expect(normalizeName("シャブリ　プルミエクリュ")).toBe(key);
    expect(normalizeName("ｼｬﾌﾞﾘ プルミエ・クリュ")).toBe(key);
    expect(normalizeName("  シャブリプルミエクリュ  ")).toBe(key);
  });

  it("かなとカナを同じキーに寄せる", () => {
    expect(normalizeName("はくつる")).toBe(normalizeName("ハクツル"));
  });

  it("ラテン文字は大小と記号を無視する", () => {
    expect(normalizeName("Johnnie Walker (Black)")).toBe(
      normalizeName("johnnie-walker black"),
    );
  });

  it("長音符は残す（別の酒を潰さない）", () => {
    expect(normalizeName("ビール")).not.toBe(normalizeName("ビル"));
  });

  it("記号だけの名前でも空キーにならない", () => {
    expect(normalizeName("・・・")).not.toBe("");
  });
});

describe("buildEncounters", () => {
  it("カテゴリが違っても、同じ銘柄なら 1 つの出会いに畳む", () => {
    const encounters = buildEncounters([
      record({
        name: "シャブリ",
        category: WINE,
        drunkAt: "2026-02-01T00:00:00.000Z",
      }),
      record({
        name: "シャブリ",
        category: null,
        drunkAt: "2026-01-01T00:00:00.000Z",
      }),
    ]);

    expect(encounters).toHaveLength(1);
    expect(encounters[0]?.count).toBe(2);
  });

  it("表記ゆれも 1 つの出会いに畳み、表示名は初回の綴りを採る", () => {
    const encounters = buildEncounters([
      record({ name: "ｼｬﾌﾞﾘ", drunkAt: "2026-03-01T00:00:00.000Z" }),
      record({ name: "シャブリ", drunkAt: "2026-01-01T00:00:00.000Z" }),
    ]);

    expect(encounters).toHaveLength(1);
    expect(encounters[0]?.name).toBe("シャブリ");
    expect(encounters[0]?.firstAt).toBe("2026-01-01T00:00:00.000Z");
    expect(encounters[0]?.lastAt).toBe("2026-03-01T00:00:00.000Z");
  });

  it("初回が未選択でも、後から付いたカテゴリを採用する", () => {
    const encounters = buildEncounters([
      record({
        name: "シャブリ",
        category: WINE,
        drunkAt: "2026-02-01T00:00:00.000Z",
      }),
      record({
        name: "シャブリ",
        category: null,
        drunkAt: "2026-01-01T00:00:00.000Z",
      }),
    ]);

    expect(encounters[0]?.categoryId).toBe(WINE.id);
  });

  it("カテゴリが競合したら、先に付いた方を採る", () => {
    const encounters = buildEncounters([
      record({
        name: "ハイボール",
        category: BEER,
        drunkAt: "2026-05-01T00:00:00.000Z",
      }),
      record({
        name: "ハイボール",
        category: WINE,
        drunkAt: "2026-01-01T00:00:00.000Z",
      }),
    ]);

    expect(encounters[0]?.categoryId).toBe(WINE.id);
  });

  it("一度でもお気に入りなら、その出会いはお気に入り", () => {
    const encounters = buildEncounters([
      record({ name: "白州", isFavorite: false }),
      record({
        name: "白州",
        isFavorite: true,
        drunkAt: "2026-02-01T00:00:00.000Z",
      }),
    ]);

    expect(encounters[0]?.isFavorite).toBe(true);
  });

  it("空白だけの名前は無視する", () => {
    expect(buildEncounters([record({ name: "   " })])).toHaveLength(0);
  });
});

describe("findEncounter", () => {
  const encounters = buildEncounters([
    record({ name: "シャブリ", category: WINE }),
  ]);

  it("表記ゆれでも記録済みと分かる", () => {
    expect(findEncounter("ｼｬﾌﾞﾘ", encounters)?.count).toBe(1);
  });

  it("知らない銘柄は undefined", () => {
    expect(findEncounter("白州", encounters)).toBeUndefined();
  });
});

// 打ち間違いへの備えは、この候補一覧が唯一の砦（保存は止めない設計）。
describe("searchEncounters", () => {
  const encounters = buildEncounters([
    record({ name: "シャブリ", drunkAt: "2026-01-01T00:00:00.000Z" }),
    record({ name: "シャンパーニュ", drunkAt: "2026-02-01T00:00:00.000Z" }),
    record({ name: "白州", drunkAt: "2026-03-01T00:00:00.000Z" }),
  ]);

  it("未入力なら最近の一杯を新しい順に返す", () => {
    expect(searchEncounters("", encounters).map((e) => e.name)).toEqual([
      "白州",
      "シャンパーニュ",
      "シャブリ",
    ]);
  });

  it("前方一致を優先して返す", () => {
    expect(searchEncounters("シャ", encounters).map((e) => e.name)).toEqual([
      "シャブリ",
      "シャンパーニュ",
    ]);
  });

  it("打ち間違いでも候補に出す", () => {
    expect(searchEncounters("シャプリ", encounters)[0]?.name).toBe("シャブリ");
  });

  it("表記ゆれ（半角カナ）でも候補に出す", () => {
    expect(searchEncounters("ｼｬﾌﾞﾘ", encounters)[0]?.name).toBe("シャブリ");
  });

  it("無関係な銘柄は候補に出さない", () => {
    expect(searchEncounters("ギネス", encounters)).toHaveLength(0);
  });

  it("年数違いは同じ銘柄の並びとして候補に出す（選ぶかは本人が決める）", () => {
    const whisky = buildEncounters([record({ name: "BOWMORE 9 年" })]);
    expect(searchEncounters("BOWMORE 12年", whisky)[0]?.name).toBe(
      "BOWMORE 9 年",
    );
  });
});
