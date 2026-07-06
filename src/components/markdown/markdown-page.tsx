import Markdown from "react-markdown";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

import styles from "./markdown-page.module.css";

// Markdown 由来の静的ページ共通の枠（利用規約・プライバシー・制作者など）。
// LP と同じ佇まいで、読みやすい幅に絞る。本文は各ルートが `?raw` で読み込んだ
// Markdown を渡す。見出し・日付等は md 側に含まれる。
export function MarkdownPage({ markdown }: { markdown: string }) {
  return (
    <main className="tashinami-lp min-h-dvh">
      <div className="mx-auto w-full max-w-3xl px-6">
        <Header />
        <article className={`lp-rise ${styles.body} py-8 md:py-12`}>
          <Markdown>{markdown}</Markdown>
        </article>
        <Footer />
      </div>
    </main>
  );
}
