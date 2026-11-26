import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/** Surface card: surface background, 20px corners, 16px padding. */
export function SurfaceCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-[20px] bg-surface p-4 text-foreground", className)} {...props} />;
}

/** Line card: card background, thin line border, 20px corners, very soft shadow. */
export function LineCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[20px] border border-border bg-card p-4 text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.05),0_6px_20px_rgb(0_0_0/0.05)]",
        className,
      )}
      {...props}
    />
  );
}
