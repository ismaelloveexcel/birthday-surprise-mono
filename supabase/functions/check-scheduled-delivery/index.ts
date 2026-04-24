/**
 * Edge Function: check-scheduled-delivery
 * Called on every experience fetch to enforce server-side unlock_at gate.
 * Deploy with: supabase functions deploy check-scheduled-delivery
 *
 * This is invoked by the web viewer page server component — not a cron.
 * The page calls this function, which returns whether the experience is
 * currently unlockable based on unlock_at.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { experience_id } = await req.json() as { experience_id: string };

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data, error } = await supabase
    .from("experiences")
    .select("id, paid, unlock_at")
    .eq("id", experience_id)
    .single();

  if (error || !data) {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  }

  const now = new Date();
  const unlockAt = data.unlock_at ? new Date(data.unlock_at) : null;
  const isTimeGated = unlockAt !== null && unlockAt > now;
  const secondsUntilUnlock = isTimeGated
    ? Math.ceil((unlockAt!.getTime() - now.getTime()) / 1000)
    : 0;

  return new Response(
    JSON.stringify({
      paid: data.paid,
      isTimeGated,
      secondsUntilUnlock,
      unlockAt: data.unlock_at,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});
