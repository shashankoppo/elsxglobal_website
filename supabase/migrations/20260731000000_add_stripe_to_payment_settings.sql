-- Add Stripe columns to payment_settings

ALTER TABLE payment_settings 
ADD COLUMN IF NOT EXISTS stripe_enabled boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_publishable_key text DEFAULT '',
ADD COLUMN IF NOT EXISTS stripe_secret_key text DEFAULT '',
ADD COLUMN IF NOT EXISTS stripe_webhook_secret text DEFAULT '';

-- Update public view
DROP VIEW IF EXISTS public_payment_settings;

CREATE OR REPLACE VIEW public_payment_settings AS
SELECT
  id,
  razorpay_enabled,
  razorpay_key_id,
  razorpay_mode,
  stripe_enabled,
  stripe_publishable_key,
  upi_enabled,
  upi_id,
  upi_display_name,
  bank_transfer_enabled,
  bank_details,
  custom_qr_image_url,
  updated_at
FROM payment_settings;

GRANT SELECT ON public_payment_settings TO anon, authenticated;
