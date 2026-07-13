import { Link } from "@tanstack/react-router";

import { DrinkImage } from "@/components/zukan/drink-image";
import { accentForSlug } from "@/components/zukan/encounters";
import { DRINK_GUIDES } from "@/content/drinks";

export function DrinkShelf() {
  return (
    <div className="dg-shelf">
      {DRINK_GUIDES.map((guide, index) => (
        <Link
          key={guide.slug}
          to="/drinks/$slug"
          params={{ slug: guide.slug }}
          className="dg-shelf__item no-underline"
          style={
            { "--dg-accent": accentForSlug(guide.slug) } as React.CSSProperties
          }
        >
          <DrinkImage slug={guide.slug} size={92} eager={index < 2} />
          <h2 className="font-jp-serif mt-3 text-lg font-semibold">
            {guide.name}
          </h2>
          <span className="dg-latin">{guide.latin}</span>
          <span className="dg-shelf__temp">{guide.temperature.short}</span>
        </Link>
      ))}
    </div>
  );
}
