import { describe, expect, it } from "vitest";

import { authorDisplayName, firstName } from "./displayName";
import { canComment, canPost, isAllowedPhoto } from "./postValidation";

describe("canPost", () => {
  it("allows words, a photo, or both — never neither", () => {
    expect(canPost("Hello", false)).toBe(true);
    expect(canPost("", true)).toBe(true);
    expect(canPost("Hello", true)).toBe(true);
    expect(canPost("", false)).toBe(false);
    expect(canPost("   ", false)).toBe(false);
  });
});

describe("canComment", () => {
  it("needs words", () => {
    expect(canComment("Thank you")).toBe(true);
    expect(canComment("")).toBe(false);
    expect(canComment("   ")).toBe(false);
  });
});

describe("isAllowedPhoto", () => {
  it("allows images up to 5 MB", () => {
    expect(isAllowedPhoto({ type: "image/jpeg", size: 1024 })).toBe(true);
    expect(isAllowedPhoto({ type: "image/png", size: 5 * 1024 * 1024 })).toBe(true);
  });

  it("refuses non-images, empty files and files over 5 MB", () => {
    expect(isAllowedPhoto({ type: "video/mp4", size: 1024 })).toBe(false);
    expect(isAllowedPhoto({ type: "image/jpeg", size: 0 })).toBe(false);
    expect(isAllowedPhoto({ type: "image/jpeg", size: 5 * 1024 * 1024 + 1 })).toBe(false);
  });
});

describe("firstName", () => {
  it("takes the first word of a full name", () => {
    expect(firstName("Amina Bello")).toBe("Amina");
    expect(firstName("  Amina  ")).toBe("Amina");
    expect(firstName(null)).toBe("");
    expect(firstName("")).toBe("");
  });
});

describe("authorDisplayName", () => {
  it("shows the saved name, or 'A mother' when there is none", () => {
    expect(authorDisplayName("Amina")).toBe("Amina");
    expect(authorDisplayName(null)).toBe("A mother");
    expect(authorDisplayName("   ")).toBe("A mother");
  });
});
