import { Meter } from "@/components/common/meter";

// 評価は 10 点の物差し（0.1 刻み）。カードでの見せ方の正本。
export function ScoreMeter({ rating }: { rating: number }) {
  return (
    <>
      <Meter percent={rating * 10} className="flex-1" />
      <span className="font-latin text-amber-bright shrink-0 text-sm tabular-nums">
        {rating.toFixed(1)}
      </span>
    </>
  );
}
