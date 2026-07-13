import type { ErrorComponentProps } from "@tanstack/react-router";
import { Link, useRouter } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/common/button";
import { Chip } from "@/components/common/chip";

// ルート配下で throw された例外（serverFn の Result → throw を含む）の受け皿。
// router.tsx の defaultErrorComponent に配線され、全ルートが継承する。
export function RootErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter();

  return (
    <main className="tashinami-lp grid min-h-dvh place-items-center px-6">
      <div className="animate-lp-rise w-full max-w-md text-center motion-reduce:animate-none">
        <Chip className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full p-0">
          <TriangleAlert size={20} />
        </Chip>
        <p className="text-rice-dim mb-2 text-[0.68rem] font-bold tracking-[0.28em] uppercase">
          Error
        </p>
        <h1 className="font-jp-serif text-2xl font-semibold md:text-3xl">
          問題が発生しました
        </h1>
        <p className="text-rice-dim mx-auto mt-3 max-w-sm text-sm leading-relaxed break-words">
          {error.message || "予期しないエラーが発生しました。"}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            onClick={() => {
              // 例外境界をリセットし、ローダーを再実行して再取得する。
              reset();
              router.invalidate();
            }}
          >
            再試行
          </Button>
          <Button asChild variant="ghost">
            <Link to="/" className="no-underline">
              トップへ
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
