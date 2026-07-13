import * as z from "zod";

import { createSupabaseSchema, select } from "@/lib/supabase/query";

// カテゴリは全ユーザー共有のマスタ（読み取り専用）。ユーザーからの CRUD は無く、
// records.category_id → categories.id の参照先として使う。DDL/RLS/シードは別途 Supabase に適用する。

export const GET_CATEGORIES_QUERY = "id, name, slug, sort_order";

// テーブルの全カラム。filter/order のカラム型はこれ由来。
export const CategoryEntitySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  sort_order: z.number(),
  created_at: z.string(),
});

// レスポンス: フラット列を pick → camelCase に transform。
export const CategoryResponseSchema = CategoryEntitySchema.pick({
  id: true,
  name: true,
  slug: true,
  sort_order: true,
}).transform((row) => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  sortOrder: row.sort_order,
}));

export type Category = z.infer<typeof CategoryResponseSchema>;

// 読み取り専用マスタなので select 断片のみ。
export const categoriesSchema = createSupabaseSchema({
  "@select/categories": select({
    output: z.array(CategoryResponseSchema),
    select: GET_CATEGORIES_QUERY,
    row: CategoryEntitySchema,
  }),
});
