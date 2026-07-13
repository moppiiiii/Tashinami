import { Star } from "lucide-react";

const STARS = [1, 2, 3, 4, 5] as const;

// ★タップ式の評価入力。選択済みの★を再度押すと解除（null）。
export function StarRating({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  return (
    <div role="group" aria-label="評価" className="flex items-center gap-1.5">
      {STARS.map((n) => {
        const active = value != null && n <= value;
        return (
          <button
            key={n}
            type="button"
            aria-label={`${n} 点`}
            aria-pressed={active}
            onClick={() => onChange(value === n ? null : n)}
            className="rounded-full p-0.5 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--amber-bright)]"
            style={{
              color: active ? "var(--amber-bright)" : "var(--rice-dim)",
            }}
          >
            <Star size={28} fill={active ? "currentColor" : "none"} />
          </button>
        );
      })}
      <span className="lp-latin ml-2 min-w-8 text-sm tabular-nums">
        {value != null ? (
          <span style={{ color: "var(--amber-bright)" }}>{value}／5</span>
        ) : (
          <span className="lp-dim">—</span>
        )}
      </span>
    </div>
  );
}

// 読み取り専用の★表示（カード用）。入力の★と見た目を揃える。
export function RatingStars({
  value,
  size = 14,
}: {
  value: number | null;
  size?: number;
}) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={value != null ? `評価 ${value} / 5` : "評価なし"}
    >
      {STARS.map((n) => {
        const active = value != null && n <= value;
        return (
          <Star
            key={n}
            size={size}
            fill={active ? "currentColor" : "none"}
            style={{
              color: active ? "var(--amber-bright)" : "var(--rice-dim)",
              opacity: active ? 1 : 0.5,
            }}
          />
        );
      })}
    </div>
  );
}
