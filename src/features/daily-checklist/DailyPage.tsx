import { Check } from "lucide-react";

import { PeachCard, WhiteCard } from "@/components/Cards";
import { LoadError } from "@/components/LoadError";
import { PageHeader } from "@/components/PageHeader";
import { ProgressBar } from "@/components/ProgressBar";
import { Skeleton } from "@/components/ui/skeleton";
import { FormError } from "@/features/auth/FormField";
import { cn } from "@/lib/utils";

import { doneText, streakText, tasksLeftText } from "./checklistText";
import type { DailyTask } from "./selectTasks";
import { useDailyChecklist } from "./useDailyChecklist";

export function DailyPage() {
  const checklist = useDailyChecklist();

  return (
    <main className="page-shell">
      <div className="mb-5">
        <PageHeader label="Daily checklist" title="Today" />
      </div>
      {checklist.status === "error" ? (
        <LoadError onRetry={checklist.retry} />
      ) : checklist.status === "loading" ? (
        <DailySkeleton />
      ) : checklist.total === 0 ? (
        <div className="space-y-4">
          <WhiteCard>
            <p className="text-[17px] font-semibold text-foreground">No tasks for today.</p>
          </WhiteCard>
          <DoctorNote />
        </div>
      ) : (
        <div className="space-y-4">
          <PeachCard>
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[22px] leading-tight font-extrabold text-foreground">
                {doneText(checklist.done, checklist.total)}
              </p>
              <p className="text-[15px] font-bold text-foreground">
                {streakText(checklist.streak)}
              </p>
            </div>
            <ProgressBar value={(checklist.done / checklist.total) * 100} className="mt-5" />
          </PeachCard>

          <FormError message={checklist.saveError} />

          <ul className="space-y-4">
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

          <div className="rounded-3xl bg-primary p-5 text-primary-foreground">
            {checklist.done < checklist.total ? (
              <>
                <h2 className="text-[22px] leading-tight font-extrabold">
                  {tasksLeftText(checklist.total - checklist.done)}
                </h2>
                <p className="mt-3 text-[17px] leading-relaxed">
                  Finish them to see “You are done for today”.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-[22px] leading-tight font-extrabold">You are done for today</h2>
                <p className="mt-3 text-[17px] leading-relaxed">Well done. See you tomorrow.</p>
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
      className="flex min-h-14 w-full items-center gap-3.5 rounded-[20px] border border-border bg-surface px-4 py-3.5 text-left text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <span
        aria-hidden
        className={cn(
          "grid h-[26px] w-[26px] shrink-0 place-items-center rounded-[3px]",
          done
            ? "bg-primary text-primary-foreground"
            : "border-[1.5px] border-muted-foreground bg-surface",
        )}
      >
        {done ? <Check className="h-5 w-5" strokeWidth={3.5} /> : null}
      </span>
      <span className="text-[17px] leading-snug font-medium">{task.title}</span>
    </button>
  );
}

function DoctorNote() {
  return (
    <p className="text-[17px] leading-relaxed text-foreground">
      Stop and call your doctor if you feel pain, dizziness, or bleeding.
    </p>
  );
}

function DailySkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-[88px] w-full rounded-3xl" />
      {[0, 1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-14 w-full rounded-[20px]" />
      ))}
      <Skeleton className="h-28 w-full rounded-3xl" />
    </div>
  );
}
