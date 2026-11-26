import { useState } from "react";

import { PrimaryButton } from "@/components/Buttons";
import { Logo } from "@/components/Logo";
import { PageHeader } from "@/components/PageHeader";

import { isIOS, isInstalled, useInstallPrompt } from "./useInstallPrompt";

/** How to install Mamagist on your phone. */
export function InstallPage() {
  const { canInstall, installed, install } = useInstallPrompt();
  const [message, setMessage] = useState<string | null>(null);
  const ios = isIOS();

  async function onInstall() {
    const accepted = await install();
    setMessage(
      accepted
        ? "Thank you. Mamagist is installing."
        : "No problem. You can install it later from this page.",
    );
  }

  return (
    <main className="page-shell">
      <Logo />
      <div className="mt-4">
        <PageHeader title="Install Mamagist" />
      </div>
      <p className="mt-3 text-base leading-relaxed text-foreground">
        Add Mamagist to your home screen so it opens like an app, even when your
        connection is slow.
      </p>

      {installed ? (
        <div className="mt-5 rounded-[20px] bg-card p-4 text-foreground">
          <p className="text-base font-bold">Mamagist is already installed.</p>
          <p className="mt-1 text-base">You are using the installed app now.</p>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {ios ? (
            <div className="rounded-[20px] border border-border bg-surface p-4">
              <h2 className="text-[20px] leading-tight font-extrabold text-foreground">
                On iPhone
              </h2>
              <ol className="mt-2 list-decimal space-y-2 pl-5 text-base leading-relaxed text-foreground">
                <li>Tap the Share button at the bottom of Safari.</li>
                <li>Tap “Add to Home Screen”.</li>
                <li>Tap “Add” at the top right.</li>
              </ol>
              <p className="mt-3 text-[15px] text-foreground">
                You need iOS 16.4 or newer, and Safari. It does not work from Chrome
                on iPhone.
              </p>
            </div>
          ) : (
            <div className="rounded-[20px] border border-border bg-surface p-4">
              <h2 className="text-[20px] leading-tight font-extrabold text-foreground">
                On Android
              </h2>
              {canInstall ? (
                <>
                  <p className="mt-2 text-base leading-relaxed text-foreground">
                    Tap the button below and then “Install” in the box that appears.
                  </p>
                  <PrimaryButton type="button" className="mt-4" onClick={() => void onInstall()}>
                    Install Mamagist
                  </PrimaryButton>
                </>
              ) : (
                <ol className="mt-2 list-decimal space-y-2 pl-5 text-base leading-relaxed text-foreground">
                  <li>Tap the three dots at the top right of Chrome.</li>
                  <li>Tap “Install app” or “Add to Home screen”.</li>
                  <li>Tap “Install”.</li>
                </ol>
              )}
              {message ? (
                <p className="mt-3 text-base font-semibold text-foreground">{message}</p>
              ) : null}
            </div>
          )}

          <div className="rounded-[20px] border border-border bg-surface p-4">
            <h2 className="text-[20px] leading-tight font-extrabold text-foreground">
              On a computer
            </h2>
            <p className="mt-2 text-base leading-relaxed text-foreground">
              Open Mamagist in Chrome or Edge, then look for the install icon in the
              address bar.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
