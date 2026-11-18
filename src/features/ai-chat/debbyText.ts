// Header line and first message. Pure functions.
import { homeCard, weeksAndDays } from "@/features/home/homeSummary";
import type { CalendarDate } from "@/features/pregnancy-calculator/calendarDate";
import type { LifeStage, ProfileSummary } from "@/features/profile/privateProfile";

export const MAX_MESSAGE_LENGTH = 1000;
export const SHOW_COUNTER_AFTER = 900;

function isNewMother(stage: LifeStage | null | undefined) {
  return stage === "new_mother" || stage === "breastfeeding";
}

/** "Your pregnancy guide · 26 weeks, 4 days", "Your pregnancy guide", or "Your guide for new mothers". */
export function guideLine(profile: ProfileSummary, today: CalendarDate): string {
  if (isNewMother(profile.stage)) return "Your guide for new mothers";
  const card = homeCard(profile, today);
  return card.kind === "pregnancy"
    ? `Your pregnancy guide · ${weeksAndDays(card.age)}`
    : "Your pregnancy guide";
}

/** Debby's first message when there is no history. Not saved. First name only. */
export function welcomeText(fullName: string | null, stage: LifeStage | null): string {
  const first = (fullName ?? "").trim().split(/\s+/)[0] ?? "";
  const hello = first ? `Hello ${first}.` : "Hello.";
  const guide = isNewMother(stage) ? "your guide for new mothers" : "your pregnancy guide";
  return `${hello} I am Debby, ${guide}. I am an AI, not a doctor. Tell me how you feel today.`;
}
