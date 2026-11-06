CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- No public access — only the service role (used by edge functions) can read
CREATE POLICY "select_integrations_service_only" ON public.integrations FOR SELECT
  TO authenticated USING (false);

INSERT INTO public.integrations (key, value) VALUES
  ('odoo_api_key', '86c3fd4322589a1bdbd605869e4222dfbcd89568'),
  ('odoo_url', 'https://elsxglobal.com'),
  ('odoo_db', 'elsxglobal')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
