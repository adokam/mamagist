import { describe, expect, it } from "vitest";

import type { ProfileSummary } from "@/features/profile/privateProfile";

import { babyAge, babyAgeText, greeting, homeCard, weeksAndDays } from "./homeSummary";

const d = (year: number, month: number, day: number) => ({ year, month, day });
const empty: ProfileSummary = {
  full_name: null,
  last_period_date: null,
  due_date: null,
  stage: null,
  baby_birth_date: null,
};

describe("greeting", () => {
  it("uses the first word of her name only", () => {
    expect(greeting(9, "  Ada Grace Obi ")).toBe("Good morning, Ada");
  });
  it("switches to afternoon at 12:00 and evening at 17:00", () => {
    expect(greeting(11, "Ada")).toBe("Good morning, Ada");
    expect(greeting(12, "Ada")).toBe("Good afternoon, Ada");
    expect(greeting(16, "Ada")).toBe("Good afternoon, Ada");
    expect(greeting(17, "Ada")).toBe("Good evening, Ada");
  });
  it("leaves out the name when there is none", () => {
    expect(greeting(8, null)).toBe("Good morning");
  });
});

describe("pregnancy card", () => {
  const today = d(2026, 11, 12);

  it("shows 26 weeks, 4 days and the due date from a last period date", () => {
    const card = homeCard({ ...empty, last_period_date: "2026-05-10" }, today);
    expect(card.kind).toBe("pregnancy");
    if (card.kind !== "pregnancy") return;
    expect(weeksAndDays(card.age)).toBe("26 weeks, 4 days");
    expect(card.dueDate).toEqual(d(2027, 2, 14));
    expect(card.age.trimester).toBe(2);
    expect(card.progress).toBeCloseTo(65);
    expect(card.tipWeek).toBe(26);
  });

  it("shows 0 weeks, 3 days when she is only a few days in", () => {
    const card = homeCard({ ...empty, last_period_date: "2026-11-09" }, today);
    expect(card.kind === "pregnancy" && weeksAndDays(card.age)).toBe("0 weeks, 3 days");
  });

  it("works out the rest from a due date only", () => {
    const card = homeCard({ ...empty, stage: "pregnant", due_date: "2027-02-14" }, today);
    expect(card.kind === "pregnancy" && weeksAndDays(card.age)).toBe("26 weeks, 4 days");
  });

  it("never fills the bar past 100 percent", () => {
    const card = homeCard({ ...empty, last_period_date: "2025-11-01" }, today);
    expect(card.kind === "pregnancy" && card.progress).toBe(100);
  });

  it("shows the clinic line only after 42 weeks", () => {
    const at42 = homeCard({ ...empty, last_period_date: "2025-12-31" }, d(2026, 10, 21)); // 42w0d
    const past42 = homeCard({ ...empty, last_period_date: "2025-12-31" }, d(2026, 10, 22)); // 42w1d
    expect(at42.kind === "pregnancy" && at42.pastFortyTwoWeeks).toBe(false);
    expect(past42.kind === "pregnancy" && past42.pastFortyTwoWeeks).toBe(true);
  });

  it("uses tip week 1 for 0 weeks and week 42 after 42 weeks", () => {
    const early = homeCard({ ...empty, last_period_date: "2026-11-10" }, today);
    const late = homeCard({ ...empty, last_period_date: "2025-12-31" }, d(2026, 11, 5)); // 44w0d
    expect(early.kind === "pregnancy" && early.tipWeek).toBe(1);
    expect(late.kind === "pregnancy" && late.tipWeek).toBe(42);
  });

  it("shows the no date card when she has no date", () => {
    expect(homeCard(empty, today).kind).toBe("no_date");
    expect(homeCard({ ...empty, stage: "pregnant" }, today).kind).toBe("no_date");
  });
});

describe("baby card", () => {
  const today = d(2026, 11, 12);

  it("is used for new mothers and breastfeeding, even with a pregnancy date", () => {
    expect(homeCard({ ...empty, stage: "new_mother", last_period_date: "2026-05-10" }, today).kind).toBe("baby");
    expect(homeCard({ ...empty, stage: "breastfeeding" }, today)).toEqual({ kind: "baby", babyAge: null });
  });

  it("shows weeks under 12 weeks, months from 12 weeks", () => {
    expect(babyAge(d(2026, 8, 21), today)).toEqual({ unit: "weeks", value: 11 }); // 83 days
    expect(babyAge(d(2026, 8, 20), today)).toEqual({ unit: "months", value: 2 }); // 84 days
    expect(babyAge(d(2025, 11, 13), today)).toEqual({ unit: "months", value: 11 });
    expect(babyAge(d(2025, 11, 12), today)).toEqual({ unit: "months", value: 12 });
  });

  it("has no age for a future birth date", () => {
    expect(babyAge(d(2026, 12, 1), today)).toBeNull();
  });

  it("words the age", () => {
    expect(babyAgeText({ unit: "weeks", value: 0 })).toBe("Less than 1 week old");
    expect(babyAgeText({ unit: "weeks", value: 1 })).toBe("1 week old");
    expect(babyAgeText({ unit: "months", value: 5 })).toBe("5 months old");
  });
});
