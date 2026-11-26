import { describe, expect, it } from "vitest";

import { timeAgo } from "./timeAgo";

const NOW = new Date("2026-11-26T12:00:00.000Z").getTime();

describe("timeAgo", () => {
  it("says Just now for a post under a minute old", () => {
    expect(timeAgo("2026-11-26T11:59:30.000Z", NOW)).toBe("Just now");
  });

  it("uses m, h and d labels like the Facebook feed", () => {
    expect(timeAgo("2026-11-26T11:30:00.000Z", NOW)).toBe("30m");
    expect(timeAgo("2026-11-26T10:00:00.000Z", NOW)).toBe("2h");
    expect(timeAgo("2026-11-23T12:00:00.000Z", NOW)).toBe("3d");
  });

  it("uses w, mo and y for older posts", () => {
    expect(timeAgo("2026-11-12T12:00:00.000Z", NOW)).toBe("2w");
    expect(timeAgo("2026-09-26T12:00:00.000Z", NOW)).toBe("2mo");
    expect(timeAgo("2024-11-26T12:00:00.000Z", NOW)).toBe("2y");
  });

  it("never goes negative for a future date", () => {
    expect(timeAgo("2026-11-26T13:00:00.000Z", NOW)).toBe("Just now");
  });

  it("returns empty for a date that is not a date", () => {
    expect(timeAgo("not a date", NOW)).toBe("");
  });
});
