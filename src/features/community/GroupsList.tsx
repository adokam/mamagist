// Groups list: My groups and All groups, plus creating a group.
// A group is a smaller feed inside the community. The mother who creates
// a group is its admin.
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { LoadError } from "@/components/LoadError";
import { PrimaryButton } from "@/components/Buttons";
import { FormError } from "@/features/auth/FormField";
import { useAuth } from "@/features/auth/AuthProvider";
import { friendlySaveError } from "@/features/profile/saveError";

import {
  createGroup,
  fetchAllGroupMembers,
  fetchGroups,
  fetchMyMemberships,
  joinGroup,
  type CommunityGroupRow,
} from "./communityApi";
import { groupsListInitialState } from "./groupsListState";

export function GroupsList() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // The community menu can send us here with a request: open the create
  // form, or jump to My groups.
  const initial = groupsListInitialState(useLocation().state);
  const [showCreate, setShowCreate] = useState(initial.showCreate);
  const myGroupsRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (initial.focusMine) myGroupsRef.current?.scrollIntoView();
  }, [initial.focusMine]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const groups = useQuery({
    queryKey: ["community-groups"],
    enabled: Boolean(userId),
    queryFn: fetchGroups,
  });
  const memberships = useQuery({
    queryKey: ["community-my-memberships", userId],
    enabled: Boolean(userId),
    queryFn: () => fetchMyMemberships(userId),
  });
  const allMembers = useQuery({
    queryKey: ["community-all-members"],
    enabled: Boolean(userId),
    queryFn: fetchAllGroupMembers,
  });

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["community-groups"] });
    void queryClient.invalidateQueries({ queryKey: ["community-my-memberships", userId] });
    void queryClient.invalidateQueries({ queryKey: ["community-all-members"] });
  }

  if (groups.isPending || memberships.isPending || allMembers.isPending) {
    return (
      <main className="page-shell">
        <p className="rounded-[20px] bg-card p-4 text-base text-muted">Loading groups…</p>
      </main>
    );
  }
  if (groups.isError || memberships.isError || allMembers.isError) {
    return (
      <main className="page-shell">
        <LoadError onRetry={refresh} />
      </main>
    );
  }

  const allGroups = groups.data ?? [];
  const myMembershipByGroup = new Map((memberships.data ?? []).map((m) => [m.group_id, m]));
  const memberCount = new Map<string, number>();
  for (const member of allMembers.data ?? []) {
    memberCount.set(member.group_id, (memberCount.get(member.group_id) ?? 0) + 1);
  }
  const myGroups = allGroups.filter((g) => myMembershipByGroup.has(g.id));

  async function onCreate() {
    if (!name.trim() || creating) return;
    setCreating(true);
    setError(null);
    try {
      const group = await createGroup({ name, description, userId });
      refresh();
      void navigate({ to: "/community/groups/$groupId", params: { groupId: group.id } });
    } catch (e) {
      setError(friendlySaveError(e));
    } finally {
      setCreating(false);
    }
  }

  async function onJoin(groupId: string) {
    if (joiningId) return;
    setJoiningId(groupId);
    setError(null);
    try {
      await joinGroup(groupId, userId);
      refresh();
      void navigate({ to: "/community/groups/$groupId", params: { groupId } });
    } catch (e) {
      setError(friendlySaveError(e));
    } finally {
      setJoiningId(null);
    }
  }

  return (
    <main className="page-shell">
      <div className="flex items-center gap-2">
        <h1 className="flex-1 text-[28px] leading-tight font-extrabold tracking-tight text-ink">
          Groups
        </h1>
        <button
          type="button"
          onClick={() => setShowCreate((open) => !open)}
          className="flex h-[52px] shrink-0 items-center rounded-full bg-primary px-6 text-base font-bold text-primary-contrast"
        >
          Create a group
        </button>
      </div>

      {showCreate ? (
        <div className="mt-4 rounded-[20px] border border-line bg-card p-4">
          <label htmlFor="group-name" className="block text-[15px] font-bold text-ink">
            Group name
          </label>
          <input
            id="group-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. March 2027 mothers"
            maxLength={80}
            className="mt-2 h-12 w-full rounded-full border border-line bg-card px-4 text-base text-ink outline-none placeholder:text-muted focus:border-primary"
          />
          <label htmlFor="group-description" className="mt-4 block text-[15px] font-bold text-ink">
            What is this group about? (optional)
          </label>
          <textarea
            id="group-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={300}
            placeholder="e.g. For mothers due in March 2027 to share and support each other."
            className="mt-2 w-full resize-none rounded-[16px] border border-line bg-card px-4 py-3 text-base text-ink outline-none placeholder:text-muted focus:border-primary"
          />
          <p className="mt-2 text-[13px] text-muted">
            You will be the admin of this group and can remove people from it.
          </p>
          <PrimaryButton
            type="button"
            className="mt-3"
            disabled={!name.trim() || creating}
            aria-busy={creating}
            onClick={() => void onCreate()}
          >
            {creating ? "Creating…" : "Create group"}
          </PrimaryButton>
          <FormError message={error} />
        </div>
      ) : null}

      {myGroups.length > 0 ? (
        <>
          <h2 ref={myGroupsRef} className="mt-6 text-[20px] font-extrabold text-ink">
            My groups
          </h2>
          <div className="mt-3 space-y-3">
            {myGroups.map((group) => (
              <GroupRow
                key={group.id}
                group={group}
                memberCount={memberCount.get(group.id) ?? 0}
                isAdmin={myMembershipByGroup.get(group.id)?.role === "admin"}
                isMember
                joining={false}
                onJoin={() => {}}
                onOpen={() =>
                  void navigate({ to: "/community/groups/$groupId", params: { groupId: group.id } })
                }
              />
            ))}
          </div>
        </>
      ) : null}

      <h2 className="mt-6 text-[20px] font-extrabold text-ink">All groups</h2>
      {allGroups.length === 0 ? (
        <div className="mt-3 rounded-[20px] border border-line bg-card p-4 text-center">
          <p className="text-base font-bold text-ink">No groups yet</p>
          <p className="mt-2 text-base text-muted">
            Create the first group — by due month, or any group you want.
          </p>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {allGroups.map((group) => {
            const membership = myMembershipByGroup.get(group.id);
            return (
              <GroupRow
                key={group.id}
                group={group}
                memberCount={memberCount.get(group.id) ?? 0}
                isAdmin={membership?.role === "admin"}
                isMember={Boolean(membership)}
                joining={joiningId === group.id}
                onJoin={() => void onJoin(group.id)}
                onOpen={() =>
                  void navigate({ to: "/community/groups/$groupId", params: { groupId: group.id } })
                }
              />
            );
          })}
        </div>
      )}
      <FormError message={error} />
    </main>
  );
}

