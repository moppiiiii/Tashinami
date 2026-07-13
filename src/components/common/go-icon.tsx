import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function GoIcon({ className }: { className?: string }) {
  return (
    <ChevronRight
      size={16}
      aria-hidden="true"
      className={cn(
        "text-rice-dim group-hover:text-amber-bright opacity-45 transition-[opacity,color,translate] duration-[180ms] group-hover:translate-x-[2px] group-hover:opacity-100 motion-reduce:group-hover:translate-x-0",
        className,
      )}
    />
  );
}
