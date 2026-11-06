import { z } from 'zod';
import { ActionIntent, RiskTier, TargetService, ActionExecutionResult } from '@/lib/action-gateway/types';
import { processActionIntent } from '@/lib/action-gateway/gateway';

export interface McpToolParameter {
  type: string;
  description: string;
  required?: boolean;
  enum?: string[];
  default?: unknown;
}

export interface McpToolDefinition {
  name: string;
  description: string;
  riskTier: RiskTier;
  targetService: TargetService;
  inputSchema: {
    type: 'object';
    properties: Record<string, McpToolParameter>;
    required: string[];
  };
}

/**
 * Standard MCP Server registry exposing VaultHost cloud capabilities.
 * Every tool invocation routes through the Action Gateway execution plane.
 */
export const VAULTHOST_MCP_TOOLS: McpToolDefinition[] = [
  {
    name: 'vaulthost_dns_manage',
    description: 'Manage DNS zones and records on VaultDNS authoritative edge network.',
    riskTier: 1,
    targetService: 'dns',
    inputSchema: {
      type: 'object',
      properties: {
        zoneId: { type: 'string', description: 'The target DNS zone ID (e.g., example.com)' },
        action: { 
          type: 'string', 
          enum: ['get_records', 'add_record', 'update_record', 'delete_record', 'purge_zone'], 
          description: 'The DNS operation verb' 
        },
        recordType: { type: 'string', enum: ['A', 'AAAA', 'CNAME', 'TXT', 'MX'], description: 'DNS record type' },
        name: { type: 'string', description: 'Record hostname / subdomain' },
        value: { type: 'string', description: 'Target IP, CNAME hostname, or TXT value' },
        ttl: { type: 'number', description: 'Time-to-live in seconds', default: 300 },
      },
      required: ['zoneId', 'action'],
    },
  },
  {
    name: 'vaulthost_workers_deploy',
    description: 'Deploy or manage serverless V8 edge compute workers across 300+ global PoPs.',
    riskTier: 2,
    targetService: 'compute',
    inputSchema: {
      type: 'object',
      properties: {
        workerName: { type: 'string', description: 'Unique identifier for the edge worker' },
        scriptCode: { type: 'string', description: 'JavaScript/TypeScript/WASM code bundle' },
        environment: { type: 'string', enum: ['preview', 'staging', 'production'], description: 'Target environment' },
        action: { type: 'string', enum: ['deploy', 'rollback', 'delete', 'get_status'], description: 'Compute action' },
        routes: { type: 'string', description: 'Comma-separated routing patterns (e.g. api.example.com/*)' },
      },
      required: ['workerName', 'action'],
    },
  },
  {
    name: 'vaulthost_storage_manage',
    description: 'Manage S3-compatible VaultR2 zero-egress buckets, assets, and lifecycle rules.',
    riskTier: 1,
    targetService: 'storage',
    inputSchema: {
      type: 'object',
      properties: {
        bucketName: { type: 'string', description: 'Name of the storage bucket' },
        action: { type: 'string', enum: ['list_objects', 'upload_object', 'delete_object', 'delete_bucket'], description: 'Storage verb' },
        objectKey: { type: 'string', description: 'Key/path of the object' },
        contentType: { type: 'string', description: 'MIME type' },
      },
      required: ['bucketName', 'action'],
    },
  },
  {
    name: 'vaulthost_sql_query',
    description: 'Execute SQL queries or schema migrations on serverless edge SQLite database (VaultD1).',
    riskTier: 1,
    targetService: 'database',
    inputSchema: {
      type: 'object',
      properties: {
        databaseId: { type: 'string', description: 'Database identifier' },
        sqlStatement: { type: 'string', description: 'SQL query or DDL statement to execute' },
        params: { type: 'string', description: 'JSON-serialized array of parameterized query values' },
      },
      required: ['databaseId', 'sqlStatement'],
    },
  },
];

export interface McpCallContext {
  tenantId: string;
  actorId: string;
  actorType: 'user' | 'ai_agent' | 'system';
  delegationToken?: string;
  clientIp?: string;
  confirmationToken?: string;
  stepUpAuthToken?: string;
  approverStaffId?: string;
  staff2FaToken?: string;
}

/**
 * Handles incoming MCP JSON-RPC tool calls, mapping them into an ActionIntent
 * and processing them via the Action Gateway.
 */
export async function handleMcpToolCall(
  toolName: string,
  parameters: Record<string, unknown>,
  context: McpCallContext
): Promise<{ result?: ActionExecutionResult; error?: string }> {
  const tool = VAULTHOST_MCP_TOOLS.find((t) => t.name === toolName);
  if (!tool) {
    return { error: `Tool '${toolName}' not found on VaultHost MCP Server` };
  }

  // Derive action verb
  let actionVerb = String(parameters.action || 'query');
  if (toolName === 'vaulthost_sql_query') {
    const sql = String(parameters.sqlStatement || '').trim().toLowerCase();
    if (sql.startsWith('select') || sql.startsWith('explain') || sql.startsWith('pragma')) {
      actionVerb = 'read';
    } else if (sql.startsWith('drop') || sql.startsWith('delete') || sql.startsWith('truncate')) {
      actionVerb = 'drop_table';
    } else if (sql.startsWith('update') || sql.startsWith('alter')) {
      actionVerb = 'update';
    } else {
      actionVerb = 'insert';
    }
  }

  // Construct canonical ActionIntent
  const intentId = crypto.randomUUID();
  const idempotencyKey = `mcp_${context.tenantId}_${intentId}`;
  const resourceUri = `vaulthost://tenants/${context.tenantId}/services/${tool.targetService}/${parameters.zoneId || parameters.workerName || parameters.bucketName || parameters.databaseId || 'root'}`;

  const intent: ActionIntent = {
    intentId,
    actor: {
      id: context.actorId,
      type: context.actorType,
      tenantId: context.tenantId,
      roles: context.actorType === 'user' ? ['developer'] : ['ai_agent'],
      delegationToken: context.delegationToken,
      clientIp: context.clientIp,
    },
    targetService: tool.targetService,
    actionVerb,
    resourceUri,
    parameters,
    idempotencyKey,
    reasoningTrace: `Invoked via MCP Server Tool [${toolName}]`,
    createdAt: new Date().toISOString(),
  };

  // Route directly to Action Gateway execution plane
  const executionResult = await processActionIntent(intent, {
    confirmationToken: context.confirmationToken,
    stepUpAuthToken: context.stepUpAuthToken,
    approverStaffId: context.approverStaffId,
    staff2FaToken: context.staff2FaToken,
  });

  return { result: executionResult };
}

/**
 * Returns the list of registered MCP tools for discovery by reasoning engines.
 */
export function listMcpTools(): McpToolDefinition[] {
  return VAULTHOST_MCP_TOOLS;
}
