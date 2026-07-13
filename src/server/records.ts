import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { $supabaseServer } from "@/lib/supabase/server";
import {
  AddRecordInput,
  type DrinkRecord,
  RemoveRecordInput,
  UpdateRecordInput,
} from "@/schemas/records";

// 1 リソースの fetch / mutation（どちらも serverFn）を 1 ファイルにまとめる。
// user_id は DB の default auth.uid() ＋ RLS が担保するため入力・書き込みに含めない。

export const getRecords = createServerFn().handler(
  async (): Promise<DrinkRecord[]> => {
    const $supabase = await $supabaseServer();
    const result = await $supabase("@select/records", {
      filter: (q) => q.order("drunk_at", { ascending: false }),
    });
    return result.unwrapOr([]);
  },
);

export const recordsQueryOptions = () =>
  queryOptions({
    queryKey: ["records"],
    queryFn: () => getRecords(),
  });

export const addRecord = createServerFn({ method: "POST" })
  .validator(AddRecordInput)
  .handler(async ({ data }) => {
    const $supabase = await $supabaseServer();
    const result = await $supabase("@insert/records", {
      data: {
        name: data.name,
        category_id: data.categoryId ?? null,
        rating: data.rating ?? null,
        is_favorite: data.isFavorite ?? false,
        memo: data.memo ?? null,
        meta: data.meta ?? null,
        place_name: data.placeName ?? null,
        price: data.price ?? null,
        abv: data.abv ?? null,
        // 未指定なら「今」。undefined を渡すと null 挿入になり not-null 制約に触れるため。
        drunk_at: data.drunkAt ?? new Date().toISOString(),
        photo_url: data.photoUrl ?? null,
      },
    });
    if (result.isErr()) throw result.error;
  });

export const updateRecord = createServerFn({ method: "POST" })
  .validator(UpdateRecordInput)
  .handler(async ({ data }) => {
    const $supabase = await $supabaseServer();
    const {
      id,
      categoryId,
      isFavorite,
      placeName,
      drunkAt,
      photoUrl,
      ...rest
    } = data;
    const result = await $supabase("@update/records", {
      // rest（name/rating/memo/meta/price/abv）はカラム名と一致。camelCase 差分だけ振り分ける。
      data: {
        ...rest,
        ...(categoryId !== undefined ? { category_id: categoryId } : {}),
        ...(isFavorite !== undefined ? { is_favorite: isFavorite } : {}),
        ...(placeName !== undefined ? { place_name: placeName } : {}),
        ...(drunkAt !== undefined ? { drunk_at: drunkAt } : {}),
        ...(photoUrl !== undefined ? { photo_url: photoUrl } : {}),
        updated_at: new Date().toISOString(),
      },
      match: { id },
    });
    if (result.isErr()) throw result.error;
  });

export const removeRecord = createServerFn({ method: "POST" })
  .validator(RemoveRecordInput)
  .handler(async ({ data }) => {
    const $supabase = await $supabaseServer();
    const result = await $supabase("@delete/records", {
      match: { id: data.id },
    });
    if (result.isErr()) throw result.error;
  });
