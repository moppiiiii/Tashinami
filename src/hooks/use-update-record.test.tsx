// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DrinkRecord } from "@/schemas/records";

// serverFn とクエリ定義をモックし、「楽観的 update → 巻き戻し」だけを検証する。
const updateRecord = vi.fn();
const queryFn = vi.fn();
vi.mock("@/server/records", () => ({
  updateRecord: (args: unknown) => updateRecord(args),
  recordsQueryOptions: () => ({ queryKey: ["records"], queryFn }),
}));

// モック定義後に import する（vi.mock は巻き上げられる）。
const { useUpdateRecord } = await import("./use-update-record");

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

describe("useUpdateRecord", () => {
  it("楽観的 update: 該当行へ変更をマージし、category は input から除外して送る", async () => {
    let resolve!: () => void;
    updateRecord.mockReturnValue(
      new Promise<void>((r) => {
        resolve = () => r();
      }),
    );
    const { wrapper, cache } = setup();
    const { result } = renderHook(() => useUpdateRecord(), { wrapper });

    act(() => {
      result.current.mutate({
        id: "existing",
        rating: 5,
        categoryId: CAT.id,
        category: CAT,
      });
    });

    // 解決前に楽観値がマージされる（未指定フィールドはそのまま）。
    await waitFor(() => {
      const list = cache();
      expect(list?.[0]).toMatchObject({
        id: "existing",
        name: "先客の一杯",
        rating: 5,
        category: CAT,
      });
    });

    // DB へ送る input には表示用の category を含めない。
    expect(updateRecord).toHaveBeenCalledWith({
      data: { id: "existing", rating: 5, categoryId: CAT.id },
    });

    act(() => {
      resolve();
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("失敗時: スナップショットへ巻き戻す", async () => {
    updateRecord.mockRejectedValue(new Error("boom"));
    const { wrapper, cache } = setup();
    const { result } = renderHook(() => useUpdateRecord(), { wrapper });

    act(() => {
      result.current.mutate({ id: "existing", rating: 5 });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    // onError で onMutate 前（rating 未変更）へ戻る。
    expect(cache()).toEqual([record()]);
  });
});
