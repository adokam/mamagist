// One group: its name, description, members, and its own feed.
// Non-members see the info and a Join button, but not the posts.
// The admin can remove other members; she cannot remove herself.
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

import { LoadError } from "@/components/LoadError";
import { OutlineButton } from "@/components/Buttons";
import { FormError } from "@/features/auth/FormField";
import { useAuth } from "@/features/auth/AuthProvider";
import { friendlySaveError } from "@/features/profile/saveError";

import {
  fetchGroup,
  fetchGroupMembers,
  fetchGroupPosts,
  fetchMyMemberships,
  fetchOwnFirstName,
  fetchProfilesByIds,
  joinGroup,
  leaveGroup,
  removeGroupMember,
} from "./communityApi";
import { authorDisplayName } from "./displayName";
import { COMMUNITY_ENABLED } from "./communityEnabled";
import { isMissingTablesError, MISSING_TABLES_MESSAGE } from "./missingTables";
import { NotifyMePage } from "./NotifyMePage";
import { AuthorAvatar, PostCard } from "./PostCard";

/** While the community is paused, a group page shows the Notify me waiting
    list. Set COMMUNITY_ENABLED to true to bring groups back. */
export function GroupPage({ groupId }: { groupId: string }) {
  if (!COMMUNITY_ENABLED) return <NotifyMePage />;
  return <GroupPageContent groupId={groupId} />;
}

