import { Link } from "@tanstack/react-router";

// 下層ページ共通のシンプルヘッダー（ロゴ＋トップへ）。
// landing は独自ヘッダー（セクションナビ＋ログイン）を持つため対象外。
export function Header() {
  return (
    <header className="flex items-center justify-between py-6">
      <Link to="/" className="flex items-baseline gap-2 no-underline">
        <span className="lp-serif text-xl text-[color:var(--rice)]">嗜み</span>
        <span className="lp-eyebrow">Tashinami</span>
      </Link>
      <Link to="/" className="lp-ghost text-sm no-underline">
        トップへ
      </Link>
    </header>
  );
}
