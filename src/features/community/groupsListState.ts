// What the community menu sends through navigation state when it opens
// the groups list (declared on TanStack Router's HistoryState so
// navigate({ state: ... }) type-checks).
declare module "@tanstack/react-router" {
  interface HistoryState {
    focus?: string;
    createGroup?: boolean;
  }
}

// What the groups list should open with, from the navigation state the
// community menu sends (e.g. "Create a group" opens the create form).
// Pure function, no screen code.
export function groupsListInitialState(state: unknown): {
  showCreate: boolean;
  focusMine: boolean;
} {
  if (typeof state !== "object" || state === null) {
    return { showCreate: false, focusMine: false };
  }
  const s = state as Record<string, unknown>;
  return {
    showCreate: s["createGroup"] === true,
    focusMine: s["focus"] === "mine",
  };
}
