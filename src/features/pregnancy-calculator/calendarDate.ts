// Plain calendar dates (year, month, day). No time of day, so no off-by-one-day errors.

export type CalendarDate = { year: number; month: number; day: number };

const MS_PER_DAY = 86_400_000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Date.UTC is used only as a day counter; UTC has no daylight saving, so every day is 24h.
function toDayNumber(d: CalendarDate): number {
  return Math.round(Date.UTC(d.year, d.month - 1, d.day) / MS_PER_DAY);
}

function fromDayNumber(n: number): CalendarDate {
  const dt = new Date(n * MS_PER_DAY);
  return { year: dt.getUTCFullYear(), month: dt.getUTCMonth() + 1, day: dt.getUTCDate() };
}

export function addDays(d: CalendarDate, days: number): CalendarDate {
  return fromDayNumber(toDayNumber(d) + days);
}

/** Whole days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: CalendarDate, to: CalendarDate): number {
  return toDayNumber(to) - toDayNumber(from);
}

/** "2026-05-10" to a CalendarDate. Returns null for anything that is not a real date. */
export function parseIsoDate(value: string): CalendarDate | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const d = { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
  if (d.year < 1000) return null;
  const back = fromDayNumber(toDayNumber(d));
  return back.year === d.year && back.month === d.month && back.day === d.day ? d : null;
}

export function toIsoDate(d: CalendarDate): string {
  const pad = (n: number, len = 2) => String(n).padStart(len, "0");
  return `${pad(d.year, 4)}-${pad(d.month)}-${pad(d.day)}`;
}

/** Today's date in the phone's own time zone. */
export function todayInLocalTimeZone(now: Date = new Date()): CalendarDate {
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}

/** "10 May 2026". */
export function formatCalendarDate(d: CalendarDate): string {
  return `${d.day} ${MONTHS[d.month - 1]} ${d.year}`;
}
