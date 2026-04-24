import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import type {
  SurpriseOutput,
  SurpriseInput,
  AnalyticsEventType,
  Tier,
} from "@birthday-surprise/shared";

const supabaseUrl: string =
  (Constants.expoConfig?.extra?.supabaseUrl as string) ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  "https://placeholder.supabase.co";

const supabaseAnonKey: string =
  (Constants.expoConfig?.extra?.supabaseAnonKey as string) ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ---------------------------------------------------------------------------
// Save a newly generated experience to Supabase
// ---------------------------------------------------------------------------

export async function saveExperience(
  output: SurpriseOutput,
  input: SurpriseInput,
  options?: {
    qualityFlag?: boolean;
    scheduledDeliveryDate?: string; // ISO datetime for unlock_at
  }
): Promise<{ id: string | null; error: string | null }> {
  const unlock_at =
    input.scheduledDelivery && input.tier === "premium" && options?.scheduledDeliveryDate
      ? options.scheduledDeliveryDate
      : null;

  const { data, error } = await supabase
    .from("experiences")
    .insert({
      output,
      paid: false,
      tier: input.tier,
      unlocked: false,
      quality_flag: options?.qualityFlag ?? false,
      recipient_name: input.recipientName,
      relationship: input.relationship,
      vibe: input.vibe,
      locale: input.locale,
      region: input.region,
      share_count: 0,
      unlock_at,
      recipient_birthday: input.recipientBirthday ?? null,
      contributors: input.contributors ?? [],
    })
    .select("id")
    .single();

  if (error) return { id: null, error: error.message };
  return { id: (data as { id: string }).id, error: null };
}

// ---------------------------------------------------------------------------
// Mark an experience as paid and set its tier (server-side verified)
// ---------------------------------------------------------------------------

export async function markExperiencePaid(
  experienceId: string,
  tier: Tier
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("experiences")
    .update({ paid: true, unlocked: true, tier })
    .eq("id", experienceId);
  return { error: error?.message ?? null };
}

// ---------------------------------------------------------------------------
// Legacy alias kept for any callers that still reference unlockExperience
// ---------------------------------------------------------------------------

export async function unlockExperience(
  experienceId: string,
  tier: Tier = "single"
): Promise<{ error: string | null }> {
  return markExperiencePaid(experienceId, tier);
}

// ---------------------------------------------------------------------------
// Increment share count
// ---------------------------------------------------------------------------

export async function incrementShareCount(
  experienceId: string
): Promise<void> {
  await supabase.rpc("increment_share_count", { experience_id: experienceId }).catch(() => {
    // Non-fatal
  });
}

// ---------------------------------------------------------------------------
// Analytics — fire-and-forget, never throws
// ---------------------------------------------------------------------------

export async function trackEvent(
  experienceId: string,
  eventType: AnalyticsEventType,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await supabase.from("analytics").insert({
      experience_id: experienceId,
      event_type: eventType,
      metadata: metadata ?? null,
    });
  } catch {
    // Analytics failures are non-fatal — never block the main flow
  }
}

// ---------------------------------------------------------------------------
// Share URL helper
// ---------------------------------------------------------------------------

export function getShareUrl(experienceId: string): string {
  const baseUrl: string =
    (Constants.expoConfig?.extra?.webBaseUrl as string) ||
    process.env.EXPO_PUBLIC_WEB_BASE_URL ||
    "http://localhost:3000";
  return `${baseUrl}/e/${experienceId}`;
}
