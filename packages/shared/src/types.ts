import { z } from "zod";

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

export const SurpriseInputSchema = z.object({
  recipientName: z.string().min(1),
  relationship: z.string().min(1),
  vibe: SurpriseVibeSchema,
  memoryNote: z.string().min(1),
});
export type SurpriseInput = z.infer<typeof SurpriseInputSchema>;

export const SurpriseOutputSchema = z.object({
  type: z.literal("birthday_surprise"),
  conceptTitle: z.string(),
  creativeDirection: z.string(),
  tone: z.string(),
  visualStyleId: z.string(),
  paletteId: z.string(),
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
  qualityScore: z
    .object({
      emotionalResonance: z.number(),
      uniqueness: z.number(),
      mobileClarity: z.number(),
      remixability: z.number(),
      overall: z.number(),
    })
    .optional(),
});
export type SurpriseOutput = z.infer<typeof SurpriseOutputSchema>;

export const StoredExperienceSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string(),
  output: SurpriseOutputSchema,
  unlocked: z.boolean(),
  recipient_name: z.string(),
  relationship: z.string(),
  vibe: SurpriseVibeSchema,
});
export type StoredExperience = z.infer<typeof StoredExperienceSchema>;

export const AnalyticsEventTypeSchema = z.enum([
  "experience_generated",
  "preview_viewed",
  "payment_started",
  "payment_success",
  "experience_opened",
  "interaction_completed",
  "share_clicked",
  "remix_clicked",
]);
export type AnalyticsEventType = z.infer<typeof AnalyticsEventTypeSchema>;

export interface AnalyticsEvent {
  id?: string;
  experience_id: string;
  event_type: AnalyticsEventType;
  created_at?: string;
  metadata?: Record<string, unknown>;
}
