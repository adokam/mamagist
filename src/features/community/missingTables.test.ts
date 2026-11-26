import { describe, expect, it } from "vitest";

import { isMissingTablesError, MISSING_TABLES_MESSAGE } from "./missingTables";

describe("isMissingTablesError", () => {
  it("detects the Postgres undefined-table code 42P01", () => {
    expect(isMissingTablesError({ code: "42P01" })).toBe(true);
  });

  it("detects a relation-does-not-exist message with no code", () => {
    expect(
      isMissingTablesError({
        message: 'relation "public.community_posts" does not exist',
      }),
    ).toBe(true);
  });

  it("does not flag other errors", () => {
    expect(isMissingTablesError({ code: "23505" })).toBe(false);
    expect(isMissingTablesError({ message: "Network request failed" })).toBe(false);
    expect(isMissingTablesError(new Error("We couldn't save this."))).toBe(false);
    expect(isMissingTablesError(null)).toBe(false);
    expect(isMissingTablesError(undefined)).toBe(false);
  });

  it("tells her what to do, not just that it failed", () => {
    expect(MISSING_TABLES_MESSAGE).toContain("not set up yet");
    expect(MISSING_TABLES_MESSAGE).toContain("migration in Supabase");
  });
});
