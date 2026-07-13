import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Plus } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/common/button";
import { Card } from "@/components/common/card";
import { Chip } from "@/components/common/chip";
import { GoIcon } from "@/components/common/go-icon";
import { StretchLink } from "@/components/common/stretch-link";
import { AppFooter } from "@/components/layout/app-footer";
import { AuthedHeader } from "@/components/layout/authed-header";
import { buildPlaces, type Place } from "@/components/records/places";
import { formatJstDate } from "@/lib/date";
import { recordsQueryOptions } from "@/server/records";

// 出会った場所の一覧。records.placeName の集約なので、専用テーブルは持たない。
export const Route = createFileRoute("/_authed/places/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(recordsQueryOptions()),
  component: PlacesPage,
});

function PlacesPage() {
  const { data: records } = useSuspenseQuery(recordsQueryOptions());

  // 通った回数の多い順。同数なら最近行った方を上に。
  const places = useMemo(
    () =>
      buildPlaces(records).sort(
        (a, b) => b.count - a.count || b.lastAt.localeCompare(a.lastAt),
      ),
    [records],
  );

  const drinks = places.reduce((sum, p) => sum + p.drinkCount, 0);

  return (
    <main className="tashinami-lp min-h-dvh">
      <div className="mx-auto w-full max-w-4xl px-6">
        <AuthedHeader />

        <section className="animate-lp-rise py-8 motion-reduce:animate-none md:py-12">
          <p className="text-rice-dim mb-3 text-[0.68rem] font-bold tracking-[0.28em] uppercase">
            Places
          </p>
          <h1 className="font-jp-serif text-3xl font-semibold md:text-4xl">
            出会った場所
          </h1>
          <p className="text-rice-dim mt-3 max-w-md leading-relaxed">
            その一杯と、
            <span className="text-[color:var(--rice)]">どこで出会ったか</span>
            。酒屋も、店も、旅先の蔵も。棚をひらけば、その店のセレクトが見えてきます。
          </p>

          {places.length === 0 ? (
            <EmptyPlaces />
          ) : (
            <>
              <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-y border-[color:var(--ink-line)] py-6">
                <Stat value={places.length} label="出会った場所" />
                <Stat value={drinks} label="そこで出会った銘柄" />
              </div>

              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {places.map((place) => (
                  <PlaceCard key={place.key} place={place} />
                ))}
              </ul>
            </>
          )}
        </section>

        <AppFooter />
      </div>
    </main>
  );
}

function PlaceCard({ place }: { place: Place }) {
  return (
    <Card as="li" hover className="relative flex items-center gap-4 p-5">
      <Chip className="size-10 shrink-0 justify-center rounded-full p-0">
        <MapPin size={16} />
      </Chip>

      <div className="min-w-0 flex-1">
        {/* 見出しがリンク。当たり判定はカード全面へ広がる（StretchLink）。 */}
        <h2 className="font-jp-serif truncate text-lg leading-snug font-semibold">
          <StretchLink className="block truncate">
            <Link
              to="/places/$placeKey"
              params={{ placeKey: place.key }}
              aria-label={`${place.name} の棚`}
            >
              {place.name}
            </Link>
          </StretchLink>
        </h2>
        <p className="text-rice-dim mt-1 text-xs tabular-nums">
          {place.drinkCount} 種と出会った ・ {place.count} 杯 ・ 前回{" "}
          {formatJstDate(place.lastAt)}
        </p>
      </div>

      <GoIcon className="shrink-0" />
    </Card>
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

function EmptyPlaces() {
  return (
    <Card className="mt-8 flex flex-col items-center px-6 py-16 text-center">
      <Chip className="mb-5 flex size-14 items-center justify-center rounded-full p-0">
        <MapPin size={22} />
      </Chip>
      <h2 className="font-jp-serif text-lg font-semibold">
        まだ、どこで出会ったかを残していません。
      </h2>
      <p className="text-rice-dim mt-2 max-w-xs text-sm leading-relaxed">
        買った酒屋も、飲んだ店も、旅先の蔵も。記録の「出会った場所」に書いておくと、ここに棚が並びます。
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
