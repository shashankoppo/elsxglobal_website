# ADR-005: Revoke Locations Frozen Constraint

**Status:** Accepted
**Date:** 2026-11-26
**Deciders:** Founder (Shashank Patel)

## Context
ADR (implicit) previously froze all office/location content on the site — no agent could add, remove, rename, restyle, redirect, or rewrite location pages. Only phone/email contact fields could be changed. This was enforced by `tools/frozen-guard.mjs` in CI.

The founder has determined that this constraint is too restrictive. Location and office content needs to be maintainable and updatable as the company grows to new markets.

## Decision
Revoke the "Locations Frozen" constraint. Offices and locations are now fully editable and manageable by authorized agents.

### What changed:
1. `AGENTS.md` §2: "LOCATIONS ARE FROZEN" → "LOCATIONS ARE EDITABLE"
2. `tools/frozen-guard.mjs` → `tools/contact-guard.mjs` (checks contact normalization only, not location content immutability)
3. Audit findings F-02 and F-13 reopened as actionable items (were previously closed as "frozen by founder")
4. `.agents/rules/frozen-locations.md` → `.agents/rules/editable-locations.md`
5. §11 Hard Constraints updated to permit location editing by authorized agents

### What stays the same:
- All offices on the site are real and founder-attested
- Contact fields (phone/email) must always import from `lib/contact.ts`
- No invented office addresses
- Contact normalization is still enforced in CI via `tools/contact-guard.mjs`

## Consequences
- **Positive:** Agents can now fix placeholder content (F-02), consolidate office lists (F-13), and improve location pages
- **Positive:** Removes friction for growth — new offices can be added as the company expands
- **Negative:** Risk of inconsistency if multiple location references are updated independently
- **Mitigation:** `tools/contact-guard.mjs` ensures all contact details stay normalized; PR review for location changes
