import { useNavigate } from "@tanstack/react-router";

import { OutlineButton } from "@/components/Buttons";
import { PlaceholderPage } from "@/components/PlaceholderPage";
import { useAuth } from "@/features/auth/AuthProvider";

export function ProfilePage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function onLogOut() {
    await signOut();
    await navigate({ to: "/login", replace: true });
  }

  return (
    <>
      <PlaceholderPage title="Profile" />
      {/* Temporary. Settings will replace this button later. */}
      <div className="mt-8 px-6">
        <OutlineButton type="button" onClick={() => void onLogOut()}>
          Log out
        </OutlineButton>
      </div>
    </>
  );
}
