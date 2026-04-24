import type { Tier, Region } from "./types";

// ---------------------------------------------------------------------------
// Tier definitions — SINGLE SOURCE OF TRUTH. Never hardcode prices elsewhere.
// ---------------------------------------------------------------------------

export interface TierDefinition {
  id: Tier;
  label: string;
  tagline: string;
  features: string[];
  amountUSD: number;   // in cents
  displayUSD: string;  // formatted
}

export const TIER_DEFINITIONS: Record<Tier, TierDefinition> = {
  single: {
    id: "single",
    label: "Single Experience",
    tagline: "One story, perfectly told.",
    features: [
      "1 AI-crafted experience",
      "Permanent share URL",
      "Interactive element",
      "Beautiful mobile-first design",
    ],
    amountUSD: 799,
    displayUSD: "$7.99",
  },
  premium: {
    id: "premium",
    label: "Premium Experience",
    tagline: "Go all out.",
    features: [
      "Everything in Single",
      "Voice narration",
      "Extended story length",
      "Music mood layer",
      "Scheduled delivery (send on their birthday)",
    ],
    amountUSD: 1499,
    displayUSD: "$14.99",
  },
  group: {
    id: "group",
    label: "Group Experience",
    tagline: "Many voices, one unforgettable moment.",
    features: [
      "Everything in Premium",
      "Up to 5 contributors",
      "AI weaves all memories into one",
      "Group invite link",
    ],
    amountUSD: 1999,
    displayUSD: "$19.99",
  },
};

// ---------------------------------------------------------------------------
// Currency localisation by region
// Stripe supports multi-currency — pass the currency code to payment intent
// ---------------------------------------------------------------------------

export interface RegionalPrice {
  currency: string;     // ISO 4217
  symbol: string;
  amounts: Record<Tier, number>;  // in smallest currency unit
  display: Record<Tier, string>;  // formatted strings
}

export const REGIONAL_PRICES: Partial<Record<Region, RegionalPrice>> = {
  gulf_mena: {
    currency: "AED",
    symbol: "AED",
    amounts: { single: 2900, premium: 5500, group: 7500 },
    display: { single: "AED 29", premium: "AED 55", group: "AED 75" },
  },
  indian_ocean: {
    currency: "MUR",
    symbol: "MUR",
    amounts: { single: 37000, premium: 69000, group: 92500 },
    display: { single: "MUR 370", premium: "MUR 690", group: "MUR 925" },
  },
};

// Default USD prices for all other regions
const USD_DEFAULT: RegionalPrice = {
  currency: "USD",
  symbol: "$",
  amounts: { single: 799, premium: 1499, group: 1999 },
  display: { single: "$7.99", premium: "$14.99", group: "$19.99" },
};

export function getPriceForRegion(region: Region): RegionalPrice {
  return REGIONAL_PRICES[region] ?? USD_DEFAULT;
}

export function getAmountForTierAndRegion(tier: Tier, region: Region): number {
  return getPriceForRegion(region).amounts[tier];
}

export function getCurrencyForRegion(region: Region): string {
  return getPriceForRegion(region).currency;
}

export function getDisplayPriceForTierAndRegion(
  tier: Tier,
  region: Region
): string {
  return getPriceForRegion(region).display[tier];
}
