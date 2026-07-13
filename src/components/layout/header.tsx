import { Link } from "@tanstack/react-router";

import { Button } from "@/components/common/button";

// 下層ページ共通のシンプルヘッダー（ロゴ＋トップへ）。
export function Header() {
  return (
    <header className="flex items-center justify-between py-6">
      <Link to="/" className="flex items-baseline gap-2 no-underline">
        <span className="font-jp-serif text-xl font-semibold text-[color:var(--rice)]">
          嗜み
        </span>
        <span className="text-rice-dim text-[0.68rem] font-bold tracking-[0.28em] uppercase">
          Tashinami
        </span>
      </Link>
      <Button asChild variant="ghost">
        <Link to="/" className="text-sm no-underline">
          トップへ
        </Link>
      </Button>
    </header>
  );
}
