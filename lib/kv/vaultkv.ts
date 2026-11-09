import crypto from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface KVNamespace {
  id: string;
  userId: string;
  name: string;
  description?: string;
  entryCount?: number;
}

export interface KVEntry {
  key: string;
  value: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VaultKVResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * VaultKV Key-Value Storage Client.
 * Backed by Supabase tables (cloud_kv_namespaces, cloud_kv_entries) with automatic TTL expiration.
 */
export class VaultKVClient {
  private config: Record<string, any>;
  private configLoaded: boolean = false;
  private supabaseClient?: SupabaseClient;

  /**
   * Initializes the VaultKV client.
   * @param config Optional configuration object (e.g. from provisioning_settings or custom Supabase options).
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
        console.warn('[VaultKVClient] Failed to load configuration from Supabase:', err.message);
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
   * Returns a singleton Supabase admin client for data operations.
   */
  private getClient(): SupabaseClient {
    if (this.supabaseClient) {
      return this.supabaseClient;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials missing (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)');
    }

    this.supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    return this.supabaseClient;
  }

  /**
   * Creates a new Key-Value namespace for a user.
   * @param userId Owner user ID
   * @param name Namespace identifier name
   * @param description Optional description
   */
  async createNamespace(userId: string, name: string, description?: string): Promise<VaultKVResponse<KVNamespace>> {
    try {
      const supabase = this.getClient();
      const id = crypto.randomUUID();

      const { data, error } = await supabase
        .from('cloud_kv_namespaces')
        .insert({
          id,
          user_id: userId,
          name,
          description: description || null,
          created_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (error) {
        return { success: false, error: `Failed to create KV namespace: ${error.message}` };
      }

      const namespace: KVNamespace = {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        description: data.description || undefined,
        entryCount: 0,
      };

      return { success: true, data: namespace };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while creating KV namespace' };
    }
  }

  /**
   * Deletes a namespace and cascades deletion to all associated KV keys.
   * @param namespaceId Identifier of the namespace
   */
  async deleteNamespace(namespaceId: string): Promise<VaultKVResponse<void>> {
    try {
      const supabase = this.getClient();

      // Delete child entries first in case cascade is not defined in DB
      await supabase.from('cloud_kv_entries').delete().eq('namespace_id', namespaceId);

      const { error } = await supabase.from('cloud_kv_namespaces').delete().eq('id', namespaceId);
      if (error) {
        return { success: false, error: `Failed to delete KV namespace: ${error.message}` };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while deleting KV namespace' };
    }
  }

  /**
   * Lists all namespaces belonging to a user, with entry count calculation.
   * @param userId Owner user ID
   */
  async listNamespaces(userId: string): Promise<VaultKVResponse<KVNamespace[]>> {
    try {
      const supabase = this.getClient();
      const { data, error } = await supabase
        .from('cloud_kv_namespaces')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: `Failed to list KV namespaces: ${error.message}` };
      }

      const namespaces: KVNamespace[] = [];

      for (const row of data || []) {
        // Query entry count for namespace
        const { count } = await supabase
          .from('cloud_kv_entries')
          .select('*', { count: 'exact', head: true })
          .eq('namespace_id', row.id);

        namespaces.push({
          id: row.id,
          userId: row.user_id,
          name: row.name,
          description: row.description || undefined,
          entryCount: count ?? 0,
        });
      }

      return { success: true, data: namespaces };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while listing KV namespaces' };
    }
  }

  /**
   * Retrieves a value for a specific key, verifying TTL expiration.
   * @param namespaceId Namespace identifier
   * @param key Key name
   */
  async get(namespaceId: string, key: string): Promise<VaultKVResponse<string | null>> {
    try {
      const supabase = this.getClient();
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('cloud_kv_entries')
        .select('value, expires_at')
        .eq('namespace_id', namespaceId)
        .eq('key', key)
        .maybeSingle();

      if (error) {
        return { success: false, error: `Failed to get KV entry: ${error.message}` };
      }

      if (!data) {
        return { success: true, data: null };
      }

      // Check TTL expiration
      if (data.expires_at && new Date(data.expires_at) <= new Date(now)) {
        // Cleanup expired entry asynchronously
        supabase.from('cloud_kv_entries').delete().eq('namespace_id', namespaceId).eq('key', key).then(() => {});
        return { success: true, data: null };
      }

      return { success: true, data: data.value };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while reading KV entry' };
    }
  }

  /**
   * Sets or updates a key-value pair with optional TTL expiration.
   * @param namespaceId Namespace identifier
   * @param key Entry key
   * @param value Text value to store
   * @param ttlSeconds Optional time-to-live in seconds
   */
  async put(namespaceId: string, key: string, value: string, ttlSeconds?: number): Promise<VaultKVResponse<KVEntry>> {
    try {
      const supabase = this.getClient();
      const now = new Date().toISOString();
      const expiresAt = ttlSeconds ? new Date(Date.now() + ttlSeconds * 1000).toISOString() : null;

      const payload = {
        namespace_id: namespaceId,
        key,
        value,
        expires_at: expiresAt,
        updated_at: now,
      };

      const { data, error } = await supabase
        .from('cloud_kv_entries')
        .upsert(payload, { onConflict: 'namespace_id,key' })
        .select('key, value, expires_at, created_at, updated_at')
        .single();

      if (error) {
        return { success: false, error: `Failed to put KV entry: ${error.message}` };
      }

      const entry: KVEntry = {
        key: data.key,
        value: data.value,
        expiresAt: data.expires_at || undefined,
        createdAt: data.created_at || now,
        updatedAt: data.updated_at || now,
      };

      return { success: true, data: entry };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while saving KV entry' };
    }
  }

  /**
   * Deletes a key from a namespace.
   * @param namespaceId Namespace identifier
   * @param key Entry key to delete
   */
  async delete(namespaceId: string, key: string): Promise<VaultKVResponse<void>> {
    try {
      const supabase = this.getClient();
      const { error } = await supabase
        .from('cloud_kv_entries')
        .delete()
        .eq('namespace_id', namespaceId)
        .eq('key', key);

      if (error) {
        return { success: false, error: `Failed to delete KV entry: ${error.message}` };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while deleting KV entry' };
    }
  }

  /**
   * Lists non-expired keys within a namespace matching an optional prefix.
   * @param namespaceId Namespace identifier
   * @param prefix Optional key prefix filter
   * @param limit Maximum results (default: 100)
   */
  async list(namespaceId: string, prefix?: string, limit: number = 100): Promise<VaultKVResponse<KVEntry[]>> {
    try {
      const supabase = this.getClient();
      const now = new Date().toISOString();

      let query = supabase
        .from('cloud_kv_entries')
        .select('key, value, expires_at, created_at, updated_at')
        .eq('namespace_id', namespaceId)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order('key', { ascending: true })
        .limit(limit);

      if (prefix) {
        query = query.like('key', `${prefix}%`);
      }

      const { data, error } = await query;
      if (error) {
        return { success: false, error: `Failed to list KV entries: ${error.message}` };
      }

      const entries: KVEntry[] = (data || []).map((row) => ({
        key: row.key,
        value: row.value,
        expiresAt: row.expires_at || undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      return { success: true, data: entries };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while listing KV entries' };
    }
  }

  /**
   * Retrieves a key's value alongside metadata (expiresAt, updatedAt).
   * @param namespaceId Namespace identifier
   * @param key Entry key
   */
  async getWithMetadata(
    namespaceId: string,
    key: string
  ): Promise<VaultKVResponse<{ value: string; expiresAt?: string; updatedAt: string } | null>> {
    try {
      const supabase = this.getClient();
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('cloud_kv_entries')
        .select('value, expires_at, updated_at')
        .eq('namespace_id', namespaceId)
        .eq('key', key)
        .maybeSingle();

      if (error) {
        return { success: false, error: `Failed to get entry with metadata: ${error.message}` };
      }

      if (!data) {
        return { success: true, data: null };
      }

      if (data.expires_at && new Date(data.expires_at) <= new Date(now)) {
        supabase.from('cloud_kv_entries').delete().eq('namespace_id', namespaceId).eq('key', key).then(() => {});
        return { success: true, data: null };
      }

      return {
        success: true,
        data: {
          value: data.value,
          expiresAt: data.expires_at || undefined,
          updatedAt: data.updated_at,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while getting entry with metadata' };
    }
  }

  /**
   * Batch upserts multiple key-value entries into a namespace.
   * @param namespaceId Namespace identifier
   * @param entries Array of entries to insert or update
   */
  async bulkPut(
    namespaceId: string,
    entries: Array<{ key: string; value: string; ttl?: number }>
  ): Promise<VaultKVResponse<{ insertedCount: number }>> {
    try {
      const supabase = this.getClient();
      const now = new Date().toISOString();

      const rows = entries.map((e) => ({
        namespace_id: namespaceId,
        key: e.key,
        value: e.value,
        expires_at: e.ttl ? new Date(Date.now() + e.ttl * 1000).toISOString() : null,
        updated_at: now,
      }));

      const { error } = await supabase.from('cloud_kv_entries').upsert(rows, { onConflict: 'namespace_id,key' });
      if (error) {
        return { success: false, error: `Bulk put failed: ${error.message}` };
      }

      return { success: true, data: { insertedCount: entries.length } };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while performing bulk put' };
    }
  }
}
