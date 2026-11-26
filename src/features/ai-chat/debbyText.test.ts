import { describe, expect, it } from "vitest";

import { guideLine, welcomeText } from "./debbyText";

const base = {
  full_name: "Ada Obi",
  last_period_date: null,
  due_date: null,
  stage: null,
  baby_birth_date: null,
};
const today = { year: 2026, month: 11, day: 18 };

describe("guideLine", () => {
  it("shows her weeks and days from her last period", () => {
    // 2026-05-10 to 2026-11-18 is 192 days: 27 weeks, 3 days.
    expect(guideLine({ ...base, last_period_date: "2026-05-10" }, today)).toBe(
      "Your pregnancy guide · 27 weeks, 3 days",
    );
  });

  it("shows 0 weeks when she is only a few days in", () => {
    // 2026-11-15 to 2026-11-18 is 3 days: 0 weeks, 3 days.
    expect(guideLine({ ...base, last_period_date: "2026-11-15" }, today)).toBe(
      "Your pregnancy guide · 0 weeks, 3 days",
    );
  });

  it("no date shows only the guide line", () => {
    expect(guideLine(base, today)).toBe("Your pregnancy guide");
  });

  it("new mother and breastfeeding get the new mothers line", () => {
    expect(guideLine({ ...base, stage: "new_mother" }, today)).toBe("Your guide for new mothers");
    expect(guideLine({ ...base, stage: "breastfeeding" }, today)).toBe(
      "Your guide for new mothers",
    );
  });
});

describe("welcomeText", () => {
  it("uses her first name only", () => {
    expect(welcomeText("Ada Obi", "pregnant")).toBe(
      "Hello Ada. I am Debby, your pregnancy guide. I am an AI, not a doctor. Tell me how you feel today.",
    );
  });

  it("uses the new mothers wording for new mother and breastfeeding", () => {
    expect(welcomeText("Ada", "breastfeeding")).toBe(
      "Hello Ada. I am Debby, your guide for new mothers. I am an AI, not a doctor. Tell me how you feel today.",
    );
  });
});
