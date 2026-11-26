import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/** Fully rounded text input with a thin line border, 48px tall, 20px side padding. */
export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-full border border-input bg-card px-5 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  );
}
