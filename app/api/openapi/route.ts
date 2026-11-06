import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
  const openApiSpec = {
    openapi: '3.1.0',
    info: {
      title: 'VaultHost Cloud Infrastructure & Decoupled Intelligence API',
      version: '2026.09.1',
      description: 'API-First Multi-Modular Protocol for VaultHost Anycast Cloud Platform, S3 Object Storage, Edge Workers, and Action Gateway Execution Plane.',
      contact: {
        name: 'VaultHost Developer Platform',
        url: 'https://elsxglobal.com/docs/api',
        email: 'api@vaulthost.cloud',
      },
      license: {
        name: 'Proprietary Enterprise License',
        url: 'https://elsxglobal.com/legal/terms',
      },
    },
    servers: [
      {
        url: 'https://api.vaulthost.cloud/v1',
        description: 'Global Anycast Edge Gateway (300+ PoPs)',
      },
      {
        url: 'http://localhost:3001',
        description: 'Local Edge Sandbox Environment',
      },
    ],
    paths: {
      '/api/cloud/dns': {
        get: {
          summary: 'List DNS records for a zone',
          tags: ['DNS & Network'],
          parameters: [
            {
              name: 'zone',
              in: 'query',
              required: false,
              schema: { type: 'string', default: 'vaulthost.dev' },
              description: 'Target authoritative domain zone',
            },
          ],
          responses: {
            '200': {
              description: 'Active DNS records returned successfully',
            },
          },
        },
        post: {
          summary: 'Mutate DNS records or purge edge cache',
          tags: ['DNS & Network'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['action'],
                  properties: {
                    action: { type: 'string', enum: ['create_record', 'delete_record', 'purge_cache'] },
                    zone: { type: 'string' },
                    type: { type: 'string', enum: ['A', 'AAAA', 'CNAME', 'TXT', 'MX'] },
                    name: { type: 'string' },
                    content: { type: 'string' },
                    ttl: { type: 'number', default: 300 },
                    proxied: { type: 'boolean', default: true },
                    record_id: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Operation completed and signed by Action Gateway' },
            '400': { description: 'Validation failure' },
          },
        },
      },
      '/api/cloud/workers': {
        get: {
          summary: 'List active edge workers or query tail logs',
          tags: ['Edge Compute'],
          parameters: [
            { name: 'logs', in: 'query', schema: { type: 'boolean' } },
            { name: 'worker', in: 'query', schema: { type: 'string' } },
          ],
          responses: {
            '200': { description: 'Worker fleet status or streaming logs' },
          },
        },
        post: {
          summary: 'Deploy, rollback, suspend, or resume edge worker isolates',
          tags: ['Edge Compute'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['action'],
                  properties: {
                    action: { type: 'string', enum: ['deploy_worker', 'suspend_worker', 'resume_worker'] },
                    name: { type: 'string' },
                    script: { type: 'string' },
                    routes: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'V8 isolate deployed globally in <30s' },
          },
        },
      },
      '/api/cloud/storage': {
        get: {
          summary: 'List S3-compatible VaultR2 buckets and egress metrics',
          tags: ['Object Storage'],
          responses: {
            '200': { description: 'Buckets with zero-egress cost telemetry' },
          },
        },
        post: {
          summary: 'Create or delete storage bucket',
          tags: ['Object Storage'],
          responses: {
            '200': { description: 'Bucket provisioned across Anycast topology' },
          },
        },
      },
      '/api/cloud/ai-gateway': {
        get: {
          summary: 'List connected AI model providers & semantic cache stats',
          tags: ['VaultAI Gateway'],
          responses: {
            '200': { description: 'Provider metrics and semantic cache hit rates' },
          },
        },
        post: {
          summary: 'Purge global semantic cache or execute real-time model test',
          tags: ['VaultAI Gateway'],
          responses: {
            '200': { description: 'Cache invalidated or streaming response' },
          },
        },
      },
      '/api/action-gateway/intent': {
        post: {
          summary: 'Dispatch canonical ActionIntent to the Deterministic Execution Plane',
          description: 'Autonomous AI agents must route all mutation requests through this endpoint. Gateway verifies risk tiers (0-3), calculates HMAC-SHA256 signature, and enforces safety bounds.',
          tags: ['Action Gateway & Decoupled Intelligence'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ActionIntent',
                },
              },
            },
          },
          responses: {
            '200': { description: 'Action executed or challenged with TOTP / staff queue' },
          },
        },
      },
      '/api/action-gateway/mcp': {
        post: {
          summary: 'Model Context Protocol (MCP) JSON-RPC 2.0 Server',
          description: 'Standard protocol for external LLM orchestrators (Claude, Gemini, OpenAI) to list tools and execute verified actions.',
          tags: ['Action Gateway & Decoupled Intelligence'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['jsonrpc', 'method', 'id'],
                  properties: {
                    jsonrpc: { type: 'string', enum: ['2.0'] },
                    id: { type: 'string' },
                    method: { type: 'string', enum: ['tools/list', 'tools/call'] },
                    params: { type: 'object' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'JSON-RPC 2.0 response with tool output' },
          },
        },
      },
      '/api/action-gateway/audit': {
        get: {
          summary: 'Query tamper-proof cryptographic audit log ledger',
          tags: ['Action Gateway & Decoupled Intelligence'],
          parameters: [
            { name: 'targetService', in: 'query', schema: { type: 'string' } },
            { name: 'riskTier', in: 'query', schema: { type: 'string' } },
            { name: 'limit', in: 'query', schema: { type: 'number', default: 100 } },
          ],
          responses: {
            '200': { description: 'Ledger entries chained with HMAC-SHA256 signatures' },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
        },
        TenantHeader: {
          type: 'apiKey',
          in: 'header',
          name: 'X-VaultHost-Tenant',
        },
      },
      schemas: {
        ActionIntent: {
          type: 'object',
          required: ['intentId', 'actor', 'targetService', 'actionVerb', 'resourceUri', 'parameters', 'idempotencyKey', 'createdAt'],
          properties: {
            intentId: { type: 'string', format: 'uuid' },
            actor: {
              type: 'object',
              required: ['id', 'type', 'tenantId'],
              properties: {
                id: { type: 'string' },
                type: { type: 'string', enum: ['ai_agent', 'user', 'system'] },
                tenantId: { type: 'string' },
                roles: { type: 'array', items: { type: 'string' } },
              },
            },
            targetService: { type: 'string', enum: ['dns', 'compute', 'storage', 'database', 'ai_gateway', 'iam', 'network', 'billing'] },
            actionVerb: { type: 'string' },
            resourceUri: { type: 'string' },
            parameters: { type: 'object' },
            idempotencyKey: { type: 'string' },
            reasoningTrace: { type: 'string' },
            confidenceScore: { type: 'number', minimum: 0, maximum: 1 },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  };

  return NextResponse.json(openApiSpec, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
