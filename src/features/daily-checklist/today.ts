// "Today" for the checklist: the calendar date in her saved time zone.
export const DEFAULT_TIME_ZONE = "Africa/Lagos";

/** Today's date as YYYY-MM-DD in the given time zone. Empty or unknown zones use Africa/Lagos. */
export function todayInTimeZone(timeZone: string | null | undefined, now: Date = new Date()): string {
  const zone = timeZone?.trim() || DEFAULT_TIME_ZONE;
  try {
    return format(zone, now);
  } catch {
    return format(DEFAULT_TIME_ZONE, now);
  }
}

function format(timeZone: string, now: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}
