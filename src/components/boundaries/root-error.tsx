import type { ErrorComponentProps } from "@tanstack/react-router";
import { Link, useRouter } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";

// ルート配下で throw された例外（serverFn の Result → throw を含む）の受け皿。
// router.tsx の defaultErrorComponent に配線され、全ルートが継承する。
// 注意: `redirect()`（未ログイン→/login 等）は例外ではなく制御フローなので
// ここには落ちてこない（TanStack Router が別扱いする）。
// 見た目は LP（.tashinami-lp）の琥珀×墨トーンに合わせる。
export function RootErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter();

  return (
    <main className="tashinami-lp grid min-h-dvh place-items-center px-6">
      <div className="lp-rise w-full max-w-md text-center">
        <span className="lp-chip mx-auto mb-5 flex size-12 items-center justify-center rounded-full p-0">
          <TriangleAlert size={20} />
        </span>
        <p className="lp-eyebrow mb-2">Error</p>
        <h1 className="lp-serif text-2xl md:text-3xl">問題が発生しました</h1>
        <p className="lp-dim mx-auto mt-3 max-w-sm text-sm leading-relaxed break-words">
          {error.message || "予期しないエラーが発生しました。"}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            className="lp-cta"
            onClick={() => {
              // 例外境界をリセットし、ローダーを再実行して再取得する。
              reset();
              router.invalidate();
            }}
          >
            再試行
          </button>
          <Link to="/" className="lp-ghost no-underline">
            トップへ
          </Link>
        </div>
      </div>
    </main>
  );
}
