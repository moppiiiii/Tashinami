import { Heart } from "lucide-react";

import { Card } from "@/components/common/card";
import { Chip } from "@/components/common/chip";
import { DrinkImage } from "@/components/zukan/drink-image";
import { accentForSlug } from "@/components/zukan/encounters";
import { formatJstDate, jstDaysAgo } from "@/lib/date";
import type { Category } from "@/schemas/categories";
import type { DrinkRecord } from "@/schemas/records";

import { ScoreMeter } from "./score-meter";

function relativeDay(iso: string): string {
  const days = jstDaysAgo(iso);
  if (days == null) return "";
  if (days <= 0) return "今日";
  if (days === 1) return "昨夜";
  if (days < 7) return `${days}日前`;
  if (days < 14) return "先週";
  if (days < 28) return `${Math.floor(days / 7)}週間前`;
  if (days < 365) return `${Math.floor(days / 30)}か月前`;
  return `${Math.floor(days / 365)}年前`;
}

const absoluteDay = formatJstDate;

function TonightsPour({
  record,
  slug,
}: {
  record: DrinkRecord;
  slug: string | null;
}) {
  const accent = accentForSlug(slug);

  return (
    <Card as="article" className="relative overflow-hidden">
      <span
        className="lp-tonight__glow"
        aria-hidden="true"
        style={{
          background: `radial-gradient(circle, ${accent}38, transparent 66%)`,
        }}
      />

      <div className="relative grid items-center gap-10 p-8 sm:grid-cols-[1fr_auto] sm:gap-14 sm:p-12">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="font-latin text-amber-bright tracking-[0.01em] italic">
              {relativeDay(record.drunkAt)}
            </span>
            <span className="font-latin text-rice-dim text-xs tabular-nums">
              {absoluteDay(record.drunkAt)}
            </span>
            {record.category ? <Chip>{record.category.name}</Chip> : null}
            {record.isFavorite ? (
              <Heart
                size={13}
                fill="currentColor"
                className="text-amber-bright drop-shadow-[0_0_6px_rgba(236,185,114,0.45)]"
                aria-label="お気に入り"
              />
            ) : null}
          </div>

          <h3 className="font-jp-serif mt-1.5 text-3xl leading-tight font-semibold text-balance md:text-4xl">
            {record.name}
          </h3>

          {record.memo ? (
            <p className="font-jp-serif mt-5 max-w-[34ch] text-[17px] leading-loose font-semibold">
              {record.memo}
            </p>
          ) : null}

          {record.placeName ? (
            <p className="text-rice-dim mt-6 text-[13px]">{record.placeName}</p>
          ) : null}

          {record.rating != null ? (
            <div className="mt-7 flex max-w-xs items-center gap-4">
              <ScoreMeter rating={record.rating} />
            </div>
          ) : null}
        </div>

        <span className="animate-lp-rise flex justify-center motion-reduce:animate-none">
          <DrinkImage slug={slug} size={220} eager />
        </span>
      </div>
    </Card>
  );
}

function PourRow({
  record,
  slug,
}: {
  record: DrinkRecord;
  slug: string | null;
}) {
  return (
    <li className="lp-row">
      <div className="lp-row__when">
        <p className="text-[13px]">{relativeDay(record.drunkAt)}</p>
        <p className="font-latin text-rice-dim text-[11px] tabular-nums">
          {absoluteDay(record.drunkAt)}
        </p>
      </div>

      <div className="lp-row__glass">
        <DrinkImage slug={slug} size={56} glow={false} />
      </div>

      <div className="lp-row__main min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-jp-serif truncate text-lg font-semibold">
            {record.name}
          </h3>
          {record.isFavorite ? (
            <Heart
              size={12}
              fill="currentColor"
              className="text-amber-bright shrink-0 drop-shadow-[0_0_6px_rgba(236,185,114,0.45)]"
              aria-label="お気に入り"
            />
          ) : null}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          {record.category ? <Chip>{record.category.name}</Chip> : null}
          {record.placeName ? (
            <span className="text-rice-dim text-xs">{record.placeName}</span>
          ) : null}
        </div>
        {record.memo ? (
          <p className="text-rice-dim mt-2 truncate text-[13px]">
            {record.memo}
          </p>
        ) : null}
      </div>

      <div className="lp-row__rate">
        {record.rating != null ? <ScoreMeter rating={record.rating} /> : null}
      </div>
    </li>
  );
}

export function RecentPours({
  records,
  categories,
}: {
  records: DrinkRecord[];
  categories: Category[];
}) {
  if (records.length === 0) return null;

  const slugById = new Map(categories.map((c) => [c.id, c.slug]));
  const slugOf = (record: DrinkRecord) =>
    record.category ? (slugById.get(record.category.id) ?? null) : null;

  const [latest, ...rest] = records;

  return (
    <div className="flex flex-col gap-8">
      <TonightsPour record={latest} slug={slugOf(latest)} />

      {rest.length > 0 ? (
        <ul className="lp-rows">
          {rest.map((record) => (
            <PourRow key={record.id} record={record} slug={slugOf(record)} />
          ))}
        </ul>
      ) : (
        <p className="text-rice-dim py-4 text-center text-sm">
          次の一杯を、ここで待っています。
        </p>
      )}
    </div>
  );
}
