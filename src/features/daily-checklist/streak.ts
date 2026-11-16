// Streak of complete days. Pure function, no screen code.
import { pregnancyAge } from "@/features/pregnancy-calculator/calculator";
import { addDays, toIsoDate, type CalendarDate } from "@/features/pregnancy-calculator/calendarDate";

import { selectTasks, type DailyTask, type LifeStage } from "./selectTasks";

export const STREAK_MAX_DAYS = 90;

export type Completion = { task_id: string; completed_on: string };

/** Tasks that applied to her on a given day, using her weeks and trimester on that day. */
export function tasksForDay(
  tasks: readonly DailyTask[],
  stage: LifeStage | null,
  lastPeriod: CalendarDate | null,
  day: CalendarDate,
): DailyTask[] {
  const age = lastPeriod ? pregnancyAge(lastPeriod, day) : null;
  return selectTasks(tasks, stage, age?.weeks ?? null, age?.trimester ?? null);
}

/** A day is complete when it had at least one task and every one has a completion row that day. */
export function isDayComplete(dayTasks: readonly DailyTask[], doneIds: ReadonlySet<string>): boolean {
  return dayTasks.length > 0 && dayTasks.every((t) => doneIds.has(t.id));
}

/**
 * Number of complete days in a row, at most 90.
 * Ends today if today is complete; otherwise ends yesterday, so an unfinished today never breaks it.
 */
export function computeStreak({
  tasks,
  stage,
  lastPeriod,
  completions,
  today,
}: {
  tasks: readonly DailyTask[];
  stage: LifeStage | null;
  lastPeriod: CalendarDate | null;
  completions: readonly Completion[];
  today: CalendarDate;
}): number {
  const byDay = new Map<string, Set<string>>();
  for (const c of completions) {
    let set = byDay.get(c.completed_on);
    if (!set) byDay.set(c.completed_on, (set = new Set()));
    set.add(c.task_id);
  }
  const complete = (day: CalendarDate) =>
    isDayComplete(
      tasksForDay(tasks, stage, lastPeriod, day),
      byDay.get(toIsoDate(day)) ?? new Set<string>(),
    );

  let day = complete(today) ? today : addDays(today, -1);
  let streak = 0;
  while (streak < STREAK_MAX_DAYS && complete(day)) {
    streak += 1;
    day = addDays(day, -1);
  }
  return streak;
}
