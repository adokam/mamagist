import { createFileRoute, redirect } from "@tanstack/react-router";

// /home is the default page.
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/home" });
  },
});
