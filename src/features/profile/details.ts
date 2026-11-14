import type { LifeStage, PrivateProfileUpdate } from "./privateProfile";

export const LIFE_STAGES: { value: LifeStage; label: string }[] = [
  { value: "pregnant", label: "Pregnant" },
  { value: "new_mother", label: "New mother" },
  { value: "breastfeeding", label: "Breastfeeding" },
];

export type DetailsForm = {
  stage: LifeStage | null;
  firstBaby: boolean | null;
  state: string;
  /** ISO "YYYY-MM-DD" or "". Only used when stage is new_mother. */
  babyBirthDate: string;
};

/** Only the fields she filled in. The baby birth date is saved only for a new mother. */
export function detailsUpdate(form: DetailsForm): PrivateProfileUpdate {
  const out: PrivateProfileUpdate = {};
  if (form.stage) out.stage = form.stage;
  if (form.firstBaby !== null) out.first_baby = form.firstBaby;
  if (form.state) out.state = form.state;
  if (form.stage === "new_mother" && form.babyBirthDate) out.baby_birth_date = form.babyBirthDate;
  return out;
}
