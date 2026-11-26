// The community feed: one big feed for all mothers, like the Facebook
// home feed in the user's screenshot, but in Mamagist's own Fresh Green
// look. Top bar with our logo, a "+" to post, and the avatar that opens
// the menu. Under it, Feed and Groups tabs, the composer, then the posts,
// newest first. Groups live at /community/groups (Part 3).
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Image as ImageIcon, Newspaper, Plus, Users } from "lucide-react";
import { useState } from "react";

import { OutlineButton } from "@/components/Buttons";
import { LoadError } from "@/components/LoadError";
import { LogoMark } from "@/components/Logo";
import { useAuth } from "@/features/auth/AuthProvider";

import { fetchFeedPosts, fetchOwnFirstName } from "./communityApi";
import { COMMUNITY_ENABLED } from "./communityEnabled";
import { CommunityMenu } from "./CommunityMenu";
import { authorDisplayName, firstName } from "./displayName";
import { isMissingTablesError, MISSING_TABLES_MESSAGE } from "./missingTables";
import { NotifyMePage } from "./NotifyMePage";
import { AuthorAvatar, PostCard } from "./PostCard";

/** While the community is paused, /community shows the Notify me waiting
    list. Set COMMUNITY_ENABLED to true to bring the feed back. */
export function CommunityPage() {
  if (!COMMUNITY_ENABLED) return <NotifyMePage />;
  return <CommunityFeed />;
}

function CommunityFeed() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);

  function openCreatePost() {
    void navigate({ to: "/community/create-post", search: {} });
  }

  const feed = useQuery({
    queryKey: ["community-feed", userId],
    enabled: Boolean(userId),
    queryFn: () => fetchFeedPosts(userId),
  });

  const myName = useQuery({
    queryKey: ["community-my-first-name", userId],
    enabled: Boolean(userId),
    queryFn: () => fetchOwnFirstName(userId),
  });
  const myFirstName = firstName(myName.data ?? null);

  function refreshFeed() {
    void queryClient.invalidateQueries({ queryKey: ["community-feed", userId] });
  }

  return (
    <main className="page-shell">
      {/* Top bar: our logo on the left, post button and avatar on the right. */}
      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <LogoMark className="h-10 w-10 rounded-[12px]" />
          <span className="text-[22px] leading-none font-extrabold tracking-tight text-ink">
            Mamagist
          </span>
        </div>
        <button
          type="button"
          onClick={openCreatePost}
          aria-label="Write a post"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface text-ink"
        >
          <Plus className="h-6 w-6" aria-hidden />
        </button>
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Community menu"
            aria-expanded={menuOpen}
            className="grid h-11 w-11 place-items-center rounded-full bg-primary text-[18px] font-extrabold text-primary-contrast"
          >
            {authorDisplayName(myFirstName || "M").trim()[0]?.toUpperCase() ?? "M"}
          </button>
          <CommunityMenu
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            items={[
              {
                label: "Feed",
                // Already on the feed — tapping only closes the menu.
                onClick: () => {},
              },
              {
                label: "My groups",
                onClick: () =>
                  void navigate({ to: "/community/groups", state: { focus: "mine" } }),
              },
              {
                label: "All groups",
                onClick: () => void navigate({ to: "/community/groups" }),
              },
              {
                label: "Create a group",
                onClick: () =>
                  void navigate({ to: "/community/groups", state: { createGroup: true } }),
              },
              {
                label: "Settings",
                onClick: () => void navigate({ to: "/settings" }),
              },
            ]}
          />
        </div>
      </div>

      {/* Icon row: Feed and Groups. Only these two, both working. */}
      <div className="mt-4 flex border-b border-line">
        <button
          type="button"
          aria-current="page"
          className="flex flex-1 items-center justify-center gap-2 border-b-2 border-primary py-3 text-base font-bold text-primary"
        >
          <Newspaper className="h-5 w-5" aria-hidden /> Feed
        </button>
        <button
          type="button"
          onClick={() => void navigate({ to: "/community/groups" })}
          className="flex flex-1 items-center justify-center gap-2 border-b-2 border-transparent py-3 text-base font-bold text-muted"
        >
          <Users className="h-5 w-5" aria-hidden /> Groups
        </button>
      </div>

      {/* Composer card, like "What's on your mind?" with a Photo button.
          Both open the full-screen Create post page. */}
      <div className="mt-4">
        <div className="flex items-center gap-3 rounded-[20px] border border-line bg-card p-3">
          <AuthorAvatar name={myFirstName || "M"} />
          <button
            type="button"
            onClick={openCreatePost}
            className="h-12 min-w-0 flex-1 rounded-full bg-surface px-4 text-left text-base text-muted"
          >
            Share with other mothers…
          </button>
          <button
            type="button"
            onClick={openCreatePost}
            className="flex shrink-0 flex-col items-center gap-0.5 text-primary"
            aria-label="Share a photo"
          >
            <ImageIcon className="h-6 w-6" aria-hidden />
            <span className="text-[13px] font-bold">Photo</span>
          </button>
        </div>
      </div>

      {/* The feed. */}
      <div className="mt-4 space-y-4">
        {feed.isPending ? (
          <p className="rounded-[20px] bg-card p-4 text-base text-muted">Loading posts…</p>
        ) : feed.isError ? (
          isMissingTablesError(feed.error) ? (
            <div
              role="alert"
              className="space-y-4 rounded-[20px] bg-card p-4 text-card-foreground"
            >
              <p className="text-base font-semibold">{MISSING_TABLES_MESSAGE}</p>
              <OutlineButton type="button" onClick={() => void feed.refetch()}>
                Try again
              </OutlineButton>
            </div>
          ) : (
            <LoadError onRetry={() => void feed.refetch()} />
          )
        ) : (feed.data ?? []).length === 0 ? (
          <div className="rounded-[20px] border border-line bg-card p-4 text-center">
            <p className="text-[20px] font-extrabold text-ink">No posts yet</p>
            <p className="mt-2 text-base text-muted">
              Be the first to share something with other mothers.
            </p>
            <button
              type="button"
              onClick={openCreatePost}
              className="mt-4 flex h-[52px] w-full items-center justify-center rounded-full bg-primary px-6 text-base font-bold text-primary-contrast"
            >
              Share a post
            </button>
          </div>
        ) : (
          (feed.data ?? []).map((post) => (
            <PostCard key={post.id} post={post} userId={userId} onChanged={refreshFeed} />
          ))
        )}
      </div>
    </main>
  );
}
