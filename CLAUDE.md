# birthday-surprise-mono — Claude Context

## Project
AI-powered birthday experience generator. Users describe a person → Claude generates a personalised multi-card birthday experience → paid unlock via Lemon Squeezy.

## Stack
- **Monorepo**: Turborepo + pnpm workspaces (`pnpm@8`)
- **Web**: Next.js 14 App Router (`apps/web`) — deployed on Vercel
- **Mobile**: Expo 50 + React Native (`apps/mobile`)
- **Shared**: `packages/shared` — types, pricing, prompt builders
- **Payments**: `packages/payments` — Lemon Squeezy client (reusable across apps)
- **DB**: Supabase Postgres + RLS (`project: wrucceebqeqptpayeatn`, region: us-east-1)
- **AI**: Anthropic Claude API (server-side only)
- **Auth**: Supabase Auth

## Key URLs
- Production: https://birthday-surprise-mono-web.vercel.app
- Vercel project: https://vercel.com/ismaelloveexcels-projects/birthday-surprise-mono-web
- Supabase: https://supabase.com/dashboard/project/wrucceebqeqptpayeatn
- GitHub: https://github.com/ismaelloveexcel/birthday-surprise-mono

## Environment Variables
All secrets live in Vercel (production) and `.env` locally. Never commit `.env`.
| Variable | Where to get it |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (service_role) |
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `LEMONSQUEEZY_API_KEY` | app.lemonsqueezy.com → Settings → API |
| `LEMONSQUEEZY_STORE_ID` | app.lemonsqueezy.com → Settings → Store |
| `LEMONSQUEEZY_VARIANT_ID` | LS product variant ID |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | LS → Settings → Webhooks |
| `NEXT_PUBLIC_BASE_URL` | https://birthday-surprise-mono-web.vercel.app |

## API Routes
| Route | Purpose |
|-------|---------|
| `POST /api/generate` | Generate birthday experience via Claude |
| `POST /api/checkout` | Create Lemon Squeezy checkout session |
| `POST /api/webhook` | Lemon Squeezy webhook → unlock experience in Supabase |
| `POST /api/create-reaction-upload-url` | Signed Supabase Storage URL for reactions |

## Payments Flow
1. User clicks Pay → `POST /api/checkout` → returns `checkoutUrl`
2. Redirect to Lemon Squeezy hosted checkout
3. LS sends `order_created` webhook to `/api/webhook`
4. Webhook verifies `x-signature`, sets `paid=true, unlocked=true` in `experiences` table

## Git Workflow
- Main branch: `main` → auto-deploys to Vercel production
- Commit style: `feat:`, `fix:`, `chore:`, `refactor:`
- Push via: `git push origin main`

## Common Commands
```bash
pnpm install          # install all deps
pnpm dev              # run web + shared in dev mode
pnpm build            # turbo build all packages
pnpm type-check       # typecheck all packages
```

## Known Issues / Gotchas
- `.git/index.lock` can appear if VS Code git is running simultaneously — close VS Code git panel or run `del .git\index.lock` (Windows)
- Supabase service role key starts with `eyJ` — browser safety filter blocks reading it from JS; add it manually to Vercel env vars
- `packages/payments` must be built before `apps/web` — turbo handles the order automatically
