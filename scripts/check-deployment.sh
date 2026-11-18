#!/bin/sh
# ================================================================
# ELSxGlobal Deployment Health Checker
# Run this on your Ubuntu/Debian server to verify everything is set
# Usage: bash scripts/check-deployment.sh
# ================================================================

PASS=0
FAIL=0
WARN=0

ok()   { echo "  ✅ $1"; PASS=$((PASS+1)); }
fail() { echo "  ❌ $1"; FAIL=$((FAIL+1)); }
warn() { echo "  ⚠️  $1"; WARN=$((WARN+1)); }
hdr()  { echo "\n━━━ $1 ━━━"; }

echo "============================================================"
echo " ELSxGlobal + VaultHost Deployment Health Check"
echo " $(date)"
echo "============================================================"

# ── 1. Environment Variables ─────────────────────────────────────
hdr "Environment Variables"

if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  ok "NEXT_PUBLIC_SUPABASE_URL = $NEXT_PUBLIC_SUPABASE_URL"
else
  fail "NEXT_PUBLIC_SUPABASE_URL is NOT set"
fi

if [ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
  ok "NEXT_PUBLIC_SUPABASE_ANON_KEY is set (${#NEXT_PUBLIC_SUPABASE_ANON_KEY} chars)"
else
  fail "NEXT_PUBLIC_SUPABASE_ANON_KEY is NOT set"
fi

if [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  ok "SUPABASE_SERVICE_ROLE_KEY is set (${#SUPABASE_SERVICE_ROLE_KEY} chars)"
else
  warn "SUPABASE_SERVICE_ROLE_KEY not set — migrations will be SKIPPED"
fi

if [ -n "$DATABASE_URL" ]; then
  ok "DATABASE_URL is set (pg fallback available)"
else
  warn "DATABASE_URL not set — HTTP-only migration mode"
fi

if [ -n "$NEXT_PUBLIC_SITE_URL" ]; then
  ok "NEXT_PUBLIC_SITE_URL = $NEXT_PUBLIC_SITE_URL"
else
  warn "NEXT_PUBLIC_SITE_URL not set"
fi

# ── 2. Supabase Connectivity ─────────────────────────────────────
hdr "Supabase Connectivity"

if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  SUPABASE_HEALTH="${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/"
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    --max-time 10 \
    "$SUPABASE_HEALTH" 2>/dev/null)
  
  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
    ok "Supabase REST API reachable (HTTP $HTTP_CODE)"
  else
    fail "Supabase REST API returned HTTP $HTTP_CODE (expected 200)"
  fi
else
  warn "Skipping Supabase connectivity check (URL not set)"
fi

# ── 3. Migration Files ───────────────────────────────────────────
hdr "Migration Files"

MIGRATIONS_DIR="./supabase/migrations"
if [ -d "$MIGRATIONS_DIR" ]; then
  COUNT=$(find "$MIGRATIONS_DIR" -name "*.sql" | wc -l)
  ok "Found $COUNT migration file(s) in supabase/migrations/"
  find "$MIGRATIONS_DIR" -name "*.sql" | sort | while read -r f; do
    echo "     📄 $(basename "$f")"
  done
else
  fail "supabase/migrations/ directory not found"
fi

# ── 4. App Health ────────────────────────────────────────────────
hdr "App Health Endpoint"

SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://www.elsxglobal.com}"
HEALTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${SITE_URL}/api/health" 2>/dev/null)

if [ "$HEALTH_CODE" = "200" ]; then
  ok "App health endpoint responding (${SITE_URL}/api/health)"
elif [ "$HEALTH_CODE" = "000" ]; then
  warn "App not reachable yet (may be starting up)"
else
  warn "App health check returned HTTP $HEALTH_CODE"
fi

# ── 5. Docker ────────────────────────────────────────────────────
hdr "Docker"

if command -v docker >/dev/null 2>&1; then
  DOCKER_VER=$(docker --version 2>/dev/null)
  ok "Docker available: $DOCKER_VER"
else
  fail "Docker not found in PATH"
fi

# ── Summary ──────────────────────────────────────────────────────
echo "\n============================================================"
echo " Results: ✅ $PASS passed | ⚠️  $WARN warnings | ❌ $FAIL failed"
echo "============================================================\n"

if [ "$FAIL" -gt 0 ]; then
  echo " ❌ Fix the failed checks before deploying."
  exit 1
elif [ "$WARN" -gt 0 ]; then
  echo " ⚠️  Warnings present — deployment may work but check the items above."
  exit 0
else
  echo " ✅ All checks passed! Ready to deploy."
  exit 0
fi
