import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";

import { Card } from "@/components/common/card";
import type { AnnualSummary } from "@/components/summary/annual";
import { accentForSlug } from "@/components/zukan/encounters";
import { formatJstMonthDay } from "@/lib/date";
import type { Category } from "@/schemas/categories";

const MONTH_LABELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export function AnnualSpread({
  summary,
  categories,
  years,
  onReplay,
}: {
  summary: AnnualSummary;
  categories: Category[];
  /** 記録のある年（新しい順）。前後の年へ渡り歩くために使う。 */
  years: number[];
  /** 章立てをもう一度流す。データが足りない年では渡されない。 */
  onReplay?: () => void;
}) {
  const accentOf = (categoryId: string | null) =>
    accentForSlug(categories.find((c) => c.id === categoryId)?.slug);

  const peak = Math.max(...summary.months.map((m) => m.count), 1);
  const index = years.indexOf(summary.year);
  const older = index >= 0 ? years[index + 1] : undefined;
  const newer = index > 0 ? years[index - 1] : undefined;

  return (
    <div className="sm-spread">
      <Card as="aside" className="sm-dossier">
        <div>
          <p className="text-rice-dim text-[0.68rem] font-bold tracking-[0.28em] uppercase">
            Annual
          </p>
          <p className="sm-year">{summary.year}</p>
          <h1 className="font-jp-serif mt-1 text-xl font-semibold">
            一年の記録
          </h1>
        </div>

        <div className="via-ink-line h-px bg-linear-to-r from-transparent to-transparent" />

        <ul className="grid gap-2.5">
          <Fact label="出会った銘柄" value={summary.firstMeetings} unit="種" />
          <Fact label="再会した杯" value={summary.revisits} />
          <Fact label="出会った場所" value={summary.placeCount} unit="か所" />
          {summary.best ? (
            <>
              <Fact label="いちばんの一杯" text={summary.best.name} />
              <Fact label="最高評価" value={summary.best.rating} />
            </>
          ) : null}
        </ul>

        {summary.type ? (
          <p className="text-rice-dim text-sm leading-relaxed">
            {summary.type.note}
            <br />
            <span className="text-amber-bright font-jp-serif">
              『{summary.type.name}』
            </span>
            一年。
          </p>
        ) : null}

        {onReplay ? (
          <button
            type="button"
            onClick={onReplay}
            className="text-rice-dim hover:text-amber-bright inline-flex cursor-pointer items-center gap-2 justify-self-start text-sm transition-colors"
          >
            <Play size={13} />
            章立てで、もう一度
          </button>
        ) : null}
      </Card>

      <div>
        <section className="sm-sec">
          <div className="sm-sec__head">
            <h2 className="font-jp-serif text-xl font-semibold">月の灯り</h2>
            <span className="text-rice-dim ml-auto text-xs">
              色は、その月にいちばん飲んだ酒
            </span>
          </div>
          <div className="sm-months">
            {summary.months.map((month) => (
              <div key={month.month} className="sm-month">
                <span className="sm-month__n">{month.count}</span>
                <span
                  className="sm-month__bar"
                  style={
                    {
                      height: `${(month.count / peak) * 100}%`,
                      "--sm-c": accentOf(month.categoryId),
                    } as React.CSSProperties
                  }
                />
                <span className="sm-month__m">{MONTH_LABELS[month.month]}</span>
              </div>
            ))}
          </div>
        </section>

        {summary.categories.length > 0 ? (
          <section className="sm-sec">
            <div className="sm-sec__head">
              <h2 className="font-jp-serif text-xl font-semibold">一年の味</h2>
              <span className="text-rice-dim ml-auto text-xs">
                カテゴリの比
              </span>
            </div>
            <div className="sm-band">
              {summary.categories.map((c) => (
                <i
                  key={c.name}
                  style={{
                    width: `${c.percent}%`,
                    background: accentOf(c.categoryId),
                  }}
                />
              ))}
            </div>
            <ul className="sm-legend">
              {summary.categories.map((c) => (
                <li key={c.name}>
                  <i style={{ background: accentOf(c.categoryId) }} />
                  {c.name}
                  <b>{c.percent}%</b>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="sm-sec">
          <div className="sm-sec__head">
            <h2 className="font-jp-serif text-xl font-semibold">
              忘れがたい夜
            </h2>
          </div>
          <ul className="grid gap-4">
            {summary.best ? (
              <Line at={summary.best.at} name={summary.best.name}>
                と出会った。
                {summary.best.placeName ? `${summary.best.placeName}・` : ""}
                {summary.best.rating} — 今年いちばんの一杯。
              </Line>
            ) : null}
            {summary.mostReturned ? (
              <Line name={summary.mostReturned.name}>
                に、{summary.mostReturned.count} 度。いちばん多く戻った銘柄。
              </Line>
            ) : null}
            {summary.topPlace ? (
              <Line name={summary.topPlace.name}>
                で、{summary.topPlace.count} 杯と出会った。いちばん通った場所。
              </Line>
            ) : null}
          </ul>
        </section>

        <nav className="sm-sec flex items-center justify-between gap-4">
          {older ? (
            <Link
              to="/summary/$year"
              params={{ year: String(older) }}
              className="text-rice-dim hover:text-amber-bright inline-flex items-center gap-2 text-sm no-underline transition-colors"
            >
              <ArrowLeft size={14} />
              {older} 年
            </Link>
          ) : (
            <span />
          )}
          <Link
            to="/zukan"
            className="text-rice-dim hover:text-amber-bright text-sm no-underline transition-colors"
          >
            図鑑へ
          </Link>
          {newer ? (
            <Link
              to="/summary/$year"
              params={{ year: String(newer) }}
              className="text-rice-dim hover:text-amber-bright inline-flex items-center gap-2 text-sm no-underline transition-colors"
            >
              {newer} 年
              <ArrowRight size={14} />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </div>
  );
}

function Fact({
  label,
  value,
  unit,
  text,
}: {
  label: string;
  value?: number;
  unit?: string;
  text?: string;
}) {
  return (
    <li className="sm-fact">
      <span>{label}</span>
      <b className={text ? "font-jp-serif" : "font-latin tabular-nums"}>
        {text ?? value}
        {unit ? (
          <span className="text-rice-dim ml-1 text-xs">{unit}</span>
        ) : null}
      </b>
    </li>
  );
}

function Line({
  at,
  name,
  children,
}: {
  at?: string;
  name: string;
  children: React.ReactNode;
}) {
  return (
    <li className="sm-line">
      <time className="font-latin text-amber text-xs tabular-nums">
        {at ? formatJstMonthDay(at) : ""}
      </time>
      <p className="text-sm leading-relaxed">
        <span className="font-jp-serif">{name}</span>
        <span className="text-rice-dim">{children}</span>
      </p>
    </li>
  );
}
