// Data for the Daily screen and the Home checklist card. Reads and writes only her own rows.
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useRef, useState } from "react";

import { useAuth } from "@/features/auth/AuthProvider";
import { lastPeriodFromDueDate } from "@/features/pregnancy-calculator/calculator";
import { addDays, parseIsoDate, toIsoDate } from "@/features/pregnancy-calculator/calendarDate";
import { privateProfileKey } from "@/features/profile/privateProfile";
import { supabase } from "@/integrations/supabase/client";

import type { DailyTask } from "./selectTasks";
import { computeStreak, STREAK_MAX_DAYS, tasksForDay, type Completion } from "./streak";
import { useToday } from "./useToday";

const checklistProfileQuery = (userId: string) =>
  queryOptions({
    queryKey: [...privateProfileKey(userId), "checklist"],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("private_profiles")
        .select("stage, last_period_date, due_date, timezone")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return data ?? { stage: null, last_period_date: null, due_date: null, timezone: null };
    },
  });

const activeTasksQuery = queryOptions({
  queryKey: ["daily-tasks"],
  queryFn: async (): Promise<DailyTask[]> => {
    const { data, error } = await supabase
      .from("daily_tasks")
      .select("id, title, stage, trimester, min_week, max_week, sort_order")
      .eq("is_active", true);
    if (error) throw error;
    return data ?? [];
  },
});

const completionsKey = (userId: string, today: string) =>
  ["task-completions", userId, today] as const;

/** Her completions from 90 days before today up to today. */
const completionsQuery = (userId: string, today: string, enabled: boolean) =>
  queryOptions({
    queryKey: completionsKey(userId, today),
    enabled: enabled && Boolean(userId),
    queryFn: async (): Promise<Completion[]> => {
      const todayDate = parseIsoDate(today);
      if (!todayDate) return [];
      const { data, error } = await supabase
        .from("task_completions")
        .select("task_id, completed_on")
        .eq("user_id", userId)
        .gte("completed_on", toIsoDate(addDays(todayDate, -STREAK_MAX_DAYS)))
        .lte("completed_on", today);
      if (error) throw error;
      return data ?? [];
    },
  });

const SAVE_FAILED = "We couldn't save that. Please try again.";
const OFFLINE = "You seem to be offline. Check your internet connection and try again.";

export type DailyChecklist =
  | { status: "loading" }
  | { status: "error"; retry: () => void }
  | {
      status: "ready";
      tasks: DailyTask[];
      doneIds: ReadonlySet<string>;
      done: number;
      total: number;
      streak: number;
      toggle: (taskId: string) => void;
      saveError: string | null;
    };

export function useDailyChecklist(): DailyChecklist {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const queryClient = useQueryClient();

  const profile = useQuery(checklistProfileQuery(userId));
  const tasks = useQuery(activeTasksQuery);
  const today = useToday(profile.data?.timezone);
  const completions = useQuery(completionsQuery(userId, today, profile.isSuccess));

  const [saveError, setSaveError] = useState<string | null>(null);
  const pending = useRef(new Set<string>());

  const toggle = useCallback(
    (taskId: string) => {
      if (!userId || pending.current.has(taskId)) return;
      const key = completionsKey(userId, today);
      const before = queryClient.getQueryData<Completion[]>(key) ?? [];
      const wasDone = before.some((c) => c.task_id === taskId && c.completed_on === today);
      const after = wasDone
        ? before.filter((c) => !(c.task_id === taskId && c.completed_on === today))
        : [...before, { task_id: taskId, completed_on: today }];

      pending.current.add(taskId);
      setSaveError(null);
      void queryClient.cancelQueries({ queryKey: key });
      queryClient.setQueryData(key, after);

      const request = wasDone
        ? supabase
            .from("task_completions")
            .delete()
            .eq("user_id", userId)
            .eq("task_id", taskId)
            .eq("completed_on", today)
        : supabase
            .from("task_completions")
            .insert({ user_id: userId, task_id: taskId, completed_on: today });

      void Promise.resolve(request)
        .then(({ error }) => {
          // 23505: the row already exists, so the task is already done.
          if (error && !(error.code === "23505" && !wasDone)) throw error;
        })
        .catch(() => {
          queryClient.setQueryData<Completion[]>(key, (current = []) =>
            wasDone
              ? [
                  ...current.filter((c) => !(c.task_id === taskId && c.completed_on === today)),
                  { task_id: taskId, completed_on: today },
                ]
              : current.filter((c) => !(c.task_id === taskId && c.completed_on === today)),
          );
          setSaveError(
            typeof navigator !== "undefined" && navigator.onLine === false ? OFFLINE : SAVE_FAILED,
          );
        })
        .finally(() => pending.current.delete(taskId));
    },
    [queryClient, today, userId],
  );

  const ready = useMemo(() => {
    if (!profile.data || !tasks.data || !completions.data) return null;
    const todayDate = parseIsoDate(today);
    if (!todayDate) return null;
    const { stage, last_period_date, due_date } = profile.data;
    const pregnant = stage === null || stage === "pregnant";
    const savedPeriod = parseIsoDate(last_period_date ?? "");
    const savedDue = parseIsoDate(due_date ?? "");
    const lastPeriod = pregnant
      ? (savedPeriod ?? (savedDue ? lastPeriodFromDueDate(savedDue) : null))
      : null;

    const todayTasks = tasksForDay(tasks.data, stage, lastPeriod, todayDate);
    const doneIds = new Set(
      completions.data.filter((c) => c.completed_on === today).map((c) => c.task_id),
    );
    return {
      tasks: todayTasks,
      doneIds,
      done: todayTasks.filter((t) => doneIds.has(t.id)).length,
      total: todayTasks.length,
      streak: computeStreak({
        tasks: tasks.data,
        stage,
        lastPeriod,
        completions: completions.data,
        today: todayDate,
      }),
    };
  }, [profile.data, tasks.data, completions.data, today]);

  if (profile.isError || tasks.isError || completions.isError) {
    return {
      status: "error",
      retry: () => {
        if (profile.isError) void profile.refetch();
        if (tasks.isError) void tasks.refetch();
        if (completions.isError) void completions.refetch();
      },
    };
  }
  if (!ready) return { status: "loading" };
  return { status: "ready", ...ready, toggle, saveError };
}
