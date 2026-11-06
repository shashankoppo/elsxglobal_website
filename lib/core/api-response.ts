/**
 * @module api-response
 * @docs /docs/api/reference#response-format
 * @description Canonical API response envelope following RFC 7231 and VaultHost API standards.
 * All API routes MUST use these types for consistency.
 * 
 * @see {@link https://datatracker.ietf.org/doc/html/rfc7231 RFC 7231}
 * @example
 * ```typescript
 * import { ok, err, withStandardHeaders } from '@/lib/core/api-response';
 * 
 * export async function GET(req: Request) {
 *   const data = await fetchData();
 *   return ok(data); // Returns { success: true, data, meta: { requestId, version, timestamp } }
 * }
 * ```
 */
import { NextResponse } from 'next/server';

export interface ResponseMeta {
  requestId: string;
  timestamp: string;
  colo: string;
  latencyMs?: number;
  version: string;
  riskTier?: number;
  idempotencyKey?: string;
  signature?: string;
}

export interface ApiResponseEnvelope<T> {
  success: true;
  data: T;
  meta: ResponseMeta;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  field?: string;
  details?: unknown;
}

export interface ApiErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    issues?: ApiErrorDetail[];
  };
  meta: ResponseMeta;
}

/**
 * Standard HTTP Status Codes enum for type safety.
 */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Generates canonical response headers adhering to RFC 7231 & Cloudflare Anycast standard.
 */
export function buildResponseHeaders(meta: ResponseMeta, extraHeaders?: Record<string, string>): Headers {
  const headers = new Headers(extraHeaders);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('X-Request-Id', meta.requestId);
  headers.set('X-VaultHost-Colo', meta.colo);
  headers.set('X-VaultHost-Version', meta.version);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');

  if (meta.latencyMs !== undefined) {
    headers.set('X-Response-Time', `${meta.latencyMs}ms`);
  }
  if (meta.riskTier !== undefined) {
    headers.set('X-Action-Gateway-Tier', String(meta.riskTier));
  }
  if (meta.signature) {
    headers.set('X-Action-Gateway-Signature', meta.signature);
  }
  if (meta.idempotencyKey) {
    headers.set('X-Idempotency-Key', meta.idempotencyKey);
  }

  return headers;
}

/**
 * Creates a standardized 200/201 success response envelope.
 */
export function createSuccessResponse<T>(
  data: T,
  options?: {
    status?: number;
    meta?: Partial<ResponseMeta>;
    headers?: Record<string, string>;
  }
): NextResponse<ApiResponseEnvelope<T>> {
  const meta: ResponseMeta = {
    requestId: options?.meta?.requestId || `req_${crypto.randomUUID()}`,
    timestamp: options?.meta?.timestamp || new Date().toISOString(),
    colo: options?.meta?.colo || 'BOM1',
    latencyMs: options?.meta?.latencyMs,
    version: '2026-09-v1',
    riskTier: options?.meta?.riskTier,
    idempotencyKey: options?.meta?.idempotencyKey,
    signature: options?.meta?.signature,
  };

  const body: ApiResponseEnvelope<T> = {
    success: true,
    data,
    meta,
  };

  const headers = buildResponseHeaders(meta, options?.headers);

  return NextResponse.json(body, {
    status: options?.status || HttpStatus.OK,
    headers,
  });
}

/**
 * Creates a standardized error response envelope.
 */
export function createErrorResponse(
  code: string,
  message: string,
  options?: {
    status?: number;
    details?: unknown;
    issues?: ApiErrorDetail[];
    meta?: Partial<ResponseMeta>;
    headers?: Record<string, string>;
  }
): NextResponse<ApiErrorEnvelope> {
  const meta: ResponseMeta = {
    requestId: options?.meta?.requestId || `req_${crypto.randomUUID()}`,
    timestamp: options?.meta?.timestamp || new Date().toISOString(),
    colo: options?.meta?.colo || 'BOM1',
    latencyMs: options?.meta?.latencyMs,
    version: '2026-09-v1',
    riskTier: options?.meta?.riskTier,
    idempotencyKey: options?.meta?.idempotencyKey,
  };

  const body: ApiErrorEnvelope = {
    success: false,
    error: {
      code,
      message,
      details: options?.details,
      issues: options?.issues,
    },
    meta,
  };

  const headers = buildResponseHeaders(meta, options?.headers);

  return NextResponse.json(body, {
    status: options?.status || HttpStatus.BAD_REQUEST,
    headers,
  });
}
