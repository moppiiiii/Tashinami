import type { ComponentPropsWithRef, ElementType } from "react";

import { cn } from "@/lib/utils";

type CardProps<T extends ElementType> = {
  as?: T;
  hover?: boolean;
  className?: string;
} & Omit<ComponentPropsWithRef<T>, "as" | "className">;

export function Card<T extends ElementType = "div">({
  as,
  hover,
  className,
  ...props
}: CardProps<T>) {
  const Comp = as ?? "div";
  return (
    <Comp
      className={cn(
        "border-ink-line rounded-2xl border bg-linear-165 from-white/5 to-white/[0.015] shadow-[0_1px_0_rgba(255,236,200,0.06)_inset,0_22px_44px_rgba(0,0,0,0.34)] transition-[transform,border-color] duration-200",
        // group を付けるので、中の StretchLink / GoIcon がこのカードのホバーに連動して灯る。
        hover &&
          "group hover:-translate-y-[3px] hover:border-[rgba(207,146,71,0.42)]",
        className,
      )}
      {...props}
    />
  );
}
