import { describe, expect, it } from "vitest";

import { MAX_CHAT_TITLE_LENGTH, validateChatTitle } from "./chatTitle";

describe("validateChatTitle", () => {
  it("trims the title", () => {
    expect(validateChatTitle("  Feeling tired  ")).toEqual({ ok: true, title: "Feeling tired" });
  });

  it("rejects an empty title", () => {
    const result = validateChatTitle("");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Give the chat a title.");
  });

  it("rejects a title that is only spaces", () => {
    expect(validateChatTitle("   ").ok).toBe(false);
  });

  it("accepts a title of exactly 80 characters", () => {
    const title = "a".repeat(MAX_CHAT_TITLE_LENGTH);
    expect(validateChatTitle(title)).toEqual({ ok: true, title });
  });

  it("rejects a title over 80 characters", () => {
    const result = validateChatTitle("a".repeat(MAX_CHAT_TITLE_LENGTH + 1));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Keep the title to 80 characters or less.");
  });
});
