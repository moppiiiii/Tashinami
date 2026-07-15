import { createFileRoute } from "@tanstack/react-router";

import { MarkdownPage } from "@/components/markdown/markdown-page";
// 本文の正本は src/content/legal/terms.md。`?raw` で読み込んでそのまま描画する。
import termsMarkdown from "@/content/legal/terms.md?raw";
import { pageHead } from "@/lib/seo";

// 公開ページ（未ログインでも閲覧可）。
export const Route = createFileRoute("/terms")({
  head: () =>
    pageHead({
      title: "利用規約 — 嗜み（Tashinami）",
      description: "嗜み（Tashinami）の利用規約です。",
      path: "/terms",
    }),
  component: TermsPage,
});

function TermsPage() {
  return <MarkdownPage markdown={termsMarkdown} />;
}
