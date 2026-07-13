import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Wine } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/common/button";
import { Card } from "@/components/common/card";
import { Chip } from "@/components/common/chip";
import { AppFooter } from "@/components/layout/app-footer";
import { AuthedHeader } from "@/components/layout/authed-header";
import { EncounterCard } from "@/components/zukan/encounter-card";
import {
  buildEncounters,
  type Encounter,
  seasonsTouched,
} from "@/components/zukan/encounters";
import { categoriesQueryOptions } from "@/server/categories";
import { recordsQueryOptions } from "@/server/records";

// 出会いの図鑑。records の (カテゴリ, 銘柄) 集約で「初めて出会った一杯」を並べる。
export const Route = createFileRoute("/_authed/zukan")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(recordsQueryOptions()),
      context.queryClient.ensureQueryData(categoriesQueryOptions()),
    ]),
  component: ZukanPage,
});

function ZukanPage() {
  const { data: records } = useSuspenseQuery(recordsQueryOptions());
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions());

  const encounters = useMemo(() => buildEncounters(records), [records]);

  // カテゴリ ID ごとに束ね、各束は初出会いの新しい順に並べる。
  const byCategory = useMemo(() => {
    const map = new Map<string | null, Encounter[]>();
    for (const e of encounters) {
      const list = map.get(e.categoryId) ?? [];
      list.push(e);
      map.set(e.categoryId, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => b.firstAt.localeCompare(a.firstAt));
    }
    return map;
  }, [encounters]);

  const total = encounters.length;
  const categoryCount = new Set(encounters.map((e) => e.categoryId)).size;
  const seasons = seasonsTouched(encounters);

  const sortedCategories = [...categories].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  const uncategorized = byCategory.get(null) ?? [];

  return (
    <main className="tashinami-lp min-h-dvh">
      <div className="mx-auto w-full max-w-4xl px-6">
        <AuthedHeader />

        <section className="animate-lp-rise py-8 motion-reduce:animate-none md:py-12">
          <p className="text-rice-dim mb-3 text-[0.68rem] font-bold tracking-[0.28em] uppercase">
            Collection
          </p>
          <h1 className="font-jp-serif text-3xl font-semibold md:text-4xl">
            出会いの図鑑
          </h1>
          <p className="text-rice-dim mt-3 max-w-md leading-relaxed">
            何杯飲んだかではなく、
            <span className="text-[color:var(--rice)]">
              何と初めて出会ったか
            </span>
            。記録した一杯が、ここに灯ります。
          </p>

          {total === 0 ? (
            <EmptyZukan />
          ) : (
            <>
              <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-y border-[color:var(--ink-line)] py-6">
                <Stat value={total} label="出会った銘柄" />
                <Stat value={categoryCount} label="カテゴリ" />
                <Stat value={seasons} label="またいだ季節" />
              </div>

              {sortedCategories.map((category) => {
                const items = byCategory.get(category.id) ?? [];
                if (items.length === 0) return null;
                return (
                  <CategorySection
                    key={category.id}
                    latin={toLatin(category.slug)}
                    title={category.name}
                    slug={category.slug}
                    items={items}
                  />
                );
              })}

              {uncategorized.length > 0 ? (
                <CategorySection
                  latin="Other"
                  title="未分類"
                  slug={null}
                  items={uncategorized}
                />
              ) : null}
            </>
          )}
        </section>

        <AppFooter />
      </div>
    </main>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <b
        className="font-jp-serif font-latin text-3xl leading-none font-semibold tabular-nums"
        style={{ color: "var(--rice)" }}
      >
        {value}
      </b>
      <span className="text-rice-dim text-[0.68rem] font-bold tracking-[0.28em] uppercase">
        {label}
      </span>
    </div>
  );
}

function CategorySection({
  latin,
  title,
  slug,
  items,
}: {
  latin: string;
  title: string;
  slug: string | null;
  items: Encounter[];
}) {
  return (
    <section className="mt-11">
      <div className="mb-5 flex items-baseline gap-3 border-b border-[color:var(--ink-line)] pb-3">
        <span className="text-rice-dim text-[0.68rem] font-bold tracking-[0.28em] uppercase">
          {latin}
        </span>
        <h2 className="font-jp-serif text-xl font-semibold">{title}</h2>
        <span className="text-rice-dim ml-auto text-sm tabular-nums">
          {items.length} と出会った
        </span>
      </div>
      <ul className="grid [grid-template-columns:repeat(auto-fill,minmax(140px,1fr))] gap-3">
        {items.map((e) => (
          <EncounterCard key={e.key} encounter={e} slug={slug} />
        ))}
      </ul>
    </section>
  );
}

function EmptyZukan() {
  return (
    <Card className="mt-8 flex flex-col items-center px-6 py-16 text-center">
      <Chip className="mb-5 flex size-14 items-center justify-center rounded-full p-0">
        <Wine size={22} />
      </Chip>
      <h2 className="font-jp-serif text-lg font-semibold">
        図鑑は、まだ暗いままです。
      </h2>
      <p className="text-rice-dim mt-2 max-w-xs text-sm leading-relaxed">
        最初の一杯を記録すると、ここに最初の灯りがともります。
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

// slug を見出しの英字に（beer → Beer）。
function toLatin(slug: string): string {
  return slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : "";
}
