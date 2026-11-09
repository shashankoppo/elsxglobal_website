/**
 * @module @vaulthost/sdk
 * @description Official Multi-Modular Type-Safe Client SDK
 * 
 * Complies with VaultHost Decoupled Intelligence & API-First Specifications:
 * - Domain-isolated modules (DNS, Compute, Storage, AI Gateway, Action Gateway, MCP, Tunnel, Billing, KV)
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

// ----------------- Data Models -----------------

export interface Zone {
  id: string;
  domain: string;
  status: string;
  dnssec: string;
  queries24h: number;
}

export interface DNSRecord {
  id?: string;
  zoneId?: string;
  type: string;
  name: string;
  content: string;
  ttl?: number;
  proxied?: boolean;
  priority?: number;
}

export interface Server {
  id: string;
  name: string;
  planName: string;
  domain: string;
  ip: string;
  status: 'running' | 'stopped' | 'rebooting' | 'rebuilding' | 'terminated';
  location: string;
  specs?: Record<string, unknown>;
  metrics?: Record<string, unknown>;
  renewalDate?: string;
  price?: number;
}

export interface Bucket {
  id: string;
  name: string;
  region: string;
  objects: number;
  sizeGb: number;
  publicAccess: boolean;
  corsEnabled: boolean;
  created: string;
  egressCostSavedUsd: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  response: string;
  model: string;
  provider?: string;
  tokensUsed?: number;
  tokensSaved?: number;
  cached?: boolean;
  costUsd?: number;
  costSavedUsd?: number;
  latencyMs?: number;
  gateway?: unknown;
}

export interface EmbedResponse {
  embedding: number[];
  model: string;
  tokensUsed?: number;
}

export interface Model {
  id: string;
  name: string;
  provider: string;
  contextWindow?: number;
}

export interface Tunnel {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'provisioning';
  protocol: 'http' | 'https' | 'tcp';
  subdomain?: string;
  target?: string;
  publicUrl: string;
  token?: string;
  createdAt?: string;
  connectedAt?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  amountUsd: number;
  status: 'paid' | 'open' | 'void';
  periodStart: string;
  periodEnd: string;
  paidAt?: string;
  pdfUrl?: string;
}

export interface UsageSummary {
  period: string;
  computeHours: number;
  bandwidthGb: number;
  requestsTotal: number;
  aiTokensTotal: number;
  totalCostUsd: number;
  currency: string;
}

export interface Plan {
  id: string;
  name: string;
  tier: 'free' | 'pro' | 'enterprise';
  monthlyPriceUsd: number;
  features: string[];
}

// ----------------- Concrete Domain Modules -----------------

export class DnsModule {
  constructor(private http: SdkHttpTransport) {}

  /** Backwards compatibility alias for transport */
  private get transport(): SdkHttpTransport {
    return this.http;
  }

  /**
   * Lists all available DNS zones.
   */
  public async listZones(): Promise<SdkResponse<Zone[]>> {
    const res = await this.http.request<{ zones: Zone[] }>('/api/cloud/dns');
    if (res.success && res.data) {
      const zones = Array.isArray(res.data) ? res.data : (res.data.zones || []);
      return { success: true, data: zones, meta: res.meta };
    }
    return res as unknown as SdkResponse<Zone[]>;
  }

  /**
   * Adds a DNS record to a zone.
   */
  public async addRecord(zoneId: string, record: DNSRecord): Promise<SdkResponse<void>> {
    return this.http.request<void>('/api/cloud/dns', {
      method: 'POST',
      body: { action: 'create_record', record: { ...record, zoneId } },
      idempotencyKey: `dns_rec_${zoneId}_${record.name}_${record.type}`,
    });
  }

  /**
   * Deletes a DNS record by ID.
   */
  public async deleteRecord(zoneId: string, recordId: string): Promise<SdkResponse<void>> {
    return this.http.request<void>('/api/cloud/dns', {
      method: 'POST',
      body: { action: 'delete_record', record: { id: recordId, zoneId } },
    });
  }

  /**
   * Retrieves all DNS records for a specific zone.
   */
  public async listRecords(zoneId: string): Promise<SdkResponse<DNSRecord[]>> {
    const res = await this.http.request<{ records: DNSRecord[] }>(`/api/cloud/dns?zone=${encodeURIComponent(zoneId)}`);
    if (res.success && res.data) {
      const records = Array.isArray(res.data) ? res.data : (res.data.records || []);
      return { success: true, data: records, meta: res.meta };
    }
    return res as unknown as SdkResponse<DNSRecord[]>;
  }

  /**
   * Creates a new DNS record in a specific zone (legacy signature).
   */
  public async createRecord(zone: string, record: { type: string; name: string; content: string; ttl?: number; proxied?: boolean }) {
    return this.addRecord(zone, record as DNSRecord);
  }

  /**
   * Purges the DNS edge cache for a zone.
   */
  public async purgeCache(zone: string) {
    return this.http.request<any>('/api/cloud/dns', {
      method: 'POST',
      body: { action: 'purge_cache', zone },
    });
  }
}

