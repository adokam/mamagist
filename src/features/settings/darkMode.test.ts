import { describe, expect, it } from "vitest";

import { resolveTheme } from "./darkMode";

describe("resolveTheme", () => {
  it("uses a saved dark choice even when the phone is light", () => {
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("uses a saved light choice even when the phone is dark", () => {
    expect(resolveTheme("light", true)).toBe("light");
  });

  it("follows the phone setting when she has not saved a choice", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });
});
