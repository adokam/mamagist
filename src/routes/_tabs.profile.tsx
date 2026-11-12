import { createFileRoute } from "@tanstack/react-router";

import { ProfilePage } from "@/features/profile/ProfilePage";

export const Route = createFileRoute("/_tabs/profile")({
  head: () => ({
    meta: [
      { title: "Profile | Mamagist" },
      { name: "description", content: "Your Mamagist profile." },
      { property: "og:title", content: "Profile | Mamagist" },
      { property: "og:description", content: "Your Mamagist profile." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});
