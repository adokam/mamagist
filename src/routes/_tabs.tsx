import { Outlet, createFileRoute } from "@tanstack/react-router";

import { BottomBar } from "@/components/BottomBar";
import { RequireAuth } from "@/features/auth/AuthGuards";

// Pathless layout for every page that shows the bottom bar. Signed-out visitors go to /login.
export const Route = createFileRoute("/_tabs")({
  component: TabsLayout,
});

function TabsLayout() {
  return (
    <RequireAuth>
      {/* Bottom space so the bar (and the phone's safe area) never covers content. */}
      <div className="pb-[calc(6rem+env(safe-area-inset-bottom))]">
        <Outlet />
      </div>
      <BottomBar />
    </RequireAuth>
  );
}
