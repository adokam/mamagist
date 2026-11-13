import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import { PrimaryButton } from "@/components/Buttons";
import { PageHeader } from "@/components/PageHeader";
import { TextInput } from "@/components/TextInput";
import { supabase } from "@/integrations/supabase/client";

import { friendlyAuthError } from "./authErrors";
import { FormError, FormField } from "./FormField";
import { PasswordInput } from "./PasswordInput";
import { fieldErrors, loginSchema, type LoginValues } from "./validation";

export function LoginPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState<LoginValues>({ email: "", password: "" });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const parsed = loginSchema.safeParse(values);
  const errors = fieldErrors(parsed.success ? undefined : parsed.error);
  const show = (field: keyof LoginValues) => (touched[field] ? errors[field] : undefined);
  const touch = (field: keyof LoginValues) => () => setTouched((t) => ({ ...t, [field]: true }));

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const result = loginSchema.safeParse(values);
    if (!result.success) {
      setTouched({ email: true, password: true });
      return;
    }
    if (submitting) return;

    setSubmitting(true);
    setFormError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword(result.data);
      if (error) {
        setFormError(friendlyAuthError(error, "login"));
        return;
      }
      await navigate({ to: "/home", replace: true });
    } catch (error) {
      setFormError(friendlyAuthError(error, "login"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-shell flex min-h-dvh flex-col pb-[calc(2rem+env(safe-area-inset-bottom))]">
      <PageHeader title="Welcome back" />

      <form noValidate onSubmit={onSubmit} className="mt-8 flex flex-1 flex-col">
        <div className="space-y-5">
          <FormField id="email" label="Email" error={show("email")}>
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
              autoComplete="current-password"
              value={values.password}
              onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
              onBlur={touch("password")}
              aria-invalid={Boolean(show("password"))}
              aria-describedby={show("password") ? "password-error" : undefined}
            />
          </FormField>
        </div>

        <div className="mt-auto space-y-4 pt-8">
          <FormError message={formError} />
          <PrimaryButton type="submit" disabled={submitting} aria-busy={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
                Logging in…
              </>
            ) : (
              "Log in"
            )}
          </PrimaryButton>
          <p className="text-center text-[17px] text-foreground">
            New here?{" "}
            <Link to="/signup" className="font-bold underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </div>
      </form>
    </main>
  );
}
