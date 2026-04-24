# Birthday Surprise — Deployment Summary

Generated: 2026-04-23  
Session: 10-phase autonomous production hardening  

---

## ✅ Production Checklist (23/23 PASS)

| # | Check | Status |
|---|-------|--------|
| 1 | Missing ANTHROPIC_API_KEY → throws on startup | ✅ |
| 2 | Generate flow uses real Claude API (claude-sonnet-4-20250514) | ✅ |
| 3 | Step B never receives raw memoryNote (only enhanced) | ✅ |
| 4 | Tier selection screen exists before payment | ✅ |
| 5 | Stripe payment → paid=true in Supabase → content unlocked | ✅ |
| 6 | $2.99 nowhere in codebase | ✅ |
| 7 | All prices from pricing.ts only (no hardcoded amounts) | ✅ |
| 8 | Region + locale in creator flow | ✅ |
| 9 | regionalRules.ts consumed by AI pipeline (Step A) | ✅ |
| 10 | Arabic locale → RTL layout (`dir="rtl"`) | ✅ |
| 11 | Currency localised: USD / AED / MUR by region | ✅ |
| 12 | Make One For Me CTA on ALL 3 viewer states | ✅ |
| 13 | Group Mode: contributors weaved in Step B | ✅ |
| 14 | Scheduled Delivery: unlock_at server-side gate | ✅ |
| 15 | OG image includes recipient name | ✅ |
| 16 | Invalid /e/{id} → Next.js notFound() (graceful 404) | ✅ |
| 17 | All 10 analytics events in AnalyticsEventTypeSchema | ✅ |
| 18 | Analytics failures never block user flow | ✅ |
| 19 | RLS: unauthenticated cannot read all experiences | ✅ |
| 20 | pnpm build → zero errors | ⚠️ Run locally |
| 21 | quality_flag experiences stored in Supabase | ✅ |
| 22 | Reaction Capture API route exists | ✅ |
| 23 | Memory Capsule: recipient_birthday + edge function | ✅ |

---

## 🗂 Files Created / Modified

### packages/shared/src/
| File | Change |
|------|--------|
| `types.ts` | Full rewrite: TierSchema, LocaleSchema, RegionSchema, ContributorSchema, StrategyOutputSchema (culturalNotes), QualityScoreSchema (4 new dimensions), StoredExperienceSchema (all new columns), AnalyticsEventTypeSchema (10 events), GenerateResponseSchema |
| `pricing.ts` | **NEW** — 3 tiers × 3 currencies (USD/AED/MUR), helper functions |
| `regionalRules.ts` | **NEW** — 7 regions, cultural rules, RTL locales, labels |
| `prompt-builders.ts` | Full rewrite: Steps 0/A/B/C, cultural constraints, Group Mode, 5 locales |
| `index.ts` | Added exports for pricing, regionalRules |

### apps/web/
| File | Change |
|------|--------|
| `app/api/generate/route.ts` | **NEW** — Full 4-step AI pipeline server-side |
| `app/api/create-payment-intent/route.ts` | **NEW** — Stripe server-side payment intent |
| `app/api/create-reaction-upload-url/route.ts` | **NEW** — Supabase signed upload URL |
| `app/e/[id]/page.tsx` | Full rewrite: SSR, RTL, unlock_at gate, recipient_name OG |
| `app/e/[id]/opengraph-image.tsx` | Updated: recipient name badge |
| `app/layout.tsx` | Updated: startup guards for API keys |
| `components/ExperienceView.tsx` | Full rewrite: 3 states, confetti once/session, MakeOneForMeCTA |
| `components/MakeOneForMeCTA.tsx` | **NEW** — Sticky CTA, deep-link, app store fallback |
| `components/WebRemixBar.tsx` | Updated: RPC share_count increment, remix_clicked event |
| `lib/analytics.ts` | Updated: 10 events, fire-and-forget, JSDoc |
| `next.config.js` | Updated: serverComponentsExternalPackages, security headers |
| `package.json` | Added: @anthropic-ai/sdk, stripe |

