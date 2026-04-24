/**
 * POST /api/create-reaction-upload-url
 *
 * Generates a signed Supabase Storage upload URL for a reaction video/audio.
 * After upload, client calls this endpoint again to mark the reaction as paid.
 *
 * Flow:
 *   1. Recipient records reaction (15s video/audio)
 *   2. Client calls this endpoint → gets { uploadUrl, reactionId }
 *   3. Client uploads directly to Supabase Storage using uploadUrl
 *   4. Client calls POST /api/create-payment-intent with tier="reaction"
 *   5. After payment → PATCH /api/create-reaction-upload-url to mark paid
 *   6. Sender gets push notification (future: via Supabase Realtime)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceRoleKey) {
  throw new Error(
    "[birthday-surprise] SUPABASE_SERVICE_ROLE_KEY is not set. Required for signed upload URLs."
  );
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  serviceRoleKey
);

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { experienceId, reactionType } = (await req.json()) as {
      experienceId?: string;
      reactionType?: "video" | "audio";
    };

    if (!experienceId || !reactionType) {
      return NextResponse.json(
        { error: "experienceId and reactionType are required." },
        { status: 400 }
      );
    }

    // Create a reaction record
    const { data: reaction, error: insertError } = await supabase
      .from("reactions")
      .insert({
        experience_id: experienceId,
        storage_path: `reactions/${experienceId}/${Date.now()}.${reactionType === "video" ? "mp4" : "m4a"}`,
        reaction_type: reactionType,
        paid: false,
      })
      .select("id, storage_path")
      .single();

    if (insertError || !reaction) {
      throw new Error(insertError?.message ?? "Failed to create reaction record.");
    }

    // Generate signed upload URL (10 min expiry)
    const { data: signedData, error: signedError } =
      await supabase.storage
        .from("reactions")
        .createSignedUploadUrl(reaction.storage_path);

    if (signedError || !signedData) {
      throw new Error(signedError?.message ?? "Failed to generate upload URL.");
    }

    return NextResponse.json({
      reactionId: reaction.id,
      uploadUrl: signedData.signedUrl,
      path: reaction.storage_path,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/create-reaction-upload-url] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** PATCH — mark a reaction as paid after Stripe success */
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    const { reactionId } = (await req.json()) as { reactionId?: string };
    if (!reactionId) {
      return NextResponse.json({ error: "reactionId is required." }, { status: 400 });
    }

    const { error } = await supabase
      .from("reactions")
      .update({ paid: true })
      .eq("id", reactionId);

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
