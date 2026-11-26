import { createFileRoute } from "@tanstack/react-router";

import { ResetPasswordPage } from "@/features/auth/ResetPasswordPage";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password | Mamagist" },
      { name: "description", content: "Set a new Mamagist password." },
    ],
  }),
  // No GuestOnly here on purpose: the reset link signs her in with a recovery
  // session, and GuestOnly would send her to /home before she can reset.
  component: ResetPasswordPage,
});
