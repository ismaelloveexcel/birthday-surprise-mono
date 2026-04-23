import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function trackEvent(
  experienceId: string,
  eventType: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await supabase.from("analytics").insert({
    experience_id: experienceId,
    event_type: eventType,
    metadata: metadata ?? null,
  });
}

/**
 * Remix rate = remix_clicked / experience_opened for a given experience.
 * Returns null if experience_opened is 0.
 */
export async function getRemixRate(
  experienceId: string
): Promise<number | null> {
  const { data } = await supabase
    .from("analytics")
    .select("event_type")
    .eq("experience_id", experienceId)
    .in("event_type", ["experience_opened", "remix_clicked"]);

  if (!data) return null;
  const opened = data.filter((r) => r.event_type === "experience_opened").length;
  const remixed = data.filter((r) => r.event_type === "remix_clicked").length;
  if (opened === 0) return null;
  return remixed / opened;
}
