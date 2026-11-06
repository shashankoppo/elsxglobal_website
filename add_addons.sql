ALTER TABLE public.hosting_orders ADD COLUMN IF NOT EXISTS addons JSONB DEFAULT '{}'::jsonb;
