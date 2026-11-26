# Truth-in-Claims Rule

All public-facing numbers, metrics, badges, and comparisons MUST come from the claims registry (`lib/claims/registry.ts`) or pricing registry (`lib/pricing/registry.ts`).

## Requirements
- Never hardcode claim values in components or pages
- Import from `lib/claims` and use `renderClaimValue(id)` or `getClaim(id)`
- Every claim has a `status`: verified | attested | estimated | target | roadmap | retired
- Competitor claims require `sourceUrl`, `retrievedAt`, and `reviewBy` ≤ 30 days
- Stale competitor data (reviewBy passed) must auto-hide or show a staleness warning
- Run `node tools/claim-lint.mjs` before committing

## Pricing
- All prices in integer paise (INR), ex-GST
- Import from `lib/pricing` and use `formatPrice()` / `getPlan()`
- GST rate from `lib/pricing/types.ts` (18%)
- Never hardcode ₹ amounts in components
