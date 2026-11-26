import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

function makeRouter(path: string) {
  return createRouter({
    routeTree,
    context: { queryClient: new QueryClient() },
    history: createMemoryHistory({ initialEntries: [path] }),
  });
}

describe("App routing", () => {
  it("sends / to /home", async () => {
    const router = makeRouter("/");
    await router.load();
    expect(router.state.location.pathname).toBe("/home");
  });

  it("sends unknown addresses to /home", async () => {
    const router = makeRouter("/no-such-page");
    await router.load();
    expect(router.state.location.pathname).toBe("/home");
  });

  it.each([
    "/home",
    "/debby",
    "/community",
    "/daily",
    "/profile",
    "/login",
    "/signup",
    "/signup/period",
    "/signup/details",
    "/pregnancy-date",
    "/install",
    "/settings",
    "/terms",
    "/privacy",
  ])("has a page at %s", (path) => {
    const router = makeRouter(path);
    const leaf = router.matchRoutes(path).at(-1)?.routeId;
    expect(leaf).not.toBe("/$");
    expect(leaf).not.toBe("__root__");
  });
});
