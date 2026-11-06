import { createHash } from 'crypto';
import { NextResponse } from 'next/server';

interface IdempotencyRecord {
  key: string;
  payloadHash: string;
  status: 'PENDING' | 'RESOLVED';
  statusCode?: number;
  responseBody?: any;
  responseHeaders?: Record<string, string>;
  createdAt: number;
  expiresAt: number;
}

// In-memory LRU store with 24-hour expiration for edge nodes
const idempotencyStore = new Map<string, IdempotencyRecord>();

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export class IdempotencyManager {
  /**
   * Hashes the request payload to ensure replay requests match the initial intent
   */
  public static hashPayload(payload: any): string {
    const raw = typeof payload === 'string' ? payload : JSON.stringify(payload || {});
    return createHash('sha256').update(raw).digest('hex');
  }

  /**
   * Checks or registers an idempotency key.
   * Returns:
   *  - { replay: true, response } if request was already successfully processed.
   *  - { conflict: true } if key is being reused with different payload.
   *  - { pending: true } if identical request is currently executing.
   *  - { allowed: true } if this is a fresh request permitted to proceed.
   */
  public static evaluateKey(
    key: string,
    payload: any
  ): {
    allowed?: boolean;
    replay?: boolean;
    conflict?: boolean;
    pending?: boolean;
    cachedResponse?: { statusCode: number; body: any; headers: Record<string, string> };
  } {
    if (!key || key.trim() === '') {
      return { allowed: true };
    }

    const now = Date.now();
    const payloadHash = this.hashPayload(payload);
    const existing = idempotencyStore.get(key);

    if (existing) {
      // Check expiration
      if (now > existing.expiresAt) {
        idempotencyStore.delete(key);
      } else {
        // Check payload match
        if (existing.payloadHash !== payloadHash) {
          return { conflict: true };
        }

        if (existing.status === 'PENDING') {
          return { pending: true };
        }

        return {
          replay: true,
          cachedResponse: {
            statusCode: existing.statusCode || 200,
            body: existing.responseBody,
            headers: {
              ...(existing.responseHeaders || {}),
              'X-Idempotency-Replay': 'true',
            },
          },
        };
      }
    }

    // Register pending lock
    idempotencyStore.set(key, {
      key,
      payloadHash,
      status: 'PENDING',
      createdAt: now,
      expiresAt: now + DEFAULT_TTL_MS,
    });

    return { allowed: true };
  }

  /**
   * Commits the resolved response for an idempotency key.
   */
  public static recordSuccess(
    key: string,
    statusCode: number,
    body: any,
    headers?: Record<string, string>
  ): void {
    if (!key) return;

    const existing = idempotencyStore.get(key);
    if (existing) {
      existing.status = 'RESOLVED';
      existing.statusCode = statusCode;
      existing.responseBody = body;
      existing.responseHeaders = headers;
    }
  }

  /**
   * Clears a pending lock on failure so the caller can retry immediately.
   */
  public static releaseLock(key: string): void {
    if (!key) return;
    idempotencyStore.delete(key);
  }
}
