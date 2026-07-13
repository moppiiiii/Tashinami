import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { Plus } from "lucide-react";

import { Button } from "@/components/common/button";
import { AppFooter } from "@/components/layout/app-footer";
import { AuthedHeader } from "@/components/layout/authed-header";
import { RecentPours } from "@/components/records/recent-pours";
import { RecordList } from "@/components/records/record-list";
import { RecordReveal } from "@/components/records/record-reveal";
import { clearReveal, revealStore } from "@/components/records/reveal-store";
import { ShelfStats } from "@/components/records/shelf-stats";
import { categoriesQueryOptions } from "@/server/categories";
import { recordsQueryOptions } from "@/server/records";
import { topDrinksQueryOptions } from "@/server/top-drinks";

// ホーム（棚）。直近の一杯を並べ、全一覧は /records へ。記録は /records/new。
// 保存後はここへ着地し、出会いのリヴィールが灯る（reveal-store 経由）。
// top_drinks も prefetch する（リヴィールが殿堂の空き席を見て誘うため）。
export const Route = createFileRoute("/_authed/home")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(recordsQueryOptions()),
      context.queryClient.ensureQueryData(categoriesQueryOptions()),
      context.queryClient.ensureQueryData(topDrinksQueryOptions()),
    ]),
  component: HomePage,
});

function HomePage() {
  // ガード（_authed）が context にマージした user。非 null。
  const { user } = Route.useRouteContext();
  const { data: records } = useSuspenseQuery(recordsQueryOptions());
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions());
  const reveal = useStore(revealStore);

  const recent = records.slice(0, 5);

  return (
    <main className="tashinami-lp min-h-dvh">
      <div className="mx-auto w-full max-w-4xl px-6">
        <AuthedHeader />

        <section className="animate-lp-rise py-12 motion-reduce:animate-none md:py-16">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-latin text-amber-bright text-base tracking-[0.01em] italic">
                おかえりなさい。
              </p>
              <h1 className="font-jp-serif mt-1 text-3xl font-semibold md:text-4xl">
                {user.email} さんの棚
              </h1>
              <p className="text-rice-dim mt-3 max-w-md leading-relaxed">
                今夜の一杯を、静かに残していきましょう。
              </p>
            </div>
            <Button asChild>
              <Link to="/records/new" className="shrink-0 no-underline">
                <Plus size={18} />
                一杯を記録する
              </Link>
            </Button>
          </div>

          {records.length > 0 ? (
            <>
              <div className="mt-10">
                <ShelfStats records={records} />
              </div>

              <div className="mt-12">
                <div className="mb-6 flex items-baseline justify-between">
                  <h2 className="font-jp-serif text-xl font-semibold">
                    最近の一杯
                  </h2>
                  <Link
                    to="/records"
                    className="text-amber-bright text-sm no-underline"
                  >
                    すべて見る →
                  </Link>
                </div>
                <RecentPours records={recent} categories={categories} />
              </div>
            </>
          ) : (
            <div className="mt-10">
              <RecordList records={recent} />
            </div>
          )}
        </section>

        <AppFooter />
      </div>

      <RecordReveal result={reveal} onClose={clearReveal} />
    </main>
  );
}
