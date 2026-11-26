---
name: release-checklist
description: Generates a pre-release checklist covering typecheck, tests, security, accessibility, and deployment verification.
---

# Release Checklist

Generate and verify before every production deploy.

## Checklist
- [ ] `npm run typecheck` passes (0 errors)
- [ ] `node tools/claim-lint.mjs` — no new violations
- [ ] `node tools/contact-guard.mjs` — green
- [ ] `node tools/route-audit.mjs` — no duplicates or missing metadata
- [ ] Unit tests pass
- [ ] Lighthouse ≥ 95 on top routes
- [ ] axe 0 serious/critical
- [ ] No secrets in diff (`gitleaks`)
- [ ] DB migration is expand/contract
- [ ] Health endpoint returns OK after deploy
- [ ] Rollback plan documented
