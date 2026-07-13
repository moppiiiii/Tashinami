import { describe, expect, it } from "vitest";

import {
  formatJstDate,
  formatJstMonthDay,
  fromJstInput,
  isSameJstMonth,
  jstDaysAgo,
  jstMonth,
  toJstInput,
} from "./date";

// 実行環境の TZ に関係なく同じ結果になることが要件（SSR は UTC、ブラウザは JST）。
describe("日本時間で固定して解釈する", () => {
  // 2025-07-13 00:30 JST = 2025-07-12 15:30 UTC。ローカル解釈だと日付が 1 日ずれる。
  const midnightJst = "2025-07-12T15:30:00.000Z";

  it("深夜の記録も日本時間の日付で出す", () => {
    expect(formatJstDate(midnightJst)).toBe("2025.7.13");
    expect(formatJstMonthDay(midnightJst)).toBe("7.13");
    expect(jstMonth(midnightJst)).toBe(6); // 0-11 の 7 月
  });

  it("入力欄の壁時計と ISO を往復できる", () => {
    expect(toJstInput(midnightJst)).toBe("2025-07-13T00:30");
    expect(fromJstInput("2025-07-13T00:30")).toBe(midnightJst);
  });

  it("日数と月の比較も日本時間で行う", () => {
    const now = new Date(Date.UTC(2025, 6, 14, 9, 0)); // JST 壁時計としての 2025-07-14
    expect(jstDaysAgo(midnightJst, now)).toBe(1);
    expect(isSameJstMonth(midnightJst, now)).toBe(true);
    expect(isSameJstMonth("2025-06-30T15:30:00.000Z", now)).toBe(true); // JST では 7/1
  });

  it("壊れた値は落ちない", () => {
    expect(formatJstDate("なんだこれ")).toBe("");
    expect(jstDaysAgo("なんだこれ")).toBeNull();
    expect(fromJstInput("2025/07/13 00:30")).toBeUndefined();
  });
});
