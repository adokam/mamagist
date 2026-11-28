import { describe, expect, it } from "vitest";

import { debbyTabAction } from "./debbyChats";

describe("debbyTabAction", () => {
  it("tapping Debby on another screen opens a new chat", () => {
    expect(debbyTabAction("/home")).toBe("new-chat");
    expect(debbyTabAction("/daily")).toBe("new-chat");
    expect(debbyTabAction("/profile")).toBe("new-chat");
    expect(debbyTabAction("/community")).toBe("new-chat");
  });

  it("tapping Debby while already on a Debby screen does nothing", () => {
    expect(debbyTabAction("/debby")).toBe("stay");
    expect(debbyTabAction("/debby/abc-123")).toBe("stay");
  });
});
