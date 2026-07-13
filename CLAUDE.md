# CLAUDE.md

TanStack Start + Supabase のフロントエンドテンプレート。

## 設計ドキュメント（正本）

データアクセス層の設計思想・規約は `docs/` を参照する。実装前に必ず読む。

- `docs/README.md` — 核となる設計思想
- `docs/architecture.md` — ディレクトリ構成・配置規約・データフロー
- `docs/data-access.md` — Supabase アクセス層（型安全エンジン・entity/response・embed・適用範囲）
- `docs/adding-a-resource.md` — リソース追加手順
- `docs/styling.md` — Tailwind と CSS の境界（角括弧テスト）

## リソース追加

新しい Supabase テーブル/リソースの CRUD を足すときは `add-supabase-resource` skill に従う。

## スタイリング

UI を書くときは `docs/styling.md` の「角括弧テスト」に従う。既定は Tailwind ユーティリティ（JSX の `className`）。
`src/styles.components.css` に置くのは次の 4 条件のどれかに当たるときだけ。

1. **装飾**に任意値 `[...]` が要る（多層グラデーション・複合 box-shadow・cubic-bezier・filter）。寸法の任意値（`grid-cols-[auto_1fr]` 等）は Tailwind のままでよい。
2. `animation` / `@keyframes`（`prefers-reduced-motion` の打ち消しと必ずセットで書く）。
3. `::before` / `::after` の `content`。
4. 同じ見た目が 3 箇所以上で再利用される（まず React コンポーネント化を検討する）。

条件に当たらないものを CSS に書かない。色は生値の `rgba()` ではなくトークン＋ `color-mix()` で導出する。

## 仕上げ

変更後は `bun run check`（tsgo ＋ oxlint ＋ oxfmt）を通す。整形は `bun run format`（oxfmt）。型のみは `bun run typecheck`（tsgo）。

## 対応後のサマリー

作業が完了したら、最後にわかりやすいサマリーを出す。以下を簡潔にまとめる。

- **やったこと** — 対応内容の要約（1〜3行）。
- **変更ファイル** — 追加・変更・削除したファイルと、それぞれの役割を1行で。
- **確認結果** — `bun run check` などの実行結果（通ったか／失敗したか）。
- **次のアクション** — 残タスク・確認が必要な点・フォローアップがあれば。なければ「なし」。
