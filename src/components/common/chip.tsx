import type { ComponentPropsWithRef } from "react";

import { cn } from "@/lib/utils";

export function Chip({ className, ...props }: ComponentPropsWithRef<"span">) {
  return (
    <span
      className={cn(
        "text-amber-bright inline-flex items-center gap-[0.3rem] rounded-full border border-[rgba(207,146,71,0.24)] bg-[rgba(207,146,71,0.1)] px-[0.6rem] py-[0.15rem] text-[0.72rem] font-semibold",
        className,
      )}
      {...props}
    />
  );
}
