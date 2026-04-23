import type { SurpriseInput } from "./types";

export function buildInputEnhancerPrompt(memoryNote: string): string {
  return `You are an Input Enhancer for a premium birthday experience generator.
Rewrite the following memory into a more vivid, specific, and emotionally resonant short paragraph (max 40 words).
Keep it personal, surprising, and free of clichés.

Memory: "${memoryNote}"

Return ONLY valid JSON: { "enhanced": "..." }`;
}

export function buildCreativeStrategistPrompt(input: SurpriseInput): string {
  return `You are the Creative Strategist for a premium birthday surprise generator.
Choose one concept, visual style, tone, and interaction type for this experience.

Input:
- Recipient: ${input.recipientName}
- Relationship: ${input.relationship}
- Vibe: ${input.vibe}
- Memory (enhanced): ${input.memoryNote}

Available visual styles: soft-party, night-glow, scrapbook-pop, editorial-luxe
Interaction types: tap_reveal, mini_quiz, choice_path, countdown_reveal

Return ONLY valid JSON:
{
  "conceptTitle": "short catchy title",
  "creativeDirection": "one sentence describing the experience direction",
  "tone": "emotional tone in 2-4 words",
  "visualStyleId": "one of the available styles",
  "paletteId": "matching palette string",
  "interactionType": "one of the interaction types"
}`;
}

export function buildExperienceWriterPrompt(
  input: SurpriseInput,
  strategy: {
    conceptTitle: string;
    creativeDirection: string;
    tone: string;
    visualStyleId: string;
    paletteId: string;
    interactionType: string;
  }
): string {
  return `You are the Experience Writer for a mobile birthday surprise.

MANDATORY RULES:
- Sound like someone who knows the recipient deeply
- Avoid clichés: "wish you all the best", "many happy returns", "happy birthday" as a standalone phrase
- Be concise for mobile reading (short sentences, punchy)
- Feel slightly surprising or unexpectedly specific
- Optimize for emotional impact and shareability

Recipient: ${input.recipientName}
Relationship from: ${input.relationship}
Vibe: ${input.vibe}
Memory: ${input.memoryNote}
Creative direction: ${strategy.creativeDirection}
Tone: ${strategy.tone}
Interaction type: ${strategy.interactionType}

Return ONLY valid JSON:
{
  "hero": {
    "headline": "bold punchy headline (not just 'Happy Birthday Name')",
    "subheadline": "one evocative line",
    "introLine": "short personal opener that references the memory"
  },
  "interaction": {
    "prompt": "question or action prompt for the ${strategy.interactionType}",
    "options": ["option1", "option2", "option3"],
    "revealText": "surprising, warm reveal after interaction"
  },
  "memoryMoment": {
    "title": "short title for the memory section",
    "body": "2-3 sentences, personal, specific, warm"
  },
  "finalWish": {
    "headline": "a short punchy closing headline",
    "message": "2-3 sentences, genuine, specific to this person",
    "signature": "who this is from (the relationship)"
  },
  "share": {
    "socialCaption": "caption to share on socials (no hashtags, max 100 chars)",
    "remixHook": "short CTA urging others to make one for their person"
  }
}`;
}

export function buildQualityGatePrompt(outputJson: string): string {
  return `You are the Quality Gate for a birthday experience generator.
Score the following birthday experience from 1–10 on each dimension.

Output to evaluate:
${outputJson}

Scoring criteria:
- emotionalResonance: Does it feel genuinely personal and moving?
- uniqueness: Is it surprising and specific, not generic?
- mobileClarity: Is the copy concise and readable on mobile?
- remixability: Would others want to share or remix this?
- overall: Honest weighted average (not just arithmetic mean)

Return ONLY valid JSON:
{
  "emotionalResonance": number,
  "uniqueness": number,
  "mobileClarity": number,
  "remixability": number,
  "overall": number
}`;
}
