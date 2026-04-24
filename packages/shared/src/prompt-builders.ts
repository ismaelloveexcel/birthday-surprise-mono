import type { SurpriseInput, StrategyOutput, Contributor } from "./types";
import { REGIONAL_RULES } from "./regionalRules";

// ---------------------------------------------------------------------------
// Step 0 — Input Enhancer
// ---------------------------------------------------------------------------

export function buildInputEnhancerPrompt(
  memoryNote: string,
  relationship: string,
  region: string,
  locale: string
): string {
  return `You are an Input Enhancer for a premium birthday experience generator.
Your job is to rewrite a raw memory note into something vivid, specific, and emotionally resonant.

RULES:
- Output MUST be ≥20 words with ≥1 specific behavioural detail
- Preserve the original spirit — do NOT invent facts not implied by the input
- Keep it personal, free of clichés, punchy
- Respect the relationship context: "${relationship}"
- Region: ${region} | Output language: ${locale}
- Max 50 words

Raw memory: "${memoryNote}"

Return ONLY valid JSON:
{ "enhanced": "..." }`;
}

// ---------------------------------------------------------------------------
// Step A — Creative Strategist
// ---------------------------------------------------------------------------

export function buildCreativeStrategistPrompt(input: SurpriseInput): string {
  const rules = REGIONAL_RULES[input.region] ?? REGIONAL_RULES["north_america"];

  return `You are the Creative Strategist for a premium birthday surprise generator.
Choose one concept, visual style, tone, and interaction type for this experience.
Your output MUST respect the cultural constraints for the recipient's region.

Input:
- Recipient: ${input.recipientName}
- Relationship: ${input.relationship}
- Vibe: ${input.vibe}
- Region: ${input.region}
- Locale: ${input.locale}
- Memory (enhanced): ${input.memoryNote}

Regional cultural rules to honour:
- Allow teasing: ${rules.allowTeasing}
- Poetic bias: ${rules.poeticBias}
- Respect elders tone: ${rules.respectElders}
- Cultural notes: ${rules.culturalNotes}

Available visual styles: soft-party, night-glow, scrapbook-pop, editorial-luxe
Interaction types: tap_reveal, mini_quiz, choice_path, countdown_reveal

Return ONLY valid JSON:
{
  "conceptTitle": "short catchy title",
  "creativeDirection": "one sentence describing the experience direction",
  "tone": "emotional tone in 2-4 words",
  "visualStyleId": "one of the available styles",
  "paletteId": "matching palette string",
  "interactionType": "one of the interaction types",
  "culturalNotes": "specific constraints or tone adjustments Step B must follow for this region/relationship"
}`;
}

// ---------------------------------------------------------------------------
// Step B — Experience Writer (Production Prompt)
// No internal retry loop — Step C owns retry.
// ---------------------------------------------------------------------------

export function buildExperienceWriterPrompt(
  input: SurpriseInput,
  strategy: StrategyOutput,
  groupContributors?: Contributor[]
): string {
  const isGroupMode = groupContributors && groupContributors.length > 1;

  const languageLabel =
    input.locale === "en" ? "English"
    : input.locale === "fr" ? "French"
    : input.locale === "ar" ? "Arabic"
    : input.locale === "hi" ? "Hindi"
    : "Mauritian Creole";

  const memoriesBlock = isGroupMode
    ? groupContributors!
        .map((c, i) => `Memory ${i + 1} (from ${c.name}): ${c.memoryNote}`)
        .join("\n")
    : `Memory: ${input.memoryNote}`;

  const groupInstruction = isGroupMode
    ? `
GROUP MODE: This experience is contributed to by ${groupContributors!.length} people.
You MUST weave all memory notes into ONE unified, cohesive experience.
Each section (hero, memoryMoment, finalWish) may draw from different contributors.
The result must feel like ONE voice — not a list of separate tributes.
`
    : "";

  return `You are the Experience Writer for a mobile birthday surprise.
Write every word in ${languageLabel}.

MANDATORY RULES — ALL MUST BE FOLLOWED:
1. Sound like someone who knows the recipient deeply and personally
2. BANNED phrases: "wish you all the best", "many happy returns", "happy birthday" as a standalone opener
3. Be concise — short, punchy sentences optimised for mobile reading
4. Be unexpectedly specific — reference the actual memory detail, not a vague paraphrase
5. Optimise for emotional impact and screenshot-worthiness
6. HONOUR the cultural constraints from Step A (see below) — these are non-negotiable
7. If allowTeasing is false (elder, parent, MENA/SEA context): use warm reverence ONLY, no banter, no irony
8. If poeticBias is true: use elevated, lyrical language with metaphor and rhythm
${groupInstruction}

Recipient: ${input.recipientName}
Relationship: ${input.relationship}
Vibe: ${input.vibe}
Region: ${input.region}
${memoriesBlock}
Creative direction: ${strategy.creativeDirection}
Tone: ${strategy.tone}
Interaction type: ${strategy.interactionType}
Cultural constraints from Step A: ${strategy.culturalNotes}

Return ONLY valid JSON — no markdown, no explanation, no code blocks:
{
  "hero": {
    "headline": "bold punchy headline — NOT 'Happy Birthday [Name]', make it specific to their personality or the memory",
    "subheadline": "one evocative line that references who they are",
    "introLine": "short personal opener that directly references the memory detail"
  },
  "interaction": {
    "prompt": "question or prompt tailored for ${strategy.interactionType} — make it personal and specific",
    "options": ["option A", "option B", "option C"],
    "revealText": "surprising, warm reveal after interaction — ties back to the memory"
  },
  "memoryMoment": {
    "title": "short evocative title for the memory section",
    "body": "2-3 sentences — personal, specific, warm. Reference concrete details from the memory, not paraphrases."
  },
  "finalWish": {
    "headline": "short punchy closing headline",
    "message": "2-3 sentences — genuine, specific to this person, not generic or template-sounding",
    "signature": "who this is from — use the relationship type naturally"
  },
  "share": {
    "socialCaption": "caption to share on socials — no hashtags, max 100 chars, makes others curious",
    "remixHook": "short CTA urging the recipient to make one for someone they love"
  }
}`;
}

// ---------------------------------------------------------------------------
// Step C — Quality Gate
// Scores: specificity, contrast, screenshot-worthiness, emotional progression
// ---------------------------------------------------------------------------

export function buildQualityGatePrompt(outputJson: string): string {
  return `You are the Quality Gate for a birthday experience generator.
Score the following birthday experience from 1–10 on each dimension.

Output to evaluate:
${outputJson}

Scoring criteria:
- specificity: Does it reference concrete, specific details — or is it frustratingly generic?
- contrast: Does it have an unexpected angle, a surprising turn of phrase that stands out?
- screenshotWorthiness: Would someone screenshot this and send it? Is the copy visually compelling?
- emotionalProgression: Does it build from opener → interaction → memory → final wish with rising emotional weight?
- overall: Honest weighted average — penalise hard for generic phrases, reward for specificity and surprise

Return ONLY valid JSON:
{
  "specificity": number,
  "contrast": number,
  "screenshotWorthiness": number,
  "emotionalProgression": number,
  "overall": number
}`;
}
