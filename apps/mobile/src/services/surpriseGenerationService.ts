/**
 * Surprise generation service — mobile orchestrator.
 *
 * The full AI pipeline (Steps 0 → A → B → C) runs server-side via /api/generate.
 * This service is responsible for calling that endpoint and returning typed output.
 *
 * Architecture:
 *   Raw input → POST /api/generate → { output, qualityFlag }
 *
 * Step B never receives raw memoryNote — Step 0 enhancement happens server-side.
 * Step C retry (max 2 full pipeline attempts) is managed server-side.
 */

import type { SurpriseInput, SurpriseOutput } from "@birthday-surprise/shared";
import { generateSurprise } from "./aiService";

export interface GenerationResult {
  output: SurpriseOutput;
  qualityFlag: boolean;
}

export async function generateBirthdaySurprise(
  input: SurpriseInput
): Promise<GenerationResult> {
  const { output, qualityFlag } = await generateSurprise(input);
  return { output, qualityFlag };
}
