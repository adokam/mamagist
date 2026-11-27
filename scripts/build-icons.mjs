// Build the app icons from one SVG source (public/icon.svg).
// Runs as part of `bun run build` / `npm run build` (see package.json "build"),
// so Vercel makes the PNGs on every deploy and nobody has to upload them.
// Fails loudly (non-zero exit) if the SVG is missing or any PNG cannot be
// written or verified, so a broken icon breaks the build instead of shipping
// silently. Run on its own with: node scripts/build-icons.mjs
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(ROOT, "public", "icon.svg");
const GREEN = "#1E7A4F";
// Maskable mark size: 60% of the 512px square, so the heart stays inside the
// middle 60% (the safe zone) when Android masks the icon.
const MASKABLE_MARK = 307;

export const ICON_OUTPUTS = [
  { file: "icon-192.png", size: 192, kind: "rounded" },
  { file: "icon-512.png", size: 512, kind: "rounded" },
  { file: "icon-maskable-512.png", size: 512, kind: "maskable" },
  { file: "apple-touch-icon.png", size: 180, kind: "opaque" },
  { file: "favicon.png", size: 64, kind: "rounded" },
];

/** Render the source SVG at a size, keeping its transparent corners. */
async function roundedMark(svg, size) {
  return sharp(svg).resize(size, size).png().toBuffer();
}

async function buildOne(svg, output) {
  const dest = path.join(ROOT, "public", output.file);
  let buffer;
  if (output.kind === "rounded") {
    buffer = await roundedMark(svg, output.size);
  } else if (output.kind === "opaque") {
    // Apple touch icons must have no transparency: flatten the rounded mark
    // onto an opaque green square.
    buffer = await sharp(svg)
      .resize(output.size, output.size)
      .flatten({ background: GREEN })
      .removeAlpha()
      .png()
      .toBuffer();
  } else if (output.kind === "maskable") {
    // Full square, no rounded corners: an opaque green square with the mark
    // rendered smaller and centred, so the heart stays in the middle 60%.
    const offset = Math.round((output.size - MASKABLE_MARK) / 2);
    const mark = await roundedMark(svg, MASKABLE_MARK);
    buffer = await sharp({
      create: {
        width: output.size,
        height: output.size,
        channels: 3,
        background: GREEN,
      },
    })
      .composite([{ input: mark, left: offset, top: offset }])
      // Compositing a mark with transparent corners leaves an alpha channel
      // behind; flatten it away so the square is fully opaque.
      .flatten({ background: GREEN })
      .removeAlpha()
      .png()
      .toBuffer();
  } else {
    throw new Error(`Unknown icon kind: ${output.kind}`);
  }
  await writeFile(dest, buffer);

  // Verify what was written: right pixel size, and no transparency where the
  // icon must be opaque.
  const meta = await sharp(dest).metadata();
  if (meta.width !== output.size || meta.height !== output.size) {
    throw new Error(
      `${output.file} is ${meta.width}x${meta.height}, expected ${output.size}x${output.size}`,
    );
  }
  if (output.kind !== "rounded" && meta.hasAlpha) {
    throw new Error(`${output.file} still has transparency`);
  }
  return dest;
}

export async function buildIcons() {
  let svg;
  try {
    svg = await readFile(SOURCE);
  } catch {
    throw new Error(`Icon source is missing: ${SOURCE}`);
  }
  await mkdir(path.join(ROOT, "public"), { recursive: true });
  for (const output of ICON_OUTPUTS) {
    const dest = await buildOne(svg, output);
    console.log(`icon: wrote ${path.relative(ROOT, dest)} (${output.size}x${output.size})`);
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    await buildIcons();
  } catch (error) {
    console.error(`icon build failed: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}
