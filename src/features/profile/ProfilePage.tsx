import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Loader2 } from "lucide-react";
import { useState } from "react";

import { OutlineButton, PrimaryButton } from "@/components/Buttons";
import { SurfaceCard, WhiteCard } from "@/components/Cards";
import { ChoiceButton } from "@/components/ChoiceButton";
import { DateInput } from "@/components/DateInput";
import { LoadError } from "@/components/LoadError";
import { PageHeader } from "@/components/PageHeader";
import { SelectInput } from "@/components/SelectInput";
import { TextInput } from "@/components/TextInput";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/AuthProvider";
import { FormError, FormField } from "@/features/auth/FormField";
import { homeCard, weeksAndDays } from "@/features/home/homeSummary";
import {
  daysBetween,
  formatCalendarDate,
  parseIsoDate,
  toIsoDate,
  todayInLocalTimeZone,
} from "@/features/pregnancy-calculator/calendarDate";
import { NIGERIAN_STATES } from "@/config/nigerian-states";
import { supabase } from "@/integrations/supabase/client";

import { LIFE_STAGES, detailsUpdate } from "./details";
import { privateProfileKey, updateMyPrivateProfile, type LifeStage } from "./privateProfile";
import { friendlySaveError } from "./saveError";

const STAGE_LABELS: Record<string, string> = {
  pregnant: "Pregnant",
  new_mother: "New mother",
  breastfeeding: "Breastfeeding",
};

type FullProfile = {
  full_name: string | null;
  last_period_date: string | null;
  due_date: string | null;
  stage: LifeStage | null;
  baby_birth_date: string | null;
  first_baby: boolean | null;
  state: string | null;
};

