import { Slot } from "radix-ui";
import type { ComponentPropsWithRef } from "react";

import { cn } from "@/lib/utils";

const variants = {
  cta: "gap-2 bg-linear-to-b from-amber-bright to-amber px-6 py-[0.8rem] font-bold text-[#1a1109] shadow-[0_1px_0_rgba(255,236,200,0.6)_inset,0_12px_30px_rgba(159,99,41,0.4)] transition-[transform,filter] duration-[180ms] hover:-translate-y-0.5 hover:text-[#1a1109] hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-amber-bright disabled:transform-none disabled:cursor-not-allowed disabled:opacity-55 disabled:filter-none",
  ghost:
    "gap-[0.4rem] border border-ink-line px-[1.2rem] py-[0.8rem] font-semibold text-rice transition-[border-color,color,background] duration-[180ms] hover:border-[rgba(207,146,71,0.5)] hover:bg-[rgba(207,146,71,0.06)] hover:text-amber-bright",
} as const;

const base = "inline-flex items-center rounded-full";

export function Button({
  variant = "cta",
  asChild,
  className,
  ...props
}: ComponentPropsWithRef<"button"> & {
  variant?: keyof typeof variants;
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot.Root : "button";
  return <Comp className={cn(base, variants[variant], className)} {...props} />;
}
