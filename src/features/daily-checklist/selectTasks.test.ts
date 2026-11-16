import { describe, expect, it } from "vitest";

import { selectTasks, type DailyTask } from "./selectTasks";

const task = (id: string, stage: DailyTask["stage"], extra: Partial<DailyTask> = {}): DailyTask => ({
  id,
  title: id,
  stage,
  trimester: null,
  min_week: null,
  max_week: null,
  sort_order: 0,
  ...extra,
});

const tasks: DailyTask[] = [
  task("kicks", "pregnant", { trimester: 3, sort_order: 7 }),
  task("walk", "pregnant", { sort_order: 1 }),
  task("water", "pregnant", { sort_order: 2 }),
  task("rest-baby", "new_mother", { sort_order: 1 }),
  task("feed-water", "breastfeeding", { sort_order: 1 }),
  task("late", "pregnant", { min_week: 30, max_week: 32, sort_order: 8 }),
];
const ids = (list: DailyTask[]) => list.map((t) => t.id);

describe("selectTasks", () => {
  it("gives the kick counts task in trimester 3, not trimester 2", () => {
    expect(ids(selectTasks(tasks, "pregnant", 30, 3))).toContain("kicks");
    expect(ids(selectTasks(tasks, "pregnant", 20, 2))).not.toContain("kicks");
  });

  it("gives no task with a trimester when she has no date", () => {
    expect(ids(selectTasks(tasks, "pregnant", null, null))).toEqual(["walk", "water"]);
  });

  it("gives new mothers only new_mother tasks and breastfeeding only breastfeeding tasks", () => {
    expect(ids(selectTasks(tasks, "new_mother", 30, 3))).toEqual(["rest-baby"]);
    expect(ids(selectTasks(tasks, "breastfeeding", 30, 3))).toEqual(["feed-water"]);
  });

  it("uses the pregnant tasks when her stage is empty", () => {
    expect(ids(selectTasks(tasks, null, 20, 2))).toEqual(["walk", "water"]);
  });

  it("checks min_week and max_week, inclusive", () => {
    expect(ids(selectTasks(tasks, "pregnant", 29, 3))).not.toContain("late");
    expect(ids(selectTasks(tasks, "pregnant", 30, 3))).toContain("late");
    expect(ids(selectTasks(tasks, "pregnant", 32, 3))).toContain("late");
    expect(ids(selectTasks(tasks, "pregnant", 33, 3))).not.toContain("late");
  });

  it("sorts by sort_order", () => {
    expect(ids(selectTasks(tasks, "pregnant", 31, 3))).toEqual(["walk", "water", "kicks", "late"]);
  });
});
