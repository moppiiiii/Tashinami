// 評価は 5 段階。LP と同じ 10 点の物差しに載せ、琥珀のメーターで見せる。
// home の「最近の一杯」・/records のカードで共有する。
export function ScoreMeter({ rating }: { rating: number }) {
  return (
    <>
      <div className="lp-meter flex-1">
        <span style={{ width: `${rating * 20}%` }} />
      </div>
      <span className="lp-score shrink-0 text-sm">
        {(rating * 2).toFixed(1)}
      </span>
    </>
  );
}
