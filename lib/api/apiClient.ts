/**
 * Centralized API Gateway Client
 *
 * All data requests route through this client. It attaches the Supabase
 * access token as a Bearer token, normalizes gateway errors, and handles
 * 401 (token refresh), 403 (authorization), and 429 (rate limit) responses.
 *
 * In production, set NEXT_PUBLIC_API_GATEWAY_URL to your centralized gateway.
 * When unset, the client falls back to direct Supabase queries so the app
 * remains functional during the migration to the gateway.
 */

import { createClient } from '@/lib/supabase';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || '';

export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

class ApiClient {
  private baseUrl: string;
  private refreshing: Promise<boolean> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getAuthToken(): Promise<string | null> {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  }

  private async refreshSession(): Promise<boolean> {
    if (this.refreshing) return this.refreshing;
    this.refreshing = (async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.refreshSession();
      this.refreshing = null;
      return !error && !!data.session;
    })();
    return this.refreshing;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
    retry = true
  ): Promise<ApiResponse<T>> {
    if (!this.baseUrl) {
      return {
        data: null,
        error: { status: 0, code: 'NO_GATEWAY', message: 'API gateway URL not configured' },
      };
    }

    const token = await this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    try {
      const response = await fetch(`${this.baseUrl}${path}`, { ...options, headers });

      if (response.status === 401 && retry) {
        const refreshed = await this.refreshSession();
        if (refreshed) return this.request<T>(path, options, false);
        return {
          data: null,
          error: { status: 401, code: 'UNAUTHORIZED', message: 'Session expired. Please sign in again.' },
        };
      }

      if (response.status === 403) {
        return {
          data: null,
          error: { status: 403, code: 'FORBIDDEN', message: 'You do not have permission to perform this action.' },
        };
      }

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || '60';
        return {
          data: null,
          error: {
            status: 429,
            code: 'RATE_LIMITED',
            message: `Too many requests. Please retry after ${retryAfter} seconds.`,
            details: { retryAfter: Number(retryAfter) },
          },
        };
      }

      if (!response.ok) {
        let errorBody: any = null;
        try { errorBody = await response.json(); } catch { /* non-JSON error */ }
        return {
          data: null,
          error: {
            status: response.status,
            code: errorBody?.code || 'ERROR',
            message: errorBody?.message || response.statusText,
            details: errorBody,
          },
        };
      }

      const data = await response.json() as T;
      return { data, error: null };
    } catch (err) {
      return {
        data: null,
        error: {
          status: 0,
          code: 'NETWORK_ERROR',
          message: err instanceof Error ? err.message : 'Network request failed',
        },
      };
    }
  }

  async get<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'GET' });
  }

  async post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'DELETE' });
  }

  isConfigured(): boolean {
    return Boolean(this.baseUrl);
  }
}

export const apiClient = new ApiClient(API_GATEWAY_URL);
export default apiClient;
