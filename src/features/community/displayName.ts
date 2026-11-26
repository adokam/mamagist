// How a mother's name shows in the community.
// Her full name lives in private_profiles, which only she can read, so the
// feed shows the first name she saved on her public profile (profiles
// .display_name, readable by any signed-in mother). When no name is saved
// yet, the feed shows "A mother" — never an email, never health data.
/** First word of a full name, or "" when there is none. */
export function firstName(fullName: string | null | undefined): string {
  return (fullName ?? "").trim().split(/\s+/)[0] ?? "";
}

/** The name shown next to a post or comment. */
export function authorDisplayName(displayName: string | null | undefined): string {
  const name = (displayName ?? "").trim();
  return name ? name : "A mother";
}
