import { Outlet, createFileRoute } from "@tanstack/react-router";

import { BottomBar } from "@/components/BottomBar";

// Pathless layout for every page that shows the bottom bar.
export const Route = createFileRoute("/_tabs")({
  component: TabsLayout,
});

function TabsLayout() {
  return (
    <>
      {/* Bottom space so the bar (and the phone's safe area) never covers content. */}
      <div className="pb-[calc(8rem+env(safe-area-inset-bottom))]">
        <Outlet />
      </div>
      <BottomBar />
    </>
  );
}
