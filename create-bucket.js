const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createBucket() {
  console.log("Creating bucket qr-uploads...");
  const { data, error } = await supabase.storage.createBucket('qr-uploads', {
    public: true,
    allowedMimeTypes: ['image/*'],
    fileSizeLimit: 5242880 // 5MB
  });
  
  if (error) {
    if (error.message.includes('already exists')) {
      console.log("Bucket already exists.");
      // Ensure it's public
      await supabase.storage.updateBucket('qr-uploads', { public: true });
    } else {
      console.error("Error creating bucket:", error);
    }
  } else {
    console.log("Bucket created:", data);
  }
}

createBucket();
