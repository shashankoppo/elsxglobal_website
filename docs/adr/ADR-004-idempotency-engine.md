# ADR-004: Idempotency Engine Design

**Status:** Accepted
**Date:** 2025-02-10
**Deciders:** ELSxGlobal Engineering, VaultHost Platform Team

## Context
AI agents and distributed systems often retry requests on timeout or network failure. For mutating operations (e.g., creating resources, charging accounts), retries can lead to duplicated state. We need a robust mechanism to guarantee idempotent execution for critical endpoints.

## Decision
Implement a Stripe-like Idempotency Engine for all state-mutating API requests.

1. **Client-provided Keys:** Clients (and agents) must supply an `Idempotency-Key` header.
2. **SHA-256 Collision Detection:** Payload hashes are compared to detect situations where the same key is reused for a different payload.
3. **24h TTL LRU Cache:** Idempotency state (response status, body) is stored with a 24-hour expiration.
4. **Concurrent Request Locking:** Simultaneous requests with the same key will block until the first one completes, returning the cached result.

## Consequences
- **Positive:** Prevents duplicate resource creation during network blips or agent retries.
- **Positive:** Safe retries improve overall system resilience.
- **Negative:** Additional storage required (Redis/KV) to hold responses for 24h.

## Implementation
- Implemented as middleware or gateway guard.
- Stores data in a distributed cache (e.g., VaultD1 or Redis).
