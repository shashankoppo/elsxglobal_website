'use client';

import { createClient } from '@/lib/supabase';

export { createClient };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function adminFetch(action: string, payload?: any) {
  const res = await fetch(`/api/admin/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, ...payload }),
  });
  return res;
}
