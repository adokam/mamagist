import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { AuthLogoMark } from "@/features/auth/AuthIntro";
import { cn } from "@/lib/utils";

/**
 * Enticing top area for /login and /signup: a primary gradient about
 * 220px tall with soft round decorative shapes, the logo mark, the name
 * in white, and the warm line. In dark mode the gradient uses the dark
 * primary shades and the sheet below uses the dark background token.
 */
export function AuthHero() {
  return (
    <div className="relative h-[220px] shrink-0 overflow-hidden bg-gradient-to-b from-primary to-primary-dark">
      <div aria-hidden className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-primary-contrast/10" />
      <div aria-hidden className="absolute top-24 -left-10 h-32 w-32 rounded-full bg-primary-contrast/10" />
      <div aria-hidden className="absolute right-16 bottom-6 h-16 w-16 rounded-full bg-primary-contrast/10" />
      <div className="relative flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
        <AuthLogoMark />
        <p className="text-2xl font-extrabold tracking-tight text-primary-contrast">Mamagist</p>
        <p className="text-base text-primary-contrast/90">Your pregnancy guide, week by week.</p>
      </div>
    </div>
  );
}

/** White sheet that overlaps the hero, with 28px top corners, holding the form. */
export function AuthSheet({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative z-10 -mt-6 flex flex-1 flex-col rounded-t-[28px] bg-card px-5 pt-5 pb-[calc(2rem+env(safe-area-inset-bottom))]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Pill switch at the top of the sheet on /login and signup step 1. */
export function AuthSwitch({ active }: { active: "login" | "signup" }) {
  const part = (to: "/login" | "/signup", label: string, isActive: boolean) => (
    <Link
      to={to}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex flex-1 items-center justify-center rounded-full py-2.5 text-base font-bold",
        isActive ? "bg-primary text-primary-contrast" : "bg-surface text-foreground",
      )}
    >
      {label}
    </Link>
  );
  return (
    <div className="flex rounded-full bg-surface p-1" role="navigation" aria-label="Login or sign up">
      {part("/login", "Login", active === "login")}
      {part("/signup", "Sign up", active === "signup")}
    </div>
  );
}
