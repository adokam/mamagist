import { Check } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/** Big tappable choice, used inside a role="radiogroup". Selected: peach with a deep green border. */
export function ChoiceButton({
  selected,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { selected: boolean }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={cn(
        "flex h-[52px] w-full items-center justify-center gap-2 rounded-full border-2 px-5 text-base font-bold text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "border-primary bg-card" : "border-input bg-surface",
        className,
      )}
      {...props}
    >
      {selected ? <Check className="h-5 w-5" aria-hidden /> : null}
      {children}
    </button>
  );
}
