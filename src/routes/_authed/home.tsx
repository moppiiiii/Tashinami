import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { NotebookPen } from "lucide-react";

import { useSignOut } from "@/hooks/use-sign-out";

// ホーム。API は叩かず、_authed ガードが用意した user を表示するだけの簡易画面。
export const Route = createFileRoute("/_authed/home")({
  component: HomePage,
});

function HomePage() {
  // ガード（_authed）が context にマージした user。非 null。
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const signOut = useSignOut();

  return (
    <main className="tashinami-lp min-h-dvh">
      <div className="mx-auto w-full max-w-4xl px-6">
        <header className="flex items-center justify-between py-6">
          <Link to="/" className="flex items-baseline gap-2 no-underline">
            <span className="lp-serif text-xl text-[color:var(--rice)]">
              嗜み
            </span>
            <span className="lp-eyebrow">Tashinami</span>
          </Link>
          <button
            type="button"
            className="lp-ghost text-sm"
            disabled={signOut.isPending}
            onClick={() =>
              signOut.mutate(undefined, {
                onSuccess: () => navigate({ to: "/login" }),
              })
            }
          >
            {signOut.isPending ? "ログアウト中…" : "ログアウト"}
          </button>
        </header>

        <section className="lp-rise py-12 md:py-16">
          <p className="lp-kicker text-base">おかえりなさい。</p>
          <h1 className="lp-serif mt-1 text-3xl md:text-4xl">
            {user.email} さんの棚
          </h1>
          <p className="lp-dim mt-3 max-w-md leading-relaxed">
            今夜の一杯を、静かに残していきましょう。
          </p>

          {/* 記録がまだ無いときの空状態（ダミー） */}
          <div className="lp-card mt-8 p-8 text-center">
            <span className="lp-chip mx-auto mb-4 flex size-12 items-center justify-center rounded-full p-0">
              <NotebookPen size={20} />
            </span>
            <h2 className="lp-serif text-lg">まだ、一杯も注がれていません。</h2>
            <p className="lp-dim mt-2 text-sm">
              最初の一杯を記録すると、ここに棚ができあがります。
            </p>
            <button type="button" className="lp-cta mt-6" disabled>
              一杯を記録する（準備中）
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
