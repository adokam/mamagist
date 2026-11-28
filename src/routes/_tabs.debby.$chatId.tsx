import { createFileRoute } from "@tanstack/react-router";

import { DebbyPage } from "@/features/ai-chat/DebbyPage";

export const Route = createFileRoute("/_tabs/debby/$chatId")({
  head: () => ({
    meta: [
      { title: "Ask Debby | Mamagist" },
      { name: "description", content: "Ask Debby, your Mamagist pregnancy assistant." },
      { property: "og:title", content: "Ask Debby | Mamagist" },
      { property: "og:description", content: "Ask Debby, your Mamagist pregnancy assistant." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DebbyChatRoute,
});

function DebbyChatRoute() {
  const { chatId } = Route.useParams();
  return <DebbyPage key={chatId} chatId={chatId} />;
}
