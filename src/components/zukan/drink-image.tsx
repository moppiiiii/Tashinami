import beer from "@/assets/beer.webp";
import cocktail from "@/assets/cocktail.webp";
import sake from "@/assets/japanese_sake.webp";
import other from "@/assets/other.webp";
import shochu from "@/assets/shochu.webp";
import whisky from "@/assets/whisky.webp";
import wine from "@/assets/wine.webp";

import { accentForSlug } from "./encounters";
import { Vessel } from "./vessel";

// カテゴリ slug ごとの器の絵。背景を抜いた琥珀の線画。
const IMAGES: Record<string, string> = {
  beer,
  cocktail,
  other,
  sake,
  shochu,
  whisky,
  wine,
};

// 器の絵。灯りは CSS 側で描く（カテゴリの差し色で灯る）。
// カテゴリ未設定の記録は other の絵で受ける。
// 絵を持たない未知の slug だけ、手描きの器にフォールバックする。
export function DrinkImage({
  slug,
  size = 72,
  eager = false,
  glow = true,
}: {
  slug: string | null;
  size?: number;
  /** ファーストビューに出るものだけ true。既定は遅延読み込み。 */
  eager?: boolean;
  /** 器のうしろの灯り。小さく並べるときは切る。 */
  glow?: boolean;
}) {
  const src = IMAGES[slug ?? "other"];
  const accent = accentForSlug(slug);

  if (!src) {
    return (
      <span
        className="flex shrink-0 items-center justify-center"
        style={{ width: size, height: size }}
      >
        <Vessel slug={slug} color={accent} height={Math.round(size * 0.72)} />
      </span>
    );
  }

  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      {glow ? (
        <span
          className="lp-drink__glow"
          aria-hidden="true"
          style={{
            background: `radial-gradient(circle, ${accent}2e, transparent 62%)`,
          }}
        />
      ) : null}
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className="lp-drink"
        style={{ width: size, height: size }}
      />
    </span>
  );
}
