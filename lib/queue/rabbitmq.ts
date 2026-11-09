import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export interface Queue {
  name: string;
  vhost: string;
  durable: boolean;
  messages: number;
  consumers: number;
  state: 'running' | 'stopped';
  messageRate: number;
}

export interface QueueMessage {
  id: string;
  body: string | Record<string, any>;
  timestamp: string;
  headers?: Record<string, string>;
}

export interface RabbitMQResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * RabbitMQ Management & Message Queue Client.
 * Leverages the RabbitMQ HTTP Management API for queue lifecycle, live stats, message publishing, and consumption.
 */
export class RabbitMQClient {
  private config: Record<string, any>;
  private configLoaded: boolean = false;

  /**
   * Initializes the RabbitMQ client.
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
        console.warn('[RabbitMQClient] Failed to load configuration from Supabase:', err.message);
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
   * Returns a Supabase admin client instance.
   */
  private getSupabaseAdmin() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase admin configuration missing (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)');
    }

    return createClient(supabaseUrl, supabaseServiceKey);
  }

  /**
   * Derives connection parameters for RabbitMQ Management API from configs.
   */
  private async getManagementAuth(): Promise<{ baseUrl: string; authHeader: string }> {
    let mgmtUrl = (await this.getConfigValue('rabbitmq_management_url', 'RABBITMQ_MANAGEMENT_URL')) || '';
    let username = (await this.getConfigValue('rabbitmq_username', 'RABBITMQ_USERNAME')) || 'guest';
    let password = (await this.getConfigValue('rabbitmq_password', 'RABBITMQ_PASSWORD')) || 'guest';

    // Parse from rabbitmq_url if management url or user/pass not set
    const amqpUrl = await this.getConfigValue('rabbitmq_url', 'RABBITMQ_URL');
    if (amqpUrl) {
      try {
        const parsed = new URL(amqpUrl);
        if (parsed.username) username = parsed.username;
        if (parsed.password) password = parsed.password;
        if (!mgmtUrl) {
          const host = parsed.hostname || 'localhost';
          mgmtUrl = `http://${host}:15672`;
        }
      } catch {
        // Fallback
      }
    }

    if (!mgmtUrl) {
      mgmtUrl = 'http://localhost:15672';
    }

    const cleanBaseUrl = mgmtUrl.replace(/\/+$/, '');
    const authHeader = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

    return { baseUrl: cleanBaseUrl, authHeader };
  }

  /**
   * Executes an authenticated HTTP request to the RabbitMQ Management API.
   * @param endpoint Management endpoint (e.g. /api/queues/%2F/my-queue)
   * @param method HTTP method
   * @param body Optional request body
   */
  private async fetchManagementAPI(endpoint: string, method: string = 'GET', body?: any): Promise<Response> {
    const { baseUrl, authHeader } = await this.getManagementAuth();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    return fetch(`${baseUrl}${cleanEndpoint}`, {
      method,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Creates a queue in RabbitMQ and persists metadata to the Supabase database.
   * @param userId Owner user identifier
   * @param name Queue name
   * @param opts Optional durability and configuration settings
   */
  async createQueue(
    userId: string,
    name: string,
    opts?: { durable?: boolean; maxLength?: number; dlx?: string }
  ): Promise<RabbitMQResponse<Queue>> {
    try {
      const isDurable = opts?.durable ?? true;
      const args: Record<string, any> = {};

      if (opts?.maxLength) {
        args['x-max-length'] = opts.maxLength;
      }
      if (opts?.dlx) {
        args['x-dead-letter-exchange'] = opts.dlx;
      }

      const payload = {
        auto_delete: false,
        durable: isDurable,
        arguments: args,
      };

      const res = await this.fetchManagementAPI(`/api/queues/%2F/${encodeURIComponent(name)}`, 'PUT', payload);
      if (!res.ok && res.status !== 204) {
        const errText = await res.text();
        return { success: false, error: `Failed to create queue in RabbitMQ: ${errText}` };
      }

      // Persist in cloud_queues table in Supabase
      try {
        const supabase = this.getSupabaseAdmin();
        await supabase.from('cloud_queues').upsert({
          user_id: userId,
          name,
          durable: isDurable,
          created_at: new Date().toISOString(),
        });
      } catch (dbErr: any) {
        console.warn('[RabbitMQClient] Supabase save warning:', dbErr.message);
      }

      const queue: Queue = {
        name,
        vhost: '/',
        durable: isDurable,
        messages: 0,
        consumers: 0,
        state: 'running',
        messageRate: 0,
      };

      return { success: true, data: queue };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while creating queue' };
    }
  }

  /**
   * Deletes a queue from RabbitMQ and removes its database record.
   * @param queueId Queue name or database ID
   */
  async deleteQueue(queueId: string): Promise<RabbitMQResponse<void>> {
    try {
      let queueName = queueId;

      try {
        const supabase = this.getSupabaseAdmin();
        const { data } = await supabase.from('cloud_queues').select('name').eq('id', queueId).single();
        if (data?.name) {
          queueName = data.name;
        }

        await supabase.from('cloud_queues').delete().or(`id.eq.${queueId},name.eq.${queueId}`);
      } catch (dbErr: any) {
        console.warn('[RabbitMQClient] Supabase delete warning:', dbErr.message);
      }

      const res = await this.fetchManagementAPI(`/api/queues/%2F/${encodeURIComponent(queueName)}`, 'DELETE');
      if (!res.ok && res.status !== 404) {
        const errText = await res.text();
        return { success: false, error: `Failed to delete queue: ${errText}` };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while deleting queue' };
    }
  }

  /**
   * Lists queues owned by a user, enriched with real-time statistics from the RabbitMQ management API.
   * @param userId Owner user ID
   */
  async listQueues(userId: string): Promise<RabbitMQResponse<Queue[]>> {
    try {
      let queueNames: string[] = [];

      try {
        const supabase = this.getSupabaseAdmin();
        const { data } = await supabase
          .from('cloud_queues')
          .select('name')
          .or(`user_id.eq.${userId},tenant_id.eq.${userId}`);

        if (data && data.length > 0) {
          queueNames = data.map((q: any) => q.name);
        }
      } catch {
        // Fallback
      }

      // Query RabbitMQ queues
      const res = await this.fetchManagementAPI('/api/queues/%2F', 'GET');
      if (!res.ok) {
        const errText = await res.text();
        return { success: false, error: `Failed to query queues from management API: ${errText}` };
      }

      const rawQueues: any[] = await res.json();
      const queues: Queue[] = rawQueues
        .filter((q) => queueNames.length === 0 || queueNames.includes(q.name))
        .map((q) => ({
          name: q.name,
          vhost: q.vhost || '/',
          durable: Boolean(q.durable),
          messages: q.messages || 0,
          consumers: q.consumers || 0,
          state: q.state === 'running' ? 'running' : (q.idle_since ? 'stopped' : 'running'),
          messageRate: q.message_stats?.publish_details?.rate || 0,
        }));

      return { success: true, data: queues };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while listing queues' };
    }
  }

  /**
   * Publishes a message directly to a queue via the default exchange.
   * @param queueName Target destination queue name
   * @param message String or JSON object payload
   */
  async publishMessage(queueName: string, message: string | Record<string, any>): Promise<RabbitMQResponse<{ routed: boolean }>> {
    try {
      const payloadString = typeof message === 'string' ? message : JSON.stringify(message);

      const body = {
        properties: {
          delivery_mode: 2,
          headers: {},
        },
        routing_key: queueName,
        payload: payloadString,
        payload_encoding: 'string',
      };

      const res = await this.fetchManagementAPI('/api/exchanges/%2F/amq.default/publish', 'POST', body);
      if (!res.ok) {
        const errText = await res.text();
        return { success: false, error: `Failed to publish message: ${errText}` };
      }

      const result = await res.json();
      return { success: true, data: { routed: Boolean(result.routed) } };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while publishing message' };
    }
  }

  /**
   * Consumes and acknowledges messages from a queue.
   * @param queueName Target queue name
   * @param count Number of messages to consume (default: 1)
   */
  async consumeMessages(queueName: string, count: number = 1): Promise<RabbitMQResponse<QueueMessage[]>> {
    try {
      const body = {
        count: count || 1,
        ackmode: 'ack_requeue_false',
        encoding: 'auto',
        truncate: 50000,
      };

      const res = await this.fetchManagementAPI(`/api/queues/%2F/${encodeURIComponent(queueName)}/get`, 'POST', body);
      if (!res.ok) {
        const errText = await res.text();
        return { success: false, error: `Failed to consume messages: ${errText}` };
      }

      const rawMessages: any[] = await res.json();
      const messages: QueueMessage[] = (rawMessages || []).map((m) => {
        let parsedBody: any = m.payload;
        try {
          parsedBody = JSON.parse(m.payload);
        } catch {
          // Keep string
        }

        return {
          id: m.properties?.message_id || crypto.randomUUID(),
          body: parsedBody,
          timestamp: new Date().toISOString(),
          headers: m.properties?.headers || {},
        };
      });

      return { success: true, data: messages };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while consuming messages' };
    }
  }

  /**
   * Retrieves live metrics, consumer count, and message backlog for a queue.
   * @param queueName Target queue name
   */
  async getQueueStats(queueName: string): Promise<RabbitMQResponse<Queue>> {
    try {
      const res = await this.fetchManagementAPI(`/api/queues/%2F/${encodeURIComponent(queueName)}`, 'GET');
      if (!res.ok) {
        const errText = await res.text();
        return { success: false, error: `Failed to get queue statistics: ${errText}` };
      }

      const q = await res.json();
      const queue: Queue = {
        name: q.name,
        vhost: q.vhost || '/',
        durable: Boolean(q.durable),
        messages: q.messages || 0,
        consumers: q.consumers || 0,
        state: q.state === 'running' ? 'running' : (q.idle_since ? 'stopped' : 'running'),
        messageRate: q.message_stats?.publish_details?.rate || 0,
      };

      return { success: true, data: queue };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while fetching queue statistics' };
    }
  }

  /**
   * Purges all unconsumed messages from the specified queue.
   * @param queueName Target queue name
   */
  async purgeQueue(queueName: string): Promise<RabbitMQResponse<void>> {
    try {
      const res = await this.fetchManagementAPI(`/api/queues/%2F/${encodeURIComponent(queueName)}/contents`, 'DELETE');
      if (!res.ok) {
        const errText = await res.text();
        return { success: false, error: `Failed to purge queue: ${errText}` };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while purging queue' };
    }
  }
}
