import { z } from "zod";

export const NAME_MIN = 2;
export const NAME_MAX = 80;
export const PASSWORD_MIN = 8;

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Please enter your email address.")
  .max(255, "That email address is too long.")
  .email("Please enter a valid email address.");

/** Signup, step 1. Name and email are trimmed; email is made lowercase. */
export const signupSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(NAME_MIN, `Please enter your full name (at least ${NAME_MIN} letters).`)
    .max(NAME_MAX, `Your name can be at most ${NAME_MAX} characters.`),
  email,
  password: z
    .string()
    .min(PASSWORD_MIN, `Your password needs at least ${PASSWORD_MIN} characters.`),
  acceptedTerms: z.boolean().refine((v) => v, "Please accept the Terms of Use and Privacy Policy."),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Please enter your password."),
});

/** Forgot password: email only. */
export const forgotPasswordSchema = z.object({ email });

/** Reset password: a new password of at least 8 characters. */
export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(PASSWORD_MIN, `Your password needs at least ${PASSWORD_MIN} characters.`),
});

export type SignupValues = z.input<typeof signupSchema>;
export type LoginValues = z.input<typeof loginSchema>;
export type ForgotPasswordValues = z.input<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.input<typeof resetPasswordSchema>;

/** First error message per field, or an empty object when everything is valid. */
export function fieldErrors(error: z.ZodError | undefined): Record<string, string | undefined> {
  if (!error) return {};
  const flat = error.flatten().fieldErrors as Record<string, string[] | undefined>;
  return Object.fromEntries(Object.entries(flat).map(([key, list]) => [key, list?.[0]]));
}
