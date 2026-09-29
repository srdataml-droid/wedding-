import type { CSSProperties } from "react";

// Wedding website designs (D-011). Each one swaps the site's colour variables on the
// wedding page only. The names follow common aso-ebi colours.
// "wine" is the site's own palette. Primary colours all keep white text readable, and
// the gold tones are dark enough for small text on the page background.

export type ThemeId = "wine" | "emerald" | "royal" | "coral";

type Palette = {
  primary: string;
  primaryDeep: string;
  soft: string;
  gold: string;
  goldSoft: string;
  paper: string;
};

export const THEMES: { id: ThemeId; name: string; palette: Palette }[] = [
  {
    id: "wine",
    name: "Wine and gold",
    palette: {
      primary: "#7b2340",
      primaryDeep: "#5e1a31",
      soft: "#fbeef1",
      gold: "#8a6a35",
      goldSoft: "#f1e7d6",
      paper: "#f8f4ee",
    },
  },
  {
    id: "emerald",
    name: "Emerald",
    palette: {
      primary: "#1f5e4a",
      primaryDeep: "#164537",
      soft: "#e8f2ee",
      gold: "#86672b",
      goldSoft: "#efe8d4",
      paper: "#f6f5ef",
    },
  },
  {
    id: "royal",
    name: "Royal blue",
    palette: {
      primary: "#23407a",
      primaryDeep: "#182e59",
      soft: "#e9eef8",
      gold: "#83673a",
      goldSoft: "#eee7d6",
      paper: "#f5f6f9",
    },
  },
  {
    id: "coral",
    name: "Coral",
    palette: {
      primary: "#b0503d",
      primaryDeep: "#8c3d2f",
      soft: "#fbece7",
      gold: "#886334",
      goldSoft: "#f5e9d8",
      paper: "#fbf6f1",
    },
  },
];

export function isThemeId(value: string): value is ThemeId {
  return THEMES.some((t) => t.id === value);
}

export function themeById(id: string | null | undefined) {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

// CSS variables for a wrapper element. Everything inside that uses the wine, blush,
// gold or paper colours picks up the theme.
export function themeStyle(id: string | null | undefined): CSSProperties {
  const p = themeById(id).palette;
  return {
    "--color-wine": p.primary,
    "--color-wine-deep": p.primaryDeep,
    "--color-blush": p.soft,
    "--color-gold": p.gold,
    "--color-gold-soft": p.goldSoft,
    "--color-paper": p.paper,
    backgroundColor: p.paper,
  } as CSSProperties;
}
