// Full-screen "Create post" page, like Facebook's Create post screen but
// in Mamagist's own Fresh Green look: back arrow, "Create post" title and
// a Post button in the header; her avatar, name and a fixed "Mothers only"
// audience pill; a big borderless text area; a contained photo preview;
// one "Photos/Videos" option row; and a big full-width Post button at the
// bottom. No bottom bar on this page — it sits outside the _tabs layout.
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Globe, Image as ImageIcon, X } from "lucide-react";
import { useRef, useState } from "react";

import { PrimaryButton } from "@/components/Buttons";
import { FormError } from "@/features/auth/FormField";
import { useAuth } from "@/features/auth/AuthProvider";
import { friendlySaveError } from "@/features/profile/saveError";

import { AuthorAvatar } from "./PostCard";
import { createPost, fetchOwnFirstName, uploadPostPhoto } from "./communityApi";
import { COMMUNITY_ENABLED } from "./communityEnabled";
import { firstName } from "./displayName";
import { isMissingTablesError, MISSING_TABLES_MESSAGE } from "./missingTables";
import { NotifyMePage } from "./NotifyMePage";
import { canPost, isAllowedPhoto, MAX_POST_LENGTH } from "./postValidation";

/** While the community is paused, the Create post page shows the Notify me
    waiting list. Set COMMUNITY_ENABLED to true to bring posting back. */
export function CreatePostPage({ groupId }: { groupId: string | null }) {
  if (!COMMUNITY_ENABLED) return <NotifyMePage />;
  return <CreatePostPageContent groupId={groupId} />;
}

function CreatePostPageContent({ groupId }: { groupId: string | null }) {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const myName = useQuery({
    queryKey: ["community-my-first-name", userId],
    enabled: Boolean(userId),
    queryFn: () => fetchOwnFirstName(userId),
  });
  const myFirstName = firstName(myName.data ?? null);

  function goBack() {
    if (groupId) {
      void navigate({ to: "/community/groups/$groupId", params: { groupId } });
    } else {
      void navigate({ to: "/community" });
    }
  }

  function pickPhoto(next: File | null) {
    setError(null);
    if (!next) return;
    if (!isAllowedPhoto(next)) {
      setError("Please choose a photo smaller than 5 MB.");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(next);
    setPreviewUrl(URL.createObjectURL(next));
  }

  function removePhoto() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function onPost() {
    if (!canPost(body, file !== null) || posting) return;
    if (body.trim().length > MAX_POST_LENGTH) {
      setError("Please keep your post under 2,000 characters.");
      return;
    }
    setPosting(true);
    setError(null);
    try {
      let imageUrl: string | null = null;
      if (file) imageUrl = await uploadPostPhoto(file, userId);
      await createPost({ userId, body, imageUrl, groupId, firstName: myFirstName });
      if (groupId) {
        void queryClient.invalidateQueries({
          queryKey: ["community-group-posts", groupId, userId],
        });
      } else {
        void queryClient.invalidateQueries({ queryKey: ["community-feed", userId] });
      }
      goBack();
    } catch (e) {
      setError(
        isMissingTablesError(e) ? MISSING_TABLES_MESSAGE : friendlySaveError(e),
      );
    } finally {
      setPosting(false);
    }
  }

  const ready = canPost(body, file !== null) && !posting;

  return (
    <main className="page-shell pb-8">
      {/* Header: back arrow, title, Post button. */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={goBack}
          aria-label="Back"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink"
        >
          <ArrowLeft className="h-6 w-6" aria-hidden />
        </button>
        <h1 className="min-w-0 flex-1 text-[22px] leading-tight font-extrabold tracking-tight text-ink">
          Create post
        </h1>
        <button
          type="button"
          onClick={() => void onPost()}
          disabled={!ready}
          className="shrink-0 rounded-full px-3 py-2 text-base font-extrabold text-primary disabled:opacity-40"
        >
          Post
        </button>
      </div>

      {/* Who is posting, and who can see it. The audience is fixed — this pill is not tappable. */}
      <div className="mt-4 flex items-center gap-3">
        <AuthorAvatar name={myFirstName || "M"} />
        <div className="min-w-0">
          <p className="truncate text-base font-extrabold text-ink">
            {myFirstName || "A mother"}
          </p>
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-[13px] font-bold text-muted">
            <Globe className="h-4 w-4" aria-hidden /> Mothers only
          </span>
        </div>
      </div>

      {/* Big borderless text area. */}
      <label htmlFor="create-post-body" className="sr-only">
        Write a post
      </label>
      <textarea
        id="create-post-body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={8}
        maxLength={MAX_POST_LENGTH}
        placeholder="Share with other mothers…"
        autoFocus
        className="mt-4 min-h-[200px] w-full resize-none border-0 bg-transparent text-[18px] leading-relaxed text-ink outline-none placeholder:text-muted focus:ring-0"
      />

      {/* Photo preview, contained so it can never push the Post button away. */}
      {previewUrl ? (
        <div className="relative mt-2">
          <img
            src={previewUrl}
            alt="Photo for your post"
            className="max-h-[240px] w-full rounded-[16px] object-cover"
          />
          <button
            type="button"
            onClick={removePhoto}
            className="absolute top-2 right-2 grid h-10 w-10 place-items-center rounded-full bg-card text-ink shadow"
            aria-label="Remove photo"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
      ) : null}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-label="Choose a photo"
        onChange={(e) => pickPhoto(e.target.files?.[0] ?? null)}
      />

      {/* Options: only Photos/Videos for now. No dead rows for things we do not have. */}
      <div className="mt-4 border-t border-line">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex w-full items-center gap-3 py-3.5 text-left text-base font-bold text-ink"
        >
          <ImageIcon className="h-6 w-6 text-primary" aria-hidden /> Photos/Videos
        </button>
      </div>

      <FormError message={error} />
      <p className="mt-2 text-[13px] leading-relaxed text-muted">
        Only mothers signed in to Mamagist can see your post. Please do not share private health
        details.
      </p>

      {/* Big full-width Post button at the bottom. */}
      <div className="mt-4">
        <PrimaryButton
          type="button"
          disabled={!ready}
          aria-busy={posting}
          onClick={() => void onPost()}
        >
          {posting ? "Posting…" : "Post"}
        </PrimaryButton>
      </div>
    </main>
  );
}
