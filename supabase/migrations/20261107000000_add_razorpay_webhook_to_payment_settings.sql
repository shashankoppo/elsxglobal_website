-- Add Razorpay webhook secret to payment_settings table
ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS razorpay_webhook_secret TEXT;

-- Add razorpay_order_id to hosting_orders so we can match webhooks to orders
ALTER TABLE hosting_orders ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;

COMMENT ON COLUMN payment_settings.razorpay_webhook_secret IS 'Razorpay webhook signing secret from Razorpay dashboard';
COMMENT ON COLUMN hosting_orders.razorpay_order_id IS 'Razorpay order ID (rzp_order_xxx) for webhook matching';
