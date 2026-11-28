import { describe, expect, it } from "vitest";

import type { ChatRow } from "./debbyChats";
import { groupChats } from "./chatGroups";

function chat(id: string, updatedAt: string): ChatRow {
  return { id, user_id: "user-1", title: id, created_at: updatedAt, updated_at: updatedAt };
}

describe("groupChats", () => {
  // Now is Saturday 2026-11-28, 10:00 in Lagos (UTC+1, no daylight saving).
  const now = new Date("2026-11-28T09:00:00Z");
  const lagos = "Africa/Lagos";

  it("puts chats from today, yesterday and earlier in their own groups", () => {
    const chats = [
      chat("today", "2026-11-28T08:30:00Z"), // 09:30 in Lagos, today
      chat("yesterday", "2026-11-27T20:00:00Z"), // 21:00 in Lagos, yesterday
      chat("earlier", "2026-11-26T10:00:00Z"), // two days ago
    ];
    const groups = groupChats(chats, lagos, now);
    expect(groups.map((group) => group.heading)).toEqual(["Today", "Yesterday", "Earlier"]);
    expect(groups[0].chats.map((c) => c.id)).toEqual(["today"]);
    expect(groups[1].chats.map((c) => c.id)).toEqual(["yesterday"]);
    expect(groups[2].chats.map((c) => c.id)).toEqual(["earlier"]);
  });

  it("uses her time zone, not UTC: late night UTC is still today in Lagos", () => {
    // 23:30 UTC on 27 November is 00:30 on 28 November in Lagos — today.
    const chats = [chat("late-night", "2026-11-27T23:30:00Z")];
    const groups = groupChats(chats, lagos, now);
    expect(groups).toHaveLength(1);
    expect(groups[0].heading).toBe("Today");
  });

  it("uses her time zone, not UTC: early morning UTC is still yesterday in Lagos", () => {
    // 00:30 UTC on 28 November is 01:30 in Lagos — today. But 00:30 UTC on
    // 27 November is 01:30 in Lagos on the 27th — yesterday.
    const chats = [chat("early", "2026-11-27T00:30:00Z")];
    const groups = groupChats(chats, lagos, now);
    expect(groups).toHaveLength(1);
    expect(groups[0].heading).toBe("Yesterday");
  });

  it("the same instant falls in a different group in another time zone", () => {
    // 23:30 UTC on 27 November is 18:30 on the 27th in New York — yesterday.
    const chats = [chat("late-night", "2026-11-27T23:30:00Z")];
    const groups = groupChats(chats, "America/New_York", now);
    expect(groups).toHaveLength(1);
    expect(groups[0].heading).toBe("Yesterday");
  });

  it("keeps the newest-first order inside a group and skips empty groups", () => {
    const chats = [chat("newer", "2026-11-28T08:00:00Z"), chat("older", "2026-11-28T07:00:00Z")];
    const groups = groupChats(chats, lagos, now);
    expect(groups.map((group) => group.heading)).toEqual(["Today"]);
    expect(groups[0].chats.map((c) => c.id)).toEqual(["newer", "older"]);
  });

  it("returns no groups when there are no chats", () => {
    expect(groupChats([], lagos, now)).toEqual([]);
  });
});
