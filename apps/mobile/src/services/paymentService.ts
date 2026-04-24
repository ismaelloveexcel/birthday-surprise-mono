/**
 * Payment service — Stripe React Native integration.
 *
 * Flow:
 *  1. initStripePayment() → calls /api/create-payment-intent server-side
 *  2. presentStripePayment() → opens Stripe payment sheet
 *
 * Server creates the payment intent so STRIPE_SECRET_KEY never touches the mobile bundle.
 * NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is safe to embed (it's public by design).
 *
 * Requires: @stripe/stripe-react-native + StripeProvider wrapping App root.
 * EAS build required for native Stripe modules.
 */

import { initPaymentSheet, presentPaymentSheet } from "@stripe/stripe-react-native";
import Constants from "expo-constants";
import type { Tier, Region } from "@birthday-surprise/shared";

function getWebBaseUrl(): string {
  return (
    (Constants.expoConfig?.extra?.webBaseUrl as string) ||
    process.env.EXPO_PUBLIC_WEB_BASE_URL ||
    "http://localhost:3000"
  );
}

/**
 * Step 1: Create payment intent server-side and initialise the payment sheet.
 * Throws on any failure — do not call presentStripePayment if this throws.
 */
export async function initStripePayment(
  experienceId: string,
  tier: Tier,
  region: Region
): Promise<void> {
  const baseUrl = getWebBaseUrl();

  const res = await fetch(`${baseUrl}/api/create-payment-intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ experienceId, tier, region }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(
      `Payment intent creation failed (${res.status}): ${body.error ?? "unknown error"}`
    );
  }

  const { clientSecret } = (await res.json()) as { clientSecret: string };

  const { error } = await initPaymentSheet({
    paymentIntentClientSecret: clientSecret,
    merchantDisplayName: "Birthday Surprise",
    allowsDelayedPaymentMethods: false,
  });

  if (error) {
    throw new Error(`Stripe init error: ${error.message}`);
  }
}

/**
 * Step 2: Present the Stripe payment sheet.
 * Returns true on success, false if user cancelled.
 * Throws on hard failure (network error, invalid card, etc.)
 */
export async function presentStripePayment(): Promise<boolean> {
  const { error } = await presentPaymentSheet();

  if (!error) return true;

  if (error.code === "Canceled") return false;

  throw new Error(`Stripe payment error: ${error.message}`);
}
