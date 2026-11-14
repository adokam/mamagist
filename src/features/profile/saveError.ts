// Friendly message when saving her details fails. Never show raw error text.
export const SAVE_MESSAGES = {
  noInternet: "You seem to be offline. Check your internet connection and try again.",
  generic: "We couldn't save this. Please try again.",
} as const;

export function friendlySaveError(error: unknown): string {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return SAVE_MESSAGES.noInternet;
  const e = typeof error === "object" && error !== null ? (error as { message?: unknown }) : {};
  if (typeof e.message === "string" && /fetch|network|load failed/i.test(e.message)) {
    return SAVE_MESSAGES.noInternet;
  }
  return SAVE_MESSAGES.generic;
}