export class ComputeModule {
  constructor(private http: SdkHttpTransport) {}

  /**
   * Lists all compute instances / servers.
   */
  public async listServers(): Promise<SdkResponse<Server[]>> {
    const res = await this.http.request<{ instances: Server[] }>('/api/cloud/vps');
    if (res.success && res.data) {
      const instances = Array.isArray(res.data) ? res.data : (res.data.instances || []);
      return { success: true, data: instances, meta: res.meta };
    }
    return res as unknown as SdkResponse<Server[]>;
  }

  /**
   * Provisions a new compute server.
   */
  public async createServer(plan: string, os: string, hostname: string): Promise<SdkResponse<Server>> {
    const res = await this.http.request<{ instance: Server }>('/api/cloud/vps', {
      method: 'POST',
      body: { action: 'create', plan, os, hostname },
      idempotencyKey: `vps_create_${Date.now()}_${hostname}`,
    });
    if (res.success && res.data) {
      const server = (res.data as any).instance || res.data;
      return { success: true, data: server as Server, meta: res.meta };
    }
    return res as unknown as SdkResponse<Server>;
  }

  /**
   * Powers on a compute server.
   */
  public async powerOn(serverId: string): Promise<SdkResponse<void>> {
    return this.http.request<void>('/api/cloud/vps', {
      method: 'POST',
      body: { action: 'start', serverId },
    });
  }

  /**
   * Powers off a compute server.
   */
  public async powerOff(serverId: string): Promise<SdkResponse<void>> {
    return this.http.request<void>('/api/cloud/vps', {
      method: 'POST',
      body: { action: 'stop', serverId },
    });
  }

  /**
   * Restarts a compute server.
   */
  public async restart(serverId: string): Promise<SdkResponse<void>> {
    return this.http.request<void>('/api/cloud/vps', {
      method: 'POST',
      body: { action: 'restart', serverId },
    });
  }
}

export class StorageModule {
  constructor(private http: SdkHttpTransport) {}

  /** Backwards compatibility alias for transport */
  private get transport(): SdkHttpTransport {
    return this.http;
  }

  /**
   * Lists all storage buckets.
   */
  public async listBuckets(): Promise<SdkResponse<Bucket[]>> {
    const res = await this.http.request<{ buckets: Bucket[] }>('/api/cloud/storage');
    if (res.success && res.data) {
      const buckets = Array.isArray(res.data) ? res.data : (res.data.buckets || []);
      return { success: true, data: buckets, meta: res.meta };
    }
    return res as unknown as SdkResponse<Bucket[]>;
  }

  /**
   * Creates a new storage bucket.
   */
  public async createBucket(name: string, region: string = 'auto'): Promise<SdkResponse<Bucket>> {
    const res = await this.http.request<{ bucket: Bucket }>('/api/cloud/storage', {
      method: 'POST',
      body: { action: 'create_bucket', name, region },
      idempotencyKey: `bucket_create_${name}`,
    });
    if (res.success && res.data) {
      const bucket = (res.data as any).bucket || res.data;
      return { success: true, data: bucket as Bucket, meta: res.meta };
    }
    return res as unknown as SdkResponse<Bucket>;
  }

