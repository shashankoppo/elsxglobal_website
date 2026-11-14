
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  console.log('Testing RLS on hosting_orders with anonymous key...');
  const { data, error } = await supabaseAnon.from('hosting_orders').select('id, user_id, total').limit(5);
  console.log('Anon Query Error:', error);
  console.log('Anon Query Data (must be empty or null under RLS):', data);
  if (!error && Array.isArray(data) && data.length === 0) {
    console.log('✅ RLS test PASSED: Anonymous clients cannot read orders.');
  } else if (error) {
    console.log('✅ RLS test PASSED: Access blocked with error:', error.message);
  } else {
    console.warn('⚠️ RLS test FAILED: Anonymous client read', data.length, 'orders!');
  }
}
run();

