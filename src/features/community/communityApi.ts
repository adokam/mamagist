// Community data: feed posts, likes, comments, reports, photo upload.
// All calls go through the Supabase client; row level security (migration
// 20261126090000) decides what each mother may read or write. No health
// data, dates or chat messages are logged here.
import { communitySupabase } from "./communityClient";
import type {
  CommunityCommentRow,
  CommunityGroupMemberRow,
  CommunityGroupRow,
  CommunityPostRow,
} from "./communityClient";
import { supabase } from "@/integrations/supabase/client";

export type FeedPost = CommunityPostRow & {
  /** Public display name from profiles, or null when none is saved yet. */
  authorName: string | null;
  likeCount: number;
  likedByMe: boolean;
  commentCount: number;
};

export type AuthorProfile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
};

const FEED_LIMIT = 50;

/** The big feed: posts with no group, newest first. */
export async function fetchFeedPosts(userId: string): Promise<FeedPost[]> {
  const { data: posts, error } = await communitySupabase
    .from("community_posts")
    .select("id, user_id, group_id, body, image_url, created_at")
    .is("group_id", null)
    .order("created_at", { ascending: false })
    .limit(FEED_LIMIT);
  if (error) throw error;
  return enrichPosts(posts ?? [], userId);
}

/** One group's feed: posts in that group, newest first. */
export async function fetchGroupPosts(groupId: string, userId: string): Promise<FeedPost[]> {
  const { data: posts, error } = await communitySupabase
    .from("community_posts")
    .select("id, user_id, group_id, body, image_url, created_at")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(FEED_LIMIT);
  if (error) throw error;
  return enrichPosts(posts ?? [], userId);
}

async function enrichPosts(posts: CommunityPostRow[], userId: string): Promise<FeedPost[]> {
  if (posts.length === 0) return [];
  const postIds = posts.map((p) => p.id);
  const authorIds = [...new Set(posts.map((p) => p.user_id))];

  const [profiles, likes, comments] = await Promise.all([
    fetchProfilesByIds(authorIds),
    communitySupabase
      .from("community_post_likes")
      .select("post_id, user_id")
      .in("post_id", postIds),
    communitySupabase
      .from("community_comments")
      .select("id, post_id")
      .in("post_id", postIds)
      .limit(500),
  ]);
  if (likes.error) throw likes.error;
  if (comments.error) throw comments.error;

  const names = new Map(profiles.map((p) => [p.id, p.display_name]));
  const likeCount = new Map<string, number>();
  const likedByMe = new Set<string>();
  for (const like of likes.data ?? []) {
    likeCount.set(like.post_id, (likeCount.get(like.post_id) ?? 0) + 1);
    if (like.user_id === userId) likedByMe.add(like.post_id);
  }
  const commentCount = new Map<string, number>();
  for (const comment of comments.data ?? []) {
    commentCount.set(comment.post_id, (commentCount.get(comment.post_id) ?? 0) + 1);
  }

  return posts.map((post) => ({
    ...post,
    authorName: names.get(post.user_id) ?? null,
    likeCount: likeCount.get(post.id) ?? 0,
    likedByMe: likedByMe.has(post.id),
    commentCount: commentCount.get(post.id) ?? 0,
  }));
}

/** Public profile names for a list of user ids. */
export async function fetchProfilesByIds(userIds: string[]): Promise<AuthorProfile[]> {
  if (userIds.length === 0) return [];
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", userIds);
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    display_name: row.display_name,
    avatar_url: row.avatar_url,
  }));
}

/** Her own first name, from her private profile (only she can read it). */
export async function fetchOwnFirstName(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from("private_profiles")
    .select("full_name")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  const first = (data?.full_name ?? "").trim().split(/\s+/)[0] ?? "";
  return first;
}

/**
 * Save her first name to her public profile, so other mothers see it next
 * to her posts. Only fills it when it is empty; best effort — a failure
 * here never blocks posting.
 */
export async function ensurePublicDisplayName(userId: string, firstName: string): Promise<void> {
  if (!firstName) return;
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: firstName })
    .eq("id", userId)
    .is("display_name", null);
  if (error) {
    // Her posts still work without a saved display name.
    return;
  }
}

/** Upload one post photo to the community-images bucket. Returns the public URL. */
export async function uploadPostPhoto(file: File, userId: string): Promise<string> {
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await communitySupabase.storage
    .from("community-images")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw uploadError;
  const { data } = communitySupabase.storage.from("community-images").getPublicUrl(path);
  return data.publicUrl;
}

