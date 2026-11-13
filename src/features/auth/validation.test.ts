import { describe, expect, it } from "vitest";

import { loginSchema, signupSchema } from "./validation";

const good = {
  fullName: "Ada Obi",
  email: "ada@example.com",
  password: "12345678",
  acceptedTerms: true,
};

describe("signup validation", () => {
  it("accepts valid details", () => {
    expect(signupSchema.safeParse(good).success).toBe(true);
  });
  it("trims the name and trims + lowercases the email", () => {
    const r = signupSchema.parse({ ...good, fullName: "  Ada Obi  ", email: "  ADA@Example.COM " });
    expect(r.fullName).toBe("Ada Obi");
    expect(r.email).toBe("ada@example.com");
  });
  it("needs a name of 2 to 80 characters", () => {
    expect(signupSchema.safeParse({ ...good, fullName: " A " }).success).toBe(false);
    expect(signupSchema.safeParse({ ...good, fullName: "Ab" }).success).toBe(true);
    expect(signupSchema.safeParse({ ...good, fullName: "a".repeat(80) }).success).toBe(true);
    expect(signupSchema.safeParse({ ...good, fullName: "a".repeat(81) }).success).toBe(false);
  });
  it("needs a valid email", () => {
    expect(signupSchema.safeParse({ ...good, email: "ada@" }).success).toBe(false);
  });
  it("needs a password of 8 or more characters", () => {
    expect(signupSchema.safeParse({ ...good, password: "1234567" }).success).toBe(false);
  });
  it("needs the terms box ticked", () => {
    expect(signupSchema.safeParse({ ...good, acceptedTerms: false }).success).toBe(false);
  });
});

describe("login validation", () => {
  it("lowercases the email and needs a password", () => {
    expect(loginSchema.parse({ email: " Ada@Example.com", password: "x" }).email).toBe(
      "ada@example.com",
    );
    expect(loginSchema.safeParse({ email: "ada@example.com", password: "" }).success).toBe(false);
  });
});
