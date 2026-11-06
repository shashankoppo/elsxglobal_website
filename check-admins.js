const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase.from('admin_users').select('*');
  console.log("Admin Users:", JSON.stringify(data, null, 2));
  if (error) console.error("Error:", error);
}

check();
