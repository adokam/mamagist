import { useCallback, useEffect, useState } from "react";

/** Her saved dark mode choice. "system" means follow the phone setting. */
export type ThemeChoice = "light" | "dark" | "system";

const STORAGE_KEY = "mamagist:theme";

/** "dark" or "light" for a saved choice and what the phone prefers. */
export function resolveTheme(choice: ThemeChoice, prefersDark: boolean): "dark" | "light" {
  if (choice === "dark") return "dark";
  if (choice === "light") return "light";
  return prefersDark ? "dark" : "light";
}

export function getSavedChoice(): ThemeChoice {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light" || saved === "system") return saved;
  } catch {
    // Storage blocked: fall back to the phone setting.
  }
  return "system";
}

function prefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Put the right theme on the page now. Call once when the app starts. */
export function applyTheme(): void {
  const theme = resolveTheme(getSavedChoice(), prefersDark());
  document.documentElement.classList.toggle("dark", theme === "dark");
}

/**
 * Apply the theme on load and follow the phone setting while she has not
 * saved a choice of her own. Returns a cleanup function.
 */
export function initTheme(): () => void {
  applyTheme();
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onChange = () => {
    if (getSavedChoice() === "system") applyTheme();
  };
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/** Her dark mode choice, saved on the device. */
export function useDarkMode() {
  const [choice, setChoiceState] = useState<ThemeChoice>(() => getSavedChoice());
  const [dark, setDark] = useState(
    () => resolveTheme(getSavedChoice(), prefersDark()) === "dark",
  );

  const setChoice = useCallback((next: ThemeChoice) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Choice is a nice-to-have when storage is blocked.
    }
    setChoiceState(next);
    const resolved = resolveTheme(next, prefersDark());
    setDark(resolved === "dark");
    document.documentElement.classList.toggle("dark", resolved === "dark");
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (getSavedChoice() === "system") {
        setDark(media.matches);
        document.documentElement.classList.toggle("dark", media.matches);
      }
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return { choice, dark, setChoice };
}
