import { createFileRoute } from "@tanstack/react-router";

import { GuestOnly } from "@/features/auth/AuthGuards";
import { LoginPage } from "@/features/auth/LoginPage";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in | Mamagist" },
      { name: "description", content: "Log in to Mamagist." },
      { property: "og:title", content: "Log in | Mamagist" },
      { property: "og:description", content: "Log in to Mamagist." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPageRoute,
});

// Signed-in users go to /home.
function LoginPageRoute() {
  return (
    <GuestOnly>
      <LoginPage />
    </GuestOnly>
  );
}
