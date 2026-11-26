import { describe, expect, it } from "vitest";

import { brokeredPreviewStorage } from "./previewAuthStorage";

/**
 * Login outside Lovable (e.g. on Vercel): the broker only applies on a Lovable
 * preview host inside the editor frame. Anywhere else the session must live in
 * plain localStorage, so sign in, sign out and the saved session work the same.
 * jsdom's host is localhost, which is not a preview zone.
 */
describe("brokeredPreviewStorage outside Lovable", () => {
  it("returns plain localStorage on a normal hosted site", () => {
    expect(brokeredPreviewStorage()).toBe(window.localStorage);
  });

  it("saves, reads and removes a session value like Supabase does", async () => {
    const storage = brokeredPreviewStorage();
    expect(storage).not.toBeUndefined();
    if (!storage) return;
    const key = "sb-test-auth-token";
    await storage.setItem(key, "session-value");
    expect(await storage.getItem(key)).toBe("session-value");
    await storage.removeItem(key);
    expect(await storage.getItem(key)).toBeNull();
  });

  it("returns null for a key that was never saved", async () => {
    const storage = brokeredPreviewStorage();
    expect(storage).not.toBeUndefined();
    if (!storage) return;
    expect(await storage.getItem("sb-never-saved")).toBeNull();
  });
});
