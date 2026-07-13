import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { TopDrinkItem } from "@/schemas/top-drinks";
import { saveTopDrinks, topDrinksQueryOptions } from "@/server/top-drinks";

// 楽観的更新（upsert）。並べ替え・出し入れは指を離す前に効いてほしいので、
// リストを丸ごと差し替えて即時反映し、失敗したら元の並びへ巻き戻す。
export function useSaveTopDrinks() {
  const queryClient = useQueryClient();
  const { queryKey } = topDrinksQueryOptions();

  return useMutation({
    mutationFn: (items: TopDrinkItem[]) => saveTopDrinks({ data: { items } }),
    onMutate: async (items) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TopDrinkItem[]>(queryKey);
      queryClient.setQueryData<TopDrinkItem[]>(queryKey, items);
      return { previous };
    },
    onError: (_error, _items, context) => {
      if (context?.previous) {
        queryClient.setQueryData<TopDrinkItem[]>(queryKey, context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}
