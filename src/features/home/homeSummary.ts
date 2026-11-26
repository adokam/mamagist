// Home screen logic. Pure functions, no screen code.
import {
  dueDateFromLastPeriod,
  lastPeriodFromDueDate,
  pregnancyAge,
  type PregnancyAge,
  type Trimester,
} from "@/features/pregnancy-calculator/calculator";
import {
  daysBetween,
  parseIsoDate,
  type CalendarDate,
} from "@/features/pregnancy-calculator/calendarDate";
import type { ProfileSummary } from "@/features/profile/privateProfile";

const FULL_TERM_WEEKS = 40;
const LAST_CONTENT_WEEK = 42; // weekly_content has weeks 1 to 42

/** "Good morning" before 12:00, "Good afternoon" from 12:00, "Good evening" from 17:00. */
export function greeting(hour: number, fullName: string | null): string {
  const part = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const first = (fullName ?? "").trim().split(/\s+/)[0] ?? "";
  return first ? `${part}, ${first}` : part;
}

export type BabyAge = { unit: "weeks" | "months"; value: number };

export type HomeCard =
  | {
      kind: "pregnancy";
      age: PregnancyAge;
      dueDate: CalendarDate;
      /** Completed weeks out of 40, as 0 to 100. */
      progress: number;
      pastFortyTwoWeeks: boolean;
      tipWeek: number;
    }
  | { kind: "no_date" }
  | { kind: "baby"; babyAge: BabyAge | null };

/** Baby age: weeks when under 12 weeks, otherwise whole months. Null when the date is missing or in the future. */
export function babyAge(birth: CalendarDate | null, today: CalendarDate): BabyAge | null {
  if (!birth) return null;
  const days = daysBetween(birth, today);
  if (days < 0) return null;
  if (days < 12 * 7) return { unit: "weeks", value: Math.floor(days / 7) };
  let months = (today.year - birth.year) * 12 + (today.month - birth.month);
  if (today.day < birth.day) months -= 1;
  return { unit: "months", value: months };
}

export function homeCard(profile: ProfileSummary, today: CalendarDate): HomeCard {
  if (profile.stage === "new_mother" || profile.stage === "breastfeeding") {
    return { kind: "baby", babyAge: babyAge(parseIsoDate(profile.baby_birth_date ?? ""), today) };
  }
  const savedPeriod = parseIsoDate(profile.last_period_date ?? "");
  const savedDue = parseIsoDate(profile.due_date ?? "");
  const lastPeriod = savedPeriod ?? (savedDue ? lastPeriodFromDueDate(savedDue) : null);
  if (!lastPeriod) return { kind: "no_date" };
  const dueDate = savedDue ?? dueDateFromLastPeriod(lastPeriod);
  const age = pregnancyAge(lastPeriod, today);
  return {
    kind: "pregnancy",
    age,
    dueDate,
    progress: Math.min(100, (age.weeks / FULL_TERM_WEEKS) * 100),
    pastFortyTwoWeeks: age.weeks * 7 + age.days > LAST_CONTENT_WEEK * 7,
    tipWeek: Math.min(LAST_CONTENT_WEEK, Math.max(1, age.weeks)),
  };
}

/** "26 weeks, 4 days" — always both parts, even "0 weeks, 3 days". */
export function weeksAndDays({ weeks, days }: PregnancyAge): string {
  const w = `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
  const d = `${days} ${days === 1 ? "day" : "days"}`;
  return `${w}, ${d}`;
}

export function trimesterName(t: Trimester): string {
  return t === 1 ? "First trimester" : t === 2 ? "Second trimester" : "Third trimester";
}

/** "3 weeks old", "5 months old", "Less than 1 week old". */
export function babyAgeText({ unit, value }: BabyAge): string {
  if (unit === "weeks" && value === 0) return "Less than 1 week old";
  const word = unit === "weeks" ? (value === 1 ? "week" : "weeks") : value === 1 ? "month" : "months";
  return `${value} ${word} old`;
}
