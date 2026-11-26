import { createFileRoute } from "@tanstack/react-router";

import { GroupsList } from "@/features/community/GroupsList";

export const Route = createFileRoute("/_tabs/community/groups")({
  head: () => ({
    meta: [
      { title: "Groups | Mamagist" },
      { name: "description", content: "Groups for mothers in the Mamagist community." },
      { property: "og:title", content: "Groups | Mamagist" },
      { property: "og:description", content: "Groups for mothers in the Mamagist community." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GroupsList,
});
