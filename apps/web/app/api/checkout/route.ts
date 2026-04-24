import { NextRequest, NextResponse } from "next/server";
import { LemonSqueezyClient, createLemonSqueezyCheckout } from "@birthday-surprise/payments";
import { TierSchema, RegionSchema } from "@birthday-surprise/shared";
import type { Tier, Region } from "@birthday-surprise/shared";

// ─────────────────────────────────────────────────────────────
// Startup guards
// ─────────────────────────────────────────────────────────────

const apiKey    = process.env.LEMONSQUEEZY_API_KEY;
const storeId   = process.env.LEMONSQUEEZY_STORE_ID;
const variantId = process.env.LEMONSQUEEZY_VARIANT_ID;
const baseUrl   = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

if (!apiKey)    throw new Error("[checkout] LEMONSQUEEZY_API_KEY is required");
if (!storeId)   throw new Error("[checkout] LEMONSQUEEZY_STORE_ID is required");
if (!variantId) throw new Error("[checkout] LEMONSQUEEZY_VARIANT_ID is required");

const lsClient = new LemonSqueezyClient(apiKey);

// ─────────────────────────────────────────────────────────────
// POST /api/checkout
// Body: { tier: Tier, experienceId: string, region?: Region }
// Response: { checkoutUrl: string }
// ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as {
      tier?: string;
      experienceId?: string;
      region?: string;
      email?: string;
    };

    // Validate tier
    const tierResult = TierSchema.safeParse(body.tier);
    if (!tierResult.success) {
      return NextResponse.json(
        { error: "Invalid tier. Must be 'single', 'premium', or 'group'." },
        { status: 400 }
      );
    }
    const tier: Tier = tierResult.data;

    const region: Region = RegionSchema.safeParse(body.region).success
      ? (body.region as Region)
      : "north_america";

    if (!body.experienceId || typeof body.experienceId !== "string") {
      return NextResponse.json(
        { error: "experienceId is required." },
        { status: 400 }
      );
    }

    const { checkoutUrl } = await createLemonSqueezyCheckout(lsClient, storeId!, {
      variantId: variantId!,
      successUrl: `${baseUrl}/experience/${body.experienceId}?paid=true`,
      email: body.email,
      customData: {
        experienceId: body.experienceId,
        tier,
        region,
      },
    });

    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/checkout] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
