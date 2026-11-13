import { describe, expect, it } from "vitest";

import { AUTH_MESSAGES, friendlyAuthError } from "./authErrors";

describe("friendly auth errors", () => {
  it("maps email already used", () => {
    expect(friendlyAuthError({ code: "user_already_exists" }, "signup")).toBe(
      AUTH_MESSAGES.emailTaken,
    );
  });
  it("maps weak password", () => {
    expect(friendlyAuthError({ code: "weak_password" }, "signup")).toBe(AUTH_MESSAGES.weakPassword);
  });
  it("maps wrong email or password", () => {
    expect(friendlyAuthError({ code: "invalid_credentials" }, "login")).toBe(
      AUTH_MESSAGES.wrongCredentials,
    );
  });
  it("maps no internet", () => {
    expect(friendlyAuthError({ name: "AuthRetryableFetchError" }, "login")).toBe(
      AUTH_MESSAGES.noInternet,
    );
    expect(friendlyAuthError(new TypeError("Failed to fetch"), "signup")).toBe(
      AUTH_MESSAGES.noInternet,
    );
  });
  it("never shows raw error text", () => {
    expect(friendlyAuthError(new Error("relation does not exist"), "signup")).toBe(
      AUTH_MESSAGES.generic,
    );
  });
});
