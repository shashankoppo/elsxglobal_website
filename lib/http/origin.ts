/**
 * Helpers for resolving the public request origin behind reverse proxies
 * (Coolify/Traefik, Nginx, etc.) where Node/Next.js internal `request.url`
 * often resolves to the bound container host (`0.0.0.0:80` or `localhost`).
 */

function firstHeaderValue(value: string | null): string {
  if (!value) return '';
  return value.split(',')[0]?.trim() ?? '';
}

function isBindAllHost(host: string): boolean {
  const bare = host.split(':')[0]?.toLowerCase() ?? '';
  return bare === '0.0.0.0' || bare === '[::]' || bare === '::';
}

export function resolvePublicOrigin(headers: Headers, fallbackUrl: string): string {
  const parsedFallback = new URL(fallbackUrl);

  const forwardedHost = firstHeaderValue(headers.get('x-forwarded-host'));
  const hostHeader = firstHeaderValue(headers.get('host'));

  let resolvedHost = forwardedHost || hostHeader || parsedFallback.host;
  if (isBindAllHost(resolvedHost)) {
    resolvedHost = !isBindAllHost(parsedFallback.host) ? parsedFallback.host : 'localhost';
  }

  const forwardedProto = firstHeaderValue(headers.get('x-forwarded-proto')).toLowerCase();
  const proto =
    forwardedProto === 'http' || forwardedProto === 'https'
      ? forwardedProto
      : parsedFallback.protocol.replace(/:$/, '') || 'https';

  return `${proto}://${resolvedHost}`;
}

export function sanitizeRelativeRedirect(target: string | null | undefined, fallback = '/portal'): string {
  if (!target) return fallback;
  const trimmed = target.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }
  return fallback;
}

export function buildPublicRedirectUrl(
  target: string,
  headers: Headers,
  fallbackUrl: string,
  fallbackPath = '/portal'
): URL {
  const safePath = sanitizeRelativeRedirect(target, fallbackPath);
  const origin = resolvePublicOrigin(headers, fallbackUrl);
  return new URL(safePath, origin);
}