function GroupPageContent({ groupId }: { groupId: string }) {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function openCreatePost() {
    void navigate({ to: "/community/create-post", search: { groupId } });
  }

  const group = useQuery({
    queryKey: ["community-group", groupId],
    enabled: Boolean(userId),
    queryFn: () => fetchGroup(groupId),
  });
  const memberships = useQuery({
    queryKey: ["community-my-memberships", userId],
    enabled: Boolean(userId),
    queryFn: () => fetchMyMemberships(userId),
  });
  const members = useQuery({
    queryKey: ["community-group-members", groupId],
    enabled: Boolean(userId),
    queryFn: () => fetchGroupMembers(groupId),
  });
  const myName = useQuery({
    queryKey: ["community-my-first-name", userId],
    enabled: Boolean(userId),
    queryFn: () => fetchOwnFirstName(userId),
  });
  const membership = (memberships.data ?? []).find((m) => m.group_id === groupId);
  const isMember = Boolean(membership);
  const isAdmin = membership?.role === "admin";

  const posts = useQuery({
    queryKey: ["community-group-posts", groupId, userId],
    enabled: Boolean(userId) && isMember,
    queryFn: () => fetchGroupPosts(groupId, userId),
  });

  const memberNames = useQuery({
    queryKey: ["community-group-member-names", groupId, (members.data ?? []).length],
    enabled: Boolean(userId) && (members.data ?? []).length > 0,
    queryFn: () =>
      fetchProfilesByIds((members.data ?? []).map((m) => m.user_id)),
  });
  const names = new Map((memberNames.data ?? []).map((p) => [p.id, p.display_name]));

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["community-group", groupId] });
    void queryClient.invalidateQueries({ queryKey: ["community-my-memberships", userId] });
    void queryClient.invalidateQueries({ queryKey: ["community-group-members", groupId] });
    void queryClient.invalidateQueries({ queryKey: ["community-group-posts", groupId, userId] });
  }

  async function onJoin() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await joinGroup(groupId, userId);
      refresh();
    } catch (e) {
      setError(friendlySaveError(e));
    } finally {
      setBusy(false);
    }
  }

  async function onLeave() {
    if (busy || isAdmin) return;
    setBusy(true);
    setError(null);
    try {
      await leaveGroup(groupId, userId);
      refresh();
      void navigate({ to: "/community/groups" });
    } catch (e) {
      setError(friendlySaveError(e));
    } finally {
      setBusy(false);
    }
  }

  async function onRemove(memberUserId: string) {
    if (!isAdmin || memberUserId === userId || removingId) return;
    setRemovingId(memberUserId);
    setError(null);
    try {
      await removeGroupMember(groupId, memberUserId);
      refresh();
    } catch (e) {
      setError(friendlySaveError(e));
    } finally {
      setRemovingId(null);
    }
  }

  if (group.isPending || memberships.isPending || members.isPending) {
    return (
      <main className="page-shell">
        <p className="rounded-[20px] bg-card p-4 text-base text-muted">Loading group…</p>
      </main>
    );
  }
  if (group.isError || memberships.isError || members.isError || !group.data) {
    return (
      <main className="page-shell">
        {group.data === null ? (
          <div className="rounded-[20px] border border-line bg-card p-4 text-center">
            <p className="text-[20px] font-extrabold text-ink">This group is gone</p>
            <p className="mt-2 text-base text-muted">
              It may have been deleted. Back to the groups list.
            </p>
            <button
              type="button"
              onClick={() => void navigate({ to: "/community/groups" })}
              className="mt-4 flex h-[52px] w-full items-center justify-center rounded-full bg-primary px-6 text-base font-bold text-primary-contrast"
            >
              All groups
            </button>
          </div>
        ) : (
          <LoadError onRetry={refresh} />
        )}
      </main>
    );
  }

  const groupData = group.data;
  const memberList = members.data ?? [];

  return (
    <main className="page-shell">
      <button
        type="button"
        onClick={() => void navigate({ to: "/community/groups" })}
        className="flex items-center gap-1 text-base font-bold text-primary"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden /> All groups
      </button>
      <h1 className="mt-2 text-[28px] leading-tight font-extrabold tracking-tight text-ink">
        {groupData.name}
      </h1>
      {groupData.description ? (
        <p className="mt-1 text-base leading-relaxed text-muted">{groupData.description}</p>
      ) : null}
      <p className="mt-1 text-[14px] text-muted">
        {memberList.length} {memberList.length === 1 ? "member" : "members"}
        {isAdmin ? " · You are the admin" : ""}
      </p>

      <div className="mt-3 flex gap-2">
        {isMember ? (
          isAdmin ? null : (
            <button
              type="button"
              onClick={() => void onLeave()}
              disabled={busy}
              className="flex h-[52px] flex-1 items-center justify-center rounded-full border-2 border-primary text-base font-bold text-primary disabled:opacity-50"
            >
              {busy ? "Leaving…" : "Leave group"}
            </button>
          )
        ) : (
          <button
            type="button"
            onClick={() => void onJoin()}
            disabled={busy}
            className="flex h-[52px] flex-1 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-contrast disabled:opacity-50"
          >
            {busy ? "Joining…" : "Join group"}
          </button>
        )}
      </div>
      <FormError message={error} />

      {isMember ? (
        <>
          <div className="mt-4">
            <div className="flex items-center gap-3 rounded-[20px] border border-line bg-card p-3">
              <AuthorAvatar name={myName.data ?? "M"} />
              <button
                type="button"
                onClick={openCreatePost}
                className="h-12 min-w-0 flex-1 rounded-full bg-surface px-4 text-left text-base text-muted"
              >
                Share with this group…
              </button>
            </div>
          </div>
          <div className="mt-4 space-y-4">
            {posts.isPending ? (
              <p className="rounded-[20px] bg-card p-4 text-base text-muted">Loading posts…</p>
            ) : posts.isError ? (
              isMissingTablesError(posts.error) ? (
                <div
                  role="alert"
                  className="space-y-4 rounded-[20px] bg-card p-4 text-card-foreground"
                >
                  <p className="text-base font-semibold">{MISSING_TABLES_MESSAGE}</p>
                  <OutlineButton type="button" onClick={() => void posts.refetch()}>
                    Try again
                  </OutlineButton>
                </div>
              ) : (
                <LoadError onRetry={() => void posts.refetch()} />
              )
            ) : (posts.data ?? []).length === 0 ? (
              <div className="rounded-[20px] border border-line bg-card p-4 text-center">
                <p className="text-base font-bold text-ink">No posts in this group yet</p>
                <p className="mt-2 text-base text-muted">Be the first to share something here.</p>
              </div>
            ) : (
              (posts.data ?? []).map((post) => (
                <PostCard key={post.id} post={post} userId={userId} onChanged={refresh} />
              ))
            )}
          </div>
        </>
      ) : (
        <div className="mt-4 rounded-[20px] border border-line bg-card p-4 text-center">
          <p className="text-base font-bold text-ink">Join this group to see its posts</p>
          <p className="mt-2 text-base text-muted">
            Only members can read and write in a group.
          </p>
        </div>
      )}

      <h2 className="mt-6 text-[20px] font-extrabold text-ink">Members</h2>
      <div className="mt-3 space-y-2">
        {memberList.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 rounded-[20px] border border-line bg-card p-3"
          >
            <AuthorAvatar name={names.get(member.user_id) ?? null} size={32} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-bold text-ink">
                {authorDisplayName(names.get(member.user_id) ?? null)}
                {member.user_id === userId ? " (you)" : ""}
              </p>
              {member.role === "admin" ? (
                <p className="text-[13px] font-bold text-primary">admin</p>
              ) : null}
            </div>
            {isAdmin && member.user_id !== userId ? (
              <button
                type="button"
                onClick={() => void onRemove(member.user_id)}
                disabled={removingId === member.user_id}
                className="flex h-11 shrink-0 items-center rounded-full border-2 border-primary px-4 text-[15px] font-bold text-primary disabled:opacity-50"
              >
                {removingId === member.user_id ? "Removing…" : "Remove"}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </main>
  );
}
