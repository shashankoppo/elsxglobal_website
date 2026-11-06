-- Add server configuration columns to hosting_orders
ALTER TABLE hosting_orders
  ADD COLUMN IF NOT EXISTS os_selection text DEFAULT 'ubuntu-22.04',
  ADD COLUMN IF NOT EXISTS panel_selection text DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS server_location text DEFAULT 'pune';

-- Create email_log table for tracking outgoing emails
CREATE TABLE IF NOT EXISTS email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient text NOT NULL,
  subject text NOT NULL,
  body text,
  template text,
  related_id uuid,
  related_type text,
  status text NOT NULL DEFAULT 'sent',
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

-- Admin can read all emails
CREATE POLICY "admin_read_email_log" ON email_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (auth.jwt() ->> 'email')
      AND admin_users.is_active = true
    )
  );

-- Owner can read their own emails (matched via related_id + user_id on related record)
CREATE POLICY "owner_read_email_log" ON email_log
  FOR SELECT TO authenticated
  USING (
    related_id IN (
      SELECT id FROM hosting_orders WHERE user_id = auth.uid()
    )
  );

-- Edge function (service role) can insert
CREATE POLICY "service_insert_email_log" ON email_log
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_email_log_recipient ON email_log(recipient);
CREATE INDEX IF NOT EXISTS idx_email_log_created_at ON email_log(created_at);
CREATE INDEX IF NOT EXISTS idx_email_log_related_id ON email_log(related_id);
