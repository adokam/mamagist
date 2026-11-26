import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { PrimaryButton } from "@/components/Buttons";
import { LoadError } from "@/components/LoadError";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/features/auth/AuthProvider";
import { FormError } from "@/features/auth/FormField";
import { friendlySaveError } from "@/features/profile/saveError";
import { supabase } from "@/integrations/supabase/client";

import { isAlreadyOnList } from "./notify";

/** Community waiting list, from the design in docs/design/community.jpg.
    Shown while the community is paused (COMMUNITY_ENABLED is false). */
export function NotifyMePage() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Her own notify_list row for topic community, if she already joined.
  const existing = useQuery({
    queryKey: ["notify-list", userId, "community"],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notify_list")
        .select("id")
        .eq("user_id", userId)
        .eq("topic", "community")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const onList = existing.data !== null && existing.data !== undefined;

  async function onNotify() {
    if (!userId || saving || onList) return;
    setSaving(true);
    setSaveError(null);
    const { error } = await supabase
      .from("notify_list")
      .insert({ user_id: userId, topic: "community" });
    setSaving(false);
    if (error) {
      // A second tap, or a row already there, is not an error: she is on the list.
      if (isAlreadyOnList(error)) {
        await existing.refetch();
        return;
      }
      setSaveError(friendlySaveError(error));
      return;
    }
    await existing.refetch();
  }

  return (
    <main className="page-shell">
      <PageHeader title="Community" />
      {existing.isError ? (
        <div className="mt-4">
          <LoadError onRetry={() => void existing.refetch()} />
        </div>
      ) : (
        <>
          <div className="mt-4 rounded-[20px] bg-accent p-4 text-ink">
            <h2 className="text-[20px] leading-tight font-extrabold">
              Community is coming soon
            </h2>
            <p className="mt-2 text-base leading-relaxed">
              Meet other mothers. Join groups by due month. Share your day and
              celebrate together.
            </p>
            <PrimaryButton
              type="button"
              className="mt-4"
              disabled={saving || onList || existing.isPending}
              aria-busy={saving}
              onClick={() => void onNotify()}
            >
              {onList ? "You are on the list" : saving ? "Saving…" : "Notify me"}
            </PrimaryButton>
          </div>
          <p className="mt-4 text-center text-base text-foreground">
            We will tell you the day it opens.
          </p>
          <FormError message={saveError} />
        </>
      )}
    </main>
  );
}
