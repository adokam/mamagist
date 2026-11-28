import { describe, expect, it } from "vitest";

import { applyReplyToChatList } from "./chatListUpdates";
import type { ChatRow } from "./debbyChats";

function chat(id: string, updatedAt: string, title = id): ChatRow {
  return { id, user_id: "user-1", title, created_at: updatedAt, updated_at: updatedAt };
}

const now = new Date("2026-11-28T10:00:00Z");

describe("applyReplyToChatList", () => {
  it("adds a new chat to the top with the title from the reply", () => {
    const chats = [chat("old-1", "2026-11-27T10:00:00Z"), chat("old-2", "2026-11-26T10:00:00Z")];
    const updated = applyReplyToChatList(
      chats,
      { kind: "ok", chatId: "new-1", title: "Feeling tired" },
      "user-1",
      now,
    );
    expect(updated.map((c) => c.id)).toEqual(["new-1", "old-1", "old-2"]);
    expect(updated[0].title).toBe("Feeling tired");
  });

  it("moves an existing chat to the top after a reply", () => {
    const chats = [
      chat("recent", "2026-11-28T09:00:00Z"),
      chat("older", "2026-11-27T10:00:00Z"),
    ];
    const updated = applyReplyToChatList(
      chats,
      { kind: "ok", chatId: "older", title: null },
      "user-1",
      now,
    );
    expect(updated.map((c) => c.id)).toEqual(["older", "recent"]);
    expect(updated[0].updated_at).toBe("2026-11-28T10:00:00.000Z");
    expect(updated[0].title).toBe("older");
  });

  it("drops a chat whose reply code is gone", () => {
    const chats = [chat("gone-1", "2026-11-28T09:00:00Z"), chat("kept", "2026-11-27T10:00:00Z")];
    const updated = applyReplyToChatList(
      chats,
      { kind: "gone", chatId: "gone-1", title: null },
      "user-1",
      now,
    );
    expect(updated.map((c) => c.id)).toEqual(["kept"]);
  });

  it("changes nothing when the reply has no chat id", () => {
    const chats = [chat("a", "2026-11-28T09:00:00Z")];
    expect(
      applyReplyToChatList(chats, { kind: "unreachable", chatId: null, title: null }, "user-1", now),
    ).toBe(chats);
  });
});
