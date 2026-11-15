import { createFileRoute } from "@tanstack/react-router";

import { EditPregnancyDatePage } from "@/features/pregnancy-calculator/EditPregnancyDatePage";

// Signed in only (the _tabs layout sends signed-out visitors to /login). The bottom bar is shown.
export const Route = createFileRoute("/_tabs/pregnancy-date")({
  head: () => ({
    meta: [
      { title: "Your pregnancy date | Mamagist" },
      { name: "description", content: "Add or correct your last period or due date." },
      { property: "og:title", content: "Your pregnancy date | Mamagist" },
      { property: "og:description", content: "Add or correct your last period or due date." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EditPregnancyDatePage,
});