  /**
   * Generates a pre-signed URL for object access.
   */
  public async getPresignedUrl(bucket: string, key: string, ttl: number = 3600): Promise<SdkResponse<{ url: string }>> {
    return this.http.request<{ url: string }>(
      `/api/cloud/storage?action=presigned&bucket=${encodeURIComponent(bucket)}&key=${encodeURIComponent(key)}&ttl=${ttl}`
    );
  }

  /**
   * Deletes an object within a bucket.
   */
  public async deleteObject(bucket: string, key: string): Promise<SdkResponse<void>> {
    return this.http.request<void>('/api/cloud/storage', {
      method: 'POST',
      body: { action: 'delete_object', bucket, key },
    });
  }

  /**
   * Deletes a storage bucket.
   */
  public async deleteBucket(name: string): Promise<SdkResponse<void>> {
    return this.http.request<void>('/api/cloud/storage', {
      method: 'POST',
      body: { action: 'delete_bucket', name },
    });
  }
}

export class AiModule {
  constructor(private http: SdkHttpTransport) {}

  /**
   * Sends a chat completion request through VaultAI Gateway.
   */
  public async chat(
    model: string,
    messages: ChatMessage[] | string,
    options?: Record<string, unknown>
  ): Promise<SdkResponse<ChatResponse>> {
    return this.http.request<ChatResponse>('/api/cloud/ai-gateway', {
      method: 'POST',
      body: { action: 'chat', model, messages, ...(options || {}) },
    });
  }

  /**
   * Generates vector embeddings for input text.
   */
  public async embed(model: string, input: string | string[]): Promise<SdkResponse<EmbedResponse>> {
    return this.http.request<EmbedResponse>('/api/cloud/ai-gateway', {
      method: 'POST',
      body: { action: 'embed', model, input },
    });
  }

  /**
   * Lists available foundational AI models.
   */
  public async listModels(): Promise<SdkResponse<Model[]>> {
    const res = await this.http.request<{ providers: any[] }>('/api/cloud/ai-gateway');
    if (res.success && res.data) {
      const providers = (res.data as any).providers || [];
      const models: Model[] = [];
      for (const p of providers) {
        for (const m of p.availableModels || []) {
          models.push({ id: m, name: m, provider: p.name });
        }
      }
      return { success: true, data: models, meta: res.meta };
    }
    return res as unknown as SdkResponse<Model[]>;
  }
}

export class TunnelModule {
  constructor(private http: SdkHttpTransport) {}

  /**
   * Lists active secure ingress tunnels.
   */
  public async listTunnels(): Promise<SdkResponse<Tunnel[]>> {
    const res = await this.http.request<{ tunnels: Tunnel[] }>('/api/cloud/tunnel');
    if (res.success && res.data) {
      const tunnels = Array.isArray(res.data) ? res.data : (res.data.tunnels || []);
      return { success: true, data: tunnels, meta: res.meta };
    }
    return res as unknown as SdkResponse<Tunnel[]>;
  }

  /**
   * Creates a new secure ingress tunnel and returns frpc configuration.
   */
  public async createTunnel(
    name: string,
    protocol: 'http' | 'https' | 'tcp' = 'http',
    subdomain?: string
  ): Promise<SdkResponse<{ tunnel: Tunnel; frpcConfig: string }>> {
    return this.http.request<{ tunnel: Tunnel; frpcConfig: string }>('/api/cloud/tunnel', {
      method: 'POST',
      body: { action: 'create_tunnel', name, protocol, subdomain },
      idempotencyKey: `tunnel_create_${name}`,
    });
  }

