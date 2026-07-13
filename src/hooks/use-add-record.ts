import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { DrinkRecord } from "@/schemas/records";
import { addRecord, recordsQueryOptions } from "@/server/records";

// 楽観的更新（insert）。id はサーバー採番なので一時 id を振り、onSettled の再取得で置換する。
// category は表示用に vars で受け取り、DB へ送る input からは除外する。
export type AddRecordVars = {
  name: string;
  categoryId?: string | null;
  rating?: number | null;
  isFavorite?: boolean;
  memo?: string | null;
  placeName?: string | null;
  price?: number | null;
  abv?: number | null;
  drunkAt?: string;
  // 楽観表示のためだけに使う（addRecord には送らない）。
  category?: { id: string; name: string } | null;
};

export function useAddRecord() {
  const queryClient = useQueryClient();
  const { queryKey } = recordsQueryOptions();

  return useMutation({
    mutationFn: ({ category: _category, ...input }: AddRecordVars) =>
      addRecord({ data: input }),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<DrinkRecord[]>(queryKey);
      const now = new Date().toISOString();
      const optimistic: DrinkRecord = {
        id: `optimistic-${crypto.randomUUID()}`,
        name: vars.name,
        rating: vars.rating ?? null,
        isFavorite: vars.isFavorite ?? false,
        memo: vars.memo ?? null,
        meta: null,
        placeName: vars.placeName ?? null,
        price: vars.price ?? null,
        abv: vars.abv ?? null,
        drunkAt: vars.drunkAt ?? now,
        photoUrl: null,
        createdAt: now,
        category: vars.category ?? null,
      };
      // 一覧は drunk_at 降順。新しい一杯を先頭に差し込む。
      queryClient.setQueryData<DrinkRecord[]>(queryKey, (old) => [
        optimistic,
        ...(old ?? []),
      ]);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
