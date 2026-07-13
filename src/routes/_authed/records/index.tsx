import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { RecordsBrowser } from "@/components/records/records-browser";
import { categoriesQueryOptions } from "@/server/categories";
import { recordsQueryOptions } from "@/server/records";

// これまでの一杯のフル一覧（Phase 1 の検索・絞り込みの置き場所）。
// 記録は home と同じくモーダルから。loader で records / categories を prefetch する。
export const Route = createFileRoute("/_authed/records/")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(recordsQueryOptions()),
      context.queryClient.ensureQueryData(categoriesQueryOptions()),
    ]),
  component: RecordsPage,
});

function RecordsPage() {
  const { data: records } = useSuspenseQuery(recordsQueryOptions());
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions());

  return (
    <main className="tashinami-lp min-h-dvh">
      <div className="mx-auto w-full max-w-4xl px-6">
        <header className="flex items-center justify-between py-6">
          <Link to="/home" className="flex items-baseline gap-2 no-underline">
            <span className="lp-serif text-xl text-[color:var(--rice)]">
              嗜み
            </span>
            <span className="lp-eyebrow">Tashinami</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/zukan" className="lp-ghost text-sm no-underline">
              図鑑
            </Link>
            <Link to="/records/new" className="lp-cta text-sm no-underline">
              <Plus size={16} />
              記録する
            </Link>
          </div>
        </header>

        <section className="lp-rise py-8 md:py-12">
          <RecordsBrowser records={records} categories={categories} />
        </section>
      </div>
    </main>
  );
}
