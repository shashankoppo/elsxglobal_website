/**
 * @module @vaulthost/sdk
 * @description Official Multi-Modular Type-Safe Client SDK
 * 
 * Complies with VaultHost Decoupled Intelligence & API-First Specifications:
 * - Domain-isolated modules (DNS, Compute, Storage, AI Gateway, Action Gateway, MCP)
 * - Automatic Request ID & Idempotency Key injection
 * - Exponential backoff and jittered retry strategies
 * - Zero uncaught promise rejections with typed result envelopes
 */
/**
 * @vaulthost/sdk — Official Multi-Modular Type-Safe Client SDK
 * 
 * Complies with VaultHost Decoupled Intelligence & API-First Specifications:
 * - Domain-isolated modules (DNS, Compute, Storage, AI Gateway, Action Gateway, MCP)
 * - Automatic Request ID & Idempotency Key injection
 * - Exponential backoff and jittered retry strategies
 * - Zero uncaught promise rejections with typed result envelopes
 */

export interface SdkConfig {
  apiKey?: string;
  baseUrl?: string;
  tenantId?: string;
  timeoutMs?: number;
  maxRetries?: number;
}

export interface SdkResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: {
    requestId: string;
    latencyMs: number;
    colo?: string;
  };
}

export class SdkHttpTransport {
  private apiKey: string;
  private baseUrl: string;
  private tenantId: string;
  private timeoutMs: number;
  private maxRetries: number;

  constructor(config?: SdkConfig) {
    this.apiKey = config?.apiKey || process.env.VAULTHOST_API_KEY || 'vh_live_demo';
    this.baseUrl = (config?.baseUrl || process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
    this.tenantId = config?.tenantId || 'tenant_default_prod';
    this.timeoutMs = config?.timeoutMs || 10000;
    this.maxRetries = config?.maxRetries || 3;
  }

  public async request<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      body?: any;
      headers?: Record<string, string>;
      idempotencyKey?: string;
    } = {}
  ): Promise<SdkResponse<T>> {
    const start = Date.now();
    const requestId = `sdk_${crypto.randomUUID()}`;
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Request-Id': requestId,
      'X-VaultHost-Tenant': this.tenantId,
      'Authorization': `Bearer ${this.apiKey}`,
      ...(options.idempotencyKey ? { 'Idempotency-Key': options.idempotencyKey } : {}),
      ...(options.headers || {}),
    };

    let attempt = 0;
    while (attempt <= this.maxRetries) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);

        const res = await fetch(url, {
          method: options.method || 'GET',
          headers,
          body: options.body ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timer);
        const latencyMs = Date.now() - start;
        const colo = res.headers.get('x-vaulthost-colo') || 'BOM1';

        // Read body
        let json: any = {};
        try {
          json = await res.json();
        } catch {
          json = {};
        }

        if (res.ok) {
          return {
            success: true,
            data: json.data !== undefined ? json.data : json,
            meta: { requestId, latencyMs, colo },
          };
        }

        // Retry on 5xx or 429
        if ((res.status >= 500 || res.status === 429) && attempt < this.maxRetries) {
          attempt++;
          const backoff = Math.pow(2, attempt) * 100 + Math.random() * 50;
          await new Promise((resolve) => setTimeout(resolve, backoff));
          continue;
        }

        return {
          success: false,
          error: {
            code: json.error?.code || `HTTP_${res.status}`,
            message: json.error?.message || res.statusText,
            details: json.error?.details,
          },
          meta: { requestId, latencyMs, colo },
        };
      } catch (err: any) {
        attempt++;
        if (attempt > this.maxRetries) {
          return {
            success: false,
            error: {
              code: 'NETWORK_ERROR',
              message: err.message || 'Request failed',
            },
            meta: { requestId, latencyMs: Date.now() - start },
          };
        }
        await new Promise((resolve) => setTimeout(resolve, attempt * 150));
      }
    }

    return {
      success: false,
      error: { code: 'UNKNOWN_FAILURE', message: 'Failed after max retries' },
      meta: { requestId, latencyMs: Date.now() - start },
    };
  }
}

// ----------------- Domain Modules -----------------

export class DnsModule {
  constructor(private transport: SdkHttpTransport) {}

  /**
   * Retrieves all DNS records for a specific zone.
   * @param zone The DNS zone name.
   */
  public async listRecords(zone: string) {
    return this.transport.request<any[]>(`/api/cloud/dns?zone=${encodeURIComponent(zone)}`);
  }

  /**
   * Creates a new DNS record in a specific zone.
   * @param zone The DNS zone name.
   * @param record The record payload.
   */
  public async createRecord(zone: string, record: { type: string; name: string; content: string; ttl?: number; proxied?: boolean }) {
    return this.transport.request<any>('/api/cloud/dns', {
      method: 'POST',
      body: { action: 'create_record', zone, ...record },
      idempotencyKey: `dns_rec_${zone}_${record.name}_${record.type}`,
    });
  }

  /**
   * Deletes a specific DNS record.
   * @param recordId The unique record ID.
   */
  public async deleteRecord(recordId: string) {
    return this.transport.request<any>('/api/cloud/dns', {
      method: 'POST',
      body: { action: 'delete_record', record_id: recordId },
    });
  }

  /**
   * Purges the DNS edge cache for a zone.
   * @param zone The DNS zone name.
   */
  public async purgeCache(zone: string) {
    return this.transport.request<any>('/api/cloud/dns', {
      method: 'POST',
      body: { action: 'purge_cache', zone },
    });
  }
}

export class WorkersModule {
  constructor(private transport: SdkHttpTransport) {}

  /**
   * Lists all deployed Workers.
   */
  public async listWorkers() {
    return this.transport.request<any[]>('/api/cloud/workers');
  }

