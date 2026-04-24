/**
 * Edge Function: memory-capsule-reminder
 * Scheduled monthly via Supabase pg_cron or Vercel cron.
 * Finds creators whose recipient's birthday is ~30 days away and emails them.
 *
 * Deploy: supabase functions deploy memory-capsule-reminder
 * Schedule: 0 9 * * * (daily at 9am UTC, filter inside)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Find experiences where recipient_birthday is 30 days from today
  const target = new Date();
  target.setDate(target.getDate() + 30);
  const mmdd = `${String(target.getMonth() + 1).padStart(2, "0")}-${String(
    target.getDate()
  ).padStart(2, "0")}`;

  const { data: experiences, error } = await supabase
    .from("experiences")
    .select("id, recipient_name, creator_id, created_at, output")
    .not("recipient_birthday", "is", null)
    .filter("recipient_birthday", "ilike", `%-${mmdd}`);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  // TODO: For each experience, send email via Resend / SendGrid
  // The deep link back to the creation flow with last year's experience as reference:
  // `birthdaysurprise://create?senderName=...&referenceExperienceId=${exp.id}`
  //
  // Email template includes:
  // - Recipient name
  // - Snippet from last year's experience
  // - CTA: "Top it this year →" deep link

  console.log(
    `[memory-capsule-reminder] Found ${experiences?.length ?? 0} upcoming birthdays for ${mmdd}`
  );

  return new Response(
    JSON.stringify({ processed: experiences?.length ?? 0, targetDate: mmdd }),
    { headers: { "Content-Type": "application/json" } }
  );
});
