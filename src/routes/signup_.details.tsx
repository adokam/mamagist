import { createFileRoute } from "@tanstack/react-router";

import { RequireAuth } from "@/features/auth/AuthGuards";
import { DetailsPage } from "@/features/profile/DetailsPage";

export const Route = createFileRoute("/signup_/details")({
  head: () => ({
    meta: [
      { title: "About you | Mamagist" },
      { name: "description", content: "Tell Mamagist a little about you." },
      { property: "og:title", content: "About you | Mamagist" },
      { property: "og:description", content: "Tell Mamagist a little about you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DetailsRoute,
});

// Signed-out visitors go to /login.
function DetailsRoute() {
  return (
    <RequireAuth>
      <DetailsPage />
    </RequireAuth>
  );
}
