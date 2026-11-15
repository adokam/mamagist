import { OutlineButton } from "@/components/Buttons";

/** Friendly message when a page could not load, with a "Try again" button. Never shows raw error text. */
export function LoadError({ onRetry }: { onRetry: () => void }) {
  const offline = typeof navigator !== "undefined" && navigator.onLine === false;
  return (
    <div role="alert" className="space-y-4 rounded-3xl bg-card p-5 text-card-foreground">
      <p className="text-[17px] font-semibold">
        {offline
          ? "You seem to be offline. Check your internet connection and try again."
          : "We couldn't load your page. Please try again."}
      </p>
      <OutlineButton type="button" onClick={onRetry}>
        Try again
      </OutlineButton>
    </div>
  );
}
