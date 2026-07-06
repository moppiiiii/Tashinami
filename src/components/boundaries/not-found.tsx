import { Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";

// 未一致 URL、または `notFound()` を throw したときの受け皿。
// router.tsx の defaultNotFoundComponent に配線され、全ルートが継承する。
// 見た目は LP（.tashinami-lp）の琥珀×墨トーンに合わせる。
export function NotFoundComponent() {
  return (
    <main className="tashinami-lp grid min-h-dvh place-items-center px-6">
      <div className="lp-rise w-full max-w-md text-center">
        <span className="lp-chip mx-auto mb-5 flex size-12 items-center justify-center rounded-full p-0">
          <Compass size={20} />
        </span>
        <p className="lp-eyebrow mb-2">404</p>
        <h1 className="lp-serif text-2xl md:text-3xl">
          ページが見つかりません
        </h1>
        <p className="lp-dim mx-auto mt-3 max-w-sm text-sm leading-relaxed">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <div className="mt-8 flex justify-center">
          <Link to="/" className="lp-cta no-underline">
            トップへ
          </Link>
        </div>
      </div>
    </main>
  );
}
