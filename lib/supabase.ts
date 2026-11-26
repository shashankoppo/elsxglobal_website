export { createClient } from '@/lib/supabase/client';

import { createClient as _createClient } from '@/lib/supabase/client';

type BrowserClient = ReturnType<typeof _createClient>;
let _cachedClient: BrowserClient | null = null;

function getClient(): BrowserClient {
  if (!_cachedClient) {
    _cachedClient = _createClient();
  }
  return _cachedClient;
}

export const supabase: BrowserClient = new Proxy({} as BrowserClient, {
  get(_target, prop) {
    const client = getClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
