import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { AuthedHeader } from "@/components/layout/authed-header";
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
        <AuthedHeader />

        <section className="lp-rise py-8 md:py-12">
          <RecordsBrowser records={records} categories={categories} />
        </section>
      </div>
    </main>
  );
}
