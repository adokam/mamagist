import { ProgressBar } from "@/components/ProgressBar";

/** Row of primary segments at the top of a multi-step flow. Segments up to `current` are filled. */
export function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5" aria-label={`Step ${current} of ${total}`} role="group">
      {Array.from({ length: total }, (_, i) => (
        <ProgressBar key={i} value={i < current ? 100 : 0} />
      ))}
    </div>
  );
}
