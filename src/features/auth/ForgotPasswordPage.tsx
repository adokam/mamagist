import { Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import { PrimaryButton } from "@/components/Buttons";
import { PageHeader } from "@/components/PageHeader";
import { TextInput } from "@/components/TextInput";
import { supabase } from "@/integrations/supabase/client";

import { FormField } from "./FormField";
import { fieldErrors, forgotPasswordSchema, type ForgotPasswordValues } from "./validation";

/**
 * Where the reset email sends her back to. Built from the site she is on, so
 * it works on the Vercel site and on any other host without a hard-coded
 * domain. The matching address must be allowlisted in Supabase (see README).
 */
export function resetPasswordUrl(): string {
  return `${window.location.origin}/reset-password`;
}

const SENT_MESSAGE =
  "If that email has an account, we sent a reset link. Check your inbox and your spam folder.";

export function ForgotPasswordPage() {
  const [values, setValues] = useState<ForgotPasswordValues>({ email: "" });
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const parsed = forgotPasswordSchema.safeParse(values);
  const errors = fieldErrors(parsed.success ? undefined : parsed.error);
  const showError = touched ? errors.email : undefined;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (!parsed.success || submitting) return;
    setSubmitting(true);
    // Always show the same message, whether or not the email exists, so
    // nobody can use this screen to find out who has an account.
    // The result is not shown either way: the same message appears whether
    // or not the email has an account.
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: resetPasswordUrl(),
    });
    setSubmitting(false);
    setSent(true);
  }

  return (
    <main className="page-shell flex min-h-dvh flex-col pb-[calc(2rem+env(safe-area-inset-bottom))]">
      <PageHeader title="Forgot password?" />
      {sent ? (
        <p className="mt-4 text-base leading-relaxed text-foreground" role="status">
          {SENT_MESSAGE}
        </p>
      ) : (
        <form noValidate onSubmit={onSubmit} className="mt-8 flex flex-1 flex-col">
          <p className="text-base leading-relaxed text-foreground">
            Enter the email you signed up with and we will send you a link to set a
            new password.
          </p>
          <div className="mt-6">
            <FormField id="email" label="Email" error={showError}>
              <TextInput
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={255}
                value={values.email}
                onChange={(e) => setValues({ email: e.target.value })}
                onBlur={() => setTouched(true)}
                aria-invalid={Boolean(showError)}
              />
            </FormField>
          </div>
          <div className="mt-auto space-y-4 pt-8">
            <PrimaryButton type="submit" disabled={submitting} aria-busy={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
                  Sending…
                </>
              ) : (
                "Send reset link"
              )}
            </PrimaryButton>
          </div>
        </form>
      )}
    </main>
  );
}
