import { describe, expect, it } from "vitest";

import { isAlreadyOnList } from "./notify";

describe("isAlreadyOnList", () => {
  it("treats a unique-violation error as already on the list", () => {
    expect(isAlreadyOnList({ code: "23505" })).toBe(true);
  });

  it("does not treat other errors as already on the list", () => {
    expect(isAlreadyOnList({ code: "42501" })).toBe(false);
    expect(isAlreadyOnList(new Error("offline"))).toBe(false);
    expect(isAlreadyOnList(null)).toBe(false);
  });
});
