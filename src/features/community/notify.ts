/** True when a Supabase error means the row already exists (unique user + topic). */
export function isAlreadyOnList(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "23505"
  );
}
