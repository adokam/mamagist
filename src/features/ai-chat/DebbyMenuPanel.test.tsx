import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DebbyMenuPanel } from "./DebbyMenuPanel";

vi.mock("@/features/auth/AuthProvider", () => ({
  useAuth: () => ({ user: null, session: null, loading: false, signOut: async () => {} }),
}));

function renderPanel(onClose = vi.fn()) {
  const queryClient = new QueryClient();
  const props = {
    open: true,
    onClose,
    chats: [],
    openChatId: null,
    fullName: "Daniel",
    timeZone: "Africa/Lagos",
    isLoading: false,
    isError: false,
    onRetry: vi.fn(),
    hasMore: false,
    loadingMore: false,
    onLoadMore: vi.fn(),
    onSelectChat: vi.fn(),
    onNewChat: vi.fn(),
    onProfile: vi.fn(),
  };
  render(
    <QueryClientProvider client={queryClient}>
      <DebbyMenuPanel {...props} />
    </QueryClientProvider>,
  );
  return { onClose };
}

describe("Debby menu panel close buttons", () => {
  it("has a close button in the header that closes the menu", () => {
    const { onClose } = renderPanel();
    // Two buttons share the name "Close menu": the dim layer first in the
    // document, the X button in the header second.
    const closeButtons = screen.getAllByRole("button", { name: "Close menu" });
    expect(closeButtons).toHaveLength(2);
    const xButton = closeButtons[1];
    // At least a 40px tap target: h-11 w-11 is 44px.
    expect(xButton.className).toContain("h-11");
    expect(xButton.className).toContain("w-11");
    fireEvent.click(xButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes the menu when the dim layer is tapped", () => {
    const { onClose } = renderPanel();
    const closeButtons = screen.getAllByRole("button", { name: "Close menu" });
    fireEvent.click(closeButtons[0]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows the avatar and the New chat button in the footer", () => {
    renderPanel();
    expect(screen.getByRole("button", { name: "Open your profile" })).toHaveTextContent("D");
    expect(screen.getByRole("button", { name: "New chat" })).toBeInTheDocument();
  });
});
