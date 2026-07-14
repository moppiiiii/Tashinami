import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/common/button";
import { Card } from "@/components/common/card";
import { AppFooter } from "@/components/layout/app-footer";
import { AuthedHeader } from "@/components/layout/authed-header";
import {
  buildAnnualSummary,
  yearsWithRecords,
} from "@/components/summary/annual";
import { AnnualReel } from "@/components/summary/annual-reel";
import { AnnualSpread } from "@/components/summary/annual-spread";
import { canPlayReel, hasChapters } from "@/components/summary/chapters";
import { hasSeenSummary, markSummarySeen } from "@/components/summary/seen";
import { categoriesQueryOptions } from "@/server/categories";
import { recordsQueryOptions } from "@/server/records";

// 年次サマリー＝一年の年鑑。集計は records だけから作る（新しいテーブルは足さない）。
export const Route = createFileRoute("/_authed/summary/$year")({
  loader: async ({ context, params }) => {
    const year = Number(params.year);
    // 桁数の合わない年（/summary/abc）はページを作らない。
    if (!Number.isInteger(year) || year < 2000 || year > 2999) throw notFound();

    await Promise.all([
      context.queryClient.ensureQueryData(recordsQueryOptions()),
      context.queryClient.ensureQueryData(categoriesQueryOptions()),
    ]);
    return { year };
  },
  component: SummaryPage,
});

function SummaryPage() {
  const { year } = Route.useLoaderData();
  const { data: records } = useSuspenseQuery(recordsQueryOptions());
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions());

  const summary = useMemo(
    () => buildAnnualSummary(records, year),
    [records, year],
  );
  const years = useMemo(() => yearsWithRecords(records), [records]);

  // 章立ては初回だけ。localStorage を見るのはハイドレーション後（SSR と食い違わせない）。
  const [reeling, setReeling] = useState(false);
  useEffect(() => {
    if (canPlayReel(summary) && !hasSeenSummary(year)) setReeling(true);
  }, [summary, year]);

  const closeReel = () => {
    markSummarySeen(year);
    setReeling(false);
  };

  return (
    <main className="tashinami-lp min-h-dvh">
      <div className="mx-auto w-full max-w-5xl px-6">
        <AuthedHeader />

        <section className="animate-lp-rise py-8 motion-reduce:animate-none md:py-12">
          {summary.pours === 0 ? (
            <EmptySummary year={year} />
          ) : (
            <AnnualSpread
              summary={summary}
              categories={categories}
              years={years}
              onReplay={
                hasChapters(summary) ? () => setReeling(true) : undefined
              }
            />
          )}
        </section>

        <AppFooter />
      </div>

      {reeling ? (
        <AnnualReel
          summary={summary}
          categories={categories}
          onDone={closeReel}
        />
      ) : null}
    </main>
  );
}

function EmptySummary({ year }: { year: number }) {
  return (
    <Card className="flex flex-col items-center px-6 py-16 text-center">
      <h1 className="font-jp-serif text-lg font-semibold">
        {year} 年の記録は、まだありません。
      </h1>
      <p className="text-rice-dim mt-2 max-w-xs text-sm leading-relaxed">
        一杯を残すたびに、この年の年鑑が埋まっていきます。
      </p>
      <div className="mt-6">
        <Button asChild>
          <Link to="/records/new" className="no-underline">
            <Plus size={18} />
            一杯を記録する
          </Link>
        </Button>
      </div>
    </Card>
  );
}
