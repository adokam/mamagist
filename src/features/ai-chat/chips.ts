// Quick reply chips shown under Debby's last message.
import type { LifeStage } from "@/features/profile/privateProfile";

export const PREGNANCY_CHIPS = ["What can I eat?", "Baby movement", "Clinic checklist"] as const;
export const NEW_MOTHER_CHIPS = [
  "Feeding my baby",
  "Rest and recovery",
  "Clinic checklist",
] as const;

/** Pregnant or empty stage get the pregnancy chips; new mother and breastfeeding get the new mother chips. */
export function chipsForStage(stage: LifeStage | null | undefined): readonly string[] {
  return stage === "new_mother" || stage === "breastfeeding" ? NEW_MOTHER_CHIPS : PREGNANCY_CHIPS;
}
