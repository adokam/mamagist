import { describe, expect, it } from "vitest";

import { NIGERIAN_STATES } from "@/config/nigerian-states";

import { LIFE_STAGES, detailsUpdate } from "./details";

const empty = { stage: null, firstBaby: null, state: "", babyBirthDate: "" };

describe("signup details", () => {
  it("saves nothing when nothing is filled in", () => {
    expect(detailsUpdate(empty)).toEqual({});
  });

  it("saves only the filled fields", () => {
    expect(detailsUpdate({ ...empty, firstBaby: false, state: "Lagos" })).toEqual({
      first_baby: false,
      state: "Lagos",
    });
  });

  it("saves the baby birth date only for a new mother", () => {
    expect(detailsUpdate({ ...empty, stage: "pregnant", babyBirthDate: "2026-10-01" })).toEqual({
      stage: "pregnant",
    });
    expect(detailsUpdate({ ...empty, stage: "new_mother", babyBirthDate: "2026-10-01" })).toEqual({
      stage: "new_mother",
      baby_birth_date: "2026-10-01",
    });
  });

  it("saves a trimmed full name when given", () => {
    expect(detailsUpdate({ ...empty, fullName: "  Ada Obi " })).toEqual({
      full_name: "Ada Obi",
    });
    expect(detailsUpdate({ ...empty, fullName: "   " })).toEqual({});
  });

  it("uses the database stage values", () => {
    expect(LIFE_STAGES.map((s) => s.value)).toEqual(["pregnant", "new_mother", "breastfeeding"]);
  });

  it("lists the 36 states and the FCT", () => {
    expect(NIGERIAN_STATES).toHaveLength(37);
    expect(new Set(NIGERIAN_STATES).size).toBe(37);
    expect(NIGERIAN_STATES).toContain("Federal Capital Territory");
  });
});
