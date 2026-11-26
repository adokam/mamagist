import { useCallback, useEffect, useState } from "react";

/** The browser's install prompt event. Not in the DOM types yet, so defined here. */
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "mamagist:install-dismissed";

/** True when the app is already installed (standalone display mode or iOS standalone). */
export function isInstalled(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  return (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function wasDismissed(): boolean {
  try {
    return window.localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * The browser install prompt (Android/Chrome) when it is available, whether
 * the app is already installed, and the Home card's dismissed state.
 */
export function useInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => isInstalled());
  const [dismissed, setDismissed] = useState(() => wasDismissed());

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!promptEvent) return false;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    setPromptEvent(null);
    return choice.outcome === "accepted";
  }, [promptEvent]);

  const dismiss = useCallback(() => {
    try {
      window.localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Dismissal is a nice-to-have.
    }
    setDismissed(true);
  }, []);

  return { canInstall: promptEvent !== null, installed, dismissed, install, dismiss };
}

/** True on iPhone/iPad (Safari has no install prompt; it uses Share > Add to Home Screen). */
export function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(window.navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
}
