// One post in the feed, like a Facebook post card: author, time, words,
// photo, like and comment counts, Like and Comment buttons, and a "…"
// menu with Delete (her own post) and Report.
import { useQuery } from "@tanstack/react-query";
import { Ellipsis, MessageCircle, Send, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";

import { FormError } from "@/features/auth/FormField";
import { friendlySaveError } from "@/features/profile/saveError";
import { cn } from "@/lib/utils";

import {
  addComment,
  deletePost,
  fetchComments,
  fetchProfilesByIds,
  reportPost,
  toggleLike,
  type FeedPost,
} from "./communityApi";
import { authorDisplayName } from "./displayName";
import { canComment } from "./postValidation";
import { timeAgo } from "./timeAgo";

/** Round avatar with her initial, in primary. */
export function AuthorAvatar({
  name,
  size = 40,
}: {
  /** Public display name, or null when none is saved yet. */
  name: string | null | undefined;
  size?: 40 | 32;
}) {
  const initial = authorDisplayName(name).trim()[0] ?? "M";
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-primary font-extrabold text-primary-contrast",
        size === 40 ? "h-10 w-10 text-[18px]" : "h-8 w-8 text-[15px]",
      )}
    >
      {initial.toUpperCase()}
    </span>
  );
}

export function PostCard({
  post,
  userId,
  onChanged,
}: {
  post: FeedPost;
  userId: string;
  /** Called after a like, comment, delete or report, so the feed reloads. */
  onChanged: () => void;
}) {
  const isOwn = post.user_id === userId;
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [likeBusy, setLikeBusy] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [commentBusy, setCommentBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [reported, setReported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const comments = useQuery({
    queryKey: ["community-comments", post.id],
    enabled: commentsOpen,
    queryFn: () => fetchComments(post.id),
  });

  async function onLike() {
    if (likeBusy) return;
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    setLikeBusy(true);
    try {
      await toggleLike(post.id, userId, liked);
      onChanged();
    } catch {
      // Put the button back the way it was.
      setLiked(liked);
      setLikeCount((c) => c + (liked ? 1 : -1));
      setError("We couldn't save your like. Please try again.");
    } finally {
      setLikeBusy(false);
    }
  }

  async function onAddComment() {
    if (!canComment(commentBody) || commentBusy) return;
    setCommentBusy(true);
    setError(null);
    try {
      await addComment(post.id, userId, commentBody);
      setCommentBody("");
      await comments.refetch();
      onChanged();
    } catch (e) {
      setError(friendlySaveError(e));
    } finally {
      setCommentBusy(false);
    }
  }

  async function onDelete() {
    setConfirmDelete(false);
    setMenuOpen(false);
    try {
      await deletePost(post.id);
      onChanged();
    } catch (e) {
      setError(friendlySaveError(e));
    }
  }

  async function onReport() {
    setMenuOpen(false);
    try {
      await reportPost(post.id, post.user_id, userId);
      setReported(true);
    } catch (e) {
      setError(friendlySaveError(e));
    }
  }

  return (
    <article className="rounded-[20px] border border-line bg-card p-4">
      <div className="flex items-center gap-3">
        <AuthorAvatar name={post.authorName} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-extrabold text-ink">
            {authorDisplayName(post.authorName)}
          </p>
          <p className="text-[13px] text-muted">{timeAgo(post.created_at)}</p>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setMenuOpen((open) => !open);
              setConfirmDelete(false);
            }}
            aria-label="Post options"
            aria-expanded={menuOpen}
            className="grid h-11 w-11 place-items-center rounded-full text-muted"
          >
            <Ellipsis className="h-5 w-5" aria-hidden />
          </button>
          {menuOpen ? (
            <div className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-[16px] border border-line bg-card shadow">
              {isOwn ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="block w-full px-4 py-3 text-left text-base font-bold text-ink"
                >
                  Delete post
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => void onReport()}
                className="block w-full px-4 py-3 text-left text-base font-bold text-ink"
              >
                Report post
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {confirmDelete ? (
        <div className="mt-3 rounded-[16px] bg-alert p-3">
          <p className="text-base font-bold text-ink">Delete this post?</p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => void onDelete()}
              className="flex h-11 flex-1 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-contrast"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="flex h-11 flex-1 items-center justify-center rounded-full border-2 border-primary text-base font-bold text-primary"
            >
              Keep it
            </button>
          </div>
        </div>
      ) : null}

      {reported ? (
        <p className="mt-3 rounded-[16px] bg-surface px-3 py-2 text-[15px] text-ink">
          Thanks, we will look at it.
        </p>
      ) : null}

      {post.body ? (
        <p className="mt-3 text-base leading-relaxed whitespace-pre-wrap text-ink">{post.body}</p>
      ) : null}
      {post.image_url ? (
        <img
          src={post.image_url}
          alt="Photo in this post"
          className="mt-3 w-full rounded-[16px] object-cover"
          loading="lazy"
        />
      ) : null}

      <p className="mt-3 text-[14px] text-muted">
        {likeCount} {likeCount === 1 ? "like" : "likes"} · {post.commentCount}{" "}
        {post.commentCount === 1 ? "comment" : "comments"}
      </p>

      <div className="mt-2 flex gap-2 border-t border-line pt-2">
        <button
          type="button"
          onClick={() => void onLike()}
          disabled={likeBusy}
          aria-pressed={liked}
          className={cn(
            "flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-base font-bold",
            liked ? "bg-primary/12 text-primary" : "text-muted",
          )}
        >
          <ThumbsUp className="h-5 w-5" aria-hidden fill={liked ? "currentColor" : "none"} />
          Like
        </button>
        <button
          type="button"
          onClick={() => setCommentsOpen((open) => !open)}
          aria-expanded={commentsOpen}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-base font-bold text-muted"
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
          Comment
        </button>
      </div>

      {commentsOpen ? (
        <div className="mt-3 space-y-3 border-t border-line pt-3">
          {comments.isPending ? (
            <p className="text-[15px] text-muted">Loading comments…</p>
          ) : comments.isError ? (
            <p className="text-[15px] text-muted">
              We couldn't load the comments.{" "}
              <button type="button" onClick={() => void comments.refetch()} className="font-bold text-primary">
                Try again
              </button>
            </p>
          ) : (comments.data ?? []).length === 0 ? (
            <p className="text-[15px] text-muted">No comments yet. Be the first to reply.</p>
          ) : (
            (comments.data ?? []).map((comment) => (
              <CommentRow key={comment.id} comment={comment} />
            ))
          )}
          <div className="flex items-center gap-2">
            <label htmlFor={`comment-${post.id}`} className="sr-only">
              Write a comment
            </label>
            <input
              id={`comment-${post.id}`}
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void onAddComment();
              }}
              placeholder="Write a comment…"
              className="h-12 min-w-0 flex-1 rounded-full border border-line bg-surface px-4 text-base text-ink outline-none placeholder:text-muted focus:border-primary"
            />
            <button
              type="button"
              onClick={() => void onAddComment()}
              disabled={!canComment(commentBody) || commentBusy}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-base font-bold text-primary-contrast disabled:opacity-50"
              aria-label="Send comment"
            >
              <Send className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
      ) : null}

      <FormError message={error} />
    </article>
  );
}

function CommentRow({ comment }: { comment: { id: string; user_id: string; body: string; created_at: string } }) {
  const [authorName, setAuthorName] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    void fetchProfilesByIds([comment.user_id]).then(([profile]) => {
      if (!cancelled) setAuthorName(profile?.display_name ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [comment.user_id]);
  return (
    <div className="flex items-start gap-2">
      <AuthorAvatar name={authorName} size={32} />
      <div className="min-w-0 flex-1 rounded-[16px] bg-surface px-3 py-2">
        <p className="text-[14px] font-extrabold text-ink">{authorDisplayName(authorName)}</p>
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-ink">{comment.body}</p>
        <p className="mt-1 text-[12px] text-muted">{timeAgo(comment.created_at)}</p>
      </div>
    </div>
  );
}
