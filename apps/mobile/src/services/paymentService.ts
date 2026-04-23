/**
 * Mock payment service.
 * Replace this entire file with Stripe or RevenueCat integration.
 *
 * TODO (Stripe): import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native'
 * TODO (RevenueCat): import Purchases from 'react-native-purchases'
 */

const MOCK_PAYMENT_DELAY_MS = 1200;

export async function mockPaymentSheet(amount: number): Promise<boolean> {
  // Simulate network latency of a real payment flow
  await sleep(MOCK_PAYMENT_DELAY_MS);
  console.log(`[MockPayment] ✅ Charged $${amount.toFixed(2)}`);
  return true;
}

// ---------------------------------------------------------------------------
// Abstraction points — wire real Stripe here later
// ---------------------------------------------------------------------------

// TODO: export async function initStripePaymentSheet(experienceId: string): Promise<void>
// TODO: export async function presentStripePaymentSheet(): Promise<boolean>

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
