import { NextRequest, NextResponse } from "next/server";
import { parseLemonSqueezyWebhook } from "@birthday-surprise/payments";
import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────
// Startup guards
// ─────────────────────────────────────────────────────────────

const webhookSecret  = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
const supabaseUrl    = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl)    throw new Error("[webhook] NEXT_PUBLIC_SUPABASE_URL is required");
if (!serviceRoleKey) throw new Error("[webhook] SUPABASE_SERVICE_ROLE_KEY is required");

// Service-role client — server-side only, never exposed to the browser
const supabase = createClient(supabaseUrl, serviceRoleKey);

// ─────────────────────────────────────────────────────────────
// POST /api/webhook
// Lemon Squeezy sends: order_created | order_refunded | …
// ─────────────────────────────────────────────────────────────

export const runtime = "nodejs";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody   = await req.text();
  const signature = req.headers.get("x-signature");

  // Dev fallback — skip verification if secret not yet configured
  if (!webhookSecret) {
    console.warn("[webhook] LEMONSQUEEZY_WEBHOOK_SECRET not set — skipping signature check (dev only)");
    return NextResponse.json({ received: true, warning: "signature not verified" });
  }

  let payload;
  try {
    payload = await parseLemonSqueezyWebhook(rawBody, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[webhook] Verification failed:", msg);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { event_name, custom_data } = payload.meta;

  // ── order_created → unlock the experience ─────────────────

  if (event_name === "order_created") {
    const experienceId = custom_data?.experienceId;
    const tier         = custom_data?.tier ?? "single";

    if (!experienceId) {
      console.warn("[webhook] order_created missing experienceId in custom_data");
      return NextResponse.json({ received: true });
    }

    const { error } = await supabase
      .from("experiences")
      .update({ paid: true, unlocked: true, tier })
      .eq("id", experienceId);

    if (error) {
      console.error("[webhook] Failed to mark experience paid:", experienceId, error.message);
      // Return 500 so Lemon Squeezy retries
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`[webhook] Experience ${experienceId} marked paid (tier: ${tier})`);
  }

  // ── order_refunded → lock it back ─────────────────────────

  if (event_name === "order_refunded") {
    const experienceId = custom_data?.experienceId;
    if (experienceId) {
      await supabase
        .from("experiences")
        .update({ paid: false, unlocked: false })
        .eq("id", experienceId);
      console.log(`[webhook] Experience ${experienceId} locked after refund`);
    }
  }

  return NextResponse.json({ received: true });
}
