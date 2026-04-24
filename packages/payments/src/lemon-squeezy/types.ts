// ─────────────────────────────────────────────────────────────
// Lemon Squeezy — TypeScript types
// Covers the subset of the LS API used across all apps.
// ─────────────────────────────────────────────────────────────

export interface LemonSqueezyConfig {
  /** API key from dashboard.lemonsqueezy.com → Settings → API */
  apiKey: string;
  /** Numeric store ID from dashboard.lemonsqueezy.com → Settings → Store */
  storeId: string;
  /** Webhook signing secret created per-endpoint in LS dashboard */
  webhookSecret: string;
}

// ── Checkout ─────────────────────────────────────────────────

export interface CreateCheckoutOptions {
  /** Variant ID for the product being purchased */
  variantId: string;
  /** URL to redirect after successful payment */
  successUrl: string;
  /** Arbitrary key/value pairs passed back in the webhook */
  customData?: Record<string, string>;
  /** Pre-fill buyer email (optional) */
  email?: string;
  /** Pre-fill buyer name (optional) */
  name?: string;
}

export interface CheckoutResponse {
  /** Direct URL to the Lemon Squeezy hosted checkout page */
  checkoutUrl: string;
  /** Unique checkout ID */
  checkoutId: string;
}

// ── Webhook payload ──────────────────────────────────────────

export type LemonSqueezyEventName =
  | "order_created"
  | "order_refunded"
  | "subscription_created"
  | "subscription_updated"
  | "subscription_cancelled"
  | "subscription_resumed"
  | "subscription_expired"
  | "subscription_paused"
  | "subscription_payment_success"
  | "subscription_payment_failed"
  | "subscription_payment_recovered"
  | "license_key_created"
  | "license_key_updated";

export interface LemonSqueezyWebhookPayload {
  meta: {
    event_name: LemonSqueezyEventName;
    custom_data?: Record<string, string>;
    webhook_id: string;
  };
  data: {
    id: string;
    type: string;
    attributes: Record<string, unknown>;
  };
}

// ── Order attributes (order_created / order_refunded) ────────

export interface OrderAttributes {
  status: "pending" | "failed" | "paid" | "refunded";
  total: number;
  currency: string;
  customer_id: number;
  order_number: number;
  first_order_item?: {
    product_name: string;
    variant_name: string;
  };
}
