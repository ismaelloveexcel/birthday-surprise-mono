# Birthday Surprise Experience

Turn one memory into a birthday surprise they'll actually remember.

## Architecture

```
birthday-surprise-mono/
├── apps/
│   ├── mobile/          # Expo React Native — primary product
│   └── web/             # Next.js 14 — public share pages only
├── packages/
│   └── shared/          # Types, constants, prompt builders (Zod)
├── supabase/
│   └── schema.sql       # Run in Supabase SQL editor
├── scripts/
│   └── generate-samples.js
├── turbo.json
├── pnpm-workspace.yaml
└── .env.example
```

## Stack

| Layer | Tech |
|---|---|
| Mobile (primary) | Expo 50, React Native, NativeWind, Reanimated 3 |
| Web (share pages) | Next.js 14 App Router, Tailwind CSS |
| Shared types | TypeScript, Zod |
| Database | Supabase (Postgres + JSONB) |
| AI | Anthropic Claude / OpenAI (mock mode by default) |
| OG Images | @vercel/og |
| Payments | Mock (Stripe/RevenueCat ready) |
| Analytics | Supabase analytics table |

## Quick Start

### 1. Install

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Copy the same values into `apps/mobile/.env.local`:

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_WEB_BASE_URL=http://localhost:3000
```

### 3. Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and run `supabase/schema.sql`

### 4. Build shared package

```bash
cd packages/shared
pnpm build
cd ../..
```

### 5. Run dev servers

```bash
# Both apps
pnpm dev

# Or individually
pnpm dev:mobile   # Expo at http://localhost:8081
pnpm dev:web      # Next.js at http://localhost:3000
```

### 6. Generate sample experiences (optional)

```bash
pnpm generate:samples
```

## Key Flows

### Creator flow (mobile)
1. Enter 4 inputs: `recipientName`, `relationship`, `vibe`, `memoryNote`
2. AI pipeline generates a personalised experience (mock by default)
3. Blurred preview is shown
4. Tap "Unlock for $2.99" → mock payment → full experience unlocked
5. Permanent share URL: `https://yourdomain.com/e/{id}`

### Viewer flow (web)
1. Recipient opens share URL `/e/{id}`
2. Sees full experience: hero → interaction → memory → final wish
3. Confetti on interaction reveal
4. Share bar and remix bar visible

### AI Pipeline
- **Step 0** — Input Enhancer: sharpens the memory note
- **Step A** — Creative Strategist: picks style, tone, interaction type
- **Step B** — Experience Writer: writes all copy
- **Step C** — Quality Gate: scores 1-10; regenerates if overall < 7.5

## AI Setup

Set one of these in `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...
# or
OPENAI_API_KEY=sk-...
```

Without a key, the app runs in **mock mode** with high-quality sample responses.

## Payments

Currently mocked in `apps/mobile/src/services/paymentService.ts`.

To integrate Stripe, replace `mockPaymentSheet()` with Stripe React Native SDK calls.

## Analytics

Events tracked: `experience_generated`, `preview_viewed`, `payment_started`, `payment_success`, `experience_opened`, `interaction_completed`, `share_clicked`, `remix_clicked`

Remix rate SQL:
```sql
SELECT
  experience_id,
  COUNT(*) FILTER (WHERE event_type = 'remix_clicked') AS remixes,
  COUNT(*) FILTER (WHERE event_type = 'experience_opened') AS opens,
  ROUND(
    COUNT(*) FILTER (WHERE event_type = 'remix_clicked')::numeric /
    NULLIF(COUNT(*) FILTER (WHERE event_type = 'experience_opened'), 0), 4
  ) AS remix_rate
FROM analytics
GROUP BY experience_id
ORDER BY remix_rate DESC NULLS LAST;
```

## Deploy

**Web (Vercel):** Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_BASE_URL` in the Vercel dashboard.

**Mobile (EAS):**
```bash
cd apps/mobile
eas build -p ios
eas build -p android
```

## Launch Checklist

- [ ] Supabase project created and `schema.sql` applied
- [ ] `.env.local` configured with Supabase credentials
- [ ] `pnpm install` + `packages/shared` built
- [ ] Mobile app runs: `pnpm dev:mobile`
- [ ] Web app runs: `pnpm dev:web`
- [ ] Enter 4 inputs → surprise generates
- [ ] Preview shows blur + "Unlock for $2.99"
- [ ] Mock payment → full experience unlocks
- [ ] Share URL opens on web and renders correctly
- [ ] Interaction tap triggers confetti + haptics
- [ ] Remix button triggers deep link
- [ ] Analytics events appear in Supabase
- [ ] `pnpm generate:samples` populates launch content
AI-powered birthday surprise generator with shareable experiences, remix loop, and viral growth system
