/**
 * Web analytics service.
 *
 * Rules (enforced throughout):
 * - ALL calls are fire-and-forget — wrapped in try/catch
 * - Analytics failures are silently logged, NEVER thrown
 * - No user action ever fails because of an analytics error
 *
 * Events:
 *   experience_generated  — mobile, on creation
 *   preview_viewed        — mobile, on preview screen load
 *   payment_started       — mobile, before Stripe sheet
 *   payment_success       — mobile, after successful payment
 *   experience_opened     — web, when recipient opens share URL
 *   interaction_completed — web, after tapping the interactive element
 *   share_clicked         — web + mobile, when share/copy is triggered
 *   remix_clicked         — web + mobile, when remix CTA is tapped
 *   reaction_recorded     — web, after recipient records reaction video/audio
 *   reaction_viewed       — web, after sender views a recorded reaction
 */

import { createClient } from "@supabase/supabase-js";
import type { AnalyticsEventType } from "@birthday-surprise/shared";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key"
);

/**
 * Track an analytics event — fire-and-forget, never throws.
 */
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
  } catch (err) {
    // Non-fatal — log for observability but never surface to user
    console.warn("[analytics] trackEvent failed silently:", eventType, err);
  }
}

/**
 * Remix rate = remix_clicked / experience_opened for a given experience.
 * Returns null if experience_opened is 0.
 */
export async function getRemixRate(
  experienceId: string
): Promise<number | null> {
  try {
    const { data } = await supabase
      .from("analytics")
      .select("event_type")
      .eq("experience_id", experienceId)
      .in("event_type", ["experience_opened", "remix_clicked"]);

    if (!data) return null;
    const opened = data.filter(
      (r) => r.event_type === "experience_opened"
    ).length;
    const remixed = data.filter(
      (r) => r.event_type === "remix_clicked"
    ).length;
    if (opened === 0) return null;
    return remixed / opened;
  } catch {
    return null;
  }
}
