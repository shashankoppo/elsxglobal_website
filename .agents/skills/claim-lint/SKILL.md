---
name: claim-lint
description: Scans source files for hardcoded claim values and verifies they reference the claims registry.
---

# Claim Lint

Scans `.tsx` and `.ts` files in `app/` and `components/` for hardcoded numbers that should come from `lib/claims/registry.ts`.

## Usage
```bash
node tools/claim-lint.mjs           # Fail on new violations
node tools/claim-lint.mjs --report  # Report only, don't fail
node tools/claim-lint.mjs --json    # JSON output for CI
```

## What it detects
- Numbers followed by `+` (e.g., `150+`, `300+`)
- Percentage patterns (e.g., `99.9%`, `99.999%`)
- Currency amounts (e.g., `₹399`, `₹2,400Cr`)
- Known claim keywords not imported from registry
