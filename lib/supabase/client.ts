import { createBrowserClient } from '@supabase/ssr';

const DEFAULT_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzMyMDAwMDAwLCJleHAiOjIwNDc1NjQ4MDB9.u46bXnr3d1siODG_oAQx9izfi2MwZjNSzvHHeq-lbAY';

export function createClient() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

  // In client browsers, if NEXT_PUBLIC_SUPABASE_URL points to an internal Docker hostname
  // (e.g. http://api-gw:8000) or placeholder, use window.location.origin so requests are
  // cleanly proxied through Next.js rewrites to the internal gateway with zero CORS.
  if (typeof window !== 'undefined') {
    if (
      !url ||
      url.includes('placeholder') ||
      url.includes('api-gw') ||
      url.includes('kong') ||
      url.includes('envoy')
    ) {
      url = window.location.origin;
    }
  } else if (!url || url.includes('placeholder')) {
    url = process.env.SUPABASE_URL || 'http://api-gw:8000';
  }

  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const key = rawKey && !rawKey.includes('placeholder') ? rawKey : DEFAULT_ANON_KEY;

  return createBrowserClient(url, key, {
    cookieOptions: {
      name: 'elsxglobal-auth-token',
    },
  });
}
