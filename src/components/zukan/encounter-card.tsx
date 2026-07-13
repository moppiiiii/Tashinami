import { Heart } from "lucide-react";

import { DrinkImage } from "./drink-image";
import type { Encounter } from "./encounters";

function formatFirst(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
}

// 図鑑のカード。銘柄・初出会い日・再訪回数を静かに灯す。
export function EncounterCard({
  encounter,
  slug,
}: {
  encounter: Encounter;
  slug: string | null;
}) {
  const revisits = encounter.count - 1;

  return (
    <li className="lp-card lp-card--hover relative flex flex-col items-center px-4 py-5 text-center">
      {encounter.isFavorite ? (
        <Heart
          size={12}
          fill="currentColor"
          className="lp-fav absolute top-3 right-3"
          aria-label="お気に入り"
        />
      ) : null}

      <span className="mb-3 flex items-end justify-center">
        <DrinkImage slug={slug} size={76} />
      </span>

      <h3 className="lp-serif text-[15px] leading-snug text-balance">
        {encounter.name}
      </h3>

      <p className="lp-latin lp-dim mt-2 text-[11px] tracking-wide tabular-nums">
        初 {formatFirst(encounter.firstAt)}
        {revisits > 0 ? ` ・ 再${revisits}` : ""}
      </p>
    </li>
  );
}