export function ProfilePage() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [today] = useState(() => todayInLocalTimeZone());
  const [editing, setEditing] = useState(false);

  const profile = useQuery({
    queryKey: [...privateProfileKey(userId), "full"],
    enabled: Boolean(userId),
    queryFn: async (): Promise<FullProfile> => {
      const { data, error } = await supabase
        .from("private_profiles")
        .select("full_name, last_period_date, due_date, stage, baby_birth_date, first_baby, state")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return (
        data ?? {
          full_name: null,
          last_period_date: null,
          due_date: null,
          stage: null,
          baby_birth_date: null,
          first_baby: null,
          state: null,
        }
      );
    },
  });

  if (profile.isError) {
    return (
      <main className="page-shell">
        <PageHeader title="Profile" />
        <div className="mt-4">
          <LoadError onRetry={() => void profile.refetch()} />
        </div>
      </main>
    );
  }

  if (profile.isPending || !profile.data) {
    return (
      <main className="page-shell">
        <div className="space-y-3" aria-busy="true" aria-label="Loading">
          <Skeleton className="h-7 w-32 rounded-full" />
          <Skeleton className="h-36 w-full rounded-[20px]" />
          <Skeleton className="h-40 w-full rounded-[20px]" />
        </div>
      </main>
    );
  }

  const data = profile.data;
  const card = homeCard(
    {
      full_name: data.full_name,
      last_period_date: data.last_period_date,
      due_date: data.due_date,
      stage: data.stage,
      baby_birth_date: data.baby_birth_date,
    },
    today,
  );

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: privateProfileKey(userId) });
  }

  return (
    <main className="page-shell">
      <PageHeader title="Profile" />

      {editing ? (
        <EditDetails
          data={data}
          today={today}
          onDone={() => {
            setEditing(false);
            void refresh();
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <div className="mt-4 space-y-3">
          <SurfaceCard>
            <p className="text-[20px] leading-tight font-extrabold text-foreground">
              {data.full_name?.trim() ? data.full_name : "Hello"}
            </p>
            {card.kind === "pregnancy" ? (
              <>
                <p className="mt-2 text-[32px] leading-tight font-extrabold tracking-tight text-foreground">
                  {weeksAndDays(card.age)}
                </p>
                <p className="mt-1 text-base text-foreground">
                  Due {formatCalendarDate(card.dueDate)}
                </p>
              </>
            ) : card.kind === "baby" && data.baby_birth_date ? (
              <p className="mt-2 text-base text-foreground">
                Baby born {formatCalendarDate(parseIsoDate(data.baby_birth_date) ?? today)}
              </p>
            ) : (
              <p className="mt-2 text-base leading-relaxed text-foreground">
                Add your last period or due date to see your week.
              </p>
            )}
            <OutlineButton
              type="button"
              className="mt-4"
              onClick={() => void navigate({ to: "/pregnancy-date" })}
            >
              Edit date
            </OutlineButton>
          </SurfaceCard>

          <WhiteCard>
            <DetailRow label="Stage" value={data.stage ? STAGE_LABELS[data.stage] : null} />
            <DetailRow label="State" value={data.state} />
            <DetailRow
              label="First baby"
              value={data.first_baby === null ? null : data.first_baby ? "Yes" : "No"}
            />
            <DetailRow
              label="Baby's birth date"
              value={
                data.baby_birth_date
                  ? formatCalendarDate(parseIsoDate(data.baby_birth_date) ?? today)
                  : null
              }
            />
            <PrimaryButton type="button" className="mt-4" onClick={() => setEditing(true)}>
              Edit details
            </PrimaryButton>
          </WhiteCard>

          <Link
            to="/settings"
            className="block rounded-[20px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <WhiteCard className="flex items-center justify-between gap-3">
              <span className="text-base font-bold text-foreground">Settings</span>
              <ChevronRight className="h-6 w-6 shrink-0 text-foreground" aria-hidden />
            </WhiteCard>
          </Link>
        </div>
      )}
    </main>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border py-2 last:border-b-0 last:pb-0 first:pt-0">
      <span className="text-[15px] font-semibold text-foreground">{label}</span>
      <span className="text-base font-bold text-foreground">{value}</span>
    </div>
  );
}

function EditDetails({
  data,
  today,
  onDone,
  onCancel,
}: {
  data: FullProfile;
  today: ReturnType<typeof todayInLocalTimeZone>;
  onDone: () => void;
  onCancel: () => void;
}) {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(data.full_name ?? "");
  const [stage, setStage] = useState<LifeStage | null>(data.stage);
  const [firstBaby, setFirstBaby] = useState<boolean | null>(data.first_baby);
  const [state, setState] = useState(data.state ?? "");
  const [babyBirthDate, setBabyBirthDate] = useState(data.baby_birth_date ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const birth = parseIsoDate(babyBirthDate);
  const birthError =
    stage === "new_mother" && birth && daysBetween(birth, today) < 0
      ? "The birth date can't be in the future."
      : undefined;
  const nameError = fullName.trim() ? undefined : "Please enter your name.";

  async function onSave() {
    if (!user || saving || birthError || nameError) return;
    const changes = detailsUpdate({
      fullName,
      stage,
      firstBaby,
      state,
      babyBirthDate,
    });
    setSaving(true);
    setSaveError(null);
    try {
      if (Object.keys(changes).length > 0) {
        await updateMyPrivateProfile(user.id, changes);
      }
      onDone();
    } catch (e) {
      setSaveError(friendlySaveError(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4 space-y-4">
      <FormField id="fullName" label="Full name" error={nameError}>
        <TextInput
          id="fullName"
          name="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
        />
      </FormField>

      <div className="space-y-2">
        <p id="stage-label" className="block text-[15px] font-bold text-foreground">
          Stage
        </p>
        <div role="radiogroup" aria-labelledby="stage-label" className="space-y-3">
          {LIFE_STAGES.map((s) => (
            <ChoiceButton
              key={s.value}
              selected={stage === s.value}
              onClick={() => setStage(s.value)}
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
          />
        </FormField>
      ) : null}

      <div className="space-y-2">
        <p id="first-baby-label" className="block text-[15px] font-bold text-foreground">
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

      <div className="space-y-3 pt-2">
        <FormError message={saveError} />
        <PrimaryButton
          type="button"
          disabled={saving || Boolean(birthError) || Boolean(nameError)}
          aria-busy={saving}
          onClick={() => void onSave()}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
              Saving…
            </>
          ) : (
            "Save"
          )}
        </PrimaryButton>
        <OutlineButton type="button" disabled={saving} onClick={onCancel}>
          Cancel
        </OutlineButton>
      </div>
    </div>
  );
}
