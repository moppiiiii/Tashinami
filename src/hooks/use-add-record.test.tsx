// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DrinkRecord } from "@/schemas/records";

// serverFn とクエリ定義をモックし、「楽観的 insert → 巻き戻し」だけを検証する。
const addRecord = vi.fn();
const queryFn = vi.fn();
vi.mock("@/server/records", () => ({
  addRecord: (args: unknown) => addRecord(args),
  recordsQueryOptions: () => ({ queryKey: ["records"], queryFn }),
}));

// モック定義後に import する（vi.mock は巻き上げられる）。
const { useAddRecord } = await import("./use-add-record");

const CAT = { id: "11111111-1111-1111-1111-111111111111", name: "ワイン" };
const record = (over: Partial<DrinkRecord> = {}): DrinkRecord => ({
  id: "existing",
  name: "先客の一杯",
  rating: null,
  isFavorite: false,
  memo: null,
  meta: null,
  placeName: null,
  price: null,
  abv: null,
  drunkAt: "2020-01-01T00:00:00Z",
  photoUrl: null,
  createdAt: "2020-01-01T00:00:00Z",
  category: null,
  ...over,
});

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  queryClient.setQueryData<DrinkRecord[]>(["records"], [record()]);
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  const cache = () => queryClient.getQueryData<DrinkRecord[]>(["records"]);
  return { wrapper, cache };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useAddRecord", () => {
  it("楽観的 insert: 解決前に先頭へ差し込み、category は input から除外して送る", async () => {
    let resolve!: () => void;
    addRecord.mockReturnValue(
      new Promise<void>((r) => {
        resolve = () => r();
      }),
    );
    const { wrapper, cache } = setup();
    const { result } = renderHook(() => useAddRecord(), { wrapper });

    act(() => {
      result.current.mutate({
        name: "シャブリ",
        categoryId: CAT.id,
        rating: 4,
        category: CAT,
      });
    });

    // 解決前に楽観値が先頭へ入る（既存はそのまま後ろに残る）。
    await waitFor(() => {
      const list = cache();
      expect(list).toHaveLength(2);
      expect(list?.[0]).toMatchObject({
        name: "シャブリ",
        rating: 4,
        category: CAT,
      });
      expect(list?.[1].id).toBe("existing");
    });

    // DB へ送る input には表示用の category を含めない。
    expect(addRecord).toHaveBeenCalledWith({
      data: { name: "シャブリ", categoryId: CAT.id, rating: 4 },
    });

    act(() => {
      resolve();
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("失敗時: スナップショットへ巻き戻す", async () => {
    addRecord.mockRejectedValue(new Error("boom"));
    const { wrapper, cache } = setup();
    const { result } = renderHook(() => useAddRecord(), { wrapper });

    act(() => {
      result.current.mutate({ name: "こぼれた一杯" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    // onError で onMutate 前（既存 1 件のみ）へ戻る。
    expect(cache()).toEqual([record()]);
  });
});
