import { describe, expect, it } from "vitest";

import { groupsListInitialState } from "./groupsListState";

describe("groupsListInitialState", () => {
  it("opens nothing special by default", () => {
    expect(groupsListInitialState(null)).toEqual({ showCreate: false, focusMine: false });
    expect(groupsListInitialState(undefined)).toEqual({ showCreate: false, focusMine: false });
    expect(groupsListInitialState({})).toEqual({ showCreate: false, focusMine: false });
  });

  it("opens the create form when the menu asked for it", () => {
    expect(groupsListInitialState({ createGroup: true })).toEqual({
      showCreate: true,
      focusMine: false,
    });
  });

  it("focuses My groups when the menu asked for it", () => {
    expect(groupsListInitialState({ focus: "mine" })).toEqual({
      showCreate: false,
      focusMine: true,
    });
  });

  it("ignores anything that is not a real request", () => {
    expect(groupsListInitialState({ createGroup: "yes" })).toEqual({
      showCreate: false,
      focusMine: false,
    });
    expect(groupsListInitialState({ focus: "all" })).toEqual({
      showCreate: false,
      focusMine: false,
    });
  });
});
