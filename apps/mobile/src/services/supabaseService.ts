import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import type { SurpriseOutput, SurpriseInput, AnalyticsEventType } from "@birthday-surprise/shared";

// Fall back to placeholder values so createClient doesn't throw when env vars
// are not yet configured. Real operations will fail with a network error,
// which is handled gracefully by each caller.
const supabaseUrl: string =
  (Constants.expoConfig?.extra?.supabaseUrl as string) ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  "https://placeholder.supabase.co";

const supabaseAnonKey: string =
  (Constants.expoConfig?.extra?.supabaseAnonKey as string) ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function saveExperience(
  output: SurpriseOutput,
  input: SurpriseInput
): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await supabase
    .from("experiences")
    .insert({
      output,
      unlocked: false,
      recipient_name: input.recipientName,
      relationship: input.relationship,
      vibe: input.vibe,
    })
    .select("id")
    .single();
  if (error) return { id: null, error: error.message };
  return { id: (data as { id: string }).id, error: null };
}

export async function unlockExperience(
  experienceId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("experiences")
    .update({ unlocked: true })
    .eq("id", experienceId);
  return { error: error?.message ?? null };
}

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

export function getShareUrl(experienceId: string): string {
  const baseUrl: string =
    (Constants.expoConfig?.extra?.webBaseUrl as string) ||
    process.env.EXPO_PUBLIC_WEB_BASE_URL ||
    "http://localhost:3000";
  return `${baseUrl}/e/${experienceId}`;
}
