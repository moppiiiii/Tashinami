import type { ComponentPropsWithRef, ElementType } from "react";

import { cn } from "@/lib/utils";

export function Field({ className, ...props }: ComponentPropsWithRef<"div">) {
  return (
    <div className={cn("flex flex-col gap-[0.4rem]", className)} {...props} />
  );
}

type LabelProps<T extends ElementType> = {
  as?: T;
  className?: string;
} & Omit<ComponentPropsWithRef<T>, "as" | "className">;

export function Label<T extends ElementType = "label">({
  as,
  className,
  ...props
}: LabelProps<T>) {
  const Comp = as ?? "label";
  return (
    <Comp
      className={cn("text-rice-dim text-[0.8rem] font-semibold", className)}
      {...props}
    />
  );
}

export function FieldError({
  errors,
  className,
}: {
  errors: ReadonlyArray<{ message?: string } | string | undefined>;
  className?: string;
}) {
  const text = errors
    .map((e) => (typeof e === "string" ? e : e?.message))
    .filter(Boolean)
    .join(", ");
  if (!text) return null;
  return (
    <p className={cn("text-[0.8rem] text-[#e5928a]", className)} role="alert">
      {text}
    </p>
  );
}
