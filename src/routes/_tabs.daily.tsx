import { createFileRoute } from "@tanstack/react-router";

import { DailyPage } from "@/features/daily-checklist/DailyPage";

export const Route = createFileRoute("/_tabs/daily")({
  head: () => ({
    meta: [
      { title: "Daily checklist | Mamagist" },
      { name: "description", content: "Your daily pregnancy checklist on Mamagist." },
      { property: "og:title", content: "Daily checklist | Mamagist" },
      { property: "og:description", content: "Your daily pregnancy checklist on Mamagist." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DailyPage,
});
