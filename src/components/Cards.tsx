import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/** Surface card: surface background, 20px corners, 16px padding. */
export function SurfaceCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-[20px] bg-surface p-4 text-foreground", className)} {...props} />;
}

/** White card: card background, thin line border, 20px corners. */
export function WhiteCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-[20px] border border-border bg-surface p-4 text-foreground", className)}
      {...props}
    />
  );
}
