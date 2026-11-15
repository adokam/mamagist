import { createFileRoute } from "@tanstack/react-router";

import { HomePage } from "@/features/home/HomePage";

export const Route = createFileRoute("/_tabs/home")({
  head: () => ({
    meta: [
      { title: "Home | Mamagist" },
      { name: "description", content: "Your Mamagist pregnancy companion home." },
      { property: "og:title", content: "Home | Mamagist" },
      { property: "og:description", content: "Your Mamagist pregnancy companion home." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HomePage,
});
