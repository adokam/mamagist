import { beforeEach, describe, expect, it } from "vitest";

import {
  readLastDailyTasks,
  readLastWeeklyTip,
  saveLastDailyTasks,
  saveLastWeeklyTip,
} from "./offlineCache";

describe("offlineCache", () => {
  beforeEach(() => {
    window.localStorage.removeItem("mamagist:last-daily-tasks");
    window.localStorage.removeItem("mamagist:last-weekly-tip");
  });

  it("saves and reads back last-loaded task titles", () => {
    saveLastDailyTasks(["Walk for 20 minutes", "Drink enough water"]);
    expect(readLastDailyTasks()).toEqual(["Walk for 20 minutes", "Drink enough water"]);
  });

  it("saves and reads back the last weekly tip", () => {
    saveLastWeeklyTip("Rest when you feel tired.");
    expect(readLastWeeklyTip()).toBe("Rest when you feel tired.");
  });

  it("returns null when nothing was saved yet", () => {
    expect(readLastDailyTasks()).toBeNull();
    expect(readLastWeeklyTip()).toBeNull();
  });
});
