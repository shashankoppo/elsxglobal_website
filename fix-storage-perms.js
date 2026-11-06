const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
});

async function fixStoragePolicies() {
  await client.connect();
  const res = await client.query(`
    -- Allow any user (anon and authenticated) to insert objects into the qr-uploads bucket
    CREATE POLICY "Allow public uploads to qr-uploads" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'qr-uploads');
    
    -- Allow public to select/read objects from the qr-uploads bucket
    CREATE POLICY "Allow public read from qr-uploads" ON storage.objects FOR SELECT TO public USING (bucket_id = 'qr-uploads');
  `);
  console.log("Storage policies added!");
  await client.end();
}

fixStoragePolicies().catch(err => {
  if (err.message.includes('already exists')) {
    console.log("Policies already exist.");
  } else {
    console.error(err);
  }
  client.end();
});
