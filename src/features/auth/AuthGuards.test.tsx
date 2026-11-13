import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GuestOnly, RequireAuth } from "./AuthGuards";

const auth = { user: null as object | null, loading: false };
vi.mock("./AuthProvider", () => ({ useAuth: () => auth }));

function renderAt(path: string) {
  const root = createRootRoute({ component: () => <Outlet /> });
  const home = createRoute({
    getParentRoute: () => root,
    path: "/home",
    component: () => (
      <RequireAuth>
        <p>home page</p>
      </RequireAuth>
    ),
  });
  const login = createRoute({
    getParentRoute: () => root,
    path: "/login",
    component: () => (
      <GuestOnly>
        <p>login page</p>
      </GuestOnly>
    ),
  });
  const router = createRouter({
    routeTree: root.addChildren([home, login]),
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  render(<RouterProvider router={router} />);
  return router;
}

describe("auth guards", () => {
  beforeEach(() => {
    auth.user = null;
    auth.loading = false;
  });

  it("sends signed-out visitors from /home to /login", async () => {
    const router = renderAt("/home");
    expect(await screen.findByText("login page")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/login");
  });

  it("sends signed-in users from /login to /home", async () => {
    auth.user = { id: "u1" };
    const router = renderAt("/login");
    expect(await screen.findByText("home page")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/home");
  });

  it("shows the loading screen while the session is checked", async () => {
    auth.loading = true;
    renderAt("/home");
    expect(await screen.findByText("Loading…")).toBeInTheDocument();
    expect(screen.queryByText("home page")).not.toBeInTheDocument();
  });
});
