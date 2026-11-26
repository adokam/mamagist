import { Navigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

import { useAuth } from "./AuthProvider";

/** Simple screen shown while the saved session is being checked. */
export function AuthLoadingScreen() {
  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center gap-3 text-foreground"
      aria-busy="true"
      aria-live="polite"
    >
      <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
      <p className="text-base font-semibold">Loading…</p>
    </main>
  );
}

/** Signed-out visitors are sent to /login. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/** Signed-in users are sent to /home (used on /login and /signup), or to `to` when given. */
export function GuestOnly({
  children,
  to = "/home",
}: {
  children: ReactNode;
  to?: "/home" | "/signup/period";
}) {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoadingScreen />;
  if (user) return <Navigate to={to} replace />;
  return <>{children}</>;
}
