import { categoriesSchema } from "./categories";
import { recordsSchema } from "./records";
import { topDrinksSchema } from "./top-drinks";

// アプリ全体のスキーマ。新しいテーブルの断片をここにスプレッドで合流させる。
export const appSchema = {
  ...categoriesSchema,
  ...recordsSchema,
  ...topDrinksSchema,
};

export type AppSchema = typeof appSchema;
