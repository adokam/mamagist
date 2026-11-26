import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const base =
  "flex h-[52px] w-full items-center justify-center rounded-full px-6 text-base font-bold transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

/** Full-width deep green button with white bold text, 52px tall. */
export function PrimaryButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(base, "bg-primary text-primary-foreground hover:opacity-90", className)}
      {...props}
    />
  );
}

/** Full-width outline button: 2px deep green border, deep green bold text, 52px tall. */
export function OutlineButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(base, "border-2 border-primary bg-transparent text-primary hover:bg-card", className)}
      {...props}
    />
  );
}
