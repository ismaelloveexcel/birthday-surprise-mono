import type { Region, Locale } from "./types";

// ---------------------------------------------------------------------------
// Regional rules — consumed by AI pipeline Steps A and B
// ---------------------------------------------------------------------------

export interface RegionalRule {
  allowTeasing: boolean;
  respectElders: boolean;
  poeticBias: boolean;
  supportedLocales: Locale[];
  defaultLocale: Locale;
  culturalNotes: string;
}

export const REGIONAL_RULES: Record<Region, RegionalRule> = {
  gulf_mena: {
    allowTeasing: false,
    respectElders: true,
    poeticBias: true,
    supportedLocales: ["en", "ar"],
    defaultLocale: "ar",
    culturalNotes:
      "Use poetic, elevated language. Show deep respect for elders and family. Avoid any teasing or banter even for close friends — warmth and reverence always. If relationship is parent/elder/family: use formal respectful tone. Arabic output preferred if locale=ar. Avoid Western pop culture references.",
  },
  south_asia: {
    allowTeasing: true,
    respectElders: true,
    poeticBias: false,
    supportedLocales: ["en", "hi"],
    defaultLocale: "hi",
    culturalNotes:
      "Warmth and nostalgia are dominant emotions. Family bonds are paramount — use loving, warm language. Gentle teasing acceptable between peers (not elders). Hindi output preferred if locale=hi. References to food, family gatherings, and shared traditions resonate strongly.",
  },
  indian_ocean: {
    allowTeasing: true,
    respectElders: false,
    poeticBias: false,
    supportedLocales: ["en", "fr", "mfe"],
    defaultLocale: "fr",
    culturalNotes:
      "Warm, intimate tone. French or Creole blend acceptable. Community and family-centric. Gentle humour is fine. Avoid overly formal or stiff language — keep it personal and heartfelt.",
  },
  sub_saharan_africa: {
    allowTeasing: true,
    respectElders: false,
    poeticBias: false,
    supportedLocales: ["en"],
    defaultLocale: "en",
    culturalNotes:
      "Celebratory, communal, bold energy. Use vibrant and expressive language. Community togetherness is a strong theme. Bold declarations of love and appreciation are welcome. Energy and joy should radiate from every section.",
  },
  western_europe: {
    allowTeasing: true,
    respectElders: false,
    poeticBias: false,
    supportedLocales: ["en", "fr"],
    defaultLocale: "en",
    culturalNotes:
      "Understated wit and dry humour are appropriate. Avoid over-sentimentality — make it clever rather than overtly emotional. Understatement works well. Pop culture references are fine but keep them timeless rather than very current.",
  },
  north_america: {
    allowTeasing: true,
    respectElders: false,
    poeticBias: false,
    supportedLocales: ["en"],
    defaultLocale: "en",
    culturalNotes:
      "Edgy and teasing tone fully acceptable for friends. Pop culture references welcome. Be direct, punchy, and emotionally open. Humour and warmth can coexist freely. Feel free to be bold and confident.",
  },
  southeast_asia: {
    allowTeasing: false,
    respectElders: true,
    poeticBias: false,
    supportedLocales: ["en"],
    defaultLocale: "en",
    culturalNotes:
      "Warm, respectful, and community-oriented. Avoid direct teasing or embarrassment humour — keep it affectionate and kind. Family and friendship bonds are central. Respect for elders is important. Gentle warmth over sharp wit.",
  },
};

// ---------------------------------------------------------------------------
// Helper: get rules for a region safely
// ---------------------------------------------------------------------------

export function getRulesForRegion(region: Region): RegionalRule {
  return REGIONAL_RULES[region] ?? REGIONAL_RULES["north_america"];
}

// ---------------------------------------------------------------------------
// Helper: suggest default locale for a region
// ---------------------------------------------------------------------------

export function getDefaultLocaleForRegion(region: Region): Locale {
  return REGIONAL_RULES[region]?.defaultLocale ?? "en";
}

// ---------------------------------------------------------------------------
// Region display labels (for UI dropdowns)
// ---------------------------------------------------------------------------

export const REGION_LABELS: Record<Region, string> = {
  gulf_mena: "Gulf & Middle East (UAE, Saudi, Qatar…)",
  south_asia: "South Asia (India, Pakistan, Sri Lanka…)",
  indian_ocean: "Indian Ocean (Mauritius, Réunion, Maldives…)",
  sub_saharan_africa: "Sub-Saharan Africa (Nigeria, Kenya, Ghana…)",
  western_europe: "Western Europe (UK, France, Germany…)",
  north_america: "North America (USA, Canada)",
  southeast_asia: "Southeast Asia (Philippines, Indonesia, Malaysia…)",
};

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  ar: "العربية",
  hi: "हिन्दी",
  mfe: "Kreol Morisyen",
};

// RTL locales
export const RTL_LOCALES: Locale[] = ["ar"];

export function isRTL(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}
