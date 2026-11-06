# OpenAPI Extensions

VaultHost uses custom `x-vaulthost-*` extension fields in our OpenAPI 3.1 specification to enrich the API definition with domain-specific metadata.

## `x-vaulthost-risk-tier`
Defines the Risk Tier (0-3) for the endpoint as enforced by the Action Gateway.
- **Type:** Integer (0, 1, 2, or 3)
- **Usage:** Helps AI agents and UI clients know what authorization level is required before attempting an action.

## `x-vaulthost-idempotent`
Indicates whether the endpoint supports and checks for idempotency keys.
- **Type:** Boolean
- **Usage:** If `true`, clients *should* (and often must) provide an `Idempotency-Key` header.

## `x-vaulthost-mcp-tool`
Maps the endpoint to a specific tool in the Model Context Protocol (MCP) server.
- **Type:** String
- **Usage:** Used to auto-generate the MCP server capabilities.

## `x-vaulthost-colo`
Lists the edge Points of Presence (PoPs) where this endpoint is deployed or restricted to.
- **Type:** Array of Strings (e.g., `["SJC", "IAD", "LHR"]`)
- **Usage:** Helpful for data sovereignty routing or debugging edge-specific issues.
