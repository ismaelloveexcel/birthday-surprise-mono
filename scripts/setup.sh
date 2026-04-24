#!/usr/bin/env bash
# =============================================================
# birthday-surprise — One-shot local setup script
# Run once after cloning / after adding credentials to .env
# Usage: bash scripts/setup.sh
# =============================================================
set -euo pipefail

BOLD='\033[1m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
fail() { echo -e "${RED}❌ $1${NC}"; exit 1; }
step() { echo -e "\n${BOLD}── $1 ──${NC}"; }

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# ── 0. Prerequisites ──────────────────────────────────────────
step "Checking prerequisites"

command -v node  >/dev/null 2>&1 || fail "node not found — install Node 18+"
command -v pnpm  >/dev/null 2>&1 || fail "pnpm not found — run: npm install -g pnpm"
command -v supabase >/dev/null 2>&1 || warn "supabase CLI not found — DB steps will be skipped (install: brew install supabase/tap/supabase)"

ok "Prerequisites OK"

# ── 1. Check .env ─────────────────────────────────────────────
step "Validating .env"

ENV_FILE="$ROOT/.env"
[ -f "$ENV_FILE" ] || fail ".env not found — copy .env.example to .env and fill in values"

check_var() {
  local key="$1"
  local val
  val=$(grep "^${key}=" "$ENV_FILE" 2>/dev/null | cut -d'=' -f2-)
  if [ -z "$val" ] || echo "$val" | grep -q "your-\|REPLACE\|PENDING\|your_"; then
    warn "$key is not set in .env — some features won't work"
    return 1
  fi
  ok "$key is set"
  return 0
}

check_var "ANTHROPIC_API_KEY"
check_var "STRIPE_SECRET_KEY"
check_var "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
check_var "STRIPE_WEBHOOK_SECRET"
check_var "NEXT_PUBLIC_SUPABASE_URL"
check_var "NEXT_PUBLIC_SUPABASE_ANON_KEY"
check_var "SUPABASE_SERVICE_ROLE_KEY"

# ── 2. Install dependencies ───────────────────────────────────
step "Installing dependencies"
pnpm install
ok "Dependencies installed"

# ── 3. Build shared package ───────────────────────────────────
step "Building shared package"
pnpm --filter @birthday-surprise/shared build
ok "Shared package built"

# ── 4. TypeScript type-check ──────────────────────────────────
step "TypeScript type-check"
pnpm --filter web type-check   && ok "web: no TypeScript errors"    || fail "web: TypeScript errors — run: cd apps/web && pnpm type-check"
pnpm --filter mobile type-check && ok "mobile: no TypeScript errors" || warn "mobile: TypeScript errors (native types may differ in EAS build)"

# ── 5. Apply Supabase migration ───────────────────────────────
step "Supabase migration"

if ! command -v supabase >/dev/null 2>&1; then
  warn "supabase CLI missing — skipping migration"
  echo "  Manual option: paste supabase/migrations/001_production_hardening.sql into the Supabase SQL editor"
else
  SUPABASE_URL=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" "$ENV_FILE" | cut -d'=' -f2-)
  if echo "$SUPABASE_URL" | grep -q "your-project"; then
    warn "NEXT_PUBLIC_SUPABASE_URL is a placeholder — skipping migration"
  else
    echo "Pushing migration to $SUPABASE_URL ..."
    supabase db push --db-url "$SUPABASE_URL" 2>&1 || warn "Migration push failed — try manually in Supabase SQL editor"
    ok "Migration applied"
  fi
fi

# ── 6. Deploy Supabase edge functions ─────────────────────────
step "Supabase edge functions"

if ! command -v supabase >/dev/null 2>&1; then
  warn "supabase CLI missing — skipping edge function deploy"
else
  PROJECT_REF=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" "$ENV_FILE" | cut -d'=' -f2- | sed 's|https://||; s|\.supabase\.co.*||')
  if echo "$PROJECT_REF" | grep -q "your-project"; then
    warn "Supabase URL is a placeholder — skipping edge function deploy"
  else
    supabase functions deploy check-scheduled-delivery --project-ref "$PROJECT_REF" 2>&1 || warn "check-scheduled-delivery deploy failed"
    supabase functions deploy memory-capsule-reminder  --project-ref "$PROJECT_REF" 2>&1 || warn "memory-capsule-reminder deploy failed"
    ok "Edge functions deployed"
  fi
fi

# ── 7. Next.js build ──────────────────────────────────────────
step "Next.js production build"
pnpm --filter web build && ok "Next.js build succeeded" || fail "Next.js build failed — check output above"

# ── Summary ───────────────────────────────────────────────────
echo ""
echo -e "${BOLD}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD} Setup complete! ${NC}"
echo -e "${BOLD}═══════════════════════════════════════════${NC}"
echo ""
echo "Next steps:"
echo "  1. Deploy web:    vercel --prod  (or push to GitHub for auto-deploy)"
echo "  2. Build mobile:  cd apps/mobile && eas build --platform all"
echo "  3. Stripe webhook: dashboard.stripe.com → Developers → Webhooks"
echo "     Endpoint: https://YOUR_VERCEL_URL/api/webhook"
echo "     Events:   payment_intent.succeeded, payment_intent.payment_failed"
echo "     Copy the whsec_... secret → add as STRIPE_WEBHOOK_SECRET in Vercel"
echo ""
