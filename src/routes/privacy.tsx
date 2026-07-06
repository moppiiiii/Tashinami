import { createFileRoute } from "@tanstack/react-router";

import { LegalLayout } from "@/components/legal/legal-layout";
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
  return <LegalLayout markdown={policyMarkdown} />;
}
