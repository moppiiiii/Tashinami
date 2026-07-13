import { Heart } from "lucide-react";

import { Card } from "@/components/common/card";
import { formatJstDate } from "@/lib/date";

import { DrinkImage } from "./drink-image";
import type { Encounter } from "./encounters";

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
    <Card
      as="li"
      hover
      className="relative flex flex-col items-center px-4 py-5 text-center"
    >
      {encounter.isFavorite ? (
        <Heart
          size={12}
          fill="currentColor"
          className="text-amber-bright absolute top-3 right-3 drop-shadow-[0_0_6px_rgba(236,185,114,0.45)]"
          aria-label="お気に入り"
        />
      ) : null}

      <span className="mb-3 flex items-end justify-center">
        <DrinkImage slug={slug} size={76} />
      </span>

      <h3 className="font-jp-serif text-[15px] leading-snug font-semibold text-balance">
        {encounter.name}
      </h3>

      <p className="font-latin text-rice-dim mt-2 text-[11px] tracking-wide tabular-nums">
        初 {formatJstDate(encounter.firstAt)}
        {revisits > 0 ? ` ・ 再${revisits}` : ""}
      </p>
    </Card>
  );
}
