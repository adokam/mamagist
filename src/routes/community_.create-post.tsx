import { createFileRoute } from "@tanstack/react-router";

import { RequireAuth } from "@/features/auth/AuthGuards";
import { CreatePostPage } from "@/features/community/CreatePostPage";

export const Route = createFileRoute("/community_/create-post")({
  validateSearch: (search: Record<string, unknown>): { groupId?: string } => ({
    groupId: typeof search.groupId === "string" ? search.groupId : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Create post | Mamagist" },
      { name: "description", content: "Share a post with other mothers." },
      { property: "og:title", content: "Create post | Mamagist" },
      { property: "og:description", content: "Share a post with other mothers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CreatePostRoute,
});

// Full-screen page outside the _tabs layout, so it has no bottom bar.
// Signed-out visitors go to /login. groupId is null for the big feed.
function CreatePostRoute() {
  const { groupId } = Route.useSearch();
  return (
    <RequireAuth>
      <CreatePostPage groupId={groupId ?? null} />
    </RequireAuth>
  );
}
