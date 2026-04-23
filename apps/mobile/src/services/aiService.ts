/**
 * AI JSON service abstraction.
 * Defaults to mock mode when no API key is set.
 * To use a real provider, set ANTHROPIC_API_KEY or OPENAI_API_KEY in your .env.
 *
 * Retry logic: if JSON parse fails, retries up to 2 times with a stricter prompt.
 */

const MAX_RETRIES = 2;

export async function aiJsonCall(prompt: string): Promise<unknown> {
  const apiKey =
    process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY || "";

  if (!apiKey) {
    return getMockResponse(prompt);
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const finalPrompt =
      attempt === 0
        ? prompt
        : `${prompt}\n\nIMPORTANT: Return ONLY valid JSON. No markdown, no explanation, no code blocks.`;

    try {
      const raw = await callProvider(finalPrompt, apiKey);
      const parsed = parseJson(raw);
      if (parsed !== null) return parsed;
    } catch (err) {
      if (attempt === MAX_RETRIES) {
        console.warn("[AI] All retries failed, falling back to mock.", err);
        return getMockResponse(prompt);
      }
    }
  }

  return getMockResponse(prompt);
}

async function callProvider(prompt: string, apiKey: string): Promise<string> {
  // Supports Anthropic Claude (claude-3-5-sonnet) or OpenAI-compatible chat completions.
  // Anthropic is preferred; falls back to OpenAI endpoint format.
  if (process.env.ANTHROPIC_API_KEY) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`);
    const data = (await res.json()) as { content: Array<{ text: string }> };
    return data.content[0]?.text ?? "";
  }

  // OpenAI-compatible fallback
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`);
  const data = (await res.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  return data.choices[0]?.message?.content ?? "";
}

function parseJson(raw: string): unknown | null {
  try {
    return JSON.parse(raw);
  } catch {
    // Try to extract JSON from markdown code block
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

// ---------------------------------------------------------------------------
// Mock mode – high-quality sample responses keyed by prompt content
// ---------------------------------------------------------------------------
function getMockResponse(prompt: string): unknown {
  if (prompt.includes("Input Enhancer")) {
    return {
      enhanced:
        "That chaotic karaoke night where everything went wrong and somehow became the best story either of us tells at parties.",
    };
  }

  if (prompt.includes("Creative Strategist")) {
    return {
      conceptTitle: "Chaos to Legend",
      creativeDirection:
        "A playful, nostalgic trip through the moments that define why this friendship is genuinely one of a kind.",
      tone: "funny and warm",
      visualStyleId: "scrapbook-pop",
      paletteId: "memory-collage",
      interactionType: "mini_quiz",
    };
  }

  if (prompt.includes("Experience Writer")) {
    return {
      hero: {
        headline: "You absolute legend.",
        subheadline: "Someone who was there had to say it.",
        introLine:
          "You know which night I'm talking about. The karaoke. The chaos. The standing ovation nobody saw coming.",
      },
      interaction: {
        prompt: "Be honest — what was your secret weapon that night?",
        options: [
          "Unshakable confidence",
          "Pure chaos energy",
          "The crowd just felt sorry for us",
        ],
        revealText:
          "Doesn't matter. You turned it into a memory worth telling forever. That's your thing.",
      },
      memoryMoment: {
        title: "The night we accidentally became icons",
        body:
          "Most people plan great memories. You manufacture them out of disasters. That karaoke night should have been embarrassing — instead it's the story everyone asks us to retell. That's a skill, honestly.",
      },
      finalWish: {
        headline: "Another year of beautiful chaos",
        message:
          "May this year bring you at least three stories you'll be telling at 80. You've already got the talent for it.",
        signature: "Your partner in chaos",
      },
      share: {
        socialCaption:
          "I made something better than a birthday text. Way better. ✨",
        remixHook: "Make one for the person who makes your best stories.",
      },
    };
  }

  if (prompt.includes("Quality Gate")) {
    return {
      emotionalResonance: 8.5,
      uniqueness: 9.0,
      mobileClarity: 8.8,
      remixability: 9.2,
      overall: 8.9,
    };
  }

  return {};
}
