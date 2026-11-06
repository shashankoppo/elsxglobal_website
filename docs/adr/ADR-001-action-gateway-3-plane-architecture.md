# ADR-001: Action Gateway 3-Plane Architecture

**Status:** Accepted
**Date:** 2025-01-15
**Deciders:** ELSxGlobal Engineering, VaultHost Platform Team

## Context
AI agents must be able to act on infrastructure (deploy, delete, scale) but without uncontrolled blast radius. Direct access creates catastrophic risk.

## Decision
Adopt a 3-plane decoupled architecture:
1. **Reasoning Plane** — AI agents emit `ActionIntent` objects, never touch infra
2. **Action Gateway** — Risk classifier, HMAC signer, idempotency engine, blast radius guard
3. **Infrastructure Plane** — Only receives validated, signed, risk-tiered intents

## Risk Tiers
- Tier 0: Read-only/cache — auto-execute
- Tier 1: Reversible writes — logged + snapshot
- Tier 2: Irreversible writes — TOTP 2FA required
- Tier 3: Catastrophic blast radius — dual-staff quorum quarantine

## Consequences
- **Positive:** No AI agent can ever directly destroy infra
- **Positive:** Full audit trail for all AI actions
- **Negative:** Extra latency (2-5ms) for all mutating operations
- **Mitigation:** Tier 0/1 operations cached at gateway, negligible real-world overhead

## Implementation
- `lib/action-gateway/gateway.ts` — main gateway
- `lib/action-gateway/risk-classifier.ts` — tier assignment
- `lib/action-gateway/types.ts` — ActionIntent interface
- `app/api/action-gateway/` — HTTP endpoints