/** Create a post in the big feed (groupId null) or in a group. */
export async function createPost(args: {
  userId: string;
  body: string;
  imageUrl: string | null;
  groupId: string | null;
  firstName: string;
}): Promise<void> {
  const { error } = await communitySupabase.from("community_posts").insert({
    user_id: args.userId,
    group_id: args.groupId,
    body: args.body.trim(),
    image_url: args.imageUrl,
  });
  if (error) throw error;
  await ensurePublicDisplayName(args.userId, args.firstName);
}

/** Toggle her like on a post. A duplicate row counts as already liked. */
export async function toggleLike(postId: string, userId: string, liked: boolean): Promise<void> {
  if (liked) {
    const { error } = await communitySupabase
      .from("community_post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);
    if (error) throw error;
    return;
  }
  const { error } = await communitySupabase
    .from("community_post_likes")
    .insert({ post_id: postId, user_id: userId });
  if (error) {
    // Unique (post_id, user_id): she already liked it.
    if ((error as { code?: unknown }).code === "23505") return;
    throw error;
  }
}

/** Comments on one post, oldest first. */
export async function fetchComments(postId: string): Promise<CommunityCommentRow[]> {
  const { data, error } = await communitySupabase
    .from("community_comments")
    .select("id, post_id, user_id, body, created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
    .limit(100);
  if (error) throw error;
  return data ?? [];
}

/** Add a comment to a post. */
export async function addComment(postId: string, userId: string, body: string): Promise<void> {
  const { error } = await communitySupabase
    .from("community_comments")
    .insert({ post_id: postId, user_id: userId, body: body.trim() });
  if (error) throw error;
}

/** Delete her own post (RLS only allows her own). */
export async function deletePost(postId: string): Promise<void> {
  const { error } = await communitySupabase
    .from("community_posts")
    .delete()
    .eq("id", postId);
  if (error) throw error;
}

/** File a report on a post. Reports are only readable by the service role. */
export async function reportPost(postId: string, authorId: string, userId: string): Promise<void> {
  const { error } = await communitySupabase.from("community_reports").insert({
    post_id: postId,
    reported_user_id: authorId,
    reason: "Reported from the feed",
    created_by: userId,
  });
  if (error) throw error;
}

/** All groups, newest first. */
export async function fetchGroups(): Promise<CommunityGroupRow[]> {
  const { data, error } = await communitySupabase
    .from("community_groups")
    .select("id, name, description, created_by, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Her memberships, so the app knows which groups she joined and admins. */
export async function fetchMyMemberships(userId: string): Promise<CommunityGroupMemberRow[]> {
  const { data, error } = await communitySupabase
    .from("community_group_members")
    .select("id, group_id, user_id, role, joined_at")
    .eq("user_id", userId);
  if (error) throw error;
  return data ?? [];
}

/** All members of one group (for the member list and the member count). */
export async function fetchGroupMembers(groupId: string): Promise<CommunityGroupMemberRow[]> {
  const { data, error } = await communitySupabase
    .from("community_group_members")
    .select("id, group_id, user_id, role, joined_at")
    .eq("group_id", groupId)
    .order("joined_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Create a group and make her its admin, in that order. */
export async function createGroup(args: {
  name: string;
  description: string;
  userId: string;
}): Promise<CommunityGroupRow> {
  const { data: group, error } = await communitySupabase
    .from("community_groups")
    .insert({
      name: args.name.trim(),
      description: args.description.trim(),
      created_by: args.userId,
    })
    .select("id, name, description, created_by, created_at")
    .single();
  if (error) throw error;
  const { error: memberError } = await communitySupabase
    .from("community_group_members")
    .insert({ group_id: group.id, user_id: args.userId, role: "admin" });
  if (memberError) throw memberError;
  return group;
}

/** Join a group (insert her own membership row). */
export async function joinGroup(groupId: string, userId: string): Promise<void> {
  const { error } = await communitySupabase
    .from("community_group_members")
    .insert({ group_id: groupId, user_id: userId, role: "member" });
  if (error) {
    if ((error as { code?: unknown }).code === "23505") return;
    throw error;
  }
}

/** Leave a group (delete her own membership row). */
export async function leaveGroup(groupId: string, userId: string): Promise<void> {
  const { error } = await communitySupabase
    .from("community_group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId);
  if (error) throw error;
}

/** Admin only (RLS): remove another member from a group. */
export async function removeGroupMember(groupId: string, memberUserId: string): Promise<void> {
  const { error } = await communitySupabase
    .from("community_group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", memberUserId);
  if (error) throw error;
}
