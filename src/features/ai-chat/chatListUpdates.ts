// How one of Debby's replies changes the menu list (flat, newest first).
// Pure, so it is easy to test. The screen applies it to the cached list
// after every reply.
import type { ChatRow } from "./debbyChats";
import type { DebbyCode } from "./debbyResponse";

export type ReplyForList = {
  kind: DebbyCode | "unreachable";
  chatId: string | null;
  title: string | null;
};

/**
 * - A new chat's first reply (chat id + title, not in the list yet): the
 *   chat goes to the top of the list with the title from the reply.
 * - Any other reply with a chat id: that chat moves to the top, with a
 *   fresh updated_at, because she just wrote in it.
 * - A "gone" reply: the chat no longer exists, so it leaves the list.
 * - A reply without a chat id (the call failed, or a new chat that never
 *   got created): the list does not change.
 */
export function applyReplyToChatList(
  chats: ChatRow[],
  reply: ReplyForList,
  userId: string,
  now: Date = new Date(),
): ChatRow[] {
  if (reply.chatId === null) return chats;
  if (reply.kind === "gone") {
    return chats.filter((chat) => chat.id !== reply.chatId);
  }
  const rest = chats.filter((chat) => chat.id !== reply.chatId);
  const existing = chats.find((chat) => chat.id === reply.chatId);
  const top: ChatRow = existing
    ? { ...existing, updated_at: now.toISOString() }
    : {
        id: reply.chatId,
        user_id: userId,
        title: reply.title ?? "New chat",
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };
  return [top, ...rest];
}
