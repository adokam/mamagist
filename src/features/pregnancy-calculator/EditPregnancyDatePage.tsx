import { useQuery } from "@tanstack/react-query";

import { LoadError } from "@/components/LoadError";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/AuthProvider";
import { profileSummaryQuery } from "@/features/profile/privateProfile";

import { PregnancyDateForm } from "./LastPeriodPage";

/** /pregnancy-date: add or correct her date. Reuses the signup step 2 screen. */
export function EditPregnancyDatePage() {
  const { user } = useAuth();
  const profile = useQuery(profileSummaryQuery(user?.id ?? ""));

  if (profile.isError) {
    return (
      <main className="page-shell">
        <LoadError onRetry={() => void profile.refetch()} />
      </main>
    );
  }
  if (profile.isPending) {
    return (
      <main className="page-shell space-y-4" aria-busy="true" aria-label="Loading">
        <Skeleton className="h-9 w-72 rounded-full" />
        <Skeleton className="h-14 w-full rounded-full" />
        <Skeleton className="h-14 w-full rounded-full" />
      </main>
    );
  }
  return (
    <PregnancyDateForm
      variant="edit"
      initial={{ period: profile.data.last_period_date ?? "", due: profile.data.due_date ?? "" }}
    />
  );
}
