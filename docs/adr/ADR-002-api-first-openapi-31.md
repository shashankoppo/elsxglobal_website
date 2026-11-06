# ADR-002: API-First with OpenAPI 3.1

**Status:** Accepted
**Date:** 2025-01-20
**Deciders:** ELSxGlobal Engineering, VaultHost Platform Team

## Context
As the VaultHost platform expands, managing API contracts across different teams, clients (SDK, Web UI), and AI agents becomes complex. We need a single source of truth for all API definitions to ensure consistency, facilitate SDK generation, and integrate smoothly with AI systems.

## Decision
Adopt an API-First design strategy using OpenAPI 3.1 as the single source of truth for all API contracts.

1. **Design First:** All new features must start with an OpenAPI definition.
2. **Machine-Readable Truth:** The OpenAPI spec will govern request/response validation, SDK generation, and automated documentation generation.
3. **OpenAPI 3.1 Features:** Leverage OpenAPI 3.1 capabilities like webhooks, improved JSON Schema compliance, and better descriptions.

## Consequences
- **Positive:** Guaranteed consistency between API, documentation, and SDKs.
- **Positive:** Enables automated SDK generation for various languages.
- **Positive:** AI agents can natively read and understand the API endpoints.
- **Negative:** Upfront cost in writing and reviewing OpenAPI specs before writing code.

## Implementation
- Store specs in `openapi/` or inline generated from Next.js routes.
- Implement automated validation in CI/CD pipeline.
- Interactive API explorer mapped to `/docs/api`.
