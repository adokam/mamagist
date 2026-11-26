import { cn } from "@/lib/utils";

/**
 * Primary progress bar on the line-color track, fully rounded, 10px tall. value is 0 to 100.
 * variant "onPrimary" is a white bar on a translucent white track, for use on the primary card.
 */
export function ProgressBar({
  value,
  variant = "primary",
  className,
}: {
  value: number;
  variant?: "primary" | "onPrimary";
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      className={cn(
        "h-2.5 w-full overflow-hidden rounded-full",
        variant === "onPrimary" ? "bg-primary-contrast/25" : "bg-line",
        className,
      )}
    >
      <div
        className={cn("h-full rounded-full", variant === "onPrimary" ? "bg-primary-contrast" : "bg-primary")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
