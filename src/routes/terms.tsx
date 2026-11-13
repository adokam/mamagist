import { createFileRoute } from "@tanstack/react-router";

import { TermsPage } from "@/legal/TermsPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use | Mamagist" },
      { name: "description", content: "The Mamagist terms of use." },
      { property: "og:title", content: "Terms of Use | Mamagist" },
      { property: "og:description", content: "The Mamagist terms of use." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});
