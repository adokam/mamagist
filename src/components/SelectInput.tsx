import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/** Native dropdown styled like TextInput: white, fully rounded, 56px tall. */
export function SelectInput({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-14 w-full appearance-none rounded-full border border-input bg-surface px-5 pr-12 text-[17px] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-5 h-5 w-5 -translate-y-1/2 text-foreground"
        aria-hidden
      />
    </div>
  );
}
