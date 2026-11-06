-- Migration: open_source_integrations
-- Replaces cPanel with HestiaCP/CyberPanel, adds Integrations table.

-- 1. Modify provisioning_settings table
ALTER TABLE public.provisioning_settings
  DROP COLUMN IF EXISTS cpanel_enabled,
  DROP COLUMN IF EXISTS cpanel_url,
  DROP COLUMN IF EXISTS cpanel_username,
  DROP COLUMN IF EXISTS cpanel_api_token;

ALTER TABLE public.provisioning_settings
  ADD COLUMN IF NOT EXISTS hestiacp_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS hestiacp_url text,
  ADD COLUMN IF NOT EXISTS hestiacp_username text,
  ADD COLUMN IF NOT EXISTS hestiacp_password text,
  
  ADD COLUMN IF NOT EXISTS cyberpanel_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS cyberpanel_url text,
  ADD COLUMN IF NOT EXISTS cyberpanel_admin_user text,
  ADD COLUMN IF NOT EXISTS cyberpanel_admin_pass text,
  
  ADD COLUMN IF NOT EXISTS domains_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS domains_provider text DEFAULT 'namesilo',
  ADD COLUMN IF NOT EXISTS domains_api_key text,
  ADD COLUMN IF NOT EXISTS domains_username text;

-- Update the default shared adapter
UPDATE public.provisioning_settings SET default_shared_adapter = 'hestiacp' WHERE id = 1;

-- 2. Create integrations table for Webhooks & CRM
CREATE TABLE IF NOT EXISTS public.integrations (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default Odoo placeholder keys if they don't exist
INSERT INTO public.integrations (key, value) VALUES
  ('odoo_url', 'https://odoo.elsxglobal.com'),
  ('odoo_db', 'elsxglobal'),
  ('odoo_api_key', '')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS on integrations
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Allow only admins to select/update
CREATE POLICY "Admins can view integrations" 
  ON public.integrations FOR SELECT 
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

CREATE POLICY "Admins can insert integrations" 
  ON public.integrations FOR INSERT 
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users));

CREATE POLICY "Admins can update integrations" 
  ON public.integrations FOR UPDATE 
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));
