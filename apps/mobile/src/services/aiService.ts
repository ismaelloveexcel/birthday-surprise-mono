/**
 * AI service — mobile side.
 *
 * The full 4-step Claude pipeline (Steps 0, A, B, C) runs server-side on the
 * Next.js web app. This keeps ANTHROPIC_API_KEY off the mobile bundle entirely.
 *
 * Mobile startup check: EXPO_PUBLIC_WEB_BASE_URL must be set.
 * If missing in production → throw loudly. No silent fallback to mock.
 */

import Constants from "expo-constants";
import type { SurpriseInput, GenerateResponse } from "@birthday-surprise/shared";
import { GenerateResponseSchema } from "@birthday-surprise/shared";

declare const __DEV__: boolean;

function getWebBaseUrl(): string {
  const url: string =
    (Constants.expoConfig?.extra?.webBaseUrl as string) ||
    process.env.EXPO_PUBLIC_WEB_BASE_URL ||
    "";

  if (!url && !__DEV__) {
    throw new Error(
      "[birthday-surprise] EXPO_PUBLIC_WEB_BASE_URL must be set to the production " +
        "web URL in a release build. App cannot generate experiences without it."
    );
  }

  return url || "http://localhost:3000";
}

/**
 * Call the server-side 4-step AI pipeline.
 * Throws on network failure or non-2xx — never falls back to mock.
 */
export async function generateSurprise(
  input: SurpriseInput
): Promise<GenerateResponse> {
  const baseUrl = getWebBaseUrl();
  const endpoint = `${baseUrl}/api/generate`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errorBody = (await res.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(
      `[AI] Generate API returned ${res.status}: ${errorBody.error ?? "unknown error"}`
    );
  }

  const data: unknown = await res.json();
  return GenerateResponseSchema.parse(data);
}
