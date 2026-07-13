import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="py-10">
      <div className="via-ink-line mb-6 h-px bg-linear-to-r from-transparent to-transparent" />
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="flex items-baseline gap-2">
          <span className="font-jp-serif font-semibold text-[color:var(--rice)]">
            嗜み
          </span>
          <span className="text-rice-dim text-[0.68rem] font-bold tracking-[0.28em] uppercase">
            Tashinami
          </span>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          <Link
            to="/concept"
            className="text-rice-dim hover:text-amber-bright no-underline transition-colors"
          >
            コンセプト
          </Link>
          <Link
            to="/drinks"
            className="text-rice-dim hover:text-amber-bright no-underline transition-colors"
          >
            飲み方ガイド
          </Link>
          <Link
            to="/creator"
            className="text-rice-dim hover:text-amber-bright no-underline transition-colors"
          >
            制作者について
          </Link>
          <Link
            to="/contact"
            className="text-rice-dim hover:text-amber-bright no-underline transition-colors"
          >
            お問い合わせ
          </Link>
          <Link
            to="/terms"
            className="text-rice-dim hover:text-amber-bright no-underline transition-colors"
          >
            利用規約
          </Link>
          <Link
            to="/privacy"
            className="text-rice-dim hover:text-amber-bright no-underline transition-colors"
          >
            プライバシーポリシー
          </Link>
        </nav>
        <p className="text-rice-dim text-xs">© 2026 Tashinami</p>
      </div>
    </footer>
  );
}
