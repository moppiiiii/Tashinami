import type { ComponentPropsWithRef } from "react";

import { cn } from "@/lib/utils";

const control =
  "w-full rounded-xl border border-ink-line bg-white/[0.04] px-[0.9rem] py-[0.7rem] text-[0.95rem] text-rice transition-[border-color,box-shadow,background] duration-150 placeholder:text-[rgba(162,149,127,0.55)] focus:border-[rgba(207,146,71,0.6)] focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(207,146,71,0.18)] focus:outline-none aria-invalid:border-[rgba(200,88,78,0.7)] aria-invalid:shadow-[0_0_0_3px_rgba(200,88,78,0.15)]";

export function Input({ className, ...props }: ComponentPropsWithRef<"input">) {
  return <input className={cn(control, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: ComponentPropsWithRef<"textarea">) {
  return <textarea className={cn(control, className)} {...props} />;
}

export function Select({
  className,
  ...props
}: ComponentPropsWithRef<"select">) {
  return <select className={cn(control, className)} {...props} />;
}
