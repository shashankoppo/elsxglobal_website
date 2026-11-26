import { describe, expect, it } from 'vitest';
import {
  buildPublicRedirectUrl,
  resolvePublicOrigin,
  sanitizeRelativeRedirect,
} from '@/lib/http/origin';

describe('resolvePublicOrigin', () => {
  it('prefers x-forwarded-host and x-forwarded-proto over internal request URL', () => {
    const headers = new Headers({
      'x-forwarded-host': 'stage.elsxglobal.com, internal-proxy',
      'x-forwarded-proto': 'https, http',
      host: '0.0.0.0:80',
    });

    expect(resolvePublicOrigin(headers, 'http://localhost:80/portal')).toBe(
      'https://stage.elsxglobal.com'
    );
  });

  it('falls back to host header when x-forwarded-host is absent', () => {
    const headers = new Headers({
      host: 'elsxglobal.com',
    });

    expect(resolvePublicOrigin(headers, 'http://0.0.0.0:80/portal')).toBe(
      'http://elsxglobal.com'
    );
  });

  it('ignores 0.0.0.0 bind-all hosts', () => {
    const headers = new Headers({
      host: '0.0.0.0:80',
    });

    expect(resolvePublicOrigin(headers, 'http://127.0.0.1:3000/portal')).toBe(
      'http://127.0.0.1:3000'
    );
  });
});

describe('sanitizeRelativeRedirect', () => {
  it('allows relative paths and rejects open redirects', () => {
    expect(sanitizeRelativeRedirect('/portal/billing/', '/portal')).toBe('/portal/billing/');
    expect(sanitizeRelativeRedirect('https://evil.com', '/portal')).toBe('/portal');
    expect(sanitizeRelativeRedirect('//evil.com', '/portal')).toBe('/portal');
    expect(sanitizeRelativeRedirect('', '/portal')).toBe('/portal');
  });
});

describe('buildPublicRedirectUrl', () => {
  it('builds a full public URL preserving forwarded origin and safe path', () => {
    const headers = new Headers({
      'x-forwarded-host': 'prod.elsxglobal.com',
      'x-forwarded-proto': 'https',
    });

    const url = buildPublicRedirectUrl('/portal/login', headers, 'http://0.0.0.0:80/portal');
    expect(url.toString()).toBe('https://prod.elsxglobal.com/portal/login');
  });
});
