import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { DrinkRecord } from "@/schemas/records";
import { recordsQueryOptions, removeRecord } from "@/server/records";

/** 楽観的更新（delete）。該当行をキャッシュから即時に取り除く。 */
export function useRemoveRecord() {
  const queryClient = useQueryClient();
  const { queryKey } = recordsQueryOptions();

  return useMutation({
    mutationFn: (vars: { id: string }) => removeRecord({ data: vars }),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<DrinkRecord[]>(queryKey);
      queryClient.setQueryData<DrinkRecord[]>(queryKey, (old) =>
        old?.filter((r) => r.id !== vars.id),
      );
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
