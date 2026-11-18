// How Debby's answer is shown. Pure function, no screen code, so it can be tested.

export const DEBBY_CODES = ["ok", "safety", "limit", "busy", "error", "too_long"] as const;
export type DebbyCode = (typeof DEBBY_CODES)[number];

/** The JSON the debby-chat edge function returns. */
export type DebbyResponse = {
  code: DebbyCode;
  reply: string;
  safety_triggered: boolean;
  /** Messages left today. Only on ok and limit. */
  remaining?: number;
};

/** What the screen shows for one answer. */
export type DebbyReplyState = {
  /** The code, or "unreachable" when the call itself failed. */
  kind: DebbyCode | "unreachable";
  text: string;
  /** "safety" shows a peach bubble with a deep green border. */
  tone: "normal" | "safety";
  /** Show a "Try again" button that sends the same message again. */
  showRetry: boolean;
  /** Turn the input off until her day changes. */
  limitReached: boolean;
};

export const UNREACHABLE_TEXT = "We could not reach Debby. Check your internet and try again.";

function isDebbyResponse(body: unknown): body is DebbyResponse {
  if (!body || typeof body !== "object") return false;
  const { code, reply } = body as { code?: unknown; reply?: unknown };
  return (
    typeof code === "string" &&
    (DEBBY_CODES as readonly string[]).includes(code) &&
    typeof reply === "string" &&
    reply.trim() !== ""
  );
}

/** Maps the edge function's answer to the screen. Anything that is not a valid answer counts as a failed call. */
export function debbyReplyState(body: unknown): DebbyReplyState {
  if (!isDebbyResponse(body)) {
    return {
      kind: "unreachable",
      text: UNREACHABLE_TEXT,
      tone: "normal",
      showRetry: true,
      limitReached: false,
    };
  }
  const { code, reply } = body;
  return {
    kind: code,
    text: reply,
    tone: code === "safety" || body.safety_triggered === true ? "safety" : "normal",
    showRetry: code === "busy" || code === "error",
    limitReached: code === "limit",
  };
}
