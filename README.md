# Birthday Surprise Mono

AI-powered birthday experience generator — production-ready monorepo.

## Stack

| Layer | Tech |
|---|---|
| Mobile (primary) | Expo 50 + React Native + NativeWind |
| Web (share pages) | Next.js 14 App Router + Tailwind CSS |
| Database | Supabase (Postgres + JSONB + RLS) |
| AI Pipeline | Anthropic Claude (`claude-sonnet-4-20250514`) |
| Payments | Stripe (React Native + server-side intents) |
| Deployment | Vercel (web) + EAS (mobile) |

## Pricing

| Tier | Price | Includes |
|---|---|---|
| Single | $7.99 | 1 AI experience + permanent share URL |
| Premium | $14.99 | All above + voice narration + extended length + music mood + scheduled delivery |
| Group | $19.99 | Up to 5 contributors, AI weaves all memories into one |

All prices are defined in `packages/shared/src/pricing.ts` — **never hardcoded in components.**

## Architecture: AI Pipeline

```
Mobile → POST /api/generate (Next.js server)
           └── Step 0: Input Enhancer     (claude-sonnet-4-20250514)
           └── Step A: Creative Strategist (claude-sonnet-4-20250514)
           └── Step B: Experience Writer   (claude-sonnet-4-20250514)
           └── Step C: Quality Gate        (claude-sonnet-4-20250514)
                         └── score ≥ 7.5 → return result
                         └── score < 7.5 → re-run full pipeline (max 2 attempts)
                         └── still < 7.5 → return best result, quality_flag = true
```

Step B **never** receives raw `memoryNote` — only the Step 0 enhanced version.
`ANTHROPIC_API_KEY` lives on the server only — never in the mobile bundle.

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/ismaelloveexcel/birthday-surprise-mono
cd birthday-surprise-mono
pnpm install
```

### 2. Set environment variables

```bash
cp .env.example .env
# Fill in all values — see .env.example for descriptions
```

Required variables:
- `ANTHROPIC_API_KEY` — from console.anthropic.com
- `STRIPE_SECRET_KEY` — from dashboard.stripe.com (test: `sk_test_...`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — from Stripe dashboard
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from supabase.com
- `SUPABASE_SERVICE_ROLE_KEY` — from Supabase project settings
- `NEXT_PUBLIC_BASE_URL` — your Vercel deployment URL

### 3. Apply Supabase migration

```bash
# Option A: Supabase CLI
supabase db push

# Option B: SQL Editor
# Paste contents of supabase/migrations/001_production_hardening.sql
```

### 4. Deploy web (Vercel)

```bash
vercel --prod
# Or via GitHub integration — push to main
```

Vercel build settings:
- Framework: Next.js
- Root directory: `apps/web`
- Build command: `cd ../.. && pnpm build --filter=web`
- Output: `.next`

### 5. Build mobile (EAS)

```bash
cd apps/mobile
eas build --platform all --profile production
eas submit --platform all
```

EAS build is required for `@stripe/stripe-react-native` native modules.

---

## Launch Checklist

- [ ] `ANTHROPIC_API_KEY` set in Vercel env vars — app throws on missing
- [ ] `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set (server-side only)
- [ ] `NEXT_PUBLIC_BASE_URL` set to production Vercel URL
- [ ] `EXPO_PUBLIC_WEB_BASE_URL` set to same production URL (for mobile API calls)
- [ ] Supabase migration `001_production_hardening.sql` applied
- [ ] Stripe webhook configured: `POST /api/stripe-webhook` (add route if using webhooks)
- [ ] EAS build complete with Stripe native module
- [ ] `eas.json` configured with production credentials
- [ ] RLS policies verified: unauthenticated cannot list all experiences
- [ ] OG images render correctly at `/e/{id}/opengraph-image`
- [ ] Test full flow: Create → Generate → Tier Select → Stripe payment → Experience view
- [ ] Verify `$2.99` does not appear anywhere (`grep -r "2\.99" apps/`)
- [ ] Verify prices only from `packages/shared/src/pricing.ts`
- [ ] Arabic locale renders RTL on web viewer
- [ ] Group Mode: 5 contributors woven into one experience

## Regional Support

| Region | Key Markets | Language | Currency |
|---|---|---|---|
| `gulf_mena` | UAE, Saudi, Qatar | Arabic / English | AED |
| `south_asia` | India, Pakistan, Sri Lanka | Hindi / English | USD |
| `indian_ocean` | Mauritius, Réunion | French / Creole | MUR |
| `sub_saharan_africa` | Nigeria, Kenya, Ghana | English | USD |
| `western_europe` | UK, France, Germany | English / French | USD |
| `north_america` | USA, Canada | English | USD |
| `southeast_asia` | Philippines, Indonesia | English | USD |

All regional rules in `packages/shared/src/regionalRules.ts`.
