# ADR-003: Multi-Modular SDK Design

**Status:** Accepted
**Date:** 2025-02-05
**Deciders:** ELSxGlobal Engineering, VaultHost Platform Team

## Context
The VaultHost platform encompasses multiple distinct domains: DNS, Workers, Storage, AI Gateway, Action Gateway, and MCP integrations. A monolithic SDK would become bloated and pull in unnecessary dependencies for users who only need a specific feature (e.g., just storage).

## Decision
Design the `@vaulthost/sdk` using a multi-modular approach with distinct domain modules:
1. `dns`
2. `workers`
3. `storage`
4. `aiGateway`
5. `actionGateway`
6. `mcp`

Users will be able to initialize the entire SDK or import only the modules they need.

## Consequences
- **Positive:** Reduces bundle sizes for downstream applications.
- **Positive:** Clear separation of concerns and easier maintenance.
- **Positive:** Allows for independent versioning or focused updates in the future.
- **Negative:** Slightly more complex internal tooling and release process.

## Implementation
- `lib/sdk/` will contain subdirectories for each module.
- `lib/sdk/index.ts` will provide a unified interface while exporting individual modules.
