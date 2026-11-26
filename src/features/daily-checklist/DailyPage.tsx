import { Check } from "lucide-react";
import { useEffect, useState } from "react";

import { SurfaceCard, LineCard } from "@/components/Cards";
import { LoadError } from "@/components/LoadError";
import { PageHeader } from "@/components/PageHeader";
import { ProgressBar } from "@/components/ProgressBar";
import { Skeleton } from "@/components/ui/skeleton";
import { FormError } from "@/features/auth/FormField";
import { cn } from "@/lib/utils";

import { readLastDailyTasks, saveLastDailyTasks } from "@/features/pwa/offlineCache";

import { doneText, streakText, tasksLeftText } from "./checklistText";
import type { DailyTask } from "./selectTasks";
import { useDailyChecklist } from "./useDailyChecklist";

export function DailyPage() {
  const checklist = useDailyChecklist();
  // Last-loaded task titles, kept on the device only, so Daily can show them offline.
  const [savedTitles] = useState(() => readLastDailyTasks());
  useEffect(() => {
    if (checklist.status === "ready") {
      saveLastDailyTasks(checklist.tasks.map((t) => t.title));
    }
  }, [checklist]);

  return (
    <main className="page-shell">
      <div className="mb-4">
        <PageHeader label="Daily checklist" title="Today" />
      </div>
      {checklist.status === "error" ? (
        <div className="space-y-4">
          {savedTitles ? (
            <LineCard>
              <p className="text-base font-semibold text-foreground">
                You are offline. Showing your last tasks.
              </p>
              <ul className="mt-3 space-y-2">
                {savedTitles.map((title) => (
                  <li key={title} className="text-base leading-snug text-foreground">
                    {title}
                  </li>
                ))}
              </ul>
            </LineCard>
          ) : null}
          <LoadError onRetry={checklist.retry} />
        </div>
      ) : checklist.status === "loading" ? (
        <DailySkeleton />
      ) : checklist.total === 0 ? (
        <div className="space-y-4">
          <LineCard>
            <p className="text-base font-semibold text-foreground">No tasks for today.</p>
          </LineCard>
          <DoctorNote />
        </div>
      ) : (
        <div className="space-y-3">
          <SurfaceCard>
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[20px] leading-tight font-extrabold text-foreground">
                {doneText(checklist.done, checklist.total)}
              </p>
              <p className="text-[15px] font-bold text-foreground">
                {streakText(checklist.streak)}
              </p>
            </div>
            <ProgressBar value={(checklist.done / checklist.total) * 100} className="mt-3" />
          </SurfaceCard>

          <FormError message={checklist.saveError} />

          <ul className="space-y-3">
            {checklist.tasks.map((task) => (
              <li key={task.id}>
                <TaskCard
                  task={task}
                  done={checklist.doneIds.has(task.id)}
                  onToggle={() => checklist.toggle(task.id)}
                />
              </li>
            ))}
          </ul>

          <div className="rounded-[20px] bg-primary p-4 text-primary-contrast">
            {checklist.done < checklist.total ? (
              <>
                <h2 className="text-[20px] leading-tight font-extrabold">
                  {tasksLeftText(checklist.total - checklist.done)}
                </h2>
                <p className="mt-3 text-base leading-relaxed">
                  Finish them to see “You are done for today”.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-[20px] leading-tight font-extrabold">You are done for today</h2>
                <p className="mt-3 text-base leading-relaxed">Well done. See you tomorrow.</p>
              </>
            )}
          </div>

          <DoctorNote />
        </div>
      )}
    </main>
  );
}

/** The whole card is the touch area. */
function TaskCard({
  task,
  done,
  onToggle,
}: {
  task: DailyTask;
  done: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      onClick={onToggle}
      className="flex min-h-12 w-full items-center gap-3 rounded-[20px] border border-line bg-card px-4 py-2.5 text-left text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <span
        aria-hidden
        className={cn(
          "grid h-6 w-6 shrink-0 place-items-center rounded-[3px]",
          done
            ? "bg-primary text-primary-contrast"
            : "border-[1.5px] border-muted-foreground bg-surface",
        )}
      >
        {done ? <Check className="h-5 w-5" strokeWidth={3.5} /> : null}
      </span>
      <span className="text-base leading-snug font-medium">{task.title}</span>
    </button>
  );
}

function DoctorNote() {
  return (
    <p className="text-base leading-relaxed text-foreground">
      Stop and call your doctor if you feel pain, dizziness, or bleeding.
    </p>
  );
}

function DailySkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-[76px] w-full rounded-[20px]" />
      {[0, 1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-12 w-full rounded-[20px]" />
      ))}
      <Skeleton className="h-24 w-full rounded-[20px]" />
    </div>
  );
}
