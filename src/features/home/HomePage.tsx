import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import { PrimaryButton } from "@/components/Buttons";
import { PeachCard, WhiteCard } from "@/components/Cards";
import { LoadError } from "@/components/LoadError";
import { PageHeader } from "@/components/PageHeader";
import { ProgressBar } from "@/components/ProgressBar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/AuthProvider";
import { doneText } from "@/features/daily-checklist/checklistText";
import { useDailyChecklist } from "@/features/daily-checklist/useDailyChecklist";
import {
  formatCalendarDate,
  todayInLocalTimeZone,
} from "@/features/pregnancy-calculator/calendarDate";
import { profileSummaryQuery } from "@/features/profile/privateProfile";
import { InstallCard } from "@/features/pwa/InstallCard";
import { readLastWeeklyTip, saveLastWeeklyTip } from "@/features/pwa/offlineCache";
import { supabase } from "@/integrations/supabase/client";

import {
  babyAgeText,
  greeting,
  homeCard,
  trimesterName,
  weeksAndDays,
  type HomeCard,
} from "./homeSummary";

function weeklyTipQuery(week: number | null) {
  return {
    queryKey: ["weekly-content", week] as const,
    enabled: week !== null,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("weekly_content")
        .select("tip")
        .eq("week", week ?? 0)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data?.tip?.trim() || null;
    },
  };
}

export function HomePage() {
  const { user } = useAuth();
  // Her phone's date and hour, read once per visit.
  const [now] = useState(() => new Date());
  const today = todayInLocalTimeZone(now);

  const profile = useQuery(profileSummaryQuery(user?.id ?? ""));
  const card = profile.data ? homeCard(profile.data, today) : null;
  const tipWeek = card?.kind === "pregnancy" ? card.tipWeek : null;
  const tip = useQuery(weeklyTipQuery(tipWeek));
  // Last-loaded tip text, kept on the device only, so Home can show it offline.
  const [savedTip] = useState(() => readLastWeeklyTip());
  useEffect(() => {
    if (tip.data) saveLastWeeklyTip(tip.data);
  }, [tip.data]);

  const failed = profile.isError;
  const loading = profile.isPending || (tipWeek !== null && tip.isPending);

  return (
    <main className="page-shell">
      {failed ? (
        <div className="space-y-6">
          <PageHeader label="Mamagist" title={greeting(now.getHours(), null)} />
          <LoadError
            onRetry={() => {
              if (profile.isError) void profile.refetch();
              if (tip.isError) void tip.refetch();
            }}
          />
        </div>
      ) : loading || !card ? (
        <HomeSkeleton />
      ) : (
        <div className="space-y-3">
          <div className="mb-4">
            <PageHeader
              label="Mamagist"
              title={greeting(now.getHours(), profile.data?.full_name ?? null)}
            />
          </div>
          <StageCard card={card} />
          <ChecklistCard />
          <AskDebbyCard />
          <InstallCard />
          {card.kind === "pregnancy" && tip.data ? (
            <WhiteCard>
              <p className="text-[15px] font-semibold text-foreground">Tip of the week</p>
              <p className="mt-2 text-base leading-relaxed text-foreground">{tip.data}</p>
            </WhiteCard>
          ) : card.kind === "pregnancy" && tip.isError && savedTip ? (
            <WhiteCard>
              <p className="text-[15px] font-semibold text-foreground">Tip of the week</p>
              <p className="mt-2 text-base leading-relaxed text-foreground">{savedTip}</p>
              <p className="mt-2 text-[15px] text-foreground">Saved from your last visit.</p>
            </WhiteCard>
          ) : null}
        </div>
      )}
    </main>
  );
}

function HomeSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading">
      <div className="mb-6 space-y-3">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-7 w-64 rounded-full" />
      </div>
      <Skeleton className="h-36 w-full rounded-[20px]" />
      <Skeleton className="h-24 w-full rounded-[20px]" />
      <Skeleton className="h-32 w-full rounded-[20px]" />
      <Skeleton className="h-24 w-full rounded-[20px]" />
    </div>
  );
}

function StageCard({ card }: { card: HomeCard }) {
  const navigate = useNavigate();

  if (card.kind === "no_date") {
    return (
      <PeachCard>
        <h2 className="text-[20px] leading-tight font-extrabold text-foreground">
          Add your due date
        </h2>
        <p className="mt-2 text-base leading-relaxed text-foreground">
          Add your last period or due date to see your week.
        </p>
        <PrimaryButton
          type="button"
          className="mt-4"
          onClick={() => void navigate({ to: "/pregnancy-date" })}
        >
          Add date
        </PrimaryButton>
      </PeachCard>
    );
  }

  if (card.kind === "baby") {
    return (
      <PeachCard>
        <p className="text-[15px] font-semibold text-foreground">Your baby</p>
        {card.babyAge ? (
          <p className="mt-2 text-[32px] leading-tight font-extrabold tracking-tight text-foreground">
            {babyAgeText(card.babyAge)}
          </p>
        ) : (
          <p className="mt-2 text-base leading-relaxed text-foreground">
            Welcome. We are here for you and your baby.
          </p>
        )}
      </PeachCard>
    );
  }

  return (
    <PeachCard>
      <p className="text-[15px] font-semibold text-foreground">Your pregnancy</p>
      <p className="mt-2 text-[32px] leading-tight font-extrabold tracking-tight text-foreground">
        {weeksAndDays(card.age)}
      </p>
      <p className="mt-1 text-base text-foreground">
        {trimesterName(card.age.trimester)} · Due {formatCalendarDate(card.dueDate)}
      </p>
      <ProgressBar value={card.progress} className="mt-3" />
      {card.pastFortyTwoWeeks ? (
        <p className="mt-4 text-base font-semibold text-foreground">
          Please talk to your clinic about your next steps.
        </p>
      ) : null}
    </PeachCard>
  );
}

function ChecklistCard() {
  const checklist = useDailyChecklist();
  return (
    <Link
      to="/daily"
      className="block rounded-[20px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <WhiteCard className="flex items-center gap-4">
        <div className="flex-1">
          <h2 className="text-[20px] leading-tight font-extrabold text-foreground">
            Today's checklist
          </h2>
          {checklist.status === "loading" ? (
            <div className="mt-2 space-y-3" aria-busy="true" aria-label="Loading">
              <Skeleton className="h-5 w-28 rounded-full" />
              <Skeleton className="h-2.5 w-full rounded-full" />
            </div>
          ) : checklist.status === "error" ? (
            <p className="mt-1 text-base text-foreground">See your tasks for today.</p>
          ) : checklist.total === 0 ? (
            <p className="mt-1 text-base text-foreground">No tasks for today.</p>
          ) : (
            <>
              <p className="mt-1 text-base text-foreground">
                {doneText(checklist.done, checklist.total)}
              </p>
              <ProgressBar value={(checklist.done / checklist.total) * 100} className="mt-3" />
            </>
          )}
        </div>
        <ChevronRight className="h-6 w-6 shrink-0 text-foreground" aria-hidden />
      </WhiteCard>
    </Link>
  );
}

function AskDebbyCard() {
  return (
    <div className="rounded-[20px] bg-primary p-4 text-primary-foreground">
      <h2 className="text-[20px] leading-tight font-extrabold">Ask Debby</h2>
      <p className="mt-2 text-base leading-relaxed">
        Tell Debby how you feel today and get advice for your week.
      </p>
      <Link
        to="/debby"
        className="mt-4 inline-flex h-[52px] items-center justify-center rounded-full bg-card px-6 text-base font-bold text-card-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        Start chat
      </Link>
    </div>
  );
}
