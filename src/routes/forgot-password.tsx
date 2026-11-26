import { createFileRoute } from "@tanstack/react-router";

import { GuestOnly } from "@/features/auth/AuthGuards";
import { ForgotPasswordPage } from "@/features/auth/ForgotPasswordPage";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot password | Mamagist" },
      { name: "description", content: "Get a link to set a new Mamagist password." },
    ],
  }),
  component: ForgotPasswordRoute,
});

function ForgotPasswordRoute() {
  return (
    <GuestOnly>
      <ForgotPasswordPage />
    </GuestOnly>
  );
}
