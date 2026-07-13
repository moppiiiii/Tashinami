import { Link } from "@tanstack/react-router";

import { DrinkImage } from "@/components/zukan/drink-image";
import { accentForSlug } from "@/components/zukan/encounters";
import { DRINK_GUIDES } from "@/content/drinks";

// 一覧＝棚。器を並べ、下に一本の灯りを通す。触れると器が持ち上がる。
// 器の絵と差し色は図鑑と同じ資産（DrinkImage / accentForSlug）を使い回す。
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
          {/* 棚の最初の 2 つはファーストビューに入るので先読みする。 */}
          <DrinkImage slug={guide.slug} size={92} eager={index < 2} />
          <h2 className="lp-serif mt-3 text-lg">{guide.name}</h2>
          <span className="dg-latin">{guide.latin}</span>
          <span className="dg-shelf__temp">{guide.temperature.short}</span>
        </Link>
      ))}
    </div>
  );
}
