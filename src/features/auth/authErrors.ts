// Turns Supabase auth errors into friendly messages. Never show raw error text to users.

export const AUTH_MESSAGES = {
  emailTaken: "This email already has an account. Please log in instead.",
  weakPassword: "That password is too easy to guess. Try a longer one with letters and numbers.",
  wrongCredentials: "Wrong email or password. Please try again.",
  emailNotConfirmed: "Please confirm your email first. Check your inbox for our link.",
  noInternet: "You seem to be offline. Check your internet connection and try again.",
  tooManyTries: "Too many tries. Please wait a few minutes and try again.",
  generic: "Something went wrong. Please try again.",
} as const;

type ErrorLike = { code?: unknown; name?: unknown; status?: unknown; message?: unknown };

function isNetworkError(e: ErrorLike): boolean {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return true;
  if (e.name === "AuthRetryableFetchError") return true;
  if (e.name === "TypeError" && typeof e.message === "string") {
    return /fetch|network|load failed/i.test(e.message);
  }
  return false;
}

export function friendlyAuthError(error: unknown, action: "signup" | "login"): string {
  const e: ErrorLike = typeof error === "object" && error !== null ? (error as ErrorLike) : {};
  if (isNetworkError(e)) return AUTH_MESSAGES.noInternet;

  switch (e.code) {
    case "user_already_exists":
    case "email_exists":
      return AUTH_MESSAGES.emailTaken;
    case "weak_password":
      return AUTH_MESSAGES.weakPassword;
    case "invalid_credentials":
      return AUTH_MESSAGES.wrongCredentials;
    case "email_not_confirmed":
      return AUTH_MESSAGES.emailNotConfirmed;
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return AUTH_MESSAGES.tooManyTries;
  }
  // Older Supabase servers send a 400 without a code for a wrong login.
  if (action === "login" && e.status === 400) return AUTH_MESSAGES.wrongCredentials;
  return AUTH_MESSAGES.generic;
}
