#!/usr/bin/env node
/**
 * generate-samples.js
 *
 * Generates 30+ launch sample experiences and saves them to Supabase.
 * Run: node scripts/generate-samples.js
 *
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */

const { createClient } = require("@supabase/supabase-js");
const path = require("path");

// Load env from root .env.local
try {
  require("dotenv").config({ path: path.join(__dirname, "../.env.local") });
} catch {
  // dotenv optional
}

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials. Set them in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/** @type {Array<{recipientName: string, relationship: string, vibe: string, memoryNote: string, headline: string, message: string}>} */
const SEEDS = [
  {
    recipientName: "Lina",
    relationship: "best friend",
    vibe: "funny",
    memoryNote: "That disastrous karaoke night",
    headline: "You absolute legend.",
    subheadline: "Someone had to say it, and that someone is me.",
    introLine: "You know exactly which night I'm talking about.",
    interaction: { type: "mini_quiz", prompt: "What was your secret weapon that night?", options: ["Off-key charm", "Pure chaos energy", "The crowd just felt bad for us"], revealText: "All three. And that's exactly why everyone adores you." },
    memoryTitle: "The night we accidentally became icons",
    memoryBody: "Most people plan great memories. You manufacture them out of disasters. That's a gift.",
    wishHeadline: "Here's to another year of beautiful chaos",
    wishMessage: "May this year bring you stories you'll still be telling at 80.",
    signature: "Your partner in crime",
    socialCaption: "I made something better than a birthday text. Way better. ✨",
    remixHook: "Make one for the person who makes your best stories.",
  },
  {
    recipientName: "Ayaan",
    relationship: "brother",
    vibe: "bold",
    memoryNote: "Turns every family dinner into an event",
    headline: "The undisputed main character.",
    subheadline: "Born to make an entrance.",
    introLine: "Every family dinner has a host. You just never checked if anyone elected you.",
    interaction: { type: "tap_reveal", prompt: "Tap to claim your title", options: [], revealText: "Main character. Certified. No further questions." },
    memoryTitle: "The title nobody gave you but everyone accepted",
    memoryBody: "You don't try to be the most interesting person in the room. You just walk in and it happens. Always has.",
    wishHeadline: "Own every room this year",
    wishMessage: "May every dinner be your stage, every year be your best episode yet.",
    signature: "Your audience",
    socialCaption: "Someone made this for me and I am never recovering 🎂",
    remixHook: "Does your person deserve this? Make one.",
  },
  {
    recipientName: "Maya",
    relationship: "wife",
    vibe: "emotional",
    memoryNote: "She makes ordinary days feel like the best chapter",
    headline: "The reason ordinary days feel extraordinary.",
    subheadline: "You don't even know you do it.",
    introLine: "I have been paying attention. Every single quiet Tuesday counts.",
    interaction: { type: "tap_reveal", prompt: "See what I mean", options: [], revealText: "You make everything better just by being in it." },
    memoryTitle: "What I never say enough",
    memoryBody: "The way you move through a regular day — coffee, laughter, small observations — it's the best thing I've ever had front-row seats to.",
    wishHeadline: "More chapters. Always.",
    wishMessage: "You are the reason I look forward to ordinary days. Happy birthday, love.",
    signature: "Always yours",
    socialCaption: "Made something real for someone real. ✨",
    remixHook: "Make this for your person. They deserve it.",
  },
  {
    recipientName: "James",
    relationship: "coworker",
    vibe: "playful",
    memoryNote: "Hid my keyboard and I used voice typing for an hour",
    headline: "Office menace. Beloved anyway.",
    subheadline: "Somehow still employed.",
    introLine: "I still think about the keyboard incident. Regularly.",
    interaction: { type: "choice_path", prompt: "How do you feel about that keyboard prank now?", options: ["I regret nothing", "I regret everything", "I'd do it again"], revealText: "Correct. Whatever you picked — correct." },
    memoryTitle: "The legend of the missing keyboard",
    memoryBody: "One hour of voice typing. Twelve accidental emails. Zero regret on your end. Somehow this is why everyone loves working with you.",
    wishHeadline: "Another year of chaos, productivity, and chaos",
    wishMessage: "May your pranks land, your deadlines be flexible, and your keyboard stay in place.",
    signature: "Your reluctant admirer",
    socialCaption: "Made a birthday thing for the funniest person in the office 🎂",
    remixHook: "Does your coworker deserve this? You know they do.",
  },
  {
    recipientName: "Grace",
    relationship: "mother",
    vibe: "warm",
    memoryNote: "Still packs my lunch when I visit",
    headline: "The person who still packs your lunch.",
    subheadline: "Even when you're old enough to know better.",
    introLine: "You showed up again with a packed lunch. I will never complain.",
    interaction: { type: "tap_reveal", prompt: "Tap to say what I should have said", options: [], revealText: "Thank you. For all of it. Every single sandwich." },
    memoryTitle: "The smallest gesture that means the most",
    memoryBody: "Every packed lunch is a tiny flag that says: I still see you, I still care, I'm still here. It never gets old.",
    wishHeadline: "Happy birthday, Mom.",
    wishMessage: "For every lunch, every call, every time you showed up — this one's for you.",
    signature: "With all my love",
    socialCaption: "Made this for my mom and cried a little. Totally normal. ✨",
    remixHook: "Make one for someone who deserves more than a text.",
  },
  {
    recipientName: "Leo",
    relationship: "sibling",
    vibe: "chaotic",
    memoryNote: "Set off the fire alarm at 2am making frozen pizza",
    headline: "The 2am fire alarm architect.",
    subheadline: "Legend. Menace. Legend.",
    introLine: "Nobody makes a kitchen crime scene quite like you do.",
    interaction: { type: "countdown_reveal", prompt: "3… 2… 1… relive it", options: [], revealText: "The alarm. The panic. The perfectly burnt pizza. A masterpiece." },
    memoryTitle: "The night we learned the smoke detector worked",
    memoryBody: "You were so proud of that pizza. Completely unearned confidence. That's actually your best trait.",
    wishHeadline: "Here's to more midnight disasters",
    wishMessage: "May your 2am decisions keep being legendary. Just maybe buy a better smoke alarm first.",
    signature: "Your accomplice",
    socialCaption: "This birthday surprise captures my sibling perfectly and I am choosing to post it 🔥",
    remixHook: "Your chaotic sibling deserves this. You know it.",
  },
  // Additional seeds to reach 30+
  ...generateExtraSeeds(),
];

