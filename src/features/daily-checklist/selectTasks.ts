// Which daily tasks apply to her. Pure function, no screen code.
import type { Trimester } from "@/features/pregnancy-calculator/calculator";
import type { Database } from "@/integrations/supabase/types";

type TaskRow = Database["public"]["Tables"]["daily_tasks"]["Row"];
export type LifeStage = Database["public"]["Enums"]["life_stage"];
export type DailyTask = Pick<
  TaskRow,
  "id" | "title" | "stage" | "trimester" | "min_week" | "max_week" | "sort_order"
>;

/**
 * Tasks that apply to her, sorted by sort_order.
 * - Stage must match hers (empty stage counts as pregnant).
 * - Trimester empty, or equal to hers. A task with a trimester never applies when hers is unknown.
 * - min_week empty or at most her weeks; max_week empty or at least her weeks.
 * - For new_mother and breastfeeding, weeks and trimester are treated as unknown.
 */
export function selectTasks(
  tasks: readonly DailyTask[],
  stage: LifeStage | null,
  weeks: number | null,
  trimester: Trimester | null,
): DailyTask[] {
  const herStage: LifeStage = stage ?? "pregnant";
  const pregnant = herStage === "pregnant";
  const w = pregnant ? weeks : null;
  const t = pregnant ? trimester : null;

  return tasks
    .filter((task) => {
      if (task.stage !== herStage) return false;
      if (task.trimester !== null && (t === null || task.trimester !== t)) return false;
      if (task.min_week !== null && (w === null || task.min_week > w)) return false;
      if (task.max_week !== null && (w === null || task.max_week < w)) return false;
      return true;
    })
    .sort((a, b) => a.sort_order - b.sort_order);
}
