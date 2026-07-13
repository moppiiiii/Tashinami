import { Link } from "@tanstack/react-router";

// サイト共通フッター。ロゴ＋情報ページ導線＋著作権表示。
// landing / MarkdownPage（規約・制作者）/ contact で共有する。
export function Footer() {
  return (
    <footer className="py-10">
      <div className="lp-divider mb-6" />
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="flex items-baseline gap-2">
          <span className="lp-serif text-[color:var(--rice)]">嗜み</span>
          <span className="lp-eyebrow">Tashinami</span>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          <Link to="/drinks" className="lp-dim no-underline">
            飲み方ガイド
          </Link>
          <Link to="/creator" className="lp-dim no-underline">
            制作者について
          </Link>
          <Link to="/contact" className="lp-dim no-underline">
            お問い合わせ
          </Link>
          <Link to="/terms" className="lp-dim no-underline">
            利用規約
          </Link>
          <Link to="/privacy" className="lp-dim no-underline">
            プライバシーポリシー
          </Link>
        </nav>
        <p className="lp-dim text-xs">© 2025 Tashinami</p>
      </div>
    </footer>
  );
}
