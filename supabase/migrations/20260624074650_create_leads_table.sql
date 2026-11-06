CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  full_name TEXT NOT NULL,
  work_email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  intent TEXT NOT NULL DEFAULT 'consultation',
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  source TEXT,
  metadata JSONB
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert_leads_public" ON public.leads FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE INDEX leads_created_at_idx ON public.leads (created_at DESC);
CREATE INDEX leads_status_idx ON public.leads (status);
CREATE INDEX leads_intent_idx ON public.leads (intent);
