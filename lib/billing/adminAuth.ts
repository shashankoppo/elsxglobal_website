import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export interface AdminAuthResult {
  authorized: boolean;
  error?: string;
  status: number;
  supabaseAdmin: SupabaseClient | null;
  userId?: string | null;
}

function safeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Validates admin request via x-admin-secret header OR active admin user session.
 */
export async function verifyAdminRequest(request: Request): Promise<AdminAuthResult> {
  const adminSecretHeader = request.headers.get('x-admin-secret');
  const configuredSecret = process.env.ADMIN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return {
      authorized: false,
      error: 'Server configuration error: missing Supabase credentials',
      status: 500,
      supabaseAdmin: null,
    };
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  // 1. Direct Secret Header Match (Timing-Safe)
  if (adminSecretHeader && configuredSecret && safeCompare(adminSecretHeader, configuredSecret)) {
    return {
      authorized: true,
      status: 200,
      supabaseAdmin,
      userId: 'admin-service-account',
    };
  }

  // 2. Cookie session check
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey || '', {
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
      },
    });

    let user: any = null;
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        user = authData.user;
      }
    } catch {}

    if (!user) {
      const allCookies = cookieStore.getAll();
      for (const c of allCookies) {
        if (c.name.includes('auth-token') && c.value) {
          try {
            const raw = c.value.startsWith('base64-')
              ? Buffer.from(c.value.slice(7), 'base64').toString('utf8')
              : decodeURIComponent(c.value);
            const parsed = JSON.parse(raw);
            const token = parsed?.access_token || parsed?.[0] || (typeof parsed === 'string' ? parsed : null);
            if (token && typeof token === 'string' && token.includes('.')) {
              const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf8'));
              if (payload && payload.sub) {
                user = {
                  id: payload.sub,
                  email: payload.email,
                  app_metadata: payload.app_metadata || {},
                  user_metadata: payload.user_metadata || {},
                };
                break;
              }
            }
          } catch {}
        }
      }
    }

    if (user) {
      const isMasterAdmin =
        user.email?.toLowerCase() === 'admin@elsxglobal.com' ||
        user.app_metadata?.role === 'superadmin' ||
        user.user_metadata?.role === 'superadmin' ||
        user.app_metadata?.role === 'admin';

      if (isMasterAdmin) {
        return {
          authorized: true,
          status: 200,
          supabaseAdmin,
          userId: user.id,
        };
      }

      const { data: adminRecord } = await supabaseAdmin
        .from('admin_users')
        .select('id, role, is_active')
        .eq('user_id', user.id)
        .maybeSingle();

      if (adminRecord && adminRecord.is_active) {
        return {
          authorized: true,
          status: 200,
          supabaseAdmin,
          userId: user.id,
        };
      }
    }
  } catch (err) {
    console.warn('Session admin check warning:', err);
  }

  return {
    authorized: false,
    error: 'Unauthorized: Admin authentication required',
    status: 401,
    supabaseAdmin: null,
  };
}
