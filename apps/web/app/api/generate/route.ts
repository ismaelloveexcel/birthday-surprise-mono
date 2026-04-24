import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  GenerateRequestSchema,
  SurpriseOutputSchema,
  StrategyOutputSchema,
  ExperienceWriterOutputSchema,
  QualityScoreSchema,
  buildInputEnhancerPrompt,
  buildCreativeStrategistPrompt,
  buildExperienceWriterPrompt,
  buildQualityGatePrompt,
} from "@birthday-surprise/shared";
import type {
  SurpriseInput,
  SurpriseOutput,
  StrategyOutput,
  QualityScore,
} from "@birthday-surprise/shared";

// ---------------------------------------------------------------------------
// Startup guard — fail loudly, never silently fall back to mock
// ---------------------------------------------------------------------------

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  throw new Error(
    "[birthday-surprise] ANTHROPIC_API_KEY is required but not set. " +
      "Add it to your .env file. The app will not start without it."
  );
}

const anthropic = new Anthropic({ apiKey });

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 2048;

// ---------------------------------------------------------------------------
// Core Claude caller — strict JSON mode, no mock fallback
// ---------------------------------------------------------------------------

async function callClaude(prompt: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [{ role: "user", content: prompt }],
  });

  const block = message.content[0];
  if (!block || block.type !== "text") {
    throw new Error("[AI] Claude returned no text content");
  }

  return block.text;
}

function parseJson<T>(raw: string): T {
  // Try direct parse first
  try {
    return JSON.parse(raw) as T;
  } catch {
    // Extract from markdown code block if present
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match?.[1]) {
      return JSON.parse(match[1]) as T;
    }
    throw new Error(`[AI] Failed to parse JSON from response: ${raw.slice(0, 200)}`);
  }
}

// ---------------------------------------------------------------------------
// Step 0 — Input Enhancer
// Word-count guard: if still <20 words after enhancement, append fallback line
// ---------------------------------------------------------------------------

async function runStep0(input: SurpriseInput): Promise<string> {
  const prompt = buildInputEnhancerPrompt(
    input.memoryNote,
    input.relationship,
    input.region,
    input.locale
  );
  const raw = await callClaude(prompt);
  const parsed = parseJson<{ enhanced?: string }>(raw);

  let enhanced =
    typeof parsed?.enhanced === "string" && parsed.enhanced.trim()
      ? parsed.enhanced.trim()
      : input.memoryNote;

  const wordCount = enhanced.split(/\s+/).filter(Boolean).length;
  if (wordCount < 20) {
    enhanced +=
      " I don't have a perfect story, but here's what I know for sure about you…";
    console.warn(`[Step 0] Enhanced note was <20 words (${wordCount}); appended fallback line.`);
  }

  return enhanced;
}

// ---------------------------------------------------------------------------
// Step A — Creative Strategist
// Zod-validates output; throws if schema mismatch
// ---------------------------------------------------------------------------

async function runStepA(input: SurpriseInput): Promise<StrategyOutput> {
  const prompt = buildCreativeStrategistPrompt(input);
  const raw = await callClaude(prompt);
  const parsed = parseJson<unknown>(raw);
  return StrategyOutputSchema.parse(parsed);
}

// ---------------------------------------------------------------------------
// Step B — Experience Writer
// No internal retry loop — Step C owns retry.
// Returns raw writer output + flag if Zod validation failed
// ---------------------------------------------------------------------------

async function runStepB(
  input: SurpriseInput,
  strategy: StrategyOutput
): Promise<{ writer: unknown; validationFailed: boolean }> {
  const prompt = buildExperienceWriterPrompt(
    input,
    strategy,
    input.tier === "group" ? (input.contributors ?? []) : undefined
  );
  const raw = await callClaude(prompt);
  const parsed = parseJson<unknown>(raw);

  const result = ExperienceWriterOutputSchema.safeParse(parsed);
  if (result.success) {
    return { writer: result.data, validationFailed: false };
  }

  console.warn("[Step B] Zod validation failed, attempting one regeneration…", result.error.message);
  const raw2 = await callClaude(prompt);
  const parsed2 = parseJson<unknown>(raw2);
  const result2 = ExperienceWriterOutputSchema.safeParse(parsed2);
  if (result2.success) {
    return { writer: result2.data, validationFailed: false };
  }

  console.warn("[Step B] Second attempt also failed Zod; passing raw output with flag.");
  return { writer: parsed2, validationFailed: true };
}

