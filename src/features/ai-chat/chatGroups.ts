// Grouping for the Debby chat menu: Today, Yesterday, Earlier, in her
// time zone. Pure functions, so they are easy to test.
import type { ChatRow } from "./debbyChats";

export type ChatGroupHeading = "Today" | "Yesterday" | "Earlier";

export type ChatGroup = {
  heading: ChatGroupHeading;
  chats: ChatRow[];
};

/** The calendar day (YYYY-MM-DD) of a date in the given time zone. */
export function dayKeyInTimeZone(date: Date, timeZone?: string | null): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timeZone ?? undefined,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** A YYYY-MM-DD day key shifted by a number of days. */
export function shiftDayKey(key: string, days: number): string {
  const [year, month, day] = key.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return shifted.toISOString().slice(0, 10);
}

/**
 * Groups chats (newest first) under Today, Yesterday and Earlier, using the
 * calendar day of each chat's updated_at in her time zone. Only groups with
 * chats are returned, in Today, Yesterday, Earlier order.
 */
export function groupChats(
  chats: ChatRow[],
  timeZone: string | null | undefined,
  now: Date = new Date(),
): ChatGroup[] {
  const todayKey = dayKeyInTimeZone(now, timeZone);
  const yesterdayKey = shiftDayKey(todayKey, -1);
  const groups: ChatGroup[] = [
    { heading: "Today", chats: [] },
    { heading: "Yesterday", chats: [] },
    { heading: "Earlier", chats: [] },
  ];
  for (const chat of chats) {
    const key = dayKeyInTimeZone(new Date(chat.updated_at), timeZone);
    const group =
      key === todayKey ? groups[0] : key === yesterdayKey ? groups[1] : groups[2];
    group.chats.push(chat);
  }
  return groups.filter((group) => group.chats.length > 0);
}
