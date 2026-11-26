---
name: audit
description: Run a full platform audit covering routes, claims, contacts, SEO, and accessibility.
---

# /audit

Run all audit tools and produce a combined report.

## Steps
1. `node tools/route-audit.mjs --json`
2. `node tools/claim-lint.mjs --report --json`
3. `node tools/contact-guard.mjs`
4. Run SEO checks on top 20 routes
5. Run axe on top 10 routes
6. Compile results into `docs/audit/audit-report-YYYY-MM-DD.md`
