// Last-loaded generic content, kept on the device only so the app can show
// something useful offline. Only daily task titles (generic, e.g. "Walk for
// 20 minutes") and the weekly tip text are saved here. Never save chat
// messages, dates, names or any health data in this file.
const TASKS_KEY = "mamagist:last-daily-tasks";
const TIP_KEY = "mamagist:last-weekly-tip";

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage full or blocked: offline fallback is a nice-to-have, never a crash.
  }
}

/** Save the titles of today's tasks after a successful load. */
export function saveLastDailyTasks(titles: string[]): void {
  if (titles.length === 0) return;
  write(TASKS_KEY, JSON.stringify(titles));
}

/** Titles from the last successful load, or null when there are none. */
export function readLastDailyTasks(): string[] | null {
  const raw = read(TASKS_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const titles = parsed.filter((t): t is string => typeof t === "string");
    return titles.length > 0 ? titles : null;
  } catch {
    return null;
  }
}

/** Save the weekly tip text after a successful load. */
export function saveLastWeeklyTip(text: string): void {
  if (!text.trim()) return;
  write(TIP_KEY, text);
}

/** Tip text from the last successful load, or null when there is none. */
export function readLastWeeklyTip(): string | null {
  const text = read(TIP_KEY);
  return text && text.trim() ? text : null;
}
