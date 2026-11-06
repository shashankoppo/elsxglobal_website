import { recordAuditLog } from '@/lib/action-gateway/audit-logger';

export interface McpExternalConnection {
  connectionId: string;
  provider: 'github' | 'slack' | 'aws' | 'datadog' | 'stripe' | 'custom';
  endpointUrl: string;
  oauthAccessToken: string;
  grantedScopes: string[];
  tenantId: string;
  userId: string;
  expiresAt?: string;
  status: 'active' | 'revoked' | 'expired';
}

export interface McpClientResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
  durationMs: number;
}

/**
 * VaultHost MCP Client
 * Connects securely to user-authorized 3rd-party SaaS MCP endpoints using OAuth delegated credentials.
 * Zero web-scraping: only authorized protocol interactions.
 */
export class VaultHostMcpClient {
  private connection: McpExternalConnection;

  constructor(connection: McpExternalConnection) {
    if (connection.status !== 'active') {
      throw new Error(`Cannot initialize MCP client: connection '${connection.connectionId}' is ${connection.status}`);
    }
    this.connection = connection;
  }

  /**
   * Invokes a tool on an authorized external MCP server.
   */
  async callTool<T = unknown>(
    toolName: string,
    toolArgs: Record<string, unknown>,
    requiredScope?: string
  ): Promise<McpClientResponse<T>> {
    const startTime = Date.now();

    // 1. Verify OAuth Scopes
    if (requiredScope && !this.connection.grantedScopes.includes(requiredScope)) {
      return {
        success: false,
        error: `Insufficient permissions: external tool '${toolName}' requires OAuth scope '${requiredScope}'`,
        durationMs: Date.now() - startTime,
      };
    }

    // 2. Prepare MCP JSON-RPC Payload
    const rpcPayload = {
      jsonrpc: '2.0',
      id: crypto.randomUUID(),
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: toolArgs,
      },
    };

    try {
      // In production, performs HTTP POST with Bearer token
      // Simulating external endpoint call with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      let responseData: T;

      // Mock/Simulated network dispatch for sandbox & demo
      if (this.connection.endpointUrl.includes('mock') || !process.env.ENABLE_EXTERNAL_NETWORK) {
        clearTimeout(timeoutId);
        responseData = {
          provider: this.connection.provider,
          tool: toolName,
          invokedAt: new Date().toISOString(),
          status: 'success',
          resultSummary: `Executed ${toolName} via delegated OAuth on ${this.connection.provider}`,
        } as unknown as T;
      } else {
        const response = await fetch(this.connection.endpointUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.connection.oauthAccessToken}`,
            'X-VaultHost-Tenant': this.connection.tenantId,
          },
          body: JSON.stringify(rpcPayload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`MCP Server responded with HTTP ${response.status}: ${response.statusText}`);
        }

        const json = await response.json();
        responseData = json.result as T;
      }

      const durationMs = Date.now() - startTime;

      // 3. Record Audit Log for external delegation call
      await recordAuditLog({
        actor: {
          id: this.connection.userId,
          type: 'user',
          tenantId: this.connection.tenantId,
          roles: ['mcp_client_delegator'],
        },
        intentId: rpcPayload.id,
        targetService: 'iam',
        actionVerb: `mcp_external_call:${toolName}`,
        resourceUri: `external://${this.connection.provider}/${toolName}`,
        riskTier: 1,
        outcome: 'executed',
      });

      return {
        success: true,
        data: responseData,
        durationMs,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown external MCP error';
      return {
        success: false,
        error: errorMessage,
        durationMs: Date.now() - startTime,
      };
    }
  }
}
