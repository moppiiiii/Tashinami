import { Slider } from "radix-ui";

// 評価の入力。見た目はカードの ScoreMeter に合わせ、つまみで「触れる」ことを示す。
// 保存値は 10 点満点の 0.1 刻み。未評価（null）は — を出すが、一度触れたら数値のまま。
export function RatingInput({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <Slider.Root
        min={0}
        max={10}
        step={0.1}
        value={[value ?? 0]}
        onValueChange={([next]) => onChange(next ?? 0)}
        aria-label="この一杯の印象"
        className="relative flex flex-1 touch-none items-center py-2 select-none"
      >
        <Slider.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-[rgba(236,226,208,0.12)]">
          <Slider.Range className="from-amber-deep to-amber-bright absolute h-full rounded-full bg-linear-to-r" />
        </Slider.Track>
        <Slider.Thumb className="from-amber-bright to-amber focus-visible:outline-amber-bright block size-4 rounded-full bg-linear-to-b shadow-[0_2px_8px_rgba(0,0,0,0.45)] ring-1 ring-[rgba(255,236,200,0.5)] transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2" />
      </Slider.Root>

      <span className="font-latin w-8 shrink-0 text-right text-sm tabular-nums">
        {value != null ? (
          <span className="text-amber-bright">{value.toFixed(1)}</span>
        ) : (
          <span className="text-rice-dim">—</span>
        )}
      </span>
    </div>
  );
}