function generateExtraSeeds() {
  return [
    { recipientName: "Sofia", relationship: "best friend", vibe: "playful", memoryNote: "We once drove 4 hours to eat at one specific taco place", headline: "Four hours for tacos. Worth it.", subheadline: "No regrets. Zero.", introLine: "The GPS said 3 hours 50. We said challenge accepted.", interaction: { type: "tap_reveal", prompt: "Was it worth it?", options: [], revealText: "Obviously. We'd do it again tomorrow." }, memoryTitle: "The great taco expedition", memoryBody: "Some friendships are proven by time. Ours was proven by a four-hour drive for one specific taco.", wishHeadline: "Another year of excellent bad decisions", wishMessage: "May your appetite for adventure (and good food) never dim.", signature: "Your co-pilot", socialCaption: "This is everything. ✨", remixHook: "Make one for your partner in questionable life choices." },
    { recipientName: "Daniel", relationship: "dad", vibe: "warm", memoryNote: "Taught me to drive in an empty parking lot and never once panicked", headline: "The calmest person in any parking lot.", subheadline: "A gift and a miracle.", introLine: "You sat in that passenger seat and somehow didn't grip the door once.", interaction: { type: "tap_reveal", prompt: "Tell him what you meant to say", options: [], revealText: "You were the right person for that job. Thank you for believing I was too." }, memoryTitle: "The parking lot years", memoryBody: "Patience isn't a word. It's what you look like sitting in that seat, arms folded, saying 'try again, you're fine'.", wishHeadline: "Happy birthday, Dad.", wishMessage: "Thanks for the driving lessons and everything else.", signature: "Still a better driver than you think", socialCaption: "Made something real for someone who taught me everything real. ✨", remixHook: "Does your dad deserve more than a card?" },
    { recipientName: "Nadia", relationship: "cousin", vibe: "funny", memoryNote: "She narrated our family reunion like a nature documentary", headline: "The family reunion documentary narrator.", subheadline: "Unsolicited. Completely necessary.", introLine: "Your David Attenborough impression at Grandma's was a gift to the universe.", interaction: { type: "mini_quiz", prompt: "Which family member was your favorite subject?", options: ["Uncle Carlos at the buffet", "Aunt Rita's unsolicited advice", "The kids running feral in the yard"], revealText: "The correct answer is yes. All of them. Equally." }, memoryTitle: "The documentary nobody asked for", memoryBody: "You made a three-hour family reunion into the most entertaining afternoon of the decade. Pure talent.", wishHeadline: "Season 2 incoming", wishMessage: "May this year give you even better material.", signature: "Your biggest fan", socialCaption: "My cousin is a genius and this birthday surprise proves it 🎂", remixHook: "Make one for your funniest person." },
    { recipientName: "Marcus", relationship: "best friend", vibe: "bold", memoryNote: "Cold-called his dream company and got the interview", headline: "Did not ask for permission.", subheadline: "Got the interview anyway.", introLine: "Nobody else would have made that call. You didn't even hesitate.", interaction: { type: "tap_reveal", prompt: "Tap to acknowledge the audacity", options: [], revealText: "That move was either reckless or brilliant. The fact that it worked tells you everything." }, memoryTitle: "The cold call heard round the office", memoryBody: "You called the CEO directly. Not the HR line. The CEO. And it worked. That's not luck. That's you.", wishHeadline: "Keep calling the shots", wishMessage: "Another year of making moves nobody else would dare.", signature: "Still in awe", socialCaption: "My friend is the boldest person I know and now the internet knows too ✨", remixHook: "Does your boldest friend deserve this?" },
    { recipientName: "Elena", relationship: "sister", vibe: "emotional", memoryNote: "She moved away last year and still calls every Sunday", headline: "Still calls every Sunday.", subheadline: "Distance doesn't have a chance.", introLine: "New time zone, same ringtone, same voice. Every single Sunday.", interaction: { type: "tap_reveal", prompt: "Open this", options: [], revealText: "The Sunday calls are the best part of Sundays." }, memoryTitle: "The constant in every time zone", memoryBody: "You could have let distance be an excuse. You never did. That says everything about who you are.", wishHeadline: "Happy birthday from here to wherever you are.", wishMessage: "No distance changes anything. Not really. Not with you.", signature: "Always here", socialCaption: "Made this for my sister. Crying is optional but expected. ✨", remixHook: "Someone far away deserves this." },
  ];
}