  /**
   * Deploys a new Worker script.
   * @param params Worker deployment parameters.
   */
  public async deployWorker(params: { name: string; routes?: string; script?: string }) {
    return this.transport.request<any>('/api/cloud/workers', {
      method: 'POST',
      body: { action: 'deploy_worker', ...params },
      idempotencyKey: `worker_deploy_${params.name}_${Date.now()}`,
    });
  }

  /**
   * Suspends an active Worker.
   * @param name The name of the Worker.
   */
  public async suspendWorker(name: string) {
    return this.transport.request<any>('/api/cloud/workers', {
      method: 'POST',
      body: { action: 'suspend_worker', name },
    });
  }

  /**
   * Resumes a suspended Worker.
   * @param name The name of the Worker.
   */
  public async resumeWorker(name: string) {
    return this.transport.request<any>('/api/cloud/workers', {
      method: 'POST',
      body: { action: 'resume_worker', name },
    });
  }

  /**
   * Gets live tail logs for a Worker.
   * @param name The name of the Worker.
   */
  public async getTailLogs(name: string) {
    return this.transport.request<any[]>(`/api/cloud/workers?logs=true&worker=${encodeURIComponent(name)}`);
  }
}

export class StorageModule {
  constructor(private transport: SdkHttpTransport) {}

  /**
   * Lists all storage buckets.
   */
  public async listBuckets() {
    return this.transport.request<any[]>('/api/cloud/storage');
  }

  /**
   * Creates a new storage bucket.
   * @param name The name of the bucket.
   * @param region The deployment region.
   */
  public async createBucket(name: string, region: string = 'auto') {
    return this.transport.request<any>('/api/cloud/storage', {
      method: 'POST',
      body: { action: 'create_bucket', name, region },
      idempotencyKey: `bucket_create_${name}`,
    });
  }

  /**
   * Deletes a storage bucket.
   * @param name The name of the bucket.
   */
  public async deleteBucket(name: string) {
    return this.transport.request<any>('/api/cloud/storage', {
      method: 'POST',
      body: { action: 'delete_bucket', name },
    });
  }
}

export class AiGatewayModule {
  constructor(private transport: SdkHttpTransport) {}

  /**
   * Lists available AI Gateway providers.
   */
  public async listProviders() {
    return this.transport.request<any>('/api/cloud/ai-gateway');
  }

  /**
   * Purges the AI Gateway prompt cache.
   * @param target The target cache to purge.
   */
  public async purgeCache(target: 'all' | string = 'all') {
    return this.transport.request<any>('/api/cloud/ai-gateway', {
      method: 'POST',
      body: { action: 'purge_cache', target },
    });
  }

  /**
   * Tests a prompt against a specified model.
   * @param prompt The prompt string.
   * @param model The model to evaluate.
   */
  public async testPrompt(prompt: string, model: string = 'gpt-4o') {
    return this.transport.request<any>('/api/cloud/ai-gateway', {
      method: 'POST',
      body: { action: 'test_prompt', prompt, model },
    });
  }
}

export class ActionGatewayModule {
  constructor(private transport: SdkHttpTransport) {}

  /**
   * Dispatches an ActionIntent through the Action Gateway.
   * @param intent The constructed action intent.
   * @param tokens Optional confirmation or step-up auth tokens.
   */
  public async dispatchIntent(intent: any, tokens?: { confirmationToken?: string; stepUpAuthToken?: string }) {
    return this.transport.request<any>('/api/action-gateway/intent', {
      method: 'POST',
      body: { intent, ...tokens },
      idempotencyKey: intent.idempotencyKey || `intent_${intent.intentId}`,
    });
  }

  /**
   * Retrieves the Action Gateway audit ledger.
   * @param params Query parameters for filtering the ledger.
   */
  public async getAuditLedger(params?: { targetService?: string; riskTier?: string; limit?: number }) {
    const q = new URLSearchParams();
    if (params?.targetService) q.set('targetService', params.targetService);
    if (params?.riskTier) q.set('riskTier', params.riskTier);
    if (params?.limit) q.set('limit', String(params.limit));
    return this.transport.request<any>(`/api/action-gateway/audit?${q.toString()}`);
  }
}

export class McpModule {
  constructor(private transport: SdkHttpTransport) {}

  /**
   * Lists all available MCP tools.
   */
  public async listTools() {
    return this.transport.request<any>('/api/action-gateway/mcp', {
      method: 'POST',
      body: { jsonrpc: '2.0', id: crypto.randomUUID(), method: 'tools/list' },
    });
  }

  /**
   * Calls a specific MCP tool.
   * @param name The name of the tool.
   * @param args Arguments to pass to the tool.
   */
  public async callTool(name: string, args: Record<string, unknown>) {
    return this.transport.request<any>('/api/action-gateway/mcp', {
      method: 'POST',
      body: { jsonrpc: '2.0', id: crypto.randomUUID(), method: 'tools/call', params: { name, arguments: args } },
    });
  }
}

/**
 * Main VaultHost Enterprise Client
 */
export class VaultHostClient {
  private transport: SdkHttpTransport;
  public dns: DnsModule;
  public workers: WorkersModule;
  public storage: StorageModule;
  public aiGateway: AiGatewayModule;
  public actionGateway: ActionGatewayModule;
  public mcp: McpModule;

  constructor(config?: SdkConfig) {
    this.transport = new SdkHttpTransport(config);
    this.dns = new DnsModule(this.transport);
    this.workers = new WorkersModule(this.transport);
    this.storage = new StorageModule(this.transport);
    this.aiGateway = new AiGatewayModule(this.transport);
    this.actionGateway = new ActionGatewayModule(this.transport);
    this.mcp = new McpModule(this.transport);
  }
}

export default VaultHostClient;
