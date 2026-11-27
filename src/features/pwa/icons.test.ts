// The app icons come from one SVG source; the manifest, the page head and the
// build script must all agree on the same file names. No browser needed.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { ICON_OUTPUTS } from "../../../scripts/build-icons.mjs";

// Vitest serves test files over http, so import.meta.url is not a file URL
// here; resolve repo files from the working directory (the repo root) instead.
const readText = (rel: string) => readFile(path.join(process.cwd(), rel), "utf-8");

describe("app icons", () => {
  it("icon.svg is the deep green square with a white heart, like Logo.tsx", async () => {
    const svg = await readText("public/icon.svg");
    expect(svg).toContain('fill="#1E7A4F"');
    expect(svg).toContain('fill="#FFFFFF"');
    // Same heart path as the mark in src/components/Logo.tsx.
    expect(svg).toContain("M256 400 C 200 340 130 280 130 205");
  });

  it("the build script makes exactly the five expected PNGs", () => {
    expect(ICON_OUTPUTS).toEqual([
      { file: "icon-192.png", size: 192, kind: "rounded" },
      { file: "icon-512.png", size: 512, kind: "rounded" },
      { file: "icon-maskable-512.png", size: 512, kind: "maskable" },
      { file: "apple-touch-icon.png", size: 180, kind: "opaque" },
      { file: "favicon.png", size: 64, kind: "rounded" },
    ]);
  });

  it("the manifest points to the SVG and the three PWA PNGs", async () => {
    const manifest = JSON.parse(await readText("public/manifest.webmanifest")) as {
      icons: { src: string; sizes: string; type: string; purpose?: string }[];
    };
    expect(manifest.icons.map((icon) => icon.src)).toEqual([
      "/icon.svg",
      "/icon-192.png",
      "/icon-512.png",
      "/icon-maskable-512.png",
    ]);
    const maskable = manifest.icons.find((icon) => icon.src === "/icon-maskable-512.png");
    expect(maskable?.purpose).toBe("maskable");
    expect(maskable?.sizes).toBe("512x512");
  });

  it("the page head links the SVG favicon with the PNG as fallback", async () => {
    const rootRoute = await readText("src/routes/__root.tsx");
    expect(rootRoute).toContain('href: "/icon.svg"');
    expect(rootRoute).toContain('type: "image/svg+xml"');
    expect(rootRoute).toContain('href: "/favicon.png"');
    expect(rootRoute).toContain('href: "/apple-touch-icon.png"');
  });
});
