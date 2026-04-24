#!/usr/bin/env bash
# =============================================================
# Push all .env secrets to GitHub Actions repository secrets
# Requires: gh CLI (brew install gh) + gh auth login
#
# Usage: bash scripts/push-github-secrets.sh
# =============================================================
set -euo pipefail

BOLD='\033[1m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
fail() { echo -e "${RED}❌ $1${NC}"; exit 1; }

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT/.env"

[ -f "$ENV_FILE" ] || fail ".env not found at $ROOT/.env"
command -v gh >/dev/null 2>&1 || fail "gh CLI not found — install: brew install gh, then: gh auth login"

# Detect repo from git remote
REPO=$(git -C "$ROOT" remote get-url origin 2>/dev/null | sed 's|.*github.com[:/]||; s|\.git$||')
[ -n "$REPO" ] || fail "Could not detect GitHub repo from git remote"
echo -e "${BOLD}Pushing secrets to: $REPO${NC}"
echo ""

push_secret() {
  local key="$1"
  local val
  val=$(grep "^${key}=" "$ENV_FILE" 2>/dev/null | cut -d'=' -f2-)

  if [ -z "$val" ] || echo "$val" | grep -qE "REPLACE|PENDING|your-|your_"; then
    warn "Skipping $key — not set in .env"
    return
  fi

  gh secret set "$key" --repo "$REPO" --body "$val" && ok "$key" || warn "Failed to set $key"
}

# Supabase
push_secret "NEXT_PUBLIC_SUPABASE_URL"
push_secret "NEXT_PUBLIC_SUPABASE_ANON_KEY"
push_secret "SUPABASE_SERVICE_ROLE_KEY"

# Anthropic
push_secret "ANTHROPIC_API_KEY"

# Stripe
push_secret "STRIPE_SECRET_KEY"
push_secret "STRIPE_WEBHOOK_SECRET"
push_secret "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
push_secret "EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY"

# App URLs
push_secret "NEXT_PUBLIC_BASE_URL"
push_secret "EXPO_PUBLIC_WEB_BASE_URL"

echo ""
echo -e "${BOLD}Done. Remaining secrets to add manually in GitHub:${NC}"
echo "  VERCEL_TOKEN      — vercel.com/account/tokens → Create Token"
echo "  VERCEL_ORG_ID     — vercel.com/account → Settings → scroll to 'Your ID'"
echo "  VERCEL_PROJECT_ID — vercel.com → open project → Settings → scroll to 'Project ID'"
echo ""
echo "Add them at: https://github.com/$REPO/settings/secrets/actions"
