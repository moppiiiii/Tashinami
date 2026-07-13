import { createFileRoute } from "@tanstack/react-router";

import { MarkdownPage } from "@/components/markdown/markdown-page";
// 本文の正本は src/content/legal/privacy.md。`?raw` で読み込んでそのまま描画する。
import policyMarkdown from "@/content/legal/privacy.md?raw";

// 公開ページ（未ログインでも閲覧可）。
export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "プライバシーポリシー — 嗜み（Tashinami）" },
      {
        name: "description",
        content: "嗜み（Tashinami）のプライバシーポリシーです。",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return <MarkdownPage markdown={policyMarkdown} />;
}
