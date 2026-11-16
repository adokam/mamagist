import { describe, expect, it } from "vitest";

import {
  addDays,
  toIsoDate,
  type CalendarDate,
} from "@/features/pregnancy-calculator/calendarDate";

import type { DailyTask } from "./selectTasks";
import { computeStreak, type Completion } from "./streak";
import { todayInTimeZone } from "./today";

const task = (id: string, extra: Partial<DailyTask> = {}): DailyTask => ({
  id,
  title: id,
  stage: "pregnant",
  trimester: null,
  min_week: null,
  max_week: null,
  sort_order: 0,
  ...extra,
});

const tasks = [task("walk"), task("water"), task("kicks", { trimester: 3 })];
const today: CalendarDate = { year: 2026, month: 11, day: 16 };
// No date: only walk and water apply.
const doneOn = (daysAgo: number[], ids = ["walk", "water"]): Completion[] =>
  daysAgo.flatMap((n) =>
    ids.map((id) => ({ task_id: id, completed_on: toIsoDate(addDays(today, -n)) })),
  );
const streak = (completions: Completion[], lastPeriod: CalendarDate | null = null, on = today) =>
  computeStreak({ tasks, stage: "pregnant", lastPeriod, completions, today: on });

describe("computeStreak", () => {
  it("counts today and the 3 days before it as 4", () => {
    expect(streak(doneOn([0, 1, 2, 3]))).toBe(4);
  });

  it("ends yesterday when today is not complete yet", () => {
    const partToday = [{ task_id: "walk", completed_on: toIsoDate(today) }];
    expect(streak([...partToday, ...doneOn([1, 2])])).toBe(2);
  });

  it("stops at a missed day", () => {
    expect(streak(doneOn([0, 1, 3, 4, 5]))).toBe(2);
  });

  it("is 0 with no completions", () => {
    expect(streak([])).toBe(0);
  });

  it("is never more than 90", () => {
    expect(streak(doneOn(Array.from({ length: 120 }, (_, i) => i)))).toBe(90);
  });

  it("needs the kick counts task only from week 28", () => {
    // Day 0 is 27w6d, day 1 is 28w0d.
    const day0 = today;
    const lastPeriod = addDays(day0, -(27 * 7 + 6));
    const day1 = addDays(day0, 1);
    const both = [day0, day1].flatMap((d) =>
      ["walk", "water"].map((id) => ({ task_id: id, completed_on: toIsoDate(d) })),
    );
    // Day 0 is complete without kicks.
    expect(streak(both, lastPeriod, day0)).toBe(1);
    // Day 1 is not complete without kicks, so the streak ends at day 0.
    expect(streak(both, lastPeriod, day1)).toBe(1);
    const withKicks = [...both, { task_id: "kicks", completed_on: toIsoDate(day1) }];
    expect(streak(withKicks, lastPeriod, day1)).toBe(2);
  });
});

describe("todayInTimeZone", () => {
  it("is correct near midnight for Africa/Lagos and America/New_York", () => {
    // 23:30 UTC on 15 Nov is 00:30 on 16 Nov in Lagos and 18:30 on 15 Nov in New York.
    const late = new Date("2026-11-15T23:30:00Z");
    expect(todayInTimeZone("Africa/Lagos", late)).toBe("2026-11-16");
    expect(todayInTimeZone("America/New_York", late)).toBe("2026-11-15");
    // 22:59 UTC is still 15 Nov in Lagos (23:59).
    expect(todayInTimeZone("Africa/Lagos", new Date("2026-11-15T22:59:00Z"))).toBe("2026-11-15");
    // 05:00 UTC on 16 Nov is 00:00 on 16 Nov in New York.
    expect(todayInTimeZone("America/New_York", new Date("2026-11-16T04:59:00Z"))).toBe(
      "2026-11-15",
    );
    expect(todayInTimeZone("America/New_York", new Date("2026-11-16T05:00:00Z"))).toBe(
      "2026-11-16",
    );
  });

  it("uses Africa/Lagos when the time zone is empty or unknown", () => {
    const late = new Date("2026-11-15T23:30:00Z");
    expect(todayInTimeZone(null, late)).toBe("2026-11-16");
    expect(todayInTimeZone("", late)).toBe("2026-11-16");
    expect(todayInTimeZone("Not/AZone", late)).toBe("2026-11-16");
  });
});
