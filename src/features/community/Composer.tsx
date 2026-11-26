// The post composer: words, an optional photo, and a Post button.
// Used on the big feed and inside a group. One photo per post for now.
import { Image as ImageIcon, X } from "lucide-react";
import { useRef, useState } from "react";

import { PrimaryButton } from "@/components/Buttons";
import { FormError } from "@/features/auth/FormField";
import { friendlySaveError } from "@/features/profile/saveError";

import { createPost, uploadPostPhoto } from "./communityApi";
import { canPost, isAllowedPhoto, MAX_POST_LENGTH } from "./postValidation";

export function Composer({
  userId,
  groupId,
  firstName,
  onPosted,
  onCancel,
}: {
  userId: string;
  /** Null for the big feed, a group id inside a group. */
  groupId: string | null;
  firstName: string;
  onPosted: () => void;
  onCancel: () => void;
}) {
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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
      await createPost({ userId, body, imageUrl, groupId, firstName });
      onPosted();
    } catch (e) {
      setError(friendlySaveError(e));
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="rounded-[20px] border border-line bg-card p-4">
      <label htmlFor="community-post-body" className="sr-only">
        Write a post
      </label>
      <textarea
        id="community-post-body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        maxLength={MAX_POST_LENGTH}
        placeholder="Share with other mothers…"
        className="w-full resize-none rounded-[16px] border border-line bg-card px-4 py-3 text-base text-ink outline-none placeholder:text-muted focus:border-primary"
      />
      {previewUrl ? (
        <div className="relative mt-3">
          <img src={previewUrl} alt="Photo for your post" className="w-full rounded-[16px] object-cover" />
          <button
            type="button"
            onClick={() => {
              URL.revokeObjectURL(previewUrl);
              setPreviewUrl(null);
              setFile(null);
              if (fileRef.current) fileRef.current.value = "";
            }}
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
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex h-12 items-center gap-2 rounded-full px-4 text-base font-bold text-primary"
        >
          <ImageIcon className="h-5 w-5" aria-hidden /> Photo
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={onCancel}
          className="flex h-12 items-center rounded-full px-4 text-base font-bold text-muted"
        >
          Cancel
        </button>
        <PrimaryButton
          type="button"
          className="w-auto px-8"
          disabled={!canPost(body, file !== null) || posting}
          aria-busy={posting}
          onClick={() => void onPost()}
        >
          {posting ? "Posting…" : "Post"}
        </PrimaryButton>
      </div>
      <FormError message={error} />
      <p className="mt-2 text-[13px] text-muted">
        Only mothers signed in to Mamagist can see your post. Please do not share private health
        details.
      </p>
    </div>
  );
}
