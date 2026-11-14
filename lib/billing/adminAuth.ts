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
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!userError && user) {
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
