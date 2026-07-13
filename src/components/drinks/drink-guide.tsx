import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { TempGauge } from "@/components/drinks/temp-gauge";
import { DrinkImage } from "@/components/zukan/drink-image";
import { accentForSlug } from "@/components/zukan/encounters";
import type { DrinkGuide as Guide } from "@/content/drinks";
import { DRINK_GUIDES } from "@/content/drinks";

// 詳細＝見開き。左に貼りつく「札」（適温・器）、右に読み物（手順・見取り図・肴）。
// 飲みながら開いて必要なところだけ引ける形にする。狭い画面では自然に縦へ積む。
export function DrinkGuideView({ guide }: { guide: Guide }) {
  const accent = accentForSlug(guide.slug);
  // 棚の並びを一巡できるよう、前後は端で折り返す。
  const count = DRINK_GUIDES.length;
  const index = DRINK_GUIDES.findIndex((g) => g.slug === guide.slug);
  const prev = DRINK_GUIDES[(index - 1 + count) % count];
  const next = DRINK_GUIDES[(index + 1) % count];

  return (
    <div
      className="dg-spread"
      style={{ "--dg-accent": accent } as React.CSSProperties}
    >
      <aside className="lp-card dg-dossier">
        <div className="grid justify-items-center gap-1">
          <DrinkImage slug={guide.slug} size={112} eager />
          <h1 className="lp-serif mt-2 text-2xl">{guide.name}</h1>
          <span className="dg-latin">{guide.latin}</span>
        </div>

        <div className="lp-divider" />

        <section className="grid gap-2.5">
          <h2 className="dg-label">適温</h2>
          <TempGauge temperature={guide.temperature} />
          <p className="dg-figure">{guide.temperature.short}</p>
          <p className="lp-dim text-xs leading-relaxed">
            {guide.temperature.note}
          </p>
        </section>

        <section className="grid gap-2.5">
          <h2 className="dg-label">器</h2>
          <ul className="grid gap-2">
            {guide.glasses.map((glass) => (
              <li key={glass.name} className="dg-fact">
                <span>{glass.name}</span>
                <span className="lp-dim">{glass.note}</span>
              </li>
            ))}
          </ul>
        </section>
      </aside>

      <div>
        <header>
          <p className="lp-kicker">{guide.latin}</p>
          <p className="lp-serif mt-1 text-2xl leading-snug md:text-3xl">
            {guide.tagline}
          </p>
          <p className="lp-dim mt-4 max-w-prose leading-relaxed">
            {guide.lead}
          </p>
        </header>

        <section className="dg-sec">
          <div className="dg-sec__head">
            <h2 className="lp-serif text-xl">{guide.stepsTitle}</h2>
            {guide.stepsNote ? (
              <span className="lp-dim text-sm">{guide.stepsNote}</span>
            ) : null}
          </div>
          <ol className="dg-steps">
            {guide.steps.map((step, i) => (
              <li key={step.title} className="dg-step">
                <span className="dg-step__mark">{i + 1}</span>
                <div>
                  <h3 className="lp-serif text-base">{step.title}</h3>
                  <p className="lp-dim mt-1 text-sm leading-relaxed">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="dg-sec">
          <div className="dg-sec__head">
            <h2 className="lp-serif text-xl">{guide.stylesTitle}</h2>
          </div>
          <div>
            {guide.styles.map((style) => (
              <div key={style.name} className="dg-style">
                <h3 className="lp-serif text-[0.95rem]">{style.name}</h3>
                <p className="lp-dim text-sm leading-relaxed">{style.note}</p>
                {style.meta ? (
                  <span className="dg-style__meta">{style.meta}</span>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className="dg-sec">
          <div className="dg-sec__head">
            <h2 className="lp-serif text-xl">合わせる肴</h2>
          </div>
          <ul className="flex flex-wrap gap-2">
            {guide.pairings.map((pairing) => (
              <li key={pairing} className="dg-pair">
                {pairing}
              </li>
            ))}
          </ul>
          <p className="lp-dim mt-4 text-sm leading-relaxed">
            {guide.pairingNote}
          </p>
        </section>

        <nav className="dg-sec flex items-center justify-between gap-4">
          <Link
            to="/drinks/$slug"
            params={{ slug: prev.slug }}
            className="lp-dim inline-flex items-center gap-2 text-sm no-underline"
          >
            <ArrowLeft size={14} />
            {prev.name}
          </Link>
          <Link to="/drinks" className="lp-dim text-sm no-underline">
            一覧へ
          </Link>
          <Link
            to="/drinks/$slug"
            params={{ slug: next.slug }}
            className="lp-dim inline-flex items-center gap-2 text-sm no-underline"
          >
            {next.name}
            <ArrowRight size={14} />
          </Link>
        </nav>
      </div>
    </div>
  );
}