  /**
   * Deletes a tunnel by ID.
   */
  public async deleteTunnel(id: string): Promise<SdkResponse<void>> {
    return this.http.request<void>(`/api/cloud/tunnel?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }
}

export class BillingModule {
  constructor(private http: SdkHttpTransport) {}

  /**
   * Queries invoices for a given period.
   */
  public async listInvoices(period?: string): Promise<SdkResponse<Invoice[]>> {
    const q = period ? `?period=${encodeURIComponent(period)}` : '';
    const res = await this.http.request<{ invoices: Invoice[] }>(`/api/cloud/billing${q}`);
    if (res.success && res.data) {
      const invoices = Array.isArray(res.data) ? res.data : (res.data.invoices || []);
      return { success: true, data: invoices, meta: res.meta };
    }
    return res as unknown as SdkResponse<Invoice[]>;
  }

  /**
   * Queries resource usage summary.
   */
  public async getUsage(period?: string): Promise<SdkResponse<UsageSummary>> {
    const q = period ? `?usage=true&period=${encodeURIComponent(period)}` : '?usage=true';
    const res = await this.http.request<{ usage: UsageSummary }>(`/api/cloud/billing${q}`);
    if (res.success && res.data) {
      const usage = (res.data as any).usage || res.data;
      return { success: true, data: usage as UsageSummary, meta: res.meta };
    }
    return res as unknown as SdkResponse<UsageSummary>;
  }

  /**
   * Retrieves current active subscription plan.
   */
  public async getCurrentPlan(): Promise<SdkResponse<Plan>> {
    const res = await this.http.request<{ plan: Plan }>('/api/cloud/billing?plan=true');
    if (res.success && res.data) {
      const plan = (res.data as any).plan || res.data;
      return { success: true, data: plan as Plan, meta: res.meta };
    }
    return res as unknown as SdkResponse<Plan>;
  }
}

export class KVModule {
  constructor(private http: SdkHttpTransport) {}

  /**
   * Reads a key-value pair from a namespace.
   */
  public async get(namespaceId: string, key: string): Promise<SdkResponse<{ value: string }>> {
    return this.http.request<{ value: string }>(
      `/api/cloud/kv?namespace=${encodeURIComponent(namespaceId)}&key=${encodeURIComponent(key)}`
    );
  }

  /**
   * Writes a key-value pair to a namespace with optional TTL in seconds.
   */
  public async put(namespaceId: string, key: string, value: string, ttl?: number): Promise<SdkResponse<void>> {
    return this.http.request<void>('/api/cloud/kv', {
      method: 'POST',
      body: { action: 'put', namespaceId, key, value, ttl },
    });
  }

  /**
   * Deletes a key from a namespace.
   */
  public async delete(namespaceId: string, key: string): Promise<SdkResponse<void>> {
    return this.http.request<void>(
      `/api/cloud/kv?namespace=${encodeURIComponent(namespaceId)}&key=${encodeURIComponent(key)}`,
      { method: 'DELETE' }
    );
  }

  /**
   * Lists keys within a namespace with optional prefix.
   */
  public async list(namespaceId: string, prefix?: string): Promise<SdkResponse<string[]>> {
    const q = prefix ? `&prefix=${encodeURIComponent(prefix)}` : '';
    const res = await this.http.request<{ keys: string[] }>(
      `/api/cloud/kv?namespace=${encodeURIComponent(namespaceId)}${q}`
    );
    if (res.success && res.data) {
      const keys = Array.isArray(res.data) ? res.data : (res.data.keys || []);
      return { success: true, data: keys, meta: res.meta };
    }
    return res as unknown as SdkResponse<string[]>;
  }
}

// ----------------- Additional Preserved Modules -----------------

export class WorkersModule {
  constructor(private transport: SdkHttpTransport) {}

  public async listWorkers() {
    return this.transport.request<any[]>('/api/cloud/workers');
  }

  public async deployWorker(params: { name: string; routes?: string; script?: string }) {
    return this.transport.request<any>('/api/cloud/workers', {
      method: 'POST',
      body: { action: 'deploy_worker', ...params },
      idempotencyKey: `worker_deploy_${params.name}_${Date.now()}`,
    });
  }

  public async suspendWorker(name: string) {
    return this.transport.request<any>('/api/cloud/workers', {
      method: 'POST',
      body: { action: 'suspend_worker', name },
    });
  }

  public async resumeWorker(name: string) {
    return this.transport.request<any>('/api/cloud/workers', {
      method: 'POST',
      body: { action: 'resume_worker', name },
    });
  }

  public async getTailLogs(name: string) {
    return this.transport.request<any[]>(`/api/cloud/workers?logs=true&worker=${encodeURIComponent(name)}`);
  }
}

export class AiGatewayModule {
  constructor(private transport: SdkHttpTransport) {}

  public async listProviders() {
    return this.transport.request<any>('/api/cloud/ai-gateway');
  }

  public async purgeCache(target: 'all' | string = 'all') {
    return this.transport.request<any>('/api/cloud/ai-gateway', {
      method: 'POST',
      body: { action: 'purge_cache', target },
    });
  }

  public async testPrompt(prompt: string, model: string = 'gpt-4o') {
    return this.transport.request<any>('/api/cloud/ai-gateway', {
      method: 'POST',
      body: { action: 'test_prompt', prompt, model },
    });
  }
}

export class ActionGatewayModule {
  constructor(private transport: SdkHttpTransport) {}

  public async dispatchIntent(intent: any, tokens?: { confirmationToken?: string; stepUpAuthToken?: string }) {
    return this.transport.request<any>('/api/action-gateway/intent', {
      method: 'POST',
      body: { intent, ...tokens },
      idempotencyKey: intent.idempotencyKey || `intent_${intent.intentId}`,
    });
  }

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

  public async listTools() {
    return this.transport.request<any>('/api/action-gateway/mcp', {
      method: 'POST',
      body: { jsonrpc: '2.0', id: crypto.randomUUID(), method: 'tools/list' },
    });
  }

  public async callTool(name: string, args: Record<string, unknown>) {
    return this.transport.request<any>('/api/action-gateway/mcp', {
      method: 'POST',
      body: { jsonrpc: '2.0', id: crypto.randomUUID(), method: 'tools/call', params: { name, arguments: args } },
    });
  }
}

// ----------------- Main VaultHost SDK Classes -----------------

/**
 * Main VaultHost Client Class with all concrete modules
 */
export class VaultHost {
  public readonly dns: DnsModule;
  public readonly compute: ComputeModule;
  public readonly storage: StorageModule;
  public readonly ai: AiModule;
  public readonly tunnel: TunnelModule;
  public readonly billing: BillingModule;
  public readonly kv: KVModule;
  private transport: SdkHttpTransport;

  constructor(config?: SdkConfig) {
    this.transport = new SdkHttpTransport(config);
    this.dns = new DnsModule(this.transport);
    this.compute = new ComputeModule(this.transport);
    this.storage = new StorageModule(this.transport);
    this.ai = new AiModule(this.transport);
    this.tunnel = new TunnelModule(this.transport);
    this.billing = new BillingModule(this.transport);
    this.kv = new KVModule(this.transport);
  }
}

/**
 * Legacy & Extended VaultHost Enterprise Client
 */
export class VaultHostClient {
  private transport: SdkHttpTransport;
  public dns: DnsModule;
  public compute: ComputeModule;
  public workers: WorkersModule;
  public storage: StorageModule;
  public ai: AiModule;
  public aiGateway: AiGatewayModule;
  public tunnel: TunnelModule;
  public billing: BillingModule;
  public kv: KVModule;
  public actionGateway: ActionGatewayModule;
  public mcp: McpModule;

  constructor(config?: SdkConfig) {
    this.transport = new SdkHttpTransport(config);
    this.dns = new DnsModule(this.transport);
    this.compute = new ComputeModule(this.transport);
    this.workers = new WorkersModule(this.transport);
    this.storage = new StorageModule(this.transport);
    this.ai = new AiModule(this.transport);
    this.aiGateway = new AiGatewayModule(this.transport);
    this.tunnel = new TunnelModule(this.transport);
    this.billing = new BillingModule(this.transport);
    this.kv = new KVModule(this.transport);
    this.actionGateway = new ActionGatewayModule(this.transport);
    this.mcp = new McpModule(this.transport);
  }
}

export default VaultHost;
