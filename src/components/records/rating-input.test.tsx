// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import { RatingInput } from "./rating-input";

// vitest の globals は無効なので、テスト間の DOM は自分で片付ける。
afterEach(cleanup);

// Radix Slider は ResizeObserver を使うが、jsdom には無い。
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

test("10 点満点で表示し、つまみを動かすと 0.1 刻みで返す", () => {
  const onChange = vi.fn();
  render(<RatingInput value={8.5} onChange={onChange} />);

  expect(screen.getByText("8.5")).toBeTruthy();

  const thumb = screen.getByRole("slider");
  expect(thumb.getAttribute("aria-valuenow")).toBe("8.5");
  expect(thumb.getAttribute("aria-valuemax")).toBe("10");

  fireEvent.keyDown(thumb, { key: "ArrowRight" });
  expect(onChange).toHaveBeenCalledWith(8.6);
});

test("未評価は — を出す", () => {
  render(<RatingInput value={null} onChange={() => {}} />);

  expect(screen.getByText("—")).toBeTruthy();
});
