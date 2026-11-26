#!/usr/bin/env bash
# install-phase1-kit.sh — Verify and report Phase-1 kit status
# Run from the project root: bash install-phase1-kit.sh
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "============================================"
echo "  ELSxGlobal Phase-1 Kit Installer"
echo "  $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "============================================"
echo ""

MISSING=0
FOUND=0

check_file() {
  local path="$1"
  local desc="$2"
  if [ -f "$path" ]; then
    echo -e "  ${GREEN}✓${NC} $path — $desc"
    FOUND=$((FOUND + 1))
  else
    echo -e "  ${RED}✗${NC} $path — $desc"
    MISSING=$((MISSING + 1))
  fi
}

check_dir() {
  local path="$1"
  local desc="$2"
  if [ -d "$path" ]; then
    echo -e "  ${GREEN}✓${NC} $path/ — $desc"
    FOUND=$((FOUND + 1))
  else
    echo -e "  ${RED}✗${NC} $path/ — $desc"
    MISSING=$((MISSING + 1))
  fi
}

echo "── Source of Truth Libraries ──"
check_file "lib/contact.ts"           "Contact details single source"
check_dir  "lib/claims"               "Claims registry"
check_file "lib/claims/types.ts"      "Claim type definitions"
check_file "lib/claims/registry.ts"   "Claim data registry"
check_file "lib/claims/index.ts"      "Claims barrel export"
check_dir  "lib/pricing"              "Pricing registry"
check_file "lib/pricing/types.ts"     "Pricing type definitions"
check_file "lib/pricing/registry.ts"  "Pricing data registry"
check_file "lib/pricing/index.ts"     "Pricing barrel export"
check_file "lib/seo.ts"              "SEO utilities"
echo ""

echo "── CI/CD Tools ──"
check_file "tools/claim-lint.mjs"     "Claim value linter"
check_file "tools/contact-guard.mjs"  "Contact normalization guard"
check_file "tools/route-audit.mjs"    "Route structure auditor"
echo ""

echo "── Deployment ──"
check_dir  "deploy"                   "Deployment configs"
check_file "Dockerfile"               "Production Dockerfile"
echo ""

echo "── Documentation ──"
check_file "AGENTS.md"                       "Agent conventions"
check_file "docs/DECISIONS_NEEDED.md"        "Founder decision queue"
check_dir  "docs/adr"                        "Architecture Decision Records"
check_file "docs/ANTIGRAVITY_MASTER_PROMPT_v7.1.md"  "Master prompt archive"
echo ""

echo "── CI Workflows ──"
check_file ".github/workflows/ci.yml"            "Main CI workflow"
check_file ".github/workflows/quality-gates.yml"  "Quality gates workflow"
echo ""

echo "── Agent Config ──"
check_dir  ".agents"                    "Agent directory"
check_dir  ".agents/rules"              "Agent rules"
check_dir  ".agents/skills"             "Agent skills"
check_dir  ".agents/workflows"          "Agent workflows"
echo ""

echo "============================================"
echo -e "  Found: ${GREEN}${FOUND}${NC}  Missing: ${RED}${MISSING}${NC}"
echo "============================================"

if [ "$MISSING" -gt 0 ]; then
  echo ""
  echo -e "${YELLOW}⚠  $MISSING items are missing. Run the Phase-1 kit creation agents to generate them.${NC}"
  exit 1
else
  echo ""
  echo -e "${GREEN}✓  Phase-1 kit is complete!${NC}"
  exit 0
fi
