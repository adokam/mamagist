import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";

import { OutlineButton, PrimaryButton } from "@/components/Buttons";
import { ChoiceButton } from "@/components/ChoiceButton";
import { DateInput } from "@/components/DateInput";
import { PageHeader } from "@/components/PageHeader";
import { SelectInput } from "@/components/SelectInput";
import { StepProgress } from "@/components/StepProgress";
import { NIGERIAN_STATES } from "@/config/nigerian-states";
import { useAuth } from "@/features/auth/AuthProvider";
import { FormError, FormField } from "@/features/auth/FormField";
import {
  daysBetween,
  formatCalendarDate,
  parseIsoDate,
  toIsoDate,
  todayInLocalTimeZone,
} from "@/features/pregnancy-calculator/calendarDate";
import { supabase } from "@/integrations/supabase/client";

import { LIFE_STAGES, detailsUpdate } from "./details";
import { privateProfileKey, updateMyPrivateProfile, type LifeStage } from "./privateProfile";
import { friendlySaveError } from "./saveError";

const groupLabel = "block text-[15px] font-bold text-foreground";

export function DetailsPage() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [today] = useState(() => todayInLocalTimeZone());

  // Only used to choose Pregnant by default when she saved a date in step 2.
  const { data: saved } = useQuery({
    queryKey: privateProfileKey(userId),
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("private_profiles")
        .select("last_period_date")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [chosenStage, setChosenStage] = useState<LifeStage | null>(null);
  const [firstBaby, setFirstBaby] = useState<boolean | null>(null);
  const [state, setState] = useState("");
  const [babyBirthDate, setBabyBirthDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const stage = chosenStage ?? (saved?.last_period_date ? "pregnant" : null);
  const birth = parseIsoDate(babyBirthDate);
  const birthError =
    stage === "new_mother" && birth && daysBetween(birth, today) < 0
      ? "The birth date can't be in the future."
      : undefined;

  async function onFinish() {
    if (!user || saving || birthError) return;
    const changes = detailsUpdate({ stage, firstBaby, state, babyBirthDate });
    if (Object.keys(changes).length === 0) {
      await navigate({ to: "/home" });
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await updateMyPrivateProfile(user.id, changes);
      await queryClient.invalidateQueries({ queryKey: privateProfileKey(user.id) });
      await navigate({ to: "/home" });
    } catch (e) {
      setSaveError(friendlySaveError(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page-shell flex min-h-dvh flex-col pb-[calc(2rem+env(safe-area-inset-bottom))]">
      <StepProgress current={3} total={3} />
      <div className="mt-8">
        <PageHeader label="Step 3 of 3" title="Tell us a little about you" />
      </div>
      <p className="mt-4 text-base leading-relaxed text-foreground">
        This is optional. You can change it later.
      </p>

      <div className="mt-6 space-y-6">
        <div className="space-y-2">
          <p id="stage-label" className={groupLabel}>
            Stage
          </p>
          <div role="radiogroup" aria-labelledby="stage-label" className="space-y-3">
            {LIFE_STAGES.map((s) => (
              <ChoiceButton
                key={s.value}
                selected={stage === s.value}
                onClick={() => setChosenStage(s.value)}
              >
                {s.label}
              </ChoiceButton>
            ))}
          </div>
        </div>

        {stage === "new_mother" ? (
          <FormField id="babyBirthDate" label="Baby's birth date" error={birthError}>
            <DateInput
              id="babyBirthDate"
              name="babyBirthDate"
              value={babyBirthDate}
              displayValue={birth ? formatCalendarDate(birth) : null}
              max={toIsoDate(today)}
              onChange={(e) => setBabyBirthDate(e.target.value)}
              aria-invalid={Boolean(birthError)}
              aria-describedby={birthError ? "babyBirthDate-error" : undefined}
            />
          </FormField>
        ) : null}

        <div className="space-y-2">
          <p id="first-baby-label" className={groupLabel}>
            First baby
          </p>
          <div role="radiogroup" aria-labelledby="first-baby-label" className="flex gap-3">
            <ChoiceButton selected={firstBaby === true} onClick={() => setFirstBaby(true)}>
              Yes
            </ChoiceButton>
            <ChoiceButton selected={firstBaby === false} onClick={() => setFirstBaby(false)}>
              No
            </ChoiceButton>
          </div>
        </div>

        <FormField id="state" label="State">
          <SelectInput
            id="state"
            name="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
          >
            <option value="">Choose your state</option>
            {NIGERIAN_STATES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </SelectInput>
        </FormField>
      </div>

      <div className="mt-auto space-y-4 pt-8">
        <FormError message={saveError} />
        <PrimaryButton
          type="button"
          disabled={saving || Boolean(birthError)}
          aria-busy={saving}
          onClick={() => void onFinish()}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
              Saving…
            </>
          ) : (
            "Finish"
          )}
        </PrimaryButton>
        <OutlineButton type="button" disabled={saving} onClick={() => void navigate({ to: "/home" })}>
          Skip for now
        </OutlineButton>
      </div>
    </main>
  );
}
