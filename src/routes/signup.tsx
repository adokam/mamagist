import { createFileRoute } from "@tanstack/react-router";

import { SignupPage } from "@/features/auth/SignupPage";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up | Mamagist" },
      { name: "description", content: "Create your Mamagist account." },
      { property: "og:title", content: "Sign up | Mamagist" },
      { property: "og:description", content: "Create your Mamagist account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SignupPage,
});
