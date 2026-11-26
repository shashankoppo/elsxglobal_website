# ADR-006: Truth-in-Claims Registry

**Status:** Accepted
**Date:** 2026-11-26
**Deciders:** ELSxGlobal Engineering, Founder

## Context
The site contains numerous public-facing numbers, metrics, badges, and competitive comparisons that are inconsistent across pages (F-04, F-05, F-15). Numbers like "340+ clients", "100+ deployments", "~150+ clients", "300+ PoPs", "99.999% SLA" appear in different variations. Competitor pricing is stated without sources or dates. Compliance certifications are claimed without certificate IDs.

This creates legal risk (misleading advertising under Consumer Protection Act 2019, ASCI Code), trust erosion with enterprise prospects, and engineering confusion about which values are authoritative.

## Decision
Adopt a **Truth-in-Claims** system:

### 1. Claims Registry (`lib/claims/`)
Every public-facing number, metric, or badge MUST be registered in `lib/claims/registry.ts` with:
- `id`: unique identifier
- `value`: the number/string
- `status`: `verified` (independently confirmed) | `attested` (founder-confirmed) | `estimated` (best guess) | `target` (aspiration) | `roadmap` (planned) | `retired` (no longer valid)
- `owner`: who is responsible for accuracy
- `asOf`: when the value was last confirmed
- `reviewBy`: when it must be re-verified
- `definition`: precise meaning (e.g., "total active client accounts" vs "total deployments")
- `sourceUrl`: evidence link (required for `verified` status)

### 2. Competitor Claims
Competitor facts additionally require:
- `sourceUrl`: public source for the claim
- `retrievedAt`: when the source was accessed
- `reviewBy`: must be ≤ 30 days from `retrievedAt`
- Stale rows (past `reviewBy`) auto-hide in the UI

### 3. Pricing Registry (`lib/pricing/`)
All prices stored as integer paise (INR), ex-GST. GST rate from a constant (18%). No hardcoded ₹ amounts in components.

### 4. Contact Registry (`lib/contact.ts`)
All phone numbers, email addresses, and social links from a single source. Never hardcoded in components.

### 5. Rendering
- Use `<Claim id="..." />` component or `renderClaimValue(id)` function
- Never hardcode claim values in JSX
- `tools/claim-lint.mjs` enforces this in CI

### 6. Compliance Wording
- "ISO 27001-aligned security controls" (not "certified" without certificate ID)
- "PCI-DSS compliant payment processing via Razorpay"
- DPDP Rules 2025 duties from 13 May 2027

## Consequences
- **Positive:** Single source of truth eliminates inconsistency across 176 pages
- **Positive:** Legal protection — every public claim has an audit trail
- **Positive:** Stale competitor data auto-expires, preventing outdated comparisons
- **Positive:** CI enforcement prevents regressions
- **Negative:** Friction when adding new metrics — must register in registry first
- **Mitigation:** `claim-lint --report` mode for gradual adoption; legacy violations tracked and reduced phase by phase
