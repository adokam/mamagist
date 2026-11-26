/**
 * Fresh Green theme — the single source of every color in the app.
 *
 * To switch the whole app to another color, change ONE word:
 * ACTIVE_THEME below, e.g. `export const ACTIVE_THEME: ThemeName = "plum";`
 *
 * Every screen reads colors only through the semantic tokens in these
 * palettes (background, surface, card, ink, muted, line, primary,
 * primary-contrast, accent, alert, alert-border, primary-dark). The tokens
 * are applied as CSS variables on <html> by applyPalette() (called from
 * src/features/settings/darkMode.ts whenever the light/dark mode changes),
 * and src/styles.css maps them to Tailwind utilities. No screen file
 * contains a hex value. The :root / .dark fallbacks in styles.css match the
 * green palette and exist only for the first paint, before JavaScript runs.
 *
 * Token jobs:
 * - background: page background. surface: soft panels, summary cards.
 *   card: white cards, inputs, chat bubbles, bottom bar.
 *   ink: main text. muted: secondary text. line: borders and tracks.
 *   primary: buttons, progress bars, active items. primary-contrast: text
 *   on primary. accent: the Ask Debby / Community card background.
 *   alert: safety bubble background. alert-border: its 2px border.
 *   primary-dark: the darker end of primary gradients (hero, pregnancy card).
 */

export type ThemeName = "green" | "plum" | "red";

export type TokenName =
  | "background"
  | "surface"
  | "card"
  | "ink"
  | "muted"
  | "line"
  | "primary"
  | "primary-contrast"
  | "accent"
  | "alert"
  | "alert-border"
  | "primary-dark";

export type Palette = Record<TokenName, string>;

export type PalettePair = { light: Palette; dark: Palette };

export const PALETTES: Record<ThemeName, PalettePair> = {
  green: {
    light: {
      background: "#FFFFFF",
      surface: "#F1F6F3",
      card: "#FFFFFF",
      ink: "#12261C",
      muted: "#5B6B63",
      line: "#DCE5E0",
      primary: "#1E7A4F",
      "primary-contrast": "#FFFFFF",
      accent: "#FFD3C0",
      alert: "#FFF1E8",
      "alert-border": "#12261C",
      "primary-dark": "#14603C",
    },
    dark: {
      background: "#0D1F16",
      surface: "#142A1F",
      card: "#1A3327",
      ink: "#EDF5F0",
      muted: "#A7BCAF",
      line: "#2C463A",
      primary: "#4CC38A",
      "primary-contrast": "#0D1F16",
      accent: "#7A4A3A",
      alert: "#3A231B",
      "alert-border": "#F0C4AC",
      "primary-dark": "#2E9E6B",
    },
  },
  plum: {
    light: {
      background: "#FFFFFF",
      surface: "#F8F1F6",
      card: "#FFFFFF",
      ink: "#2A1426",
      muted: "#6F5A69",
      line: "#E8D9E3",
      primary: "#7A2E6B",
      "primary-contrast": "#FFFFFF",
      accent: "#F7B7CF",
      alert: "#FFF1E8",
      "alert-border": "#2A1426",
      "primary-dark": "#5C1F51",
    },
    dark: {
      background: "#220F1E",
      surface: "#2D1627",
      card: "#371D30",
      ink: "#F8F1F6",
      muted: "#C0A5B4",
      line: "#4B3143",
      primary: "#D98CC4",
      "primary-contrast": "#220F1E",
      accent: "#5E2F4E",
      alert: "#38202E",
      "alert-border": "#EFC2D6",
      "primary-dark": "#C07AA8",
    },
  },
  red: {
    light: {
      background: "#FFFFFF",
      surface: "#F2F2F3",
      card: "#FFFFFF",
      ink: "#0B0B0C",
      muted: "#5E5E63",
      line: "#E3E3E6",
      primary: "#E5083A",
      "primary-contrast": "#FFFFFF",
      accent: "#FFD0D9",
      alert: "#FFF1E8",
      "alert-border": "#0B0B0C",
      "primary-dark": "#B0062E",
    },
    dark: {
      background: "#1E0D11",
      surface: "#2A1318",
      card: "#331A20",
      ink: "#F8F1F2",
      muted: "#C2A6AB",
      line: "#4A2A31",
      primary: "#FF7A96",
      "primary-contrast": "#1E0D11",
      accent: "#5C2E39",
      alert: "#381E23",
      "alert-border": "#F0C2CA",
      "primary-dark": "#D95772",
    },
  },
};

/** Change this one word to switch the whole app's color. */
export const ACTIVE_THEME: ThemeName = "green";

export function activePalette(mode: "light" | "dark"): Palette {
  return PALETTES[ACTIVE_THEME][mode];
}

const TOKEN_NAMES: TokenName[] = [
  "background",
  "surface",
  "card",
  "ink",
  "muted",
  "line",
  "primary",
  "primary-contrast",
  "accent",
  "alert",
  "alert-border",
  "primary-dark",
];

/** Write the active palette's CSS variables onto <html>. */
export function applyPalette(): void {
  if (typeof document === "undefined") return;
  const dark = document.documentElement.classList.contains("dark");
  const palette = activePalette(dark ? "dark" : "light");
  const root = document.documentElement.style;
  for (const name of TOKEN_NAMES) {
    root.setProperty(`--${name}`, palette[name]);
  }
}

/**
 * Apply the palette now and re-apply whenever the .dark class changes
 * (the Settings dark-mode toggle and the phone setting both flip it).
 * Returns a cleanup function.
 */
export function initPalette(): () => void {
  applyPalette();
  if (typeof MutationObserver === "undefined") return () => undefined;
  const observer = new MutationObserver((mutations) => {
    if (mutations.some((m) => m.attributeName === "class")) applyPalette();
  });
  observer.observe(document.documentElement, { attributes: true });
  return () => observer.disconnect();
}
