import * as z from "zod";

import { createSupabaseSchema, select, upsert } from "@/lib/supabase/query";

// 殿堂（TOP10）。評価から計算せず、本人が選んで並べた「意思」を持つ。
// ユーザーごとに 1 行で、items の配列順がそのまま順位。並べ替えを 10 行の
// position 書き換えでやると一意制約と競合して壊れやすいので、行ごと差し替える。
//
// 想定 DDL（適用済み）:
//   create table top_drinks (
//     user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
//     items jsonb not null default '[]'::jsonb,
//     updated_at timestamptz not null default now()
//   );
//   alter table top_drinks enable row level security;
//   create policy "own rows" on top_drinks
//     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

export const TOP_DRINKS_LIMIT = 10;

// key は表記揺れを畳んだ正規化キー（src/lib/match.ts）。記録側で綴りを直しても席が外れない。
// name は表示用のスナップショット。記録を全部消しても「かつて選んだ」事実は残る。
export const TopDrinkItemSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
});

export type TopDrinkItem = z.infer<typeof TopDrinkItemSchema>;

export const TopDrinksEntitySchema = z.object({
  user_id: z.string().uuid(),
  items: z.array(TopDrinkItemSchema),
  updated_at: z.string(),
});

export const GET_TOP_DRINKS_QUERY = "user_id, items, updated_at";

export const TopDrinksResponseSchema = TopDrinksEntitySchema.pick({
  items: true,
  updated_at: true,
}).transform((row) => ({
  items: row.items,
  updatedAt: row.updated_at,
}));

export type TopDrinks = z.infer<typeof TopDrinksResponseSchema>;

// --- API リクエスト（serverFn の .validator と共有） ---
export const SaveTopDrinksInput = z.object({
  items: z.array(TopDrinkItemSchema).max(TOP_DRINKS_LIMIT),
});

// --- エンジンの upsert 入力（実 DB カラム） ---
// user_id は他リソースと違いここでは明示的に送る。upsert の衝突判定（PK）に要るため。
const TopDrinksUpsertData = z.object({
  user_id: z.string().uuid(),
  items: z.array(TopDrinkItemSchema),
  updated_at: z.string().optional(),
});

export const topDrinksSchema = createSupabaseSchema({
  "@select/top_drinks": select({
    output: z.array(TopDrinksResponseSchema),
    select: GET_TOP_DRINKS_QUERY,
    row: TopDrinksEntitySchema,
  }),
  "@upsert/top_drinks": upsert({ input: TopDrinksUpsertData }),
});
