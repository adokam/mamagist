import { cn } from "@/lib/utils";

function HeartMark({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "grid h-14 w-14 shrink-0 place-items-center rounded-[16px] bg-primary text-primary-contrast",
        className,
      )}
    >
      <svg width="32" height="32" viewBox="0 0 512 512" fill="currentColor">
        <path d="M256 400 C 200 340 130 280 130 205 C 130 155 170 125 210 125 C 235 125 252 140 256 155 C 260 140 277 125 302 125 C 342 125 382 155 382 205 C 382 280 312 340 256 400 Z" />
      </svg>
    </div>
  );
}

/** Mamagist logo mark: a rounded primary square with a white heart. */
export function LogoMark({ onPrimary = false }: { onPrimary?: boolean }) {
  return (
    <HeartMark
      className={onPrimary ? "bg-primary-contrast text-primary" : undefined}
    />
  );
}

/**
 * Mamagist logo: the mark with the word Mamagist next to it in weight 800.
 * Use variant "onPrimary" on the primary hero, where the mark is inverted
 * so it stays visible on the primary gradient.
 */
export function Logo({ onPrimary = false }: { onPrimary?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark onPrimary={onPrimary} />
      <span
        className={cn(
          "text-[22px] leading-none font-extrabold tracking-tight",
          onPrimary ? "text-primary-contrast" : "text-ink",
        )}
      >
        Mamagist
      </span>
    </div>
  );
}
