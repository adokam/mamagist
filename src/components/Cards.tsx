import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/** Peach card: peach background, 24px corners, 20px padding. */
export function PeachCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-3xl bg-card p-5 text-card-foreground", className)} {...props} />;
}

/** White card: white background, thin peach border, 20px corners. */
export function WhiteCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-[20px] border border-border bg-surface p-5 text-foreground", className)}
      {...props}
    />
  );
}
