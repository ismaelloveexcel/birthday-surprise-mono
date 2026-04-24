// ─────────────────────────────────────────────────────────────
// Lemon Squeezy — checkout creation
// ─────────────────────────────────────────────────────────────

import { LemonSqueezyClient } from "./client.js";
import type { CheckoutResponse, CreateCheckoutOptions } from "./types.js";

interface CheckoutApiResponse {
  data: {
    id: string;
    attributes: {
      url: string;
    };
  };
}

export async function createCheckout(
  client: LemonSqueezyClient,
  storeId: string,
  options: CreateCheckoutOptions
): Promise<CheckoutResponse> {
  const body = {
    data: {
      type: "checkouts",
      attributes: {
        // Buyer prefill (optional)
        ...(options.email || options.name
          ? {
              checkout_data: {
                email: options.email,
                name: options.name,
                // custom_data is passed back verbatim in every webhook
                custom: options.customData ?? {},
              },
            }
          : {
              checkout_data: {
                custom: options.customData ?? {},
              },
            }),
        product_options: {
          // Where LS redirects after a successful payment
          redirect_url: options.successUrl,
          // Disable the LS receipt page redirect (we handle this)
          receipt_link_url: options.successUrl,
        },
      },
      relationships: {
        store: {
          data: { type: "stores", id: storeId },
        },
        variant: {
          data: { type: "variants", id: options.variantId },
        },
      },
    },
  };

  const response = await client.post<CheckoutApiResponse>("/checkouts", body);

  return {
    checkoutUrl: response.data.attributes.url,
    checkoutId: response.data.id,
  };
}
