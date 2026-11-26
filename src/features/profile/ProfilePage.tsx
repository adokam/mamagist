import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { WhiteCard } from "@/components/Cards";
import { PlaceholderPage } from "@/components/PlaceholderPage";

/** Placeholder profile. Task 4 replaces this with the real screen. Log out lives in Settings. */
export function ProfilePage() {
  return (
    <>
      <PlaceholderPage title="Profile" />
      <div className="mt-4 px-5">
        <Link to="/settings" className="block rounded-[20px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
          <WhiteCard className="flex items-center justify-between gap-3">
            <span className="text-base font-bold text-foreground">Settings</span>
            <ChevronRight className="h-6 w-6 shrink-0 text-foreground" aria-hidden />
          </WhiteCard>
        </Link>
      </div>
    </>
  );
}
