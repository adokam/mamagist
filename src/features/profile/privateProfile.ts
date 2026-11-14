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
