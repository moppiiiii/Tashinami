import { Heart } from "lucide-react";

import { DrinkImage } from "@/components/zukan/drink-image";
import { accentForSlug } from "@/components/zukan/encounters";
import type { Category } from "@/schemas/categories";
import type { DrinkRecord } from "@/schemas/records";

import { ScoreMeter } from "./score-meter";

const MS_DAY = 86_400_000;

function dayStart(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

// home では絶対日付より「どれくらい前か」の気配のほうが要る。
function relativeDay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const days = Math.round((dayStart(new Date()) - dayStart(d)) / MS_DAY);
  if (days <= 0) return "今日";
  if (days === 1) return "昨夜";
  if (days < 7) return `${days}日前`;
  if (days < 14) return "先週";
  if (days < 28) return `${Math.floor(days / 7)}週間前`;
  if (days < 365) return `${Math.floor(days / 30)}か月前`;
  return `${Math.floor(days / 365)}年前`;
}

function absoluteDay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
}

// 直近の一杯。卓に置かれた実物として、その夜の言葉ごと大きく扱う。
function TonightsPour({
  record,
  slug,
}: {
  record: DrinkRecord;
  slug: string | null;
}) {
  const accent = accentForSlug(slug);

  return (
    <article className="lp-card relative overflow-hidden">
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
            <span className="lp-kicker">{relativeDay(record.drunkAt)}</span>
            <span className="lp-latin lp-dim text-xs tabular-nums">
              {absoluteDay(record.drunkAt)}
            </span>
            {record.category ? (
              <span className="lp-chip">{record.category.name}</span>
            ) : null}
            {record.isFavorite ? (
              <Heart
                size={13}
                fill="currentColor"
                className="lp-fav"
                aria-label="お気に入り"
              />
            ) : null}
          </div>

          <h3 className="lp-serif mt-1.5 text-3xl leading-tight text-balance md:text-4xl">
            {record.name}
          </h3>

          {record.memo ? (
            <p className="lp-serif mt-5 max-w-[34ch] text-[17px] leading-loose">
              {record.memo}
            </p>
          ) : null}

          {record.placeName ? (
            <p className="lp-dim mt-6 text-[13px]">{record.placeName}</p>
          ) : null}

          {record.rating != null ? (
            <div className="mt-7 flex max-w-xs items-center gap-4">
              <ScoreMeter rating={record.rating} />
            </div>
          ) : null}
        </div>

        <span className="lp-rise flex justify-center">
          <DrinkImage slug={slug} size={220} eager />
        </span>
      </div>
    </article>
  );
}

// それ以前の一杯。枠は持たず、罫の上に一行ずつ灯る。
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
        <p className="lp-latin lp-dim text-[11px] tabular-nums">
          {absoluteDay(record.drunkAt)}
        </p>
      </div>

      <div className="lp-row__glass">
        <DrinkImage slug={slug} size={56} glow={false} />
      </div>

      <div className="lp-row__main min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="lp-serif truncate text-lg">{record.name}</h3>
          {record.isFavorite ? (
            <Heart
              size={12}
              fill="currentColor"
              className="lp-fav shrink-0"
              aria-label="お気に入り"
            />
          ) : null}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          {record.category ? (
            <span className="lp-chip">{record.category.name}</span>
          ) : null}
          {record.placeName ? (
            <span className="lp-dim text-xs">{record.placeName}</span>
          ) : null}
        </div>
        {record.memo ? (
          <p className="lp-dim mt-2 truncate text-[13px]">{record.memo}</p>
        ) : null}
      </div>

      <div className="lp-row__rate">
        {record.rating != null ? <ScoreMeter rating={record.rating} /> : null}
      </div>
    </li>
  );
}

// home の「最近の一杯」。直近の一杯を卓に置き、それ以前を列に灯す。
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
        <p className="lp-dim py-4 text-center text-sm">
          次の一杯を、ここで待っています。
        </p>
      )}
    </div>
  );
}
