import { cn } from "@/lib/utils";

/** Coral progress bar on a light peach track, fully rounded, 10px tall. value is 0 to 100. */
export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      className={cn("h-2.5 w-full overflow-hidden rounded-full bg-coral-track", className)}
    >
      <div className="h-full rounded-full bg-coral" style={{ width: `${pct}%` }} />
    </div>
  );
}
