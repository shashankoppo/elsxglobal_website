-- Drop foreign key constraints
ALTER TABLE public.hosting_orders DROP CONSTRAINT IF EXISTS hosting_orders_plan_id_fkey;
ALTER TABLE public.hosting_subscriptions DROP CONSTRAINT IF EXISTS hosting_subscriptions_plan_id_fkey;
ALTER TABLE public.hosting_services DROP CONSTRAINT IF EXISTS hosting_services_plan_id_fkey;
ALTER TABLE public.hosting_order_addons DROP CONSTRAINT IF EXISTS hosting_order_addons_addon_id_fkey;
ALTER TABLE public.hosting_order_addons DROP CONSTRAINT IF EXISTS hosting_order_addons_order_id_fkey;

-- Change base table IDs
ALTER TABLE public.hosting_plans ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.hosting_addons ALTER COLUMN id TYPE text USING id::text;

-- Change referencing columns
ALTER TABLE public.hosting_orders ALTER COLUMN plan_id TYPE text USING plan_id::text;
ALTER TABLE public.hosting_subscriptions ALTER COLUMN plan_id TYPE text USING plan_id::text;
ALTER TABLE public.hosting_services ALTER COLUMN plan_id TYPE text USING plan_id::text;
ALTER TABLE public.hosting_order_addons ALTER COLUMN addon_id TYPE text USING addon_id::text;

-- Add foreign key constraints back
ALTER TABLE public.hosting_orders ADD CONSTRAINT hosting_orders_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.hosting_plans(id);
ALTER TABLE public.hosting_subscriptions ADD CONSTRAINT hosting_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.hosting_plans(id);
ALTER TABLE public.hosting_services ADD CONSTRAINT hosting_services_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.hosting_plans(id);
ALTER TABLE public.hosting_order_addons ADD CONSTRAINT hosting_order_addons_addon_id_fkey FOREIGN KEY (addon_id) REFERENCES public.hosting_addons(id);
ALTER TABLE public.hosting_order_addons ADD CONSTRAINT hosting_order_addons_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.hosting_orders(id);
