# データアクセス層

`src/lib/supabase/` のスキーマ駆動エンジンと、その上の規約を説明します。

## 全体像

```
schemas/<resource>.ts          lib/supabase/
  zod スキーマ                    query.ts   … 型安全エンジン（createSupabaseClient）
  + 取得クエリ定数        ──┐     client.ts  … $supabaseClient（ブラウザ）
  + 操作の断片              │     server.ts  … $supabaseServer（サーバー・cookie）
schemas/index.ts             │     index.ts   … エンジン公開 API
  appSchema（全断片を合流） ◀┘
        ▲
        └ $supabaseClient / $supabaseServer が同じ appSchema を共有
```

## 操作キーとスキーマ断片

各操作は `@<操作>/<テーブル>` 形式のキーで表す。

```ts
export const recordsSchema = createSupabaseSchema({
  "@select/records": select({ output, select: GET_RECORDS_QUERY, row }),
  "@insert/records": insert({ input }),
  "@update/records": update({ input }),
  "@delete/records": deleteFrom(),
});
```

呼び出しはキーで行い、キーはコンパイル時に検証される。

```ts
const $supabase = await $supabaseServer();
const result = await $supabase("@select/records", { filter: (q) => q.order("drunk_at") });
//                              ^^^^^^^^^^^^^^^^ タイポはコンパイルエラー
```

戻り値は常に `Result<T, SupabaseError>`（neverthrow）。`result.unwrapOr([])` / `result.isErr()` / `result.match(...)` で扱う。

## エンティティ / レスポンス パターン

DB の全カラムを表す **EntitySchema** を定義し、レスポンスはそこから `.pick()`（必要なら `.extend()`／`.transform()`）で派生させる。

```ts
// 全カラム
export const RecordEntitySchema = z.object({
  id, user_id, name, category_id, rating, is_favorite, memo, place_name, drunk_at, created_at, ...
});

// レスポンス: フラット列を pick + 関連を extend + camelCase に transform
export const RecordResponseSchema = RecordEntitySchema.pick({
  id: true, name: true, rating: true, is_favorite: true, drunk_at: true,
})
  .extend({ category: CategoryRefSchema.nullable() })
  .transform((row) => ({ ...row, isFavorite: row.is_favorite, drunkAt: row.drunk_at }));

// TS 組み込みの Record と衝突しないよう DrinkRecord とする。
export type DrinkRecord = z.infer<typeof RecordResponseSchema>; // camelCase + ネスト
```

## 型安全の要：入力と出力の分離

エンジンは 1 つのスキーマから **2 つの型**を取り出して別々の用途に使う。

| 用途 | 型ソース | 例 |
|---|---|---|
| 戻り値の型 | `z.output<Schema>`（変換後） | `record.drunkAt`（camelCase） |
| filter のカラム型 | `select({ row })` の行型（変換前 ＝ 実 DB カラム） | `q.order("drunk_at")`（snake_case） |

この分離のおかげで、**`.transform()` で camelCase 化しても filter のカラム安全性が壊れない**。

```ts
$supabase("@select/records", {
  filter: (q) =>
    q.eq("category_id", id)        // ✅ row（実テーブル）由来。response に無くても OK
     .order("drunk_at"),           // ✅ snake_case
  //  .order("drunkAt")            // ❌ コンパイルエラー
});
```

`filter` に渡るのは `TypedFilterBuilder<Row>`（`query.ts`）。postgrest のよく使うメソッド（`eq`/`order`/`in`/`like`/`match` ...）をカラム名 `keyof Row` に制約した安全なサブセット。**使いたいメソッドが無ければこのインターフェースに足して拡張する。**

## join（embed）

関連テーブルは postgrest の埋め込みで取得する。

```ts
// 取得クエリに埋め込みを書く
export const GET_RECORDS_QUERY =
  "id, name, rating, is_favorite, drunk_at, category:categories(id, name)";

// レスポンススキーマをネスト構造にする → 戻り値の型もネストして付く
.extend({ category: CategoryRefSchema.nullable() })
```

- **読み取り**（関連データの表示）: 上記で型付きのまま通る。
- **絞り込み**: `select({ row: RecordEntitySchema })` を渡すことで、レスポンスに含めない外部キー（`category_id`）でも filter が型付けされる。

## 書き込みの `match`（update / delete）

`update`/`deleteFrom` に `row`（実テーブルの全カラム）を渡すと、`match` が `Partial<Row>` で型付けされる。カラム名のタイポや値の型違いはコンパイルエラーになる。

```ts
"@update/records": update({ input, row: RecordEntitySchema }),
"@delete/records": deleteFrom({ row: RecordEntitySchema }),

$supabase("@update/records", { data: { is_favorite: true }, match: { id } });
//                                                          match: { idd: id }  ❌ コンパイルエラー
```

`row` 省略時は `match: Record<string, unknown>`（型なし）にフォールバックする。新規リソースでは `row` を渡すのを既定にする。

## サーバー / ブラウザ クライアント

- **`$supabaseServer()`** — serverFn 内で使う既定経路。cookie をリクエストごとに読むためファクトリ（毎回 `await` する）。生成時に `getSession()` でセッションを水和するため async。`.raw` で素のクライアント（auth など）にアクセスできる。
- **`$supabaseClient`** — ブラウザ用。mutation の既定経路では **ない**。Realtime 購読などブラウザ直叩きが必要なときだけの opt-in。

`lib/supabase/index.ts` はエンジン API だけを re-export し、クライアント実体は出さない（環境を跨いだ誤 import を防ぐため、`./server` `./client` から直接 import する）。

## 適用範囲と限界

| やりたいこと | 対応 |
|---|---|
| 単一テーブルの CRUD | ✅ |
| 関連データを一緒に表示（embed 読み取り） | ✅ 型付き |
| 自テーブル＋外部キーでの絞り込み | ✅ 型付き（`row`） |
| 関連テーブルの**列**での型付き filter/order（`referencedTable`） | ⚠️ 未対応 → `$supabaseServer().raw` に退避 |
| insert/update の結果行を返す（`RETURNING`） | ⚠️ 未対応（mutation は `void`）。楽観 temp-id ＋再取得で回避 |

関連クエリが主役級になるアプリでは、この層を拡張するか、Supabase 公式の型生成（`supabase gen types`）併用ラインを別途検討する。
