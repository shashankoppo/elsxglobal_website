/*
# Storage policy for qr-uploads bucket

1. Security
- Allow public read access to QR upload images (they need to be displayed on checkout)
- Allow authenticated users to upload (admin uploads via portal)

NOTE: This migration is wrapped in a conditional. The storage schema
(storage.objects) only exists after supabase/storage-api has started and
initialized. If storage is not ready yet, we skip gracefully — the app's
entrypoint migration runner will retry on next restart.
*/

DO $$
BEGIN
  -- Only apply if storage.objects exists (storage-api has initialized)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'storage' AND table_name = 'objects'
  ) THEN
    DROP POLICY IF EXISTS "public_read_qr_uploads" ON storage.objects;
    CREATE POLICY "public_read_qr_uploads" ON storage.objects
      FOR SELECT TO anon, authenticated
      USING (bucket_id = 'qr-uploads');

    DROP POLICY IF EXISTS "auth_upload_qr_uploads" ON storage.objects;
    CREATE POLICY "auth_upload_qr_uploads" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'qr-uploads');

    RAISE NOTICE 'Storage policies applied successfully.';
  ELSE
    RAISE NOTICE 'storage.objects not found — storage service not yet initialized. Skipping.';
  END IF;
END $$;
