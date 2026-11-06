const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const pgClient = new Client({
  connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
});

async function setupBuckets() {
  console.log("Setting up buckets...");
  
  // Create payment-proofs
  const { error: err1 } = await supabase.storage.createBucket('payment-proofs', {
    public: true,
    fileSizeLimit: 5242880 // 5MB
  });
  if (err1 && !err1.message.includes('already exists')) console.error("Error creating payment-proofs:", err1);
  else await supabase.storage.updateBucket('payment-proofs', { public: true });
  
  // Set RLS policies
  await pgClient.connect();
  try {
    await pgClient.query(`
      CREATE POLICY "Allow public uploads to payment-proofs" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'payment-proofs');
      CREATE POLICY "Allow public read from payment-proofs" ON storage.objects FOR SELECT TO public USING (bucket_id = 'payment-proofs');
    `);
  } catch (e) {
    if (!e.message.includes('already exists')) console.error(e);
  }
  await pgClient.end();
  
  console.log("payment-proofs bucket and policies set up successfully.");
}

setupBuckets();
