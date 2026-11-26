import { Link } from "@tanstack/react-router";

import { WhiteCard } from "@/components/Cards";

import { useInstallPrompt } from "./useInstallPrompt";

/** Small card on Home that links to /install. Hidden once installed or dismissed. */
export function InstallCard() {
  const { installed, dismissed, dismiss } = useInstallPrompt();
  if (installed || dismissed) return null;
  return (
    <WhiteCard>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h2 className="text-[20px] leading-tight font-extrabold text-foreground">
            Install Mamagist
          </h2>
          <p className="mt-1 text-base text-foreground">
            Add it to your home screen so it opens like an app.
          </p>
          <Link
            to="/install"
            className="mt-3 inline-flex h-[52px] items-center justify-center rounded-full bg-primary px-6 text-base font-bold text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            How to install
          </Link>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Hide install card"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          ✕
        </button>
      </div>
    </WhiteCard>
  );
}
