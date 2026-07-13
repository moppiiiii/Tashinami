import { Loader2 } from "lucide-react";

// ローダー待ち（defaultPendingMs 超過）の間に出す骨組み。
// router.tsx の defaultPendingComponent に配線され、全ルートが継承する。
export function RoutePending() {
  return (
    <main className="tashinami-lp grid min-h-dvh place-items-center px-6">
      <div
        className="text-rice-dim animate-lp-rise flex items-center gap-3 motion-reduce:animate-none"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="text-amber-bright size-5 animate-spin" />
        <span className="text-sm">読み込み中…</span>
      </div>
    </main>
  );
}
