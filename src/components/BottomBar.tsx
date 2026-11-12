import { Link } from "@tanstack/react-router";
import { House, ListChecks, MessageCircleHeart, User, Users, type LucideIcon } from "lucide-react";

type BarItem = {
  to: "/home" | "/debby" | "/community" | "/daily" | "/profile";
  label: string;
  icon: LucideIcon;
};

const leftItems: BarItem[] = [
  { to: "/home", label: "Home", icon: House },
  { to: "/debby", label: "Debby", icon: MessageCircleHeart },
];
const rightItems: BarItem[] = [
  { to: "/daily", label: "Daily", icon: ListChecks },
  { to: "/profile", label: "Profile", icon: User },
];

function SideItem({ item }: { item: BarItem }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      className="group flex min-h-11 min-w-11 flex-1 flex-col items-center justify-center gap-1 text-foreground"
    >
      <Icon className="h-[22px] w-[22px] shrink-0" strokeWidth={2} aria-hidden />
      <span className="rounded-2xl px-4 py-2 text-sm leading-tight font-medium group-data-[status=active]:bg-card group-data-[status=active]:font-bold">
        {item.label}
      </span>
    </Link>
  );
}

/** Shared bottom navigation. Fixed to the bottom of the 430px app column. */
export function BottomBar() {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[430px] border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex h-[78px] items-stretch px-3">
        {leftItems.map((item) => (
          <SideItem key={item.to} item={item} />
        ))}

        <Link
          to="/community"
          className="flex min-w-11 flex-1 flex-col items-center justify-end gap-0.5 pb-1 text-foreground"
        >
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground ring-[6px] ring-background">
            <Users className="h-7 w-7" strokeWidth={2} aria-hidden />
          </span>
          <span className="mt-3 text-sm leading-tight font-bold">Community</span>
        </Link>

        {rightItems.map((item) => (
          <SideItem key={item.to} item={item} />
        ))}
      </div>
    </nav>
  );
}