// ---------------------------------------------------------------------------
// Step C — Quality Gate
// Returns score. Caller decides whether to re-run full pipeline.
// ---------------------------------------------------------------------------

async function runStepC(output: SurpriseOutput): Promise<QualityScore> {
  const prompt = buildQualityGatePrompt(JSON.stringify(output));
  const raw = await callClaude(prompt);
  const parsed = parseJson<unknown>(raw);
  return QualityScoreSchema.parse(parsed);
}

// ---------------------------------------------------------------------------
// Assemble final SurpriseOutput from strategy + writer parts
// ---------------------------------------------------------------------------

function assembleOutput(
  strategy: StrategyOutput,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  writer: any,
  input: SurpriseInput
): SurpriseOutput {
  return SurpriseOutputSchema.parse({
    type: "birthday_surprise",
    conceptTitle: strategy.conceptTitle ?? "Untitled",
    creativeDirection: strategy.creativeDirection ?? "",
    tone: strategy.tone ?? input.vibe,
    visualStyleId: strategy.visualStyleId ?? "soft-party",
    paletteId: strategy.paletteId ?? "cake-pop",
    locale: input.locale,
    hero: {
      headline: writer?.hero?.headline ?? "",
      subheadline: writer?.hero?.subheadline ?? "",
      introLine: writer?.hero?.introLine ?? "",
    },
    interaction: {
      type: strategy.interactionType ?? "tap_reveal",
      prompt: writer?.interaction?.prompt ?? "Tap to reveal",
      options: writer?.interaction?.options,
      revealText: writer?.interaction?.revealText ?? "",
    },
    memoryMoment: {
      title: writer?.memoryMoment?.title ?? "",
      body: writer?.memoryMoment?.body ?? "",
    },
    finalWish: {
      headline: writer?.finalWish?.headline ?? "",
      message: writer?.finalWish?.message ?? "",
      signature: writer?.finalWish?.signature ?? "",
    },
    share: {
      socialCaption: writer?.share?.socialCaption ?? "",
      remixHook: writer?.share?.remixHook ?? "",
    },
  });
}

// ---------------------------------------------------------------------------
// Full pipeline: Steps 0 → A → B → C (max 2 full attempts)
// ---------------------------------------------------------------------------

async function runFullPipeline(
  rawInput: SurpriseInput
): Promise<{ output: SurpriseOutput; qualityFlag: boolean }> {
  let bestOutput: SurpriseOutput | null = null;
  let bestScore = 0;
  let qualityFlag = false;

  for (let attempt = 0; attempt < 2; attempt++) {
    // Step 0: enhance
    const enhancedNote = await runStep0(rawInput);
    const input: SurpriseInput = { ...rawInput, memoryNote: enhancedNote };

    // Step A: strategise
    const strategy = await runStepA(input);

    // Step B: write (receives ONLY enhanced note — never raw memoryNote)
    const { writer } = await runStepB(input, strategy);

    // Assemble
    const assembled = assembleOutput(strategy, writer, input);

    // Step C: gate
    const score = await runStepC(assembled);
    assembled.qualityScore = score;

    if (score.overall >= 7.5) {
      return { output: assembled, qualityFlag: false };
    }

    console.warn(
      `[Step C] attempt ${attempt + 1}: overall=${score.overall} < 7.5. ${
        attempt === 0 ? "Re-running full pipeline…" : "Passing best result with quality_flag=true."
      }`
    );

    if (bestOutput === null || score.overall > bestScore) {
      bestOutput = assembled;
      bestScore = score.overall;
    }

    if (attempt === 1) {
      qualityFlag = true;
    }
  }

  return { output: bestOutput!, qualityFlag };
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await req.json();
    const input = GenerateRequestSchema.parse(body);

    const { output, qualityFlag } = await runFullPipeline(input);

    return NextResponse.json({ output, qualityFlag });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/generate] Error:", message);

    const status =
      message.includes("ANTHROPIC_API_KEY") ? 500
      : message.includes("parse") ? 422
      : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
