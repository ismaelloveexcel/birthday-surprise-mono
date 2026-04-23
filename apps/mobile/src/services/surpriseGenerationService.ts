import {
  SurpriseInput,
  SurpriseOutput,
  SurpriseOutputSchema,
  buildInputEnhancerPrompt,
  buildCreativeStrategistPrompt,
  buildExperienceWriterPrompt,
  buildQualityGatePrompt,
} from "@birthday-surprise/shared";
import { aiJsonCall } from "./aiService";

interface StrategyResult {
  conceptTitle: string;
  creativeDirection: string;
  tone: string;
  visualStyleId: string;
  paletteId: string;
  interactionType: string;
}

interface WriterResult {
  hero: { headline: string; subheadline: string; introLine: string };
  interaction: { prompt: string; options?: string[]; revealText: string };
  memoryMoment: { title: string; body: string };
  finalWish: { headline: string; message: string; signature: string };
  share: { socialCaption: string; remixHook: string };
}

interface QualityResult {
  emotionalResonance: number;
  uniqueness: number;
  mobileClarity: number;
  remixability: number;
  overall: number;
}

export async function generateBirthdaySurprise(
  input: SurpriseInput
): Promise<SurpriseOutput> {
  // Step 0: Enhance the memory note
  const enhancerRaw = (await aiJsonCall(
    buildInputEnhancerPrompt(input.memoryNote)
  )) as { enhanced?: string };
  const enhancedNote =
    typeof enhancerRaw?.enhanced === "string" && enhancerRaw.enhanced.trim()
      ? enhancerRaw.enhanced
      : input.memoryNote;
  const enhancedInput: SurpriseInput = { ...input, memoryNote: enhancedNote };

  // Step A: Creative strategist
  const strategy = (await aiJsonCall(
    buildCreativeStrategistPrompt(enhancedInput)
  )) as StrategyResult;

  // Step B: Experience writer (first attempt)
  let writerRaw = (await aiJsonCall(
    buildExperienceWriterPrompt(enhancedInput, strategy)
  )) as WriterResult;

  let output = assembleOutput(strategy, writerRaw, input.vibe);

  // Step C: Quality gate
  let quality = (await aiJsonCall(
    buildQualityGatePrompt(JSON.stringify(output))
  )) as QualityResult;

  if (
    typeof quality?.overall === "number" &&
    quality.overall < 7.5
  ) {
    // Regenerate writer once with a stronger directive
    const retryInput: SurpriseInput = {
      ...enhancedInput,
      memoryNote: `${enhancedInput.memoryNote} (Be less generic, more specific, more surprising.)`,
    };
    writerRaw = (await aiJsonCall(
      buildExperienceWriterPrompt(retryInput, strategy)
    )) as WriterResult;
    output = assembleOutput(strategy, writerRaw, input.vibe);
    quality = (await aiJsonCall(
      buildQualityGatePrompt(JSON.stringify(output))
    )) as QualityResult;
  }

  output.qualityScore = quality;

  return SurpriseOutputSchema.parse(output);
}

function assembleOutput(
  strategy: StrategyResult,
  writer: WriterResult,
  vibe: string
): SurpriseOutput {
  return {
    type: "birthday_surprise",
    conceptTitle: strategy.conceptTitle ?? "Untitled",
    creativeDirection: strategy.creativeDirection ?? "",
    tone: strategy.tone ?? vibe,
    visualStyleId: strategy.visualStyleId ?? "soft-party",
    paletteId: strategy.paletteId ?? "cake-pop",
    hero: {
      headline: writer.hero?.headline ?? "",
      subheadline: writer.hero?.subheadline ?? "",
      introLine: writer.hero?.introLine ?? "",
    },
    interaction: {
      type:
        (strategy.interactionType as SurpriseOutput["interaction"]["type"]) ??
        "tap_reveal",
      prompt: writer.interaction?.prompt ?? "Tap to reveal",
      options: writer.interaction?.options,
      revealText: writer.interaction?.revealText ?? "",
    },
    memoryMoment: {
      title: writer.memoryMoment?.title ?? "",
      body: writer.memoryMoment?.body ?? "",
    },
    finalWish: {
      headline: writer.finalWish?.headline ?? "",
      message: writer.finalWish?.message ?? "",
      signature: writer.finalWish?.signature ?? "",
    },
    share: {
      socialCaption: writer.share?.socialCaption ?? "",
      remixHook: writer.share?.remixHook ?? "",
    },
  };
}
