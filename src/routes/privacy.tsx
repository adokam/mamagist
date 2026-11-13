import { createFileRoute } from "@tanstack/react-router";

import { PrivacyPage } from "@/legal/PrivacyPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Mamagist" },
      { name: "description", content: "How Mamagist handles your private data." },
      { property: "og:title", content: "Privacy Policy | Mamagist" },
      { property: "og:description", content: "How Mamagist handles your private data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});
