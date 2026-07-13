import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { $supabaseServer } from "@/lib/supabase/server";
import type { Category } from "@/schemas/categories";

// カテゴリは共有マスタ（読み取り専用）。fetch のみ。

export const getCategories = createServerFn().handler(
  async (): Promise<Category[]> => {
    const $supabase = await $supabaseServer();
    const result = await $supabase("@select/categories", {
      filter: (q) => q.order("sort_order", { ascending: true }),
    });
    return result.unwrapOr([]);
  },
);

export const categoriesQueryOptions = () =>
  queryOptions({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });
