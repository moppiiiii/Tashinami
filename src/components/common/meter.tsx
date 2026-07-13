import { cn } from "@/lib/utils";

export function Meter({
  percent,
  className,
}: {
  percent: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-1.5 overflow-hidden rounded-full bg-[rgba(236,226,208,0.12)]",
        className,
      )}
    >
      <span
        className="from-amber-deep to-amber-bright block h-full rounded-[inherit] bg-linear-to-r"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
