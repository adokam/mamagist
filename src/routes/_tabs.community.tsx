import { createFileRoute } from "@tanstack/react-router";

import { CommunityPage } from "@/features/community/CommunityPage";

export const Route = createFileRoute("/_tabs/community")({
  head: () => ({
    meta: [
      { title: "Community | Mamagist" },
      { name: "description", content: "The Mamagist community for pregnant women." },
      { property: "og:title", content: "Community | Mamagist" },
      { property: "og:description", content: "The Mamagist community for pregnant women." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CommunityPage,
});
