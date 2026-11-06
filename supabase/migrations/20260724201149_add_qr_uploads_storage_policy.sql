/*
# Storage policy for qr-uploads bucket

1. Security
- Allow public read access to QR upload images (they need to be displayed on checkout)
- Allow authenticated users to upload (admin uploads via portal)
*/

DROP POLICY IF EXISTS "public_read_qr_uploads" ON storage.objects;
CREATE POLICY "public_read_qr_uploads" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'qr-uploads');

DROP POLICY IF EXISTS "auth_upload_qr_uploads" ON storage.objects;
CREATE POLICY "auth_upload_qr_uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'qr-uploads');
