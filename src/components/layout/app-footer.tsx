import { Link } from "@tanstack/react-router";

import { jstNow } from "@/lib/date";

// ログイン後の画面用フッター。公開ページの Footer とは別物で、
// マーケ導線（コンセプト・制作者・飲み方）は載せない。
// 登録済みの人がいつでも法務文書と問い合わせ窓口に辿り着けるための、それだけの帯。
export function AppFooter() {
  const year = jstNow().getUTCFullYear();

  return (
    <footer className="py-8">
      <div className="via-ink-line mb-5 h-px bg-linear-to-r from-transparent to-transparent" />
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:justify-between">
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
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
          <Link
            to="/contact"
            className="text-rice-dim hover:text-amber-bright no-underline transition-colors"
          >
            お問い合わせ
          </Link>
        </nav>
        <p className="text-rice-dim text-xs">© {year} Tashinami</p>
      </div>
    </footer>
  );
}
