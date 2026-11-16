// Words on the Daily screen and the Home checklist card.

/** "4 of 6 done". */
export function doneText(done: number, total: number): string {
  return `${done} of ${total} done`;
}

/** "6 day streak", "1 day streak", or "Start your streak" when 0. */
export function streakText(streak: number): string {
  return streak > 0 ? `${streak} day streak` : "Start your streak";
}

/** "2 tasks left", "1 task left". */
export function tasksLeftText(left: number): string {
  return `${left} ${left === 1 ? "task" : "tasks"} left`;
}
