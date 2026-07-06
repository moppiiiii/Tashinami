import { Loader2 } from "lucide-react";

// ローダー待ち（defaultPendingMs 超過）の間に出す骨組み。
// router.tsx の defaultPendingComponent に配線され、全ルートが継承する。
// エラーではなく読み込み状態だが、router の境界フォールバックという役割で
// root-error / not-found と同じ components/boundaries/ に同居させている。
// SSR ファースト（loader で ensureQueryData 済み）の初回表示では通常出ず、
// 遷移時やキャッシュ未ヒット時のフォールバックとして働く。
// 見た目は LP（.tashinami-lp）の琥珀×墨トーンに合わせる。
export function RoutePending() {
  return (
    <main className="tashinami-lp grid min-h-dvh place-items-center px-6">
      <div
        className="lp-dim lp-rise flex items-center gap-3"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="lp-amber size-5 animate-spin" />
        <span className="text-sm">読み込み中…</span>
      </div>
    </main>
  );
}
