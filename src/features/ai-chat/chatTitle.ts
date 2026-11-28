// The rules for a chat title, used by Rename. Pure, so it is easy to test.
export const MAX_CHAT_TITLE_LENGTH = 80;

/** The trimmed title, or a friendly error when it cannot be saved. */
export function validateChatTitle(
  raw: string,
): { ok: true; title: string } | { ok: false; error: string } {
  const title = raw.trim();
  if (!title) return { ok: false, error: "Give the chat a title." };
  if (title.length > MAX_CHAT_TITLE_LENGTH) {
    return { ok: false, error: "Keep the title to 80 characters or less." };
  }
  return { ok: true, title };
}
