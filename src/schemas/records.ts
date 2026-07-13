import * as z from "zod";

import {
  createSupabaseSchema,
  deleteFrom,
  insert,
  select,
  update,
} from "@/lib/supabase/query";

// 飲んだ一杯の記録（コア）。ユーザー所有。records.category_id → categories.id（FK）を
// embed で一緒に取る。user_id は DB 側 default auth.uid() で自動付与するため入力に含めない。
// DDL/インデックス/RLS は別途 Supabase に適用する。

// records.category_id の埋め込み先（id, name のみ表示に使う）。
const CategoryRefSchema = z.object({ id: z.string().uuid(), name: z.string() });

// テーブルの全カラム。filter/match のカラム型はこれ由来。
export const RecordEntitySchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string(),
  category_id: z.string().uuid().nullable(),
  rating: z.number().nullable(),
  is_favorite: z.boolean(),
  memo: z.string().nullable(),
  meta: z.json().nullable(),
  place_name: z.string().nullable(),
  price: z.number().nullable(),
  abv: z.number().nullable(),
  drunk_at: z.string(),
  photo_url: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

// embed 込みの取得カラム。`category:categories(...)` で関連を一緒に取る。
export const GET_RECORDS_QUERY =
  "id, name, rating, is_favorite, memo, meta, place_name, price, abv, drunk_at, photo_url, created_at, category:categories(id, name)";

// レスポンス: フラット列を pick + 関連を extend + camelCase に transform。
export const RecordResponseSchema = RecordEntitySchema.pick({
  id: true,
  name: true,
  rating: true,
  is_favorite: true,
  memo: true,
  meta: true,
  place_name: true,
  price: true,
  abv: true,
  drunk_at: true,
  photo_url: true,
  created_at: true,
})
  .extend({ category: CategoryRefSchema.nullable() })
  .transform((row) => ({
    id: row.id,
    name: row.name,
    rating: row.rating,
    isFavorite: row.is_favorite,
    memo: row.memo,
    meta: row.meta,
    placeName: row.place_name,
    price: row.price,
    abv: row.abv,
    drunkAt: row.drunk_at,
    photoUrl: row.photo_url,
    createdAt: row.created_at,
    category: row.category,
  }));

// TS 組み込みの `Record` と衝突しないよう DrinkRecord とする。
export type DrinkRecord = z.infer<typeof RecordResponseSchema>;

// --- API リクエスト（serverFn の .validator と共有・camelCase） ---
export const AddRecordInput = z.object({
  name: z.string().min(1),
  categoryId: z.string().uuid().nullable().optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  isFavorite: z.boolean().optional(),
  memo: z.string().nullable().optional(),
  meta: z.json().nullable().optional(),
  placeName: z.string().nullable().optional(),
  price: z.number().int().nonnegative().nullable().optional(),
  abv: z.number().min(0).max(100).nullable().optional(),
  drunkAt: z.string().optional(),
  photoUrl: z.string().nullable().optional(),
});

export const UpdateRecordInput = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  categoryId: z.string().uuid().nullable().optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  isFavorite: z.boolean().optional(),
  memo: z.string().nullable().optional(),
  meta: z.json().nullable().optional(),
  placeName: z.string().nullable().optional(),
  price: z.number().int().nonnegative().nullable().optional(),
  abv: z.number().min(0).max(100).nullable().optional(),
  drunkAt: z.string().optional(),
  photoUrl: z.string().nullable().optional(),
});

export const RemoveRecordInput = z.object({ id: z.string().uuid() });

// --- エンジンの insert/update 入力（実 DB カラム＝snake_case） ---
// user_id は DB default auth.uid() が埋めるので含めない。
const RecordInsertData = z.object({
  name: z.string().min(1),
  category_id: z.string().uuid().nullable().optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  is_favorite: z.boolean().optional(),
  memo: z.string().nullable().optional(),
  meta: z.json().nullable().optional(),
  place_name: z.string().nullable().optional(),
  price: z.number().int().nonnegative().nullable().optional(),
  abv: z.number().min(0).max(100).nullable().optional(),
  drunk_at: z.string().optional(),
  photo_url: z.string().nullable().optional(),
});

const RecordUpdateData = z.object({
  name: z.string().min(1).optional(),
  category_id: z.string().uuid().nullable().optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  is_favorite: z.boolean().optional(),
  memo: z.string().nullable().optional(),
  meta: z.json().nullable().optional(),
  place_name: z.string().nullable().optional(),
  price: z.number().int().nonnegative().nullable().optional(),
  abv: z.number().min(0).max(100).nullable().optional(),
  drunk_at: z.string().optional(),
  photo_url: z.string().nullable().optional(),
  updated_at: z.string().optional(),
});

// 操作の単一定義。row を渡すことで filter/match が実テーブル全カラムで型付けされる。
export const recordsSchema = createSupabaseSchema({
  "@select/records": select({
    output: z.array(RecordResponseSchema),
    select: GET_RECORDS_QUERY,
    row: RecordEntitySchema,
  }),
  "@insert/records": insert({ input: RecordInsertData }),
  "@update/records": update({
    input: RecordUpdateData,
    row: RecordEntitySchema,
  }),
  "@delete/records": deleteFrom({ row: RecordEntitySchema }),
});
