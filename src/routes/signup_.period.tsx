import { createFileRoute } from "@tanstack/react-router";

import { RequireAuth } from "@/features/auth/AuthGuards";
import { LastPeriodPage } from "@/features/pregnancy-calculator/LastPeriodPage";

export const Route = createFileRoute("/signup_/period")({
  head: () => ({
    meta: [
      { title: "Your due date | Mamagist" },
      { name: "description", content: "Find your due date and your pregnancy week." },
      { property: "og:title", content: "Your due date | Mamagist" },
      { property: "og:description", content: "Find your due date and your pregnancy week." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LastPeriodRoute,
});

// Signed-out visitors go to /login.
function LastPeriodRoute() {
  return (
    <RequireAuth>
      <LastPeriodPage />
    </RequireAuth>
  );
}
