# Birthday Surprise — Final Setup (3 steps)

Everything is built and ready. You need to do 3 things, then run one command.

---

## Step 1 — Create a Supabase project

You've hit the free tier limit (2 active projects). Do one of:

**Option A — Pause an existing project (30 seconds)**
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Open a project you don't actively need
3. Settings → General → Pause project
4. Come back and create a new project named `birthday-surprise`

**Option B — Use an existing project** (if you don't mind mixing schemas)
1. Open any active project in your Supabase dashboard
2. Go to SQL Editor → paste the contents of `supabase/migrations/001_production_hardening.sql` → Run

Once you have a project, grab these three values from **Project Settings → API**:
```
NEXT_PUBLIC_SUPABASE_URL    = https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY    = eyJ...
SUPABASE_SERVICE_ROLE_KEY   = eyJ...  (under "service_role — secret")
```

Add them to `.env` (replacing the placeholder values).

Also copy `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` into the matching `EXPO_PUBLIC_` variables.

---

## Step 2 — Get your Stripe publishable key (30 seconds)

1. Go to [dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
2. Copy the **Publishable key** — it starts with `pk_test_`
3. Add to `.env`:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## Step 3 — Run the setup script

```bash
cd birthday-surprise-mono
bash scripts/setup.sh
```

This will:
- ✅ Install all dependencies (`pnpm install`)
- ✅ Build the shared package
- ✅ Run TypeScript type-check on web + mobile
- ✅ Apply the Supabase migration (if Supabase CLI is installed)
- ✅ Deploy the two edge functions
- ✅ Run `next build` to verify zero errors

---

## Step 4 — Deploy

```bash
# Web (Vercel)
vercel --prod

# Mobile (EAS)
cd apps/mobile
eas build --platform all --profile production
eas submit --platform all
```

---

## Step 5 — Set up Stripe webhook (after Vercel deploy)

1. Go to [dashboard.stripe.com/test/webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click **Add endpoint**
3. Endpoint URL: `https://YOUR_VERCEL_DOMAIN/api/webhook`
4. Events: select `payment_intent.succeeded` and `payment_intent.payment_failed`
5. Click **Add endpoint**, then copy the **Signing secret** (`whsec_...`)
6. Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`
7. Redeploy: `vercel --prod`

---

## What's already done (no action needed)

| Item | Status |
|------|--------|
| Claude AI pipeline (Steps 0→A→B→C) | ✅ Live at `/api/generate` |
| Stripe payment intents | ✅ Live at `/api/create-payment-intent` |
| Stripe webhook handler | ✅ Live at `/api/webhook` |
| Reaction upload API | ✅ Live at `/api/create-reaction-upload-url` |
| All 7 regions × 5 locales | ✅ |
| RTL layout (Arabic) | ✅ |
| Multi-currency (USD / AED / MUR) | ✅ |
| Group Mode (up to 5 contributors) | ✅ |
| Scheduled Delivery (unlock_at gate) | ✅ |
| Make One For Me viral CTA | ✅ |
| OG image with recipient name | ✅ |
| Confetti (once per session) | ✅ |
| 10 analytics events (fire-and-forget) | ✅ |
| RLS (public reads paid experiences only) | ✅ |
| Memory Capsule edge function | ✅ (deploy in Step 3) |
| Scheduled Delivery edge function | ✅ (deploy in Step 3) |
| `.env` with Anthropic + Stripe secret keys | ✅ |
| TypeScript strict mode throughout | ✅ |

---

## Environment variables summary

| Variable | Where to get it |
|----------|----------------|
| `ANTHROPIC_API_KEY` | ✅ Already set |
| `STRIPE_SECRET_KEY` | ✅ Already set |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | dashboard.stripe.com → API keys |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Same as above |
| `STRIPE_WEBHOOK_SECRET` | After Step 5 above |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Settings → API |
| `EXPO_PUBLIC_SUPABASE_URL` | Same as NEXT_PUBLIC_SUPABASE_URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Same as NEXT_PUBLIC_SUPABASE_ANON_KEY |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Settings → API |
| `NEXT_PUBLIC_BASE_URL` | Your Vercel URL after deploy |
| `EXPO_PUBLIC_WEB_BASE_URL` | Same as NEXT_PUBLIC_BASE_URL |
