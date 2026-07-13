import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/common/button";
import { Card } from "@/components/common/card";
import { AppFooter } from "@/components/layout/app-footer";
import { AuthedHeader } from "@/components/layout/authed-header";
import { buildPlaces, recordsAtPlace } from "@/components/records/places";
import { EncounterCard } from "@/components/zukan/encounter-card";
import { buildEncounters } from "@/components/zukan/encounters";
import { formatJstDate } from "@/lib/date";
import { categoriesQueryOptions } from "@/server/categories";
import { recordsQueryOptions } from "@/server/records";

// ひとつの場所の棚。その店・その酒屋が自分に手渡した銘柄が並ぶ。
// placeKey は表記揺れを畳んだ正規化キー（src/lib/match.ts）。
export const Route = createFileRoute("/_authed/places/$placeKey")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(recordsQueryOptions()),
      context.queryClient.ensureQueryData(categoriesQueryOptions()),
    ]),
  component: PlacePage,
});

function PlacePage() {
  const { placeKey } = Route.useParams();
  const { data: records } = useSuspenseQuery(recordsQueryOptions());
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions());

  const here = useMemo(
    () => recordsAtPlace(records, placeKey),
    [records, placeKey],
  );
  // 表示名（初回の綴り）は集約に持たせてあるので、そこから引く。
  const place = useMemo(
    () => buildPlaces(here).find((p) => p.key === placeKey),
    [here, placeKey],
  );
  const encounters = useMemo(
    () =>
      buildEncounters(here).sort((a, b) => b.firstAt.localeCompare(a.firstAt)),
    [here],
  );
  const slugById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) map.set(c.id, c.slug);
    return map;
  }, [categories]);

  return (
    <main className="tashinami-lp min-h-dvh">
      <div className="mx-auto w-full max-w-4xl px-6">
        <AuthedHeader />

        <section className="animate-lp-rise py-8 motion-reduce:animate-none md:py-12">
          <Button asChild variant="ghost" className="mb-6">
            <Link to="/places" className="text-sm no-underline">
              <ArrowLeft size={16} />
              場所の一覧へ
            </Link>
          </Button>

          {place ? (
            <>
              <p className="text-rice-dim mb-3 text-[0.68rem] font-bold tracking-[0.28em] uppercase">
                Shelf
              </p>
              <h1 className="font-jp-serif text-3xl font-semibold text-balance md:text-4xl">
                {place.name} の棚
              </h1>
              <p className="text-rice-dim mt-3 max-w-md leading-relaxed">
                この棚から、あなたが選んだ {place.drinkCount} 種。
              </p>

              <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-y border-[color:var(--ink-line)] py-6">
                <Stat value={`${place.drinkCount}`} label="出会った銘柄" />
                <Stat value={`${place.count}`} label="ここで記録した杯数" />
                <Stat value={formatJstDate(place.firstAt)} label="はじめて" />
                <Stat
                  value={formatJstDate(place.lastAt)}
                  label="いちばん最近"
                />
              </div>

              <ul className="mt-10 grid [grid-template-columns:repeat(auto-fill,minmax(140px,1fr))] gap-3">
                {encounters.map((e) => (
                  <EncounterCard
                    key={e.key}
                    encounter={e}
                    slug={(e.categoryId && slugById.get(e.categoryId)) || null}
                  />
                ))}
              </ul>
            </>
          ) : (
            <UnknownPlace />
          )}
        </section>

        <AppFooter />
      </div>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <b
        className="font-jp-serif font-latin text-2xl leading-none font-semibold tabular-nums"
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

// 記録を消したり場所名を書き換えたりすると、URL のキーだけが残る。
function UnknownPlace() {
  return (
    <Card className="flex flex-col items-center px-6 py-16 text-center">
      <h1 className="font-jp-serif text-lg font-semibold">
        この場所の棚は、空のようです。
      </h1>
      <p className="text-rice-dim mt-2 max-w-xs text-sm leading-relaxed">
        記録を消したか、場所の名前を書き換えたのかもしれません。
      </p>
      <div className="mt-6">
        <Button asChild>
          <Link to="/places" className="no-underline">
            場所の一覧へ
          </Link>
        </Button>
      </div>
    </Card>
  );
}
