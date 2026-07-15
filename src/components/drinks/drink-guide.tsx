import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Card } from "@/components/common/card";
import { MethodSteps } from "@/components/drinks/method-steps";
import { TempGauge } from "@/components/drinks/temp-gauge";
import { DrinkImage } from "@/components/zukan/drink-image";
import { accentForSlug } from "@/components/zukan/encounters";
import type { DrinkGuide as Guide } from "@/content/drinks";
import { DRINK_GUIDES } from "@/content/drinks";

export function DrinkGuideView({ guide }: { guide: Guide }) {
  const accent = accentForSlug(guide.slug);
  const count = DRINK_GUIDES.length;
  const index = DRINK_GUIDES.findIndex((g) => g.slug === guide.slug);
  const prev = DRINK_GUIDES[(index - 1 + count) % count];
  const next = DRINK_GUIDES[(index + 1) % count];

  return (
    <div
      className="dg-spread"
      style={{ "--dg-accent": accent } as React.CSSProperties}
    >
      <Card as="aside" className="dg-dossier">
        <div className="grid justify-items-center gap-1">
          <DrinkImage slug={guide.slug} size={112} eager />
          <h1 className="font-jp-serif mt-2 text-2xl font-semibold">
            {guide.name}
          </h1>
          <span className="dg-latin">{guide.latin}</span>
        </div>

        <div className="via-ink-line h-px bg-linear-to-r from-transparent to-transparent" />

        <section className="grid gap-2.5">
          <h2 className="dg-label">適温</h2>
          <TempGauge temperature={guide.temperature} />
          <p className="dg-figure">{guide.temperature.short}</p>
          <p className="text-rice-dim text-xs leading-relaxed">
            {guide.temperature.note}
          </p>
        </section>

        <section className="grid gap-2.5">
          <h2 className="dg-label">器</h2>
          <ul className="grid gap-2">
            {guide.glasses.map((glass) => (
              <li key={glass.name} className="dg-fact">
                <span>{glass.name}</span>
                <span className="text-rice-dim">{glass.note}</span>
              </li>
            ))}
          </ul>
        </section>
      </Card>

      <div>
        <header>
          <p className="font-latin text-amber-bright tracking-[0.01em] italic">
            {guide.latin}
          </p>
          <p className="font-jp-serif mt-1 text-2xl leading-snug font-semibold md:text-3xl">
            {guide.tagline}
          </p>
          <p className="text-rice-dim mt-4 max-w-prose leading-relaxed">
            {guide.lead}
          </p>
        </header>

        <section className="dg-sec">
          <div className="dg-sec__head">
            <h2 className="font-jp-serif text-xl font-semibold">
              {guide.methodsTitle}
            </h2>
          </div>
          <MethodSteps methods={guide.methods} />
        </section>

        <section className="dg-sec">
          <div className="dg-sec__head">
            <h2 className="font-jp-serif text-xl font-semibold">
              {guide.stylesTitle}
            </h2>
          </div>
          <div>
            {guide.styles.map((style) => (
              <div key={style.name} className="dg-style">
                <h3 className="font-jp-serif text-[0.95rem] font-semibold">
                  {style.name}
                </h3>
                <p className="text-rice-dim text-sm leading-relaxed">
                  {style.note}
                </p>
                {style.meta ? (
                  <span className="dg-style__meta">{style.meta}</span>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className="dg-sec">
          <div className="dg-sec__head">
            <h2 className="font-jp-serif text-xl font-semibold">合わせる肴</h2>
          </div>
          <ul className="flex flex-wrap gap-2">
            {guide.pairings.map((pairing) => (
              <li key={pairing} className="dg-pair">
                {pairing}
              </li>
            ))}
          </ul>
          <p className="text-rice-dim mt-4 text-sm leading-relaxed">
            {guide.pairingNote}
          </p>
        </section>

        <nav className="dg-sec flex items-center justify-between gap-4">
          <Link
            to="/drinks/$slug"
            params={{ slug: prev.slug }}
            className="text-rice-dim hover:text-amber-bright inline-flex items-center gap-2 text-sm no-underline transition-colors"
          >
            <ArrowLeft size={14} />
            {prev.name}
          </Link>
          <Link
            to="/drinks"
            className="text-rice-dim hover:text-amber-bright text-sm no-underline transition-colors"
          >
            一覧へ
          </Link>
          <Link
            to="/drinks/$slug"
            params={{ slug: next.slug }}
            className="text-rice-dim hover:text-amber-bright inline-flex items-center gap-2 text-sm no-underline transition-colors"
          >
            {next.name}
            <ArrowRight size={14} />
          </Link>
        </nav>
      </div>
    </div>
  );
}
