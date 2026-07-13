import type { Temperature } from "@/content/drinks";

// 適温の帯。目盛り（冷たい ← → 温かい）の上に、飲み頃の帯をカテゴリの差し色で灯す。
// 目盛りの幅はカテゴリごとに違う（ビールは 0–20℃、日本酒は燗まで 0–55℃）。
// 差し色は親が --dg-accent で渡す。
export function TempGauge({
  temperature,
  showScale = true,
}: {
  temperature: Temperature;
  /** 一覧のカードなど、狭いところでは目盛りの数字を落とす。 */
  showScale?: boolean;
}) {
  const { scale, band, ticks } = temperature;
  const span = scale.max - scale.min;
  const at = (celsius: number) => ((celsius - scale.min) / span) * 100;
  const left = at(band.from);
  const width = at(band.to) - left;

  return (
    <div className="grid gap-2">
      <div
        className="dg-track"
        role="img"
        aria-label={`飲み頃は ${band.from}℃ から ${band.to}℃`}
      >
        <span
          className="dg-track__band"
          style={{ left: `${left}%`, width: `${width}%` }}
        />
      </div>
      {showScale ? (
        <div className="dg-scale">
          {ticks.map((tick) => (
            <span key={tick}>{tick}℃</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
