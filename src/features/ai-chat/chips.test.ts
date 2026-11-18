import { describe, expect, it } from "vitest";

import { chipsForStage } from "./chips";

describe("chipsForStage", () => {
  it("pregnant gets the pregnancy chips", () => {
    expect(chipsForStage("pregnant")).toEqual([
      "What can I eat?",
      "Baby movement",
      "Clinic checklist",
    ]);
  });

  it("empty stage gets the pregnancy chips", () => {
    expect(chipsForStage(null)).toEqual(["What can I eat?", "Baby movement", "Clinic checklist"]);
  });

  it("new mother gets the new mother chips", () => {
    expect(chipsForStage("new_mother")).toEqual([
      "Feeding my baby",
      "Rest and recovery",
      "Clinic checklist",
    ]);
  });

  it("breastfeeding gets the new mother chips", () => {
    expect(chipsForStage("breastfeeding")).toEqual([
      "Feeding my baby",
      "Rest and recovery",
      "Clinic checklist",
    ]);
  });
});
