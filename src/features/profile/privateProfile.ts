import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type PrivateProfileUpdate = Database["public"]["Tables"]["private_profiles"]["Update"];
export type LifeStage = Database["public"]["Enums"]["life_stage"];

export const privateProfileKey = (userId: string) => ["private-profile", userId] as const;

/** Updates her own private_profiles row. Throws if nothing was saved. */
export async function updateMyPrivateProfile(userId: string, changes: PrivateProfileUpdate) {
  const { data, error } = await supabase
    .from("private_profiles")
    .update(changes)
    .eq("id", userId)
    .select("id");
  if (error) throw error;
  if (!data || data.length === 0) throw new Error("No profile row was updated");
}

export type ProfileSummary = Pick<
  Database["public"]["Tables"]["private_profiles"]["Row"],
  "full_name" | "last_period_date" | "due_date" | "stage" | "baby_birth_date"
>;

/** Her name, dates and stage. Used by Home and the edit date screen. */
export const profileSummaryQuery = (userId: string) =>
  queryOptions({
    queryKey: [...privateProfileKey(userId), "summary"],
    enabled: Boolean(userId),
    queryFn: async (): Promise<ProfileSummary> => {
      const { data, error } = await supabase
        .from("private_profiles")
        .select("full_name, last_period_date, due_date, stage, baby_birth_date")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return (
        data ?? { full_name: null, last_period_date: null, due_date: null, stage: null, baby_birth_date: null }
      );
    },
  });
