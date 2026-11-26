import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

const inputClass =
  "h-12 w-full rounded-full border border-input bg-card px-5 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Fully rounded text input with a thin line border, 48px tall, 20px side padding. */
export function TextInput({
  icon,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { icon?: ReactNode }) {
  if (!icon) {
    return <input className={cn(inputClass, className)} {...props} />;
  }
  return (
    <div className="relative">
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 text-muted"
      >
        {icon}
      </span>
      <input className={cn(inputClass, "pl-12", className)} {...props} />
    </div>
  );
}