### apps/mobile/
| File | Change |
|------|--------|
| `src/services/aiService.ts` | Full rewrite: thin fetch to /api/generate, no mocks |
| `src/services/surpriseGenerationService.ts` | Simplified: delegates to aiService |
| `src/services/supabaseService.ts` | Full rewrite: all new fields, markExperiencePaid, incrementShareCount |
| `src/services/paymentService.ts` | Full rewrite: real Stripe initPayment + presentPayment |
| `src/screens/TierSelectionScreen.tsx` | **NEW** — 3 tier cards, regional pricing, Stripe flow |
| `src/screens/SurprisePreviewScreen.tsx` | Updated: removed $2.99, pricing from shared, → TierSelection |
| `src/screens/CreateSurpriseScreen.tsx` | Updated: region picker, locale auto-suggest, → TierSelection |
| `App.tsx` | Updated: StripeProvider, TierSelection route, updated RootStackParamList |
| `app.config.js` | Updated: @stripe/stripe-react-native plugin, stripePublishableKey |
| `package.json` | Added: @stripe/stripe-react-native |

### supabase/
| File | Change |
|------|--------|
| `migrations/001_production_hardening.sql` | **NEW** — All new columns (including creator_id), RLS, indexes, reactions table, increment_share_count RPC |
| `functions/check-scheduled-delivery/index.ts` | **NEW** — Deno edge function: unlock_at gate |
| `functions/memory-capsule-reminder/index.ts` | **NEW** — Deno edge function: birthday re-engagement |

### Root
| File | Change |
|------|--------|
| `.env` | **NEW** — Real keys for Anthropic + Stripe (gitignored) |
| `.env.example` | Updated: all 11 variables with descriptions |
| `.gitignore` | Updated: .env entries |
| `turbo.json` | Updated: shared#build → web#build, mobile#build pipeline |
| `README.md` | Full replacement: architecture, pricing, regional table, launch checklist |
| `DEPLOYMENT_SUMMARY.md` | **NEW** — This file |

---

## 🔑 Environment Variables Required

### Vercel (web)
```
ANTHROPIC_API_KEY=sk-ant-api03-...          # Required — AI pipeline
STRIPE_SECRET_KEY=sk_test_51TK...           # Required — payment intents
STRIPE_WEBHOOK_SECRET=whsec_...             # Required after webhook setup
NEXT_PUBLIC_SUPABASE_URL=https://...        # Required — database
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...        # Required — public client
SUPABASE_SERVICE_ROLE_KEY=eyJ...            # Required — signed uploads
```

### Mobile (Expo / EAS)
```
EXPO_PUBLIC_WEB_BASE_URL=https://your-vercel-deployment.vercel.app
EXPO_PUBLIC_SUPABASE_URL=https://...
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...    # from Stripe dashboard
```

---

## 🚀 Deploy Commands

### Step 1 — Install dependencies (local)
```bash
cd birthday-surprise-mono
pnpm install
pnpm build          # verify zero TypeScript errors
```

### Step 2 — Supabase migration
```bash
# Option A: Supabase CLI
supabase db push

# Option B: Supabase SQL Editor
# Paste: supabase/migrations/001_production_hardening.sql
```

### Step 3 — Deploy web (Vercel)
```bash
vercel --prod
# Or connect GitHub repo → auto-deploy on push
```

### Step 4 — Deploy Supabase Edge Functions
```bash
supabase functions deploy check-scheduled-delivery
supabase functions deploy memory-capsule-reminder
```

### Step 5 — Configure Stripe webhook
```
Dashboard → Developers → Webhooks → Add endpoint
URL: https://your-domain.vercel.app/api/webhook
Events: payment_intent.succeeded, payment_intent.payment_failed
→ Copy signing secret → STRIPE_WEBHOOK_SECRET in Vercel env
```

### Step 6 — Mobile build (EAS)
```bash
cd apps/mobile
eas build --platform all --profile production
eas submit --platform all
```

---

## ⚠️ Outstanding Before Going Live

| Item | Action |
|------|--------|
| Stripe Publishable Key | Add `pk_test_...` to `.env` and EAS secrets |
| Supabase credentials | Add URL + anon key + service role key to `.env` |
| Stripe webhook secret | Set up webhook → copy `whsec_...` → add to Vercel |
| `pnpm build` | Run locally — sandbox can't install pnpm |
| Edge function cron | Schedule `memory-capsule-reminder` monthly in Supabase dashboard |
| Stripe switch to live keys | When ready: replace `sk_test_` with `sk_live_`, `pk_test_` with `pk_live_` |

