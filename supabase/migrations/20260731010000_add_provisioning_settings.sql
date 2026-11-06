-- Migration: add_provisioning_settings
-- Creates a single-row table to store hypervisor and panel API credentials.

CREATE TABLE IF NOT EXISTS public.provisioning_settings (
  id integer PRIMARY KEY CHECK (id = 1),
  
  -- Pterodactyl Config
  pterodactyl_enabled boolean DEFAULT false,
  pterodactyl_url text,
  pterodactyl_api_key text,
  
  -- Proxmox Config
  proxmox_enabled boolean DEFAULT false,
  proxmox_url text,
  proxmox_token_id text,
  proxmox_secret text,
  proxmox_node text,
  
  -- cPanel/WHM Config
  cpanel_enabled boolean DEFAULT false,
  cpanel_url text,
  cpanel_username text,
  cpanel_api_token text,
  
  -- Default mapping for tiers
  default_game_adapter text DEFAULT 'pterodactyl',
  default_vps_adapter text DEFAULT 'proxmox',
  default_shared_adapter text DEFAULT 'cpanel',

  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default row
INSERT INTO public.provisioning_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.provisioning_settings ENABLE ROW LEVEL SECURITY;

-- Allow only admins to select/update
CREATE POLICY "Admins can view provisioning settings" 
  ON public.provisioning_settings FOR SELECT 
  USING (
    auth.uid() IN (SELECT user_id FROM public.admin_users)
  );

CREATE POLICY "Admins can update provisioning settings" 
  ON public.provisioning_settings FOR UPDATE 
  USING (
    auth.uid() IN (SELECT user_id FROM public.admin_users)
  );
