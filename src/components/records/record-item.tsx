import { Link } from "@tanstack/react-router";
import { Heart, MapPin } from "lucide-react";

import { Card } from "@/components/common/card";
import { Chip } from "@/components/common/chip";
import { GoIcon } from "@/components/common/go-icon";
import { StretchLink } from "@/components/common/stretch-link";
import { DrinkImage } from "@/components/zukan/drink-image";
import { formatJstDate } from "@/lib/date";
import type { DrinkRecord } from "@/schemas/records";

import { ScoreMeter } from "./score-meter";

// editable のとき、カード全面が編集画面への導線になる（見出しが本物のリンク）。
export function RecordItem({
  record,
  editable = false,
  slug,
}: {
  record: DrinkRecord;
  editable?: boolean;
  /** 器の絵と差し色を決める。 */
  slug?: string | null;
}) {
  const priceLabel =
    record.price != null ? `¥${record.price.toLocaleString("ja-JP")}` : null;
  const abvLabel = record.abv != null ? `${record.abv}%` : null;

  return (
    <Card as="li" hover className="relative flex flex-col p-6">
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Chip className="shrink-0">
              {record.category?.name ?? "未分類"}
            </Chip>
            <span className="font-latin text-rice-dim shrink-0 text-xs tabular-nums">
              {formatJstDate(record.drunkAt)}
            </span>
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            {/* 見出しがリンク。当たり判定はカード全面へ広がる（StretchLink）。 */}
            <h3 className="font-jp-serif min-w-0 truncate text-xl leading-snug font-semibold">
              {editable ? (
                <StretchLink className="block truncate">
                  <Link
                    to="/records/$recordId/edit"
                    params={{ recordId: record.id }}
                    aria-label={`${record.name} を編集する`}
                  >
                    {record.name}
                  </Link>
                </StretchLink>
              ) : (
                record.name
              )}
            </h3>
            {record.isFavorite ? (
              <Heart
                size={15}
                fill="currentColor"
                className="text-amber-bright shrink-0 drop-shadow-[0_0_6px_rgba(236,185,114,0.45)]"
              />
            ) : null}
          </div>

          {/* 場所・価格・度数は、同じ重さのメタとして一行にまとめる。 */}
          {record.placeName || priceLabel || abvLabel ? (
            <div className="text-rice-dim mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              {record.placeName ? (
                <span className="flex min-w-0 items-center gap-1">
                  <MapPin size={12} className="shrink-0" />
                  <span className="truncate">{record.placeName}</span>
                </span>
              ) : null}
              {priceLabel || abvLabel ? (
                <span className="font-latin flex shrink-0 items-center gap-2 tabular-nums">
                  {priceLabel ? <span>{priceLabel}</span> : null}
                  {priceLabel && abvLabel ? (
                    <span className="opacity-40">·</span>
                  ) : null}
                  {abvLabel ? <span>{abvLabel}</span> : null}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <DrinkImage slug={slug ?? null} size={76} />
      </div>

      {record.memo ? (
        <p className="mt-4 line-clamp-3 text-sm leading-relaxed whitespace-pre-wrap">
          {record.memo}
        </p>
      ) : null}

      {/* 下辺：評価と、この面が開くことの合図。 */}
      <div className="mt-auto flex items-center gap-3 pt-5">
        {record.rating != null ? (
          <ScoreMeter rating={record.rating} />
        ) : (
          <span className="text-rice-dim flex-1 text-xs">評価なし</span>
        )}
        {editable ? <GoIcon className="shrink-0" /> : null}
      </div>
    </Card>
  );
}
