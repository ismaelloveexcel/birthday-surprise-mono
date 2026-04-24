// ─────────────────────────────────────────────────────────────
// @birthday-surprise/payments
// Reusable Lemon Squeezy payment utilities.
//
// Usage in any app:
//   import { createLemonSqueezyCheckout, parseLemonSqueezyWebhook } from "@birthday-surprise/payments"
// ─────────────────────────────────────────────────────────────

export { LemonSqueezyClient } from "./lemon-squeezy/client.js";
export { createCheckout as createLemonSqueezyCheckout } from "./lemon-squeezy/checkout.js";
export { parseLemonSqueezyWebhook, verifyWebhookSignature } from "./lemon-squeezy/webhook.js";
export type {
  LemonSqueezyConfig,
  CreateCheckoutOptions,
  CheckoutResponse,
  LemonSqueezyWebhookPayload,
  LemonSqueezyEventName,
  OrderAttributes,
} from "./lemon-squeezy/types.js";
