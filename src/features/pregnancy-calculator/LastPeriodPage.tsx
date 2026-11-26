import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";

import { OutlineButton, PrimaryButton } from "@/components/Buttons";
import { SurfaceCard } from "@/components/Cards";
import { DateInput } from "@/components/DateInput";
import { PageHeader } from "@/components/PageHeader";
import { StepProgress } from "@/components/StepProgress";
import { PREGNANCY_DAYS } from "@/config/constants";
import { useAuth } from "@/features/auth/AuthProvider";
import { FormError, FormField } from "@/features/auth/FormField";
import { privateProfileKey, updateMyPrivateProfile } from "@/features/profile/privateProfile";
import { friendlySaveError } from "@/features/profile/saveError";

import {
  dueDateFromLastPeriod,
  lastPeriodFromDueDate,
  pregnancyAge,
  pregnancyAgeSentence,
  validateLastPeriod,
} from "./calculator";
import {
  addDays,
  formatCalendarDate,
  parseIsoDate,
  toIsoDate,
  todayInLocalTimeZone,
  type CalendarDate,
} from "./calendarDate";

type Mode = "period" | "due";

// In due date mode the same check runs on the worked-out last period, with wording about the due date.
const DUE_DATE_MESSAGES = {
  future: "That due date is too far away. Please check it.",
  too_old: "That due date was too long ago. Please check it.",
} as const;

function calculate(mode: Mode, value: string, today: CalendarDate) {
  const chosen = parseIsoDate(value);
  if (!chosen) return { status: "empty" as const };
  const lastPeriod = mode === "period" ? chosen : lastPeriodFromDueDate(chosen);
  const dueDate = mode === "period" ? dueDateFromLastPeriod(chosen) : chosen;
  const problem = validateLastPeriod(lastPeriod, today);
  if (problem) {
    const message = mode === "period" ? problem.message : DUE_DATE_MESSAGES[problem.problem];
    return { status: "invalid" as const, chosen, message };
  }
  return { status: "valid" as const, chosen, lastPeriod, dueDate, age: pregnancyAge(lastPeriod, today) };
}

type Variant = "signup" | "edit";

/** Signup step 2 at /signup/period. */
export function LastPeriodPage() {
  return <PregnancyDateForm variant="signup" initial={{ period: "", due: "" }} />;
}

/**
 * The date screen, shared by signup step 2 ("signup") and /pregnancy-date ("edit").
 * Edit has no step bar or step label, starts with her saved dates, and shows Save and Cancel.
 */
export function PregnancyDateForm({
  variant,
  initial,
}: {
  variant: Variant;
  initial: Record<Mode, string>;
}) {
  const isEdit = variant === "edit";
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // Her phone's date, read once per visit so the result does not jump at midnight.
  const [todayDate] = useState(() => todayInLocalTimeZone());
  // With only a saved due date, start in due date mode.
  const [mode, setMode] = useState<Mode>(() => (!initial.period && initial.due ? "due" : "period"));
  const [values, setValues] = useState<Record<Mode, string>>(initial);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const value = values[mode];
  const result = calculate(mode, value, todayDate);
  const fieldId = mode === "period" ? "lastPeriod" : "dueDate";
  const error = result.status === "invalid" ? result.message : undefined;

  // Picker limits match the validation: last period between 308 days ago and today.
  const limits =
    mode === "period"
      ? { min: toIsoDate(addDays(todayDate, -308)), max: toIsoDate(todayDate) }
      : {
          min: toIsoDate(addDays(todayDate, PREGNANCY_DAYS - 308)),
          max: toIsoDate(addDays(todayDate, PREGNANCY_DAYS)),
        };

  async function onContinue() {
    if (result.status !== "valid" || !user || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      await updateMyPrivateProfile(user.id, {
        last_period_date: toIsoDate(result.lastPeriod),
        due_date: toIsoDate(result.dueDate),
      });
      await queryClient.invalidateQueries({ queryKey: privateProfileKey(user.id) });
      await navigate({ to: isEdit ? "/home" : "/signup/details" });
    } catch (e) {
      setSaveError(friendlySaveError(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main
      className={
        isEdit
          ? "page-shell flex flex-col"
          : "page-shell flex min-h-dvh flex-col pb-[calc(2rem+env(safe-area-inset-bottom))]"
      }
    >
      {isEdit ? (
        <PageHeader title="When did your last period start?" />
      ) : (
        <>
          <StepProgress current={2} total={3} />
          <div className="mt-6">
            <PageHeader label="Step 2 of 3" title="When did your last period start?" />
          </div>
        </>
      )}
      <p className="mt-4 text-base leading-relaxed text-foreground">
        We use this to find your due date and your week.
      </p>

      <div className="mt-6 space-y-3">
        <FormField
          id={fieldId}
          label={mode === "period" ? "First day of last period" : "Your due date"}
          error={error}
        >
          <DateInput
            key={mode}
            id={fieldId}
            name={fieldId}
            value={value}
            displayValue={result.status === "empty" ? null : formatCalendarDate(result.chosen)}
            min={limits.min}
            max={limits.max}
            onChange={(e) => {
              const next = e.target.value;
              setValues((v) => ({ ...v, [mode]: next }));
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${fieldId}-error` : undefined}
          />
        </FormField>

        {mode === "period" ? (
          <OutlineButton type="button" onClick={() => setMode("due")}>
            I don't know the date
          </OutlineButton>
        ) : (
          <button
            type="button"
            onClick={() => setMode("period")}
            className="block min-h-11 px-1 text-base font-bold text-foreground underline underline-offset-4"
          >
            I know my last period date
          </button>
        )}
      </div>

      {result.status === "valid" ? (
        <SurfaceCard className="mt-4" aria-live="polite">
          <p className="text-[15px] text-foreground">
            {mode === "period" ? "Your due date" : "Estimated first day of your last period"}
          </p>
          <p className="mt-2 text-[32px] leading-tight font-extrabold tracking-tight text-foreground">
            {formatCalendarDate(mode === "period" ? result.dueDate : result.lastPeriod)}
          </p>
          <p className="mt-2 text-base text-foreground">{pregnancyAgeSentence(result.age)}</p>
        </SurfaceCard>
      ) : null}
      {isEdit ? null : (
        <p className="mt-4 text-[15px] text-foreground">You can change this later in your profile.</p>
      )}

      <div className={isEdit ? "space-y-3 pt-6" : "mt-auto space-y-3 pt-6"}>
        <FormError message={saveError} />
        <PrimaryButton
          type="button"
          disabled={result.status !== "valid" || saving}
          aria-busy={saving}
          onClick={() => void onContinue()}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
              Saving…
            </>
          ) : isEdit ? (
            "Save"
          ) : (
            "Continue"
          )}
        </PrimaryButton>
        <OutlineButton
          type="button"
          disabled={saving}
          onClick={() => void navigate({ to: isEdit ? "/home" : "/signup/details" })}
        >
          {isEdit ? "Cancel" : "Skip for now"}
        </OutlineButton>
      </div>
    </main>
  );
}