function GroupRow({
  group,
  memberCount,
  isAdmin,
  isMember,
  joining,
  onJoin,
  onOpen,
}: {
  group: CommunityGroupRow;
  memberCount: number;
  isAdmin: boolean;
  isMember: boolean;
  joining: boolean;
  onJoin: () => void;
  onOpen: () => void;
}) {
  return (
    <div className="rounded-[20px] border border-line bg-card p-4">
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <span className="flex items-center gap-2 text-base font-extrabold text-ink">
          {group.name}
          {isAdmin ? (
            <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[12px] font-bold text-primary">
              admin
            </span>
          ) : null}
        </span>
        {group.description ? (
          <span className="mt-1 block text-[15px] leading-relaxed text-muted">{group.description}</span>
        ) : null}
        <span className="mt-1 block text-[14px] text-muted">
          {memberCount} {memberCount === 1 ? "member" : "members"}
        </span>
      </button>
      <div className="mt-3 flex gap-2">
        {isMember ? (
          <button
            type="button"
            onClick={onOpen}
            className="flex h-[52px] flex-1 items-center justify-center rounded-full border-2 border-primary text-base font-bold text-primary"
          >
            Open group
          </button>
        ) : (
          <button
            type="button"
            onClick={onJoin}
            disabled={joining}
            className="flex h-[52px] flex-1 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-contrast disabled:opacity-50"
          >
            {joining ? "Joining…" : "Join group"}
          </button>
        )}
      </div>
    </div>
  );
}
