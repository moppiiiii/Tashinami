import { Slot } from "radix-ui";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function StretchLink({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <Slot.Root
      className={cn(
        "hover:text-amber-bright group-hover:text-amber-bright focus-visible:outline-amber-bright text-inherit no-underline transition-colors duration-[180ms] after:absolute after:inset-0 after:rounded-[inherit] after:content-[''] focus-visible:rounded-[4px] focus-visible:outline-2 focus-visible:outline-offset-[3px]",
        className,
      )}
    >
      {children}
    </Slot.Root>
  );
}
