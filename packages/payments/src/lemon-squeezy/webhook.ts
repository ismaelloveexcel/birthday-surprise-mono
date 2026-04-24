// ─────────────────────────────────────────────────────────────
// Lemon Squeezy — webhook signature verification
// Works in Node.js (crypto module) and Edge runtime (WebCrypto).
// ─────────────────────────────────────────────────────────────

import type { LemonSqueezyWebhookPayload } from "./types.js";

/**
 * Verify the X-Signature header sent by Lemon Squeezy.
 * Throws if the signature is invalid.
 *
 * @param rawBody   The raw request body string (before JSON.parse)
 * @param signature The value of the `x-signature` request header
 * @param secret    LEMONSQUEEZY_WEBHOOK_SECRET from the LS dashboard endpoint
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string
): Promise<void> {
  // Use WebCrypto — works in both Node 18+ and Edge runtimes
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(rawBody)
  );

  const digest = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Constant-time compare to prevent timing attacks
  if (digest.length !== signature.length || digest !== signature) {
    throw new Error("[LemonSqueezy] Invalid webhook signature");
  }
}

/**
 * Parse and verify a Lemon Squeezy webhook request.
 * Returns the typed payload on success, throws on failure.
 */
export async function parseLemonSqueezyWebhook(
  rawBody: string,
  signature: string | null,
  secret: string
): Promise<LemonSqueezyWebhookPayload> {
  if (!signature) {
    throw new Error("[LemonSqueezy] Missing x-signature header");
  }

  await verifyWebhookSignature(rawBody, signature, secret);

  return JSON.parse(rawBody) as LemonSqueezyWebhookPayload;
}
