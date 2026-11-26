import { createFileRoute } from "@tanstack/react-router";

import { InstallPage } from "@/features/pwa/InstallPage";

export const Route = createFileRoute("/install")({
  head: () => ({
    meta: [
      { title: "Install Mamagist | Mamagist" },
      { name: "description", content: "Add Mamagist to your home screen." },
    ],
  }),
  component: InstallPage,
});
