import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import { PrimaryButton } from "@/components/Buttons";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";

import { useAuth } from "./AuthProvider";
import { FormError, FormField } from "./FormField";
import { PasswordInput } from "./PasswordInput";
import { fieldErrors, resetPasswordSchema, type ResetPasswordValues } from "./validation";
import { friendlyAuthError } from "./authErrors";

/**
 * Set a new password after following the reset link in her email. The link
 * carries a recovery session, which Supabase picks up automatically; without
 * that session the link has expired and she must ask for a new one. This page
 * is not wrapped in GuestOnly on purpose: a recovery session signs her in,
 * and GuestOnly would send her to /home before she could set a password.
 */
export function ResetPasswordPage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState<ResetPasswordValues>({ password: "" });
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const parsed = resetPasswordSchema.safeParse(values);
  const errors = fieldErrors(parsed.success ? undefined : parsed.error);
  const showError = touched ? errors.password : undefined;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (!parsed.success || submitting) return;
    setSubmitting(true);
    setFormError(null);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    if (error) {
      setFormError(friendlyAuthError(error, "login"));
      setSubmitting(false);
      return;
    }
    // Sign out of the recovery session so she lands on /login and signs in
    // with her new password.
    await signOut();
    await navigate({ to: "/login", replace: true });
  }

  if (loading) {
    return (
      <main className="page-shell flex min-h-dvh flex-col items-center justify-center gap-3 text-foreground">
        <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
        <p className="text-base font-semibold">Loading…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="page-shell flex min-h-dvh flex-col pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <PageHeader title="Set a new password" />
        <p className="mt-4 text-base leading-relaxed text-foreground">
          This link has expired or was already used. Ask for a new one and try again.
        </p>
        <div className="mt-auto pt-8">
          <Link
            to="/forgot-password"
            className="flex h-[52px] w-full items-center justify-center rounded-full bg-primary px-6 text-base font-bold text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Ask for a new link
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell flex min-h-dvh flex-col pb-[calc(2rem+env(safe-area-inset-bottom))]">
      <PageHeader title="Set a new password" />
      <form noValidate onSubmit={onSubmit} className="mt-8 flex flex-1 flex-col">
        <FormField id="password" label="New password" error={showError}>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            value={values.password}
            onChange={(e) => setValues({ password: e.target.value })}
            onBlur={() => setTouched(true)}
            aria-invalid={Boolean(showError)}
          />
        </FormField>
        <p className="mt-3 text-[15px] text-foreground">
          Your password needs at least 8 characters.
        </p>
        <div className="mt-auto space-y-4 pt-8">
          <FormError message={formError} />
          <PrimaryButton type="submit" disabled={submitting} aria-busy={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
                Saving…
              </>
            ) : (
              "Save new password"
            )}
          </PrimaryButton>
        </div>
      </form>
    </main>
  );
}
