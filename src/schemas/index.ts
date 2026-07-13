import { categoriesSchema } from "./categories";
import { recordsSchema } from "./records";
import { todosSchema } from "./todos";

// アプリ全体のスキーマ。新しいテーブルの断片をここにスプレッドで合流させる。
export const appSchema = {
  ...todosSchema,
  ...categoriesSchema,
  ...recordsSchema,
};

export type AppSchema = typeof appSchema;
