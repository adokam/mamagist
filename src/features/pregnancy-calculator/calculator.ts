// Pregnancy calculator. Pure functions, no screen code, so any feature can reuse them.
import { MAX_PREGNANCY_WEEKS, PREGNANCY_DAYS } from "@/config/constants";

import { addDays, daysBetween, type CalendarDate } from "./calendarDate";

export type Trimester = 1 | 2 | 3;
export type PregnancyAge = { weeks: number; days: number; trimester: Trimester };
export type LastPeriodProblem = { problem: "future" | "too_old"; message: string };

const MAX_PREGNANCY_DAYS = MAX_PREGNANCY_WEEKS * 7; // 308

export function dueDateFromLastPeriod(lastPeriod: CalendarDate): CalendarDate {
  return addDays(lastPeriod, PREGNANCY_DAYS);
}

export function lastPeriodFromDueDate(dueDate: CalendarDate): CalendarDate {
  return addDays(dueDate, -PREGNANCY_DAYS);
}

/** Weeks and days since the last period. Trimester 1: up to 13w6d, 2: 14w0d-27w6d, 3: 28w0d on. */
export function pregnancyAge(lastPeriod: CalendarDate, today: CalendarDate): PregnancyAge {
  const total = Math.max(0, daysBetween(lastPeriod, today));
  const weeks = Math.floor(total / 7);
  const trimester: Trimester = weeks < 14 ? 1 : weeks < 28 ? 2 : 3;
  return { weeks, days: total % 7, trimester };
}

/** Null when the date is fine; otherwise a short friendly message. */
export function validateLastPeriod(
  lastPeriod: CalendarDate,
  today: CalendarDate,
): LastPeriodProblem | null {
  const ago = daysBetween(lastPeriod, today);
  if (ago < 0) {
    return { problem: "future", message: "That date is in the future. Please pick today or earlier." };
  }
  if (ago > MAX_PREGNANCY_DAYS) {
    return {
      problem: "too_old",
      message: `That date is more than ${MAX_PREGNANCY_WEEKS} weeks ago. Please check it.`,
    };
  }
  return null;
}

/** "You are 26 weeks and 4 days pregnant." */
export function pregnancyAgeSentence({ weeks, days }: PregnancyAge): string {
  const w = `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
  const d = `${days} ${days === 1 ? "day" : "days"}`;
  if (days === 0) return `You are ${w} pregnant.`;
  if (weeks === 0) return `You are ${d} pregnant.`;
  return `You are ${w} and ${d} pregnant.`;
}
