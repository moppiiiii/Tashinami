import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { DrinkRecord } from "@/schemas/records";
import { recordsQueryOptions, updateRecord } from "@/server/records";

// 楽観的更新（update）。該当行に変更フィールドだけをマージする。
// category は表示用に vars で受け取り、DB へ送る input（categoryId）とは別に扱う。
export type UpdateRecordVars = {
  id: string;
  name?: string;
  categoryId?: string | null;
  rating?: number | null;
  isFavorite?: boolean;
  memo?: string | null;
  placeName?: string | null;
  price?: number | null;
  abv?: number | null;
  drunkAt?: string;
  // 楽観表示のためだけに使う（updateRecord には送らない）。
  category?: { id: string; name: string } | null;
};

// 定義済みフィールドだけを既存行へ重ねる。undefined は「未変更」として素通しする。
function patch(row: DrinkRecord, vars: UpdateRecordVars): DrinkRecord {
  const next = { ...row };
  if (vars.name !== undefined) next.name = vars.name;
  if (vars.rating !== undefined) next.rating = vars.rating;
  if (vars.isFavorite !== undefined) next.isFavorite = vars.isFavorite;
  if (vars.memo !== undefined) next.memo = vars.memo;
  if (vars.placeName !== undefined) next.placeName = vars.placeName;
  if (vars.price !== undefined) next.price = vars.price;
  if (vars.abv !== undefined) next.abv = vars.abv;
  if (vars.drunkAt !== undefined) next.drunkAt = vars.drunkAt;
  // 表示用 category が渡されたらそれを優先。無しで categoryId=null なら未分類に落とす。
  if (vars.category !== undefined) next.category = vars.category;
  else if (vars.categoryId === null) next.category = null;
  return next;
}

export function useUpdateRecord() {
  const queryClient = useQueryClient();
  const { queryKey } = recordsQueryOptions();

  return useMutation({
    mutationFn: ({ category: _category, ...input }: UpdateRecordVars) =>
      updateRecord({ data: input }),
    onMutate: async (vars) => {
      // 進行中の refetch を止めて楽観値が上書きされないようにする。
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<DrinkRecord[]>(queryKey);
      queryClient.setQueryData<DrinkRecord[]>(queryKey, (old) =>
        old?.map((r) => (r.id === vars.id ? patch(r, vars) : r)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      // 失敗したらスナップショットへ巻き戻す。
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      // 成否に関わらずサーバーの真実と再同期する。
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
