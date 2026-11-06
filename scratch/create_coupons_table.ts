import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string);

async function run() {
  const { error } = await supabaseAdmin.rpc('exec_sql', { sql: `
    CREATE TABLE IF NOT EXISTS hosting_coupons (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      code text UNIQUE NOT NULL,
      discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
      discount_value numeric NOT NULL,
      max_uses integer,
      current_uses integer DEFAULT 0,
      valid_from timestamp with time zone,
      valid_until timestamp with time zone,
      is_active boolean DEFAULT true,
      created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
    );
  ` });
  console.log(error || 'Success');
}

run();
