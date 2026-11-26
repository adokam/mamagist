// Rules for what a community post or comment may contain. Pure functions.
export const MAX_POST_LENGTH = 2000;
export const MAX_COMMENT_LENGTH = 1000;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB

/** A post needs words, a photo, or both — never neither. */
export function canPost(body: string, hasPhoto: boolean): boolean {
  return body.trim().length > 0 || hasPhoto;
}

/** A comment needs words. */
export function canComment(body: string): boolean {
  const trimmed = body.trim();
  return trimmed.length > 0 && trimmed.length <= MAX_COMMENT_LENGTH;
}

/** Only image files, and no bigger than 5 MB, may be attached to a post. */
export function isAllowedPhoto(file: { type: string; size: number }): boolean {
  return file.type.startsWith("image/") && file.size > 0 && file.size <= MAX_PHOTO_BYTES;
}
