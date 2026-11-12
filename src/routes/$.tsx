import { createFileRoute, redirect } from "@tanstack/react-router";

// Any unknown address goes to /home.
export const Route = createFileRoute("/$")({
  beforeLoad: () => {
    throw redirect({ to: "/home" });
  },
});
