import { z } from "zod";

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

export const SurpriseVibeSchema = z.enum([
  "funny",
  "emotional",
  "playful",
  "warm",
  "bold",
  "chaotic",
]);
export type SurpriseVibe = z.infer<typeof SurpriseVibeSchema>;

export const InteractiveElementTypeSchema = z.enum([
  "tap_reveal",
  "mini_quiz",
  "choice_path",
  "countdown_reveal",
]);
export type InteractiveElementType = z.infer<typeof InteractiveElementTypeSchema>;

export const TierSchema = z.enum(["single", "premium", "group"]);
export type Tier = z.infer<typeof TierSchema>;

export const LocaleSchema = z.enum(["en", "fr", "ar", "hi", "mfe"]);
export type Locale = z.infer<typeof LocaleSchema>;

export const RegionSchema = z.enum([
  "gulf_mena",
  "south_asia",
  "indian_ocean",
  "sub_saharan_africa",
  "western_europe",
  "north_america",
  "southeast_asia",
]);
export type Region = z.infer<typeof RegionSchema>;

// ---------------------------------------------------------------------------
// Contributor (Group Mode)
// ---------------------------------------------------------------------------

export const ContributorSchema = z.object({
  name: z.string().min(1),
  memoryNote: z.string().min(1).max(500),
});
export type Contributor = z.infer<typeof ContributorSchema>;

// ---------------------------------------------------------------------------
// Surprise Input
// ---------------------------------------------------------------------------

export const SurpriseInputSchema = z.object({
  recipientName: z.string().min(1),
  relationship: z.string().min(1),
  vibe: SurpriseVibeSchema,
  memoryNote: z.string().min(1).max(500),
  region: RegionSchema.default("north_america"),
  locale: LocaleSchema.default("en"),
  tier: TierSchema.default("single"),
  contributors: z.array(ContributorSchema).optional(),
  recipientBirthday: z.string().optional(), // ISO date "YYYY-MM-DD"
  scheduledDelivery: z.boolean().optional(),
});
export type SurpriseInput = z.infer<typeof SurpriseInputSchema>;

// ---------------------------------------------------------------------------
// Step A — Creative Strategist output schema
// ---------------------------------------------------------------------------

export const StrategyOutputSchema = z.object({
  conceptTitle: z.string(),
  creativeDirection: z.string(),
  tone: z.string(),
  visualStyleId: z.string(),
  paletteId: z.string(),
  interactionType: InteractiveElementTypeSchema,
  culturalNotes: z.string(), // regional/cultural constraints injected into Step B
});
export type StrategyOutput = z.infer<typeof StrategyOutputSchema>;

// ---------------------------------------------------------------------------
// Step B — Experience Writer raw output schema
// ---------------------------------------------------------------------------

export const ExperienceWriterOutputSchema = z.object({
  hero: z.object({
    headline: z.string(),
    subheadline: z.string(),
    introLine: z.string(),
  }),
  interaction: z.object({
    prompt: z.string(),
    options: z.array(z.string()).optional(),
    revealText: z.string(),
  }),
  memoryMoment: z.object({
    title: z.string(),
    body: z.string(),
  }),
  finalWish: z.object({
    headline: z.string(),
    message: z.string(),
    signature: z.string(),
  }),
  share: z.object({
    socialCaption: z.string(),
    remixHook: z.string(),
  }),
});
export type ExperienceWriterOutput = z.infer<typeof ExperienceWriterOutputSchema>;

// ---------------------------------------------------------------------------
// Step C — Quality Gate scores (per spec: specificity, contrast,
// screenshot-worthiness, emotional progression)
// ---------------------------------------------------------------------------

export const QualityScoreSchema = z.object({
  specificity: z.number(),
  contrast: z.number(),
  screenshotWorthiness: z.number(),
  emotionalProgression: z.number(),
  overall: z.number(),
});
export type QualityScore = z.infer<typeof QualityScoreSchema>;

// ---------------------------------------------------------------------------
// Assembled Surprise Output (returned by generate API, stored as JSONB)
// ---------------------------------------------------------------------------

export const SurpriseOutputSchema = z.object({
  type: z.literal("birthday_surprise"),
  conceptTitle: z.string(),
  creativeDirection: z.string(),
  tone: z.string(),
  visualStyleId: z.string(),
  paletteId: z.string(),
  locale: LocaleSchema.default("en"),
  hero: z.object({
    headline: z.string(),
    subheadline: z.string(),
    introLine: z.string(),
  }),
  interaction: z.object({
    type: InteractiveElementTypeSchema,
    prompt: z.string(),
    options: z.array(z.string()).optional(),
    revealText: z.string(),
  }),
  memoryMoment: z.object({
    title: z.string(),
    body: z.string(),
  }),
  finalWish: z.object({
    headline: z.string(),
    message: z.string(),
    signature: z.string(),
  }),
  share: z.object({
    socialCaption: z.string(),
    remixHook: z.string(),
  }),
  qualityScore: QualityScoreSchema.optional(),
});
export type SurpriseOutput = z.infer<typeof SurpriseOutputSchema>;

// ---------------------------------------------------------------------------
// Stored Experience (full Supabase row)
// ---------------------------------------------------------------------------

export const StoredExperienceSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string(),
  output: SurpriseOutputSchema,
  // Payment / access
  paid: z.boolean().default(false),
  tier: TierSchema.default("single"),
  // Legacy compat — mirrors paid
  unlocked: z.boolean().default(false),
  // Quality
  quality_flag: z.boolean().default(false),
  // Recipient info
  recipient_name: z.string(),
  relationship: z.string(),
  vibe: SurpriseVibeSchema,
  // Regional
  locale: LocaleSchema.default("en"),
  region: RegionSchema.default("north_america"),
  // Viral
  share_count: z.number().default(0),
  // Scheduled delivery
  unlock_at: z.string().nullable().optional(),
  // Memory capsule re-engagement
  recipient_birthday: z.string().nullable().optional(),
  // Group mode contributors
  contributors: z.array(ContributorSchema).default([]),
});
export type StoredExperience = z.infer<typeof StoredExperienceSchema>;

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export const AnalyticsEventTypeSchema = z.enum([
  "experience_generated",
  "preview_viewed",
  "payment_started",
  "payment_success",
  "experience_opened",
  "interaction_completed",
  "share_clicked",
  "remix_clicked",
  "reaction_recorded",
  "reaction_viewed",
]);
export type AnalyticsEventType = z.infer<typeof AnalyticsEventTypeSchema>;

export interface AnalyticsEvent {
  id?: string;
  experience_id: string;
  event_type: AnalyticsEventType;
  created_at?: string;
  metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Generate API request / response shapes
// ---------------------------------------------------------------------------

export const GenerateRequestSchema = SurpriseInputSchema;
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

export const GenerateResponseSchema = z.object({
  output: SurpriseOutputSchema,
  qualityFlag: z.boolean(),
});
export type GenerateResponse = z.infer<typeof GenerateResponseSchema>;
