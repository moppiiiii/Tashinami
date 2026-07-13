import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { AppFooter } from "@/components/layout/app-footer";
import { AuthedHeader } from "@/components/layout/authed-header";
import { Top10Board } from "@/components/records/top10-board";
import { categoriesQueryOptions } from "@/server/categories";
import { recordsQueryOptions } from "@/server/records";
import { topDrinksQueryOptions } from "@/server/top-drinks";

// 殿堂（TOP10）。順位は評価から計算せず、本人が選んで並べた top_drinks を正本とする。
export const Route = createFileRoute("/_authed/top10")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(topDrinksQueryOptions()),
      context.queryClient.ensureQueryData(recordsQueryOptions()),
      context.queryClient.ensureQueryData(categoriesQueryOptions()),
    ]),
  component: Top10Page,
});

function Top10Page() {
  const { data: items } = useSuspenseQuery(topDrinksQueryOptions());
  const { data: records } = useSuspenseQuery(recordsQueryOptions());
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions());

  return (
    <main className="tashinami-lp min-h-dvh">
      <div className="mx-auto w-full max-w-4xl px-6">
        <AuthedHeader />

        <section className="animate-lp-rise py-8 motion-reduce:animate-none md:py-12">
          <p className="text-rice-dim mb-3 text-[0.68rem] font-bold tracking-[0.28em] uppercase">
            Hall of Fame
          </p>
          <h1 className="font-jp-serif text-3xl font-semibold md:text-4xl">
            好きな一杯が、並ぶ。
          </h1>
          <p className="text-rice-dim mt-3 max-w-md leading-relaxed">
            点数では決めません。
            <span className="text-[color:var(--rice)]">選ぶのは、あなた</span>
            。10 点が 20 個あっても、席は 10 だけです。
          </p>

          <Top10Board items={items} records={records} categories={categories} />
        </section>

        <AppFooter />
      </div>
    </main>
  );
}
