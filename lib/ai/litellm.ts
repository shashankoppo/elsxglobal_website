import { createClient } from '@supabase/supabase-js';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  id: string;
  model: string;
  choices: Array<{
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface Model {
  id: string;
  object: 'model';
  created: number;
  owned_by: string;
}

export interface UsageStats {
  totalTokens: number;
  totalCost: number;
  requestCount: number;
  period: string;
}

export interface LiteLLMResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * LiteLLM AI Proxy Client.
 * Provides OpenAI-compatible chat, embeddings, model discovery, key generation, and usage tracking.
 */
export class LiteLLMClient {
  private config: Record<string, any>;
  private configLoaded: boolean = false;

  /**
   * Initializes the LiteLLM client.
   * @param config Optional initial configuration object (e.g. from provisioning_settings).
   */
  constructor(config?: Record<string, any>) {
    this.config = config ? { ...config } : {};
  }

  /**
   * Resolves a configuration value from explicit config, Supabase provisioning_settings row id=1, or environment variables.
   */
  private async getConfigValue(key: string, envVar?: string): Promise<string | undefined> {
    if (this.config[key] !== undefined && this.config[key] !== '') {
      return String(this.config[key]);
    }

    if (!this.configLoaded) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (supabaseUrl && supabaseServiceKey) {
          const supabase = createClient(supabaseUrl, supabaseServiceKey);
          const { data } = await supabase.from('provisioning_settings').select('*').eq('id', 1).single();
          if (data) {
            this.config = { ...data, ...this.config };
          }
        }
      } catch (err: any) {
        console.warn('[LiteLLMClient] Failed to load configuration from Supabase:', err.message);
      }
      this.configLoaded = true;
    }

    if (this.config[key] !== undefined && this.config[key] !== '') {
      return String(this.config[key]);
    }

    if (envVar && process.env[envVar] !== undefined && process.env[envVar] !== '') {
      return process.env[envVar];
    }

    return undefined;
  }

  /**
   * Sends an authenticated request to LiteLLM server using the master key.
   * @param endpoint API route path
   * @param method HTTP method
   * @param body Optional request payload
   */
  private async fetchLiteLLM(endpoint: string, method: string = 'GET', body?: any): Promise<Response> {
    const rawUrl = (await this.getConfigValue('litellm_base_url', 'LITELLM_BASE_URL')) || 'http://localhost:4000';
    const masterKey = (await this.getConfigValue('litellm_master_key', 'LITELLM_MASTER_KEY')) || '';

    const baseUrl = rawUrl.replace(/\/+$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (masterKey) {
      headers['Authorization'] = `Bearer ${masterKey}`;
    }

    return fetch(`${baseUrl}${cleanEndpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Generates a chat completion using the OpenAI-compatible endpoint.
   * @param model Model identifier (e.g. 'gpt-4o', 'claude-3-5-sonnet-20240620')
   * @param messages Conversation message history
   * @param options Hyperparameters (temperature, max_tokens, stream)
   */
  async chat(
    model: string,
    messages: ChatMessage[],
    options?: { temperature?: number; max_tokens?: number; stream?: boolean }
  ): Promise<LiteLLMResponse<ChatResponse>> {
    try {
      const payload = {
        model,
        messages,
        ...options,
      };

      const res = await this.fetchLiteLLM('/chat/completions', 'POST', payload);
      if (!res.ok) {
        const errText = await res.text();
        return { success: false, error: `LiteLLM chat completion error: ${errText}` };
      }

      const data: ChatResponse = await res.json();
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred during chat completion' };
    }
  }

  /**
   * Generates vector embeddings for the provided input text(s).
   * @param model Embedding model name (e.g. 'text-embedding-3-small')
   * @param input Single text string or array of texts
   */
  async embed(model: string, input: string | string[]): Promise<LiteLLMResponse<any>> {
    try {
      const payload = { model, input };
      const res = await this.fetchLiteLLM('/embeddings', 'POST', payload);
      if (!res.ok) {
        const errText = await res.text();
        return { success: false, error: `LiteLLM embedding error: ${errText}` };
      }

      const data = await res.json();
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred during embeddings generation' };
    }
  }

  /**
   * Lists available LLM models proxied through this LiteLLM instance.
   */
  async listModels(): Promise<LiteLLMResponse<Model[]>> {
    try {
      const res = await this.fetchLiteLLM('/models', 'GET');
      if (!res.ok) {
        const errText = await res.text();
        return { success: false, error: `Failed to list models: ${errText}` };
      }

      const json = await res.json();
      const rawList: any[] = Array.isArray(json) ? json : json.data || [];
      const models: Model[] = rawList.map((m) => ({
        id: m.id || m.model_name || '',
        object: 'model',
        created: m.created || Date.now(),
        owned_by: m.owned_by || 'litellm',
      }));

      return { success: true, data: models };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while listing models' };
    }
  }

  /**
   * Retrieves aggregated usage statistics for a specific customer.
   * @param customerId Customer identifier
   * @param period Query timeframe ('day' or 'month')
   */
  async getUsage(customerId: string, period: 'day' | 'month'): Promise<LiteLLMResponse<UsageStats>> {
    try {
      const res = await this.fetchLiteLLM(`/usage?customer_id=${encodeURIComponent(customerId)}&period=${period}`, 'GET');
      if (!res.ok) {
        // Fallback to spend calculate if /usage is not enabled
        const spendRes = await this.fetchLiteLLM(`/spend/calculate?user_id=${encodeURIComponent(customerId)}`, 'GET');
        if (spendRes.ok) {
          const spendData = await spendRes.json();
          return {
            success: true,
            data: {
              totalTokens: spendData.total_tokens || 0,
              totalCost: spendData.total_spend || 0,
              requestCount: spendData.total_requests || 0,
              period,
            },
          };
        }
        const errText = await res.text();
        return { success: false, error: `Failed to get usage stats: ${errText}` };
      }

      const data = await res.json();
      return {
        success: true,
        data: {
          totalTokens: data.total_tokens || 0,
          totalCost: data.total_cost || data.spend || 0,
          requestCount: data.request_count || 0,
          period,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while getting usage statistics' };
    }
  }

  /**
   * Generates a new scoped virtual API key for a customer with specific model permissions.
   * @param customerId Customer user ID
   * @param models Permitted models list
   */
  async addCustomerKey(customerId: string, models: string[]): Promise<LiteLLMResponse<{ key: string; keyName?: string }>> {
    try {
      const payload = {
        user_id: customerId,
        models,
        duration: '90d',
      };

      const res = await this.fetchLiteLLM('/key/generate', 'POST', payload);
      if (!res.ok) {
        const errText = await res.text();
        return { success: false, error: `Failed to generate customer key: ${errText}` };
      }

      const data = await res.json();
      return {
        success: true,
        data: {
          key: data.key,
          keyName: data.key_name,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while generating customer key' };
    }
  }

  /**
   * Revokes an issued virtual customer key by its token hash or identifier.
   * @param keyHash Virtual key string or hash
   */
  async revokeCustomerKey(keyHash: string): Promise<LiteLLMResponse<void>> {
    try {
      const payload = { keys: [keyHash] };
      const res = await this.fetchLiteLLM('/key/delete', 'POST', payload);
      if (!res.ok) {
        const errText = await res.text();
        return { success: false, error: `Failed to revoke key: ${errText}` };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while revoking customer key' };
    }
  }

  /**
   * Transparently proxies an incoming HTTP Request to LiteLLM with customer API key authorization.
   * @param req Standard Fetch Request object
   * @param customerApiKey Customer's virtual API key
   */
  async proxyRequest(req: Request, customerApiKey: string): Promise<LiteLLMResponse<any>> {
    try {
      const rawUrl = (await this.getConfigValue('litellm_base_url', 'LITELLM_BASE_URL')) || 'http://localhost:4000';
      const baseUrl = rawUrl.replace(/\/+$/, '');

      let pathname = '/chat/completions';
      try {
        const parsed = new URL(req.url);
        pathname = parsed.pathname;
      } catch {
        // Fallback
      }

      let body: any;
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        body = await req.text();
      }

      const res = await fetch(`${baseUrl}${pathname}`, {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customerApiKey}`,
        },
        body,
      });

      const responseText = await res.text();
      let responseData: any;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      if (!res.ok) {
        return {
          success: false,
          error: typeof responseData === 'string' ? responseData : JSON.stringify(responseData),
        };
      }

      return { success: true, data: responseData };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while proxying request' };
    }
  }
}
