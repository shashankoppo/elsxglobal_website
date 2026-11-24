import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://api-gw:8000'
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

  return createServerClient(
    url,
    key,
    {
      cookieOptions: {
        name: 'elsxglobal-auth-token',
      },
      cookies: {
        getAll() {
          const all = cookieStore.getAll();
          const hasAuthToken = all.some((c) => c.name.startsWith('elsxglobal-auth-token'));
          if (!hasAuthToken) {
            const legacy = all.filter(
              (c) =>
                c.name.startsWith('sb-elsxglobal-auth-token') ||
                c.name.startsWith('sb-api-gw-auth-token')
            );
            if (legacy.length > 0) {
              return [
                ...all,
                ...legacy.map((c) => ({
                  name: c.name.replace(/^sb-(elsxglobal|api-gw)-auth-token/, 'elsxglobal-auth-token'),
                  value: c.value,
                })),
              ];
            }
          }
          return all;
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored when called from Server Components
          }
        },
      },
    }
  );
}

export { createClient as createServerClient };
