import { createFileRoute } from "@tanstack/react-router";

import { GroupPage } from "@/features/community/GroupPage";

export const Route = createFileRoute("/_tabs/community/groups/$groupId")({
  head: () => ({
    meta: [
      { title: "Group | Mamagist" },
      { name: "description", content: "A group in the Mamagist community." },
      { property: "og:title", content: "Group | Mamagist" },
      { property: "og:description", content: "A group in the Mamagist community." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GroupPageRoute,
});

function GroupPageRoute() {
  const { groupId } = Route.useParams();
  return <GroupPage groupId={groupId} />;
}
