import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/** White, fully rounded text input with a thin peach border, 56px tall, 20px side padding. */
export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-14 w-full rounded-full border border-input bg-surface px-5 text-[17px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  );
}
