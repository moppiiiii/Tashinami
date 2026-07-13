// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";

// vitest の globals は無効なので、テスト間の DOM は自分で片付ける。
afterEach(cleanup);

import { Calendar } from "./calendar";
import { DateTimeField } from "./date-time-field";

test("値を日付と時刻に分けて表示する", () => {
  render(<DateTimeField value="2025-07-13T21:30" onChange={() => {}} />);

  expect(screen.getByText("2025.7.13")).toBeTruthy();
  expect(screen.getByLabelText("時刻").textContent).toContain("21:30");
});

test("カレンダーの見出しと曜日がラテン表記で描画される", () => {
  const { container } = render(
    <Calendar mode="single" defaultMonth={new Date("2025-07-13")} />,
  );

  // 書体を Fraunces 一本にするため、月見出しは 2025.7、曜日は頭文字。
  expect(screen.getByText("2025.7")).toBeTruthy();
  expect(screen.getByText("W")).toBeTruthy();
  // 既定 CSS を読み込まずクラスだけで組んでいるので、構造が壊れたら気づけるようにする。
  const days = container.querySelectorAll("td[data-day]");
  expect(days.length).toBeGreaterThanOrEqual(31);
});
