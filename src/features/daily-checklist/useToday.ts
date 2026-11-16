import { useEffect, useState } from "react";

import { todayInTimeZone } from "./today";

const CHECK_EVERY_MS = 30_000;

/**
 * Her today (YYYY-MM-DD) in her time zone. Worked out again when the app becomes visible,
 * gets focus, and every 30 seconds, so the list resets at midnight without a reload.
 */
export function useToday(timeZone: string | null | undefined): string {
  const [today, setToday] = useState(() => todayInTimeZone(timeZone));

  useEffect(() => {
    const update = () => setToday(todayInTimeZone(timeZone));
    const onVisible = () => {
      if (document.visibilityState === "visible") update();
    };
    update();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", update);
    window.addEventListener("pageshow", update);
    const timer = window.setInterval(update, CHECK_EVERY_MS);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", update);
      window.removeEventListener("pageshow", update);
      window.clearInterval(timer);
    };
  }, [timeZone]);

  return today;
}
