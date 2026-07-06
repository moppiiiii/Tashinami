import { Link } from "@tanstack/react-router";
import Markdown from "react-markdown";

import styles from "./legal-layout.module.css";

// 利用規約・プライバシーポリシー共通の枠。LP と同じ佇まいで、読みやすい幅に絞る。
// 本文は src/content/legal/*.md を正本として `?raw` で読み込み、そのまま Markdown 描画する。
// 見出し・日付は md 側に含まれる（title プロップは head の <title> 用のみ）。
export function LegalLayout({ markdown }: { markdown: string }) {
  return (
    <main className="tashinami-lp min-h-dvh">
      <div className="mx-auto w-full max-w-3xl px-6">
        <header className="flex items-center justify-between py-6">
          <Link to="/" className="flex items-baseline gap-2 no-underline">
            <span className="lp-serif text-xl text-[color:var(--rice)]">
              嗜み
            </span>
            <span className="lp-eyebrow">Tashinami</span>
          </Link>
          <Link to="/" className="lp-ghost text-sm no-underline">
            トップへ
          </Link>
        </header>

        <article className={`lp-rise ${styles.body} py-8 md:py-12`}>
          <Markdown>{markdown}</Markdown>
        </article>

        <footer className="py-10">
          <div className="lp-divider mb-6" />
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <nav className="flex items-center gap-6 text-sm">
              <Link to="/terms" className="lp-dim no-underline">
                利用規約
              </Link>
              <Link to="/privacy" className="lp-dim no-underline">
                プライバシーポリシー
              </Link>
            </nav>
            <p className="lp-dim text-xs">
              © 2025 Tashinami — ほどよく、品よく、味わう。
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
