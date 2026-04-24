import type { SurpriseVibe, InteractiveElementType } from "./types";

export const VIBES: SurpriseVibe[] = [
  "funny",
  "emotional",
  "playful",
  "warm",
  "bold",
  "chaotic",
];

export const INTERACTION_TYPES: InteractiveElementType[] = [
  "tap_reveal",
  "mini_quiz",
  "choice_path",
  "countdown_reveal",
];

export const CURATED_STYLES = [
  {
    id: "soft-party",
    label: "Soft Party",
    typography: "display-rounded",
    paletteId: "cake-pop",
    motion: "float-confetti",
  },
  {
    id: "night-glow",
    label: "Night Glow",
    typography: "modern-bold",
    paletteId: "midnight-neon",
    motion: "glow-pulse",
  },
  {
    id: "scrapbook-pop",
    label: "Scrapbook Pop",
    typography: "playful-mix",
    paletteId: "memory-collage",
    motion: "paper-pop",
  },
  {
    id: "editorial-luxe",
    label: "Editorial Luxe",
    typography: "elegant-serif",
    paletteId: "gold-rose",
    motion: "slow-fade",
  },
] as const;

export const CURATED_PALETTES: Record<string, { bg: string; accent: string; text: string; card: string }> = {
  "cake-pop":      { bg: "#fce7f3", accent: "#ec4899", text: "#1f2937", card: "#fff0f7" },
  "midnight-neon": { bg: "#0f0f1a", accent: "#a855f7", text: "#f9fafb", card: "#1a1a2e" },
  "memory-collage":{ bg: "#fefce8", accent: "#f59e0b", text: "#1f2937", card: "#fffbeb" },
  "gold-rose":     { bg: "#fff1f2", accent: "#be123c", text: "#1c1917", card: "#fff5f6" },
};

export const PREVIEW_BLUR_AMOUNT = 15;

export const WEB_SHARE_BASE_PATH = "/e";
