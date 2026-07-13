// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DrinkRecord } from "@/schemas/records";

// serverFn とクエリ定義をモックし、「楽観的 delete → 巻き戻し」だけを検証する。
const removeRecord = vi.fn();
const queryFn = vi.fn();
vi.mock("@/server/records", () => ({
  removeRecord: (args: unknown) => removeRecord(args),
  recordsQueryOptions: () => ({ queryKey: ["records"], queryFn }),
}));

// モック定義後に import する（vi.mock は巻き上げられる）。
const { useRemoveRecord } = await import("./use-remove-record");

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
  queryClient.setQueryData<DrinkRecord[]>(
    ["records"],
    [record(), record({ id: "keep", name: "残す一杯" })],
  );
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  const cache = () => queryClient.getQueryData<DrinkRecord[]>(["records"]);
  return { wrapper, cache };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useRemoveRecord", () => {
  it("楽観的 delete: 解決前に該当行を取り除き、他は残す", async () => {
    let resolve!: () => void;
    removeRecord.mockReturnValue(
      new Promise<void>((r) => {
        resolve = () => r();
      }),
    );
    const { wrapper, cache } = setup();
    const { result } = renderHook(() => useRemoveRecord(), { wrapper });

    act(() => {
      result.current.mutate({ id: "existing" });
    });

    await waitFor(() => {
      const list = cache();
      expect(list).toHaveLength(1);
      expect(list?.[0].id).toBe("keep");
    });

    expect(removeRecord).toHaveBeenCalledWith({ data: { id: "existing" } });

    act(() => {
      resolve();
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("失敗時: スナップショットへ巻き戻す", async () => {
    removeRecord.mockRejectedValue(new Error("boom"));
    const { wrapper, cache } = setup();
    const { result } = renderHook(() => useRemoveRecord(), { wrapper });

    act(() => {
      result.current.mutate({ id: "existing" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    // onError で onMutate 前（2 件）へ戻る。
    expect(cache()).toEqual([
      record(),
      record({ id: "keep", name: "残す一杯" }),
    ]);
  });
});
