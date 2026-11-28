import { describe, expect, it } from "vitest";

import { debbyReplyState, UNREACHABLE_TEXT } from "./debbyResponse";

const body = (code: string, extra: Record<string, unknown> = {}) => ({
  code,
  reply: "Reply text",
  safety_triggered: false,
  ...extra,
});

describe("debbyReplyState", () => {
  it("ok shows the reply, no retry, input stays on", () => {
    expect(debbyReplyState(body("ok", { remaining: 9, chat_id: "chat-1" }))).toEqual({
      kind: "ok",
      text: "Reply text",
      tone: "normal",
      showRetry: false,
      limitReached: false,
      chatId: "chat-1",
      title: null,
    });
  });

  it("safety shows the reply in the safety bubble with no retry", () => {
    expect(debbyReplyState(body("safety", { safety_triggered: true }))).toEqual({
      kind: "safety",
      text: "Reply text",
      tone: "safety",
      showRetry: false,
      limitReached: false,
      chatId: null,
      title: null,
    });
  });

  it("limit shows the reply and turns the input off", () => {
    expect(debbyReplyState(body("limit", { remaining: 0 }))).toEqual({
      kind: "limit",
      text: "Reply text",
      tone: "normal",
      showRetry: false,
      limitReached: true,
      chatId: null,
      title: null,
    });
  });

  it("busy shows the reply with Try again", () => {
    expect(debbyReplyState(body("busy"))).toMatchObject({
      kind: "busy",
      text: "Reply text",
      showRetry: true,
      limitReached: false,
    });
  });

  it("error shows the reply with Try again", () => {
    expect(debbyReplyState(body("error"))).toMatchObject({
      kind: "error",
      text: "Reply text",
      showRetry: true,
      limitReached: false,
    });
  });

  it("too_long shows the reply with no Try again", () => {
    expect(debbyReplyState(body("too_long"))).toMatchObject({
      kind: "too_long",
      text: "Reply text",
      showRetry: false,
      limitReached: false,
    });
  });

  it("a failed call shows the could-not-reach message with Try again", () => {
    expect(debbyReplyState(null)).toEqual({
      kind: "unreachable",
      text: UNREACHABLE_TEXT,
      tone: "normal",
      showRetry: true,
      limitReached: false,
      chatId: null,
      title: null,
    });
    expect(UNREACHABLE_TEXT).toBe("We could not reach Debby. Check your internet and try again.");
  });

  it("a new chat's first reply carries its id and title", () => {
    expect(
      debbyReplyState(body("ok", { chat_id: "chat-9", title: "Feeling sick" })),
    ).toMatchObject({ kind: "ok", chatId: "chat-9", title: "Feeling sick" });
  });

  it("gone shows the reply with no Try again, so the screen can offer a new chat", () => {
    expect(debbyReplyState(body("gone", { chat_id: "chat-1" }))).toMatchObject({
      kind: "gone",
      text: "Reply text",
      showRetry: false,
      limitReached: false,
      chatId: "chat-1",
    });
  });

  it("an unknown code or empty reply counts as a failed call", () => {
    expect(debbyReplyState(body("something_else")).kind).toBe("unreachable");
    expect(debbyReplyState(body("ok", { reply: "" })).kind).toBe("unreachable");
  });
});
