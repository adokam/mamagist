import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Lock, Mail, User } from "lucide-react";
import { useState, type FormEvent } from "react";

import { PrimaryButton } from "@/components/Buttons";
import { AuthHero, AuthSheet, AuthSwitch } from "@/features/auth/AuthHero";
import { PageHeader } from "@/components/PageHeader";
import { TextInput } from "@/components/TextInput";
import { supabase } from "@/integrations/supabase/client";

import { AUTH_MESSAGES, friendlyAuthError } from "./authErrors";
import { FormError, FormField } from "./FormField";
import { PasswordInput } from "./PasswordInput";
import { fieldErrors, signupSchema, type SignupValues } from "./validation";

const linkClass = "font-bold underline underline-offset-4";

export function SignupPage({ onSigningUp }: { onSigningUp?: (value: boolean) => void }) {
  const navigate = useNavigate();
  const [values, setValues] = useState<SignupValues>({
    fullName: "",
    email: "",
    password: "",
    acceptedTerms: false,
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [checkEmailFor, setCheckEmailFor] = useState<string | null>(null);

  const parsed = signupSchema.safeParse(values);
  const errors = fieldErrors(parsed.success ? undefined : parsed.error);
  const show = (field: keyof SignupValues) => (touched[field] ? errors[field] : undefined);
  const touch = (field: keyof SignupValues) => () => setTouched((t) => ({ ...t, [field]: true }));

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const result = signupSchema.safeParse(values);
    if (!result.success || submitting) return;
    const { fullName, email, password } = result.data;

    setSubmitting(true);
    setFormError(null);
    onSigningUp?.(true);
    let signedIn = false;
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, terms_accepted: true },
          emailRedirectTo: `${window.location.origin}/signup/period`,
        },
      });
      if (error) {
        setFormError(friendlyAuthError(error, "signup"));
        return;
      }
      // With email confirmation on, an existing email comes back as a user with no identities.
      if (data.user && data.user.identities?.length === 0) {
        setFormError(AUTH_MESSAGES.emailTaken);
        return;
      }
      if (data.session) {
        signedIn = true;
        await navigate({ to: "/signup/period", replace: true });
        return;
      }
      setCheckEmailFor(email);
    } catch (error) {
      setFormError(friendlyAuthError(error, "signup"));
    } finally {
      if (!signedIn) onSigningUp?.(false);
      setSubmitting(false);
    }
  }

  if (checkEmailFor) {
    return (
      <main className="flex min-h-dvh flex-col bg-background">
        <AuthHero />
        <AuthSheet>
          <div className="mt-1">
            <PageHeader title="Check your email" />
          </div>
          <p className="mt-3 text-base leading-relaxed text-foreground">
            We sent a link to <span className="font-bold">{checkEmailFor}</span>. Open it to
            confirm your account, then log in.
          </p>
          <div className="mt-auto pt-8">
            <PrimaryButton type="button" onClick={() => void navigate({ to: "/login" })}>
              Go to log in
            </PrimaryButton>
          </div>
        </AuthSheet>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col bg-background">
      <AuthHero />
      <AuthSheet>
        <AuthSwitch active="signup" />
        <div className="mt-6">
          <PageHeader label="Step 1 of 3" title="Create your account" />
        </div>

        <form noValidate onSubmit={onSubmit} className="mt-6 flex flex-1 flex-col">
        <div className="space-y-5">
          <FormField id="fullName" label="Full name" error={show("fullName")}>
            <TextInput
              id="fullName"
              name="fullName"
              icon={<User className="h-5 w-5" aria-hidden />}
              autoComplete="name"
              autoCapitalize="words"
              maxLength={120}
              value={values.fullName}
              onChange={(e) => setValues((v) => ({ ...v, fullName: e.target.value }))}
              onBlur={touch("fullName")}
              aria-invalid={Boolean(show("fullName"))}
              aria-describedby={show("fullName") ? "fullName-error" : undefined}
            />
          </FormField>

          <FormField id="email" label="Email" error={show("email")}>
            <TextInput
              id="email"
              name="email"
              type="email"
              inputMode="email"
              icon={<Mail className="h-5 w-5" aria-hidden />}
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={255}
              value={values.email}
              onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
              onBlur={touch("email")}
              aria-invalid={Boolean(show("email"))}
              aria-describedby={show("email") ? "email-error" : undefined}
            />
          </FormField>

          <FormField id="password" label="Password" error={show("password")}>
            <PasswordInput
              id="password"
              name="password"
              icon={<Lock className="h-5 w-5" aria-hidden />}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={values.password}
              onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
              onBlur={touch("password")}
              aria-invalid={Boolean(show("password"))}
              aria-describedby={show("password") ? "password-error" : undefined}
            />
          </FormField>

          <div className="flex items-start gap-3 pt-1">
            <input
              id="acceptedTerms"
              type="checkbox"
              required
              checked={values.acceptedTerms}
              onChange={(e) => setValues((v) => ({ ...v, acceptedTerms: e.target.checked }))}
              className="mt-0.5 h-6 w-6 shrink-0 accent-primary"
            />
            <label htmlFor="acceptedTerms" className="text-base leading-snug text-foreground">
              I accept the{" "}
              <Link to="/terms" className={linkClass}>
                Terms of Use
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className={linkClass}>
                Privacy Policy
              </Link>
              .
            </label>
          </div>
        </div>

        <div className="mt-auto space-y-4 pt-8">
          <FormError message={formError} />
          <PrimaryButton
            type="submit"
            disabled={!parsed.success || submitting}
            aria-busy={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
                Creating your account…
              </>
            ) : (
              "Continue"
            )}
          </PrimaryButton>
          <p className="text-center text-base text-foreground">
            Already have an account?{" "}
            <Link to="/login" className={linkClass}>
              Log in
            </Link>
          </p>
        </div>
        </form>
      </AuthSheet>
    </main>
  );
}
