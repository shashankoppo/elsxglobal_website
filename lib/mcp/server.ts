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
  // 1. vaulthost_dns_manage
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
  // 2. vaulthost_workers_deploy
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
  // 3. vaulthost_storage_manage
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
  // 4. vaulthost_sql_query
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
  // 5. vaulthost_tunnel_manage
  {
    name: 'vaulthost_tunnel_manage',
    description: 'Create, list, and delete VaultTunnel secure ingress tunnels. Returns frpc config for client setup.',
    riskTier: 2,
    targetService: 'network',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['create', 'list', 'delete', 'get_status'],
          description: 'Tunnel action',
        },
        tunnelName: { type: 'string', description: 'Unique name of the ingress tunnel' },
        protocol: { type: 'string', enum: ['http', 'https', 'tcp'], description: 'Ingress protocol' },
        subdomain: { type: 'string', description: 'Desired custom subdomain' },
      },
      required: ['action'],
    },
  },
  // 6. vaulthost_vps_manage
  {
    name: 'vaulthost_vps_manage',
    description: 'Create, power on/off, restart, snapshot, and terminate Proxmox VPS instances.',
    riskTier: 2,
    targetService: 'compute',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['create', 'start', 'stop', 'restart', 'snapshot', 'terminate', 'list'],
          description: 'Compute lifecycle action',
        },
        serverId: { type: 'string', description: 'Instance or server identifier' },
        plan: {
          type: 'string',
          enum: ['nano', 'standard', 'pro', 'elite'],
          description: 'Hardware tier plan',
        },
        os: {
          type: 'string',
          enum: ['ubuntu-22.04', 'debian-12', 'rocky-9', 'almalinux-9'],
          description: 'Operating system template',
        },
      },
      required: ['action'],
    },
  },
  // 7. vaulthost_ai_chat
  {
    name: 'vaulthost_ai_chat',
    description: 'Send chat completion requests through VaultAI Gateway. Automatically uses cached responses to reduce costs.',
    riskTier: 0,
    targetService: 'ai_gateway',
    inputSchema: {
      type: 'object',
      properties: {
        model: {
          type: 'string',
          enum: ['gpt-4o', 'claude-3-5-sonnet', 'gemini-2.0-flash', 'llama-3-70b', 'mistral-7b'],
          description: 'Target foundation model',
        },
        messages: {
          type: 'string',
          description: 'Chat messages array JSON string (role and content objects)',
        },
        temperature: {
          type: 'number',
          description: 'Sampling temperature between 0 and 2',
          default: 0.7,
        },
        max_tokens: {
          type: 'number',
          description: 'Maximum tokens to generate in response',
        },
        stream: {
          type: 'boolean',
          description: 'Whether to stream the response chunks',
          default: false,
        },
      },
      required: ['model', 'messages'],
    },
  },
  // 8. vaulthost_container_manage
  {
    name: 'vaulthost_container_manage',
    description: 'Manage K3s Kubernetes namespaces, deployments, and services for containerized workloads.',
    riskTier: 2,
    targetService: 'compute',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['create_namespace', 'list_namespaces', 'deploy', 'scale', 'delete'],
          description: 'Container orchestration verb',
        },
        namespace: { type: 'string', description: 'Kubernetes namespace name' },
        image: { type: 'string', description: 'Container image repository and tag' },
        replicas: { type: 'number', description: 'Number of desired pod replicas' },
        port: { type: 'number', description: 'Container workload service port' },
        domain: { type: 'string', description: 'Ingress routing domain' },
      },
      required: ['action'],
    },
  },
  // 9. vaulthost_pages_deploy
  {
    name: 'vaulthost_pages_deploy',
    description: 'Deploy web applications from git repositories to VaultPages edge network with CI/CD.',
    riskTier: 1,
    targetService: 'compute',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['create', 'deploy', 'list', 'delete', 'get_logs'],
          description: 'Pages project or deployment action',
        },
        projectId: { type: 'string', description: 'Unique pages project identifier' },
        gitRepo: { type: 'string', description: 'Git repository URL' },
        branch: { type: 'string', description: 'Git branch to build and deploy', default: 'main' },
        buildCommand: { type: 'string', description: 'Build command (e.g. npm run build)' },
        domain: { type: 'string', description: 'Custom production domain' },
      },
      required: ['action'],
    },
  },
  // 10. vaulthost_domain_manage
  {
    name: 'vaulthost_domain_manage',
    description: 'Register, renew, and manage domains. Check availability and set nameservers.',
    riskTier: 2,
    targetService: 'dns',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['check', 'register', 'list', 'set_nameservers', 'renew', 'get_info'],
          description: 'Domain registrar operation',
        },
        domain: { type: 'string', description: 'Domain name to query or manage' },
        years: { type: 'number', description: 'Registration or renewal duration in years', default: 1 },
        tld: { type: 'string', description: 'Top level domain (e.g. com, io, co.in)' },
      },
      required: ['action'],
    },
  },
  // 11. vaulthost_billing_query
  {
    name: 'vaulthost_billing_query',
    description: 'Query invoices, usage stats, current plan, and billing history for a tenant.',
    riskTier: 0,
    targetService: 'billing',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['list_invoices', 'get_usage', 'get_plan', 'list_orders'],
          description: 'Billing query verb',
        },
        period: {
          type: 'string',
          enum: ['current_month', 'last_month', 'last_3_months', 'all'],
          description: 'Billing statement period',
          default: 'current_month',
        },
        resourceType: { type: 'string', description: 'Optional resource type to filter usage' },
      },
      required: ['action'],
    },
  },
  // 12. vaulthost_kv_operate
  {
    name: 'vaulthost_kv_operate',
    description: 'Read and write key-value data in VaultKV globally distributed store with optional TTL.',
    riskTier: 0,
    targetService: 'storage',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['get', 'put', 'delete', 'list', 'bulk_put'],
          description: 'KV store operation',
        },
        namespaceId: { type: 'string', description: 'Target KV namespace identifier' },
        key: { type: 'string', description: 'Key name' },
        value: { type: 'string', description: 'String value to store' },
        ttlSeconds: { type: 'number', description: 'Time-to-live in seconds' },
        prefix: { type: 'string', description: 'Key prefix filter for list operation' },
        entries: { type: 'string', description: 'JSON array of { key, value } pairs for bulk_put' },
      },
      required: ['namespaceId', 'action'],
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
  if (toolName === 'vaulthost_ai_chat') {
    actionVerb = 'chat';
  } else if (toolName === 'vaulthost_sql_query') {
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

  // Construct canonical resource identifier across all services
  const resourceTarget = 
    parameters.zoneId || 
    parameters.workerName || 
    parameters.bucketName || 
    parameters.databaseId || 
    parameters.tunnelName || 
    parameters.serverId || 
    parameters.namespace || 
    parameters.projectId || 
    parameters.domain || 
    parameters.namespaceId || 
    parameters.model || 
    'root';

  const intentId = crypto.randomUUID();
  const idempotencyKey = `mcp_${context.tenantId}_${intentId}`;
  const resourceUri = `vaulthost://tenants/${context.tenantId}/services/${tool.targetService}/${resourceTarget}`;

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

  // Route directly to Action Gateway execution plane with enforced risk tier from tool definition
  const executionResult = await processActionIntent(intent, {
    confirmationToken: context.confirmationToken,
    stepUpAuthToken: context.stepUpAuthToken,
    approverStaffId: context.approverStaffId,
    staff2FaToken: context.staff2FaToken,
    tenantPolicyOverrides: [
      {
        tenantId: context.tenantId,
        enforceTier: tool.riskTier,
      },
    ],
  });

  return { result: executionResult };
}

/**
 * Returns the list of registered MCP tools for discovery by reasoning engines.
 */
export function listMcpTools(): McpToolDefinition[] {
  return VAULTHOST_MCP_TOOLS;
}