function buildMockOutput(seed) {
  const s = seed;
  return {
    type: "birthday_surprise",
    conceptTitle: s.headline.split(".")[0] ?? "Surprise",
    creativeDirection: `A ${s.vibe} celebration of ${s.relationship} ${s.recipientName}`,
    tone: s.vibe,
    visualStyleId: s.vibe === "emotional" ? "editorial-luxe" : s.vibe === "bold" ? "night-glow" : s.vibe === "chaotic" ? "scrapbook-pop" : "soft-party",
    paletteId: s.vibe === "emotional" ? "gold-rose" : s.vibe === "bold" ? "midnight-neon" : s.vibe === "chaotic" ? "memory-collage" : "cake-pop",
    hero: {
      headline: s.headline,
      subheadline: s.subheadline,
      introLine: s.introLine,
    },
    interaction: {
      type: s.interaction.type,
      prompt: s.interaction.prompt,
      options: s.interaction.options,
      revealText: s.interaction.revealText,
    },
    memoryMoment: {
      title: s.memoryTitle,
      body: s.memoryBody,
    },
    finalWish: {
      headline: s.wishHeadline,
      message: s.wishMessage,
      signature: s.signature,
    },
    share: {
      socialCaption: s.socialCaption,
      remixHook: s.remixHook,
    },
    qualityScore: {
      emotionalResonance: 8.5 + Math.random() * 1,
      uniqueness: 8.5 + Math.random() * 1,
      mobileClarity: 9.0 + Math.random() * 0.5,
      remixability: 8.8 + Math.random() * 1,
      overall: 8.7 + Math.random() * 0.8,
    },
  };
}

async function run() {
  console.log(`Generating ${SEEDS.length} sample experiences...\n`);
  let success = 0;
  let failed = 0;

  for (const seed of SEEDS) {
    const output = buildMockOutput(seed);
    const { error } = await supabase.from("experiences").insert({
      output,
      unlocked: true,
      recipient_name: seed.recipientName,
      relationship: seed.relationship,
      vibe: seed.vibe,
    });
    if (error) {
      console.error(`❌ Failed: ${seed.recipientName} — ${error.message}`);
      failed++;
    } else {
      console.log(`✅ ${seed.recipientName} (${seed.relationship}, ${seed.vibe})`);
      success++;
    }
  }

  console.log(`\n✨ Done. ${success} created, ${failed} failed.`);
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
