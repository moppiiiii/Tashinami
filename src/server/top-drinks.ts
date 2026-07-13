import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import {
  $supabaseServer,
  createSupabaseServerClient,
} from "@/lib/supabase/server";
import { SaveTopDrinksInput, type TopDrinkItem } from "@/schemas/top-drinks";

// 殿堂（TOP10）。ユーザーごとに 1 行なので、取得は「その 1 行の items」を返すだけ。

export const getTopDrinks = createServerFn().handler(
  async (): Promise<TopDrinkItem[]> => {
    const $supabase = await $supabaseServer();
    const result = await $supabase("@select/top_drinks", {});
    return result.map((rows) => rows[0]?.items ?? []).unwrapOr([]);
  },
);

export const topDrinksQueryOptions = () =>
  queryOptions({
    queryKey: ["top-drinks"],
    queryFn: () => getTopDrinks(),
  });

export const saveTopDrinks = createServerFn({ method: "POST" })
  .validator(SaveTopDrinksInput)
  .handler(async ({ data }) => {
    // 他リソースと違い user_id を明示する。upsert は PK で衝突を判定するので、
    // 列を省くと「1 行目の insert」と「2 回目以降の update」を同じ呼び出しで書けない。
    const {
      data: { user },
    } = await createSupabaseServerClient().auth.getUser();
    if (!user) throw new Error("未ログインです。");

    const $supabase = await $supabaseServer();
    const result = await $supabase("@upsert/top_drinks", {
      data: {
        user_id: user.id,
        items: data.items,
        updated_at: new Date().toISOString(),
      },
    });
    if (result.isErr()) throw result.error;
  });
