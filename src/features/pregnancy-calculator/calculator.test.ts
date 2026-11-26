import { describe, expect, it } from "vitest";

import {
  dueDateFromLastPeriod,
  lastPeriodFromDueDate,
  pregnancyAge,
  pregnancyAgeSentence,
  validateLastPeriod,
} from "./calculator";
import { addDays, formatCalendarDate, parseIsoDate, toIsoDate, type CalendarDate } from "./calendarDate";

const d = (iso: string): CalendarDate => {
  const parsed = parseIsoDate(iso);
  if (!parsed) throw new Error(`bad test date ${iso}`);
  return parsed;
};
const today = d("2026-11-12");

describe("pregnancy calculator", () => {
  it("last period 2026-05-10 gives due date 2027-02-14", () => {
    expect(toIsoDate(dueDateFromLastPeriod(d("2026-05-10")))).toBe("2027-02-14");
  });

  it("last period 2026-05-10 on 2026-11-12 is 26 weeks and 4 days", () => {
    const age = pregnancyAge(d("2026-05-10"), today);
    expect(age.weeks).toBe(26);
    expect(age.days).toBe(4);
    expect(pregnancyAgeSentence(age)).toBe("You are 26 weeks and 4 days pregnant.");
  });

  it("last period 3 days ago is 0 weeks and 3 days", () => {
    const age = pregnancyAge(d("2026-11-09"), today);
    expect(age.weeks).toBe(0);
    expect(age.days).toBe(3);
    expect(pregnancyAgeSentence(age)).toBe("You are 0 weeks and 3 days pregnant.");
  });

  it("due date 2027-02-14 gives last period 2026-05-10", () => {
    expect(toIsoDate(lastPeriodFromDueDate(d("2027-02-14")))).toBe("2026-05-10");
  });

  it("rejects a future last period date", () => {
    expect(validateLastPeriod(d("2026-11-13"), today)?.problem).toBe("future");
  });

  it("accepts today", () => {
    expect(validateLastPeriod(today, today)).toBeNull();
  });

  it("accepts exactly 308 days ago and rejects 309 days ago", () => {
    expect(validateLastPeriod(addDays(today, -308), today)).toBeNull();
    expect(validateLastPeriod(addDays(today, -309), today)?.problem).toBe("too_old");
  });

  it.each([
    [13, 6, 1],
    [14, 0, 2],
    [27, 6, 2],
    [28, 0, 3],
  ])("%i weeks %i days is trimester %i", (weeks, days, trimester) => {
    const lastPeriod = addDays(today, -(weeks * 7 + days));
    expect(pregnancyAge(lastPeriod, today)).toEqual({ weeks, days, trimester });
  });

  it("works with leap years", () => {
    expect(toIsoDate(dueDateFromLastPeriod(d("2028-02-29")))).toBe("2028-12-05");
    expect(toIsoDate(lastPeriodFromDueDate(d("2028-12-05")))).toBe("2028-02-29");
    expect(toIsoDate(dueDateFromLastPeriod(d("2027-06-01")))).toBe("2028-03-07");
    expect(pregnancyAge(d("2028-02-01"), d("2028-03-01"))).toMatchObject({ weeks: 4, days: 1 });
    expect(parseIsoDate("2027-02-29")).toBeNull();
  });

  it("shows dates like 10 May 2026", () => {
    expect(formatCalendarDate(d("2026-05-10"))).toBe("10 May 2026");
    expect(formatCalendarDate(d("2027-02-14"))).toBe("14 Feb 2027");
  });
});
