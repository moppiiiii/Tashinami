import { createFileRoute } from "@tanstack/react-router";

import { MarkdownPage } from "@/components/markdown/markdown-page";
// 本文の正本は src/content/legal/terms.md。`?raw` で読み込んでそのまま描画する。
import termsMarkdown from "@/content/legal/terms.md?raw";

// 公開ページ（未ログインでも閲覧可）。
export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "利用規約 — 嗜み（Tashinami）" },
      {
        name: "description",
        content: "嗜み（Tashinami）の利用規約です。",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return <MarkdownPage markdown={termsMarkdown} />;
}
