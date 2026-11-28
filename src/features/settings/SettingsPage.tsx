import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import { OutlineButton } from "@/components/Buttons";
import { LineCard } from "@/components/Cards";
import { LoadError } from "@/components/LoadError";
import { PageHeader } from "@/components/PageHeader";
import { clearDebbyMemory } from "@/features/ai-chat/debbyMemory";
import { useAuth } from "@/features/auth/AuthProvider";
import { FormError } from "@/features/auth/FormField";
import {
  privateProfileKey,
  updateMyPrivateProfile,
} from "@/features/profile/privateProfile";
import { friendlySaveError } from "@/features/profile/saveError";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

import { useDarkMode } from "./darkMode";

/** "09:30:00" from the database -> "09:30" for the time input. */
function shortTime(value: string | null): string {
  return value ? value.slice(0, 5) : "";
}

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const userId = user?.id ?? "";
  const navigate = useNavigate();
  const { dark, choice, setChoice } = useDarkMode();

  const reminders = useQuery({
    queryKey: [...privateProfileKey(userId), "reminders"],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("private_profiles")
        .select("reminders_enabled, reminder_time")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return data ?? { reminders_enabled: false, reminder_time: null as string | null };
    },
  });

  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedNote, setSavedNote] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearError, setClearError] = useState<string | null>(null);
  const [clearedNote, setClearedNote] = useState(false);

  useEffect(() => {
    if (reminders.data && !loaded) {
      setEnabled(reminders.data.reminders_enabled);
      setTime(shortTime(reminders.data.reminder_time));
      setLoaded(true);
    }
  }, [reminders.data, loaded]);

  async function saveReminders(nextEnabled: boolean, nextTime: string) {
    if (!userId || saving) return;
    setSaving(true);
    setSaveError(null);
    setSavedNote(false);
    try {
      await updateMyPrivateProfile(userId, {
        reminders_enabled: nextEnabled,
        reminder_time: nextTime ? `${nextTime}:00` : null,
      });
      setSavedNote(true);
    } catch (e) {
      setSaveError(friendlySaveError(e));
    } finally {
      setSaving(false);
    }
  }

  async function onLogOut() {
    await signOut();
    await navigate({ to: "/login", replace: true });
  }

  async function onClearMemory() {
    if (!userId || clearing) return;
    setClearing(true);
    setClearError(null);
    try {
      await clearDebbyMemory(userId);
      setClearOpen(false);
      setClearedNote(true);
    } catch {
      setClearError("We couldn't clear Debby's notes. Please try again.");
    } finally {
      setClearing(false);
    }
  }

  return (
    <main className="page-shell">
      <PageHeader title="Settings" />

      {reminders.isError ? (
        <div className="mt-4">
          <LoadError onRetry={() => void reminders.refetch()} />
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <LineCard>
            <Row label="Dark mode" hint={choice === "system" ? "Using your phone setting" : null}>
              <button
                type="button"
                role="switch"
                aria-checked={dark}
                aria-label="Dark mode"
                onClick={() => setChoice(dark ? "light" : "dark")}
                className={cn(
                  "flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  dark ? "justify-end bg-primary" : "justify-start bg-line",
                )}
              >
                <span className="h-6 w-6 rounded-full bg-primary-contrast" />
              </button>
            </Row>
          </LineCard>

          <LineCard>
            <Row label="Daily reminders">
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                aria-label="Daily reminders"
                disabled={!loaded || saving}
                onClick={() => {
                  const next = !enabled;
                  setEnabled(next);
                  void saveReminders(next, time);
                }}
                className={cn(
                  "flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50",
                  enabled ? "justify-end bg-primary" : "justify-start bg-line",
                )}
              >
                <span className="h-6 w-6 rounded-full bg-primary-contrast" />
              </button>
            </Row>
            <div className="mt-3 flex items-center justify-between gap-3">
              <label htmlFor="reminder-time" className="text-base font-semibold text-foreground">
                Reminder time
              </label>
              <input
                id="reminder-time"
                type="time"
                value={time}
                disabled={!loaded || saving}
                onChange={(e) => {
                  setTime(e.target.value);
                  void saveReminders(enabled, e.target.value);
                }}
                className="h-12 rounded-[20px] border border-input bg-card px-4 text-base text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
              />
            </div>
            <p className="mt-3 text-[15px] text-foreground">Reminders will start soon.</p>
            {savedNote ? (
              <p className="mt-1 text-[15px] font-semibold text-foreground">Saved.</p>
            ) : null}
            <FormError message={saveError} />
          </LineCard>

          <LineCard>
            <Row label="Language" hint="Debby answers in the language you write.">
              <span className="text-base font-bold text-foreground">English</span>
            </Row>
          </LineCard>

          <button
            type="button"
            onClick={() => {
              setClearError(null);
              setClearOpen(true);
            }}
            className="block w-full rounded-[20px] text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <LineCard className="flex items-center justify-between gap-3">
              <span className="text-base font-bold text-foreground">
                Clear what Debby remembers
              </span>
              <ChevronRight className="h-6 w-6 shrink-0 text-foreground" aria-hidden />
            </LineCard>
          </button>
          {clearedNote ? (
            <p className="px-1 text-[15px] font-semibold text-foreground">
              Done. Debby has forgotten her short notes about you.
            </p>
          ) : null}

          <LinkRow to="/install" label="Install the app" />
          <LinkRow to="/privacy" label="Privacy policy" />
          <LinkRow to="/terms" label="Terms of use" />

          <div className="pt-2">
            <OutlineButton type="button" onClick={() => void onLogOut()}>
              Log out
            </OutlineButton>
          </div>
        </div>
      )}

      {clearOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-6">
          <div
            role="dialog"
            aria-label="Clear what Debby remembers"
            className="w-full max-w-[340px] rounded-[20px] bg-card p-5 shadow-xl"
          >
            <p className="text-[18px] font-extrabold text-ink">Clear what Debby remembers?</p>
            <p className="mt-2 text-[15px] leading-relaxed text-foreground">
              Debby will forget the short notes she keeps about you. Your chats stay. She
              will still know your week and stage.
            </p>
            {clearError ? (
              <div className="mt-2">
                <FormError message={clearError} />
              </div>
            ) : null}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => void onClearMemory()}
                disabled={clearing}
                className="flex h-11 flex-1 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-contrast disabled:opacity-50"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setClearOpen(false)}
                disabled={clearing}
                className="flex h-11 flex-1 items-center justify-center rounded-full border-2 border-primary text-base font-bold text-primary disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-base font-bold text-foreground">{label}</span>
        {children}
      </div>
      {hint ? <p className="mt-1 text-[15px] text-foreground">{hint}</p> : null}
    </div>
  );
}

function LinkRow({ to, label }: { to: "/install" | "/privacy" | "/terms"; label: string }) {
  return (
    <Link to={to} className="block rounded-[20px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
      <LineCard className="flex items-center justify-between gap-3">
        <span className="text-base font-bold text-foreground">{label}</span>
        <ChevronRight className="h-6 w-6 shrink-0 text-foreground" aria-hidden />
      </LineCard>
    </Link>
  );
}
