import { Link } from "@tanstack/react-router";
import { ChevronRight, Heart, MapPin } from "lucide-react";

import { DrinkImage } from "@/components/zukan/drink-image";
import type { DrinkRecord } from "@/schemas/records";

import { ScoreMeter } from "./score-meter";

// 日付は「2025.6.28」の体裁で（ランディングの一杯カードに合わせる）。
function formatDrunkAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
}

// 記録カード＝このプロダクトの主役「一杯カード」。
// LP の lp-showcase__front と同じ骨格：見出し帯（分類・日付／銘柄／場所 ＋ 器の列）→
// その夜の言葉 → 評価。器は専用の列に置くので、ほかの要素とは重ならない。
// editable のとき、カード全面が編集画面への導線になる（見出しが本物のリンク）。
// 削除は編集画面の底。取り消せない操作は棚の上に置かない。
export function RecordItem({
  record,
  editable = false,
  slug,
}: {
  record: DrinkRecord;
  editable?: boolean;
  /** カテゴリ slug。器の絵と差し色を決める。 */
  slug?: string | null;
}) {
  const priceLabel =
    record.price != null ? `¥${record.price.toLocaleString("ja-JP")}` : null;
  const abvLabel = record.abv != null ? `${record.abv}%` : null;

  return (
    <li className="lp-card lp-card--hover relative flex flex-col p-6">
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="lp-chip shrink-0">
              {record.category?.name ?? "未分類"}
            </span>
            <span className="lp-latin lp-dim shrink-0 text-xs tabular-nums">
              {formatDrunkAt(record.drunkAt)}
            </span>
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            {/* 見出しがリンク。当たり判定はカード全面へ広がる（lp-stretch）。 */}
            <h3 className="lp-serif min-w-0 truncate text-xl leading-snug">
              {editable ? (
                <Link
                  to="/records/$recordId/edit"
                  params={{ recordId: record.id }}
                  aria-label={`${record.name} を編集する`}
                  className="lp-stretch block truncate"
                >
                  {record.name}
                </Link>
              ) : (
                record.name
              )}
            </h3>
            {record.isFavorite ? (
              <Heart
                size={15}
                fill="currentColor"
                className="lp-fav shrink-0"
              />
            ) : null}
          </div>

          {/* 場所・価格・度数は、同じ重さのメタとして一行にまとめる。 */}
          {record.placeName || priceLabel || abvLabel ? (
            <div className="lp-dim mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              {record.placeName ? (
                <span className="flex min-w-0 items-center gap-1">
                  <MapPin size={12} className="shrink-0" />
                  <span className="truncate">{record.placeName}</span>
                </span>
              ) : null}
              {priceLabel || abvLabel ? (
                <span className="lp-latin flex shrink-0 items-center gap-2 tabular-nums">
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
          <span className="lp-dim flex-1 text-xs">評価なし</span>
        )}
        {editable ? (
          <ChevronRight
            size={16}
            className="lp-go shrink-0"
            aria-hidden="true"
          />
        ) : null}
      </div>
    </li>
  );
}
