// Detecting a missing community table, so the app can say so plainly
// instead of "We couldn't save this." The new community tables only exist
// as a migration file in the repo until someone applies that migration to
// the live Supabase project; until then every read/write to those tables
// fails with Postgres code 42P01 ("relation ... does not exist"). Pure
// functions — no live database needed.
export const MISSING_TABLES_MESSAGE =
  "The community tables are not set up yet. Please apply the new migration in Supabase, then try again.";

/** True when an error means a database table does not exist yet. */
export function isMissingTablesError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const e = error as { code?: unknown; message?: unknown };
  if (e.code === "42P01") return true;
  const message = typeof e.message === "string" ? e.message : "";
  return /relation .* does not exist/i.test(message) || /42P01/.test(message);
}
