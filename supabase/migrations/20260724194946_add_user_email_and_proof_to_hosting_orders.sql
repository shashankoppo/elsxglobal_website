/*
# Add user_email and payment_proof_url to hosting_orders

1. Modified Tables
- `hosting_orders`
  - Add `user_email` (text, nullable) — denormalized email for admin display without joining auth.users
  - Add `payment_proof_url` (text, nullable) — URL to uploaded payment proof image (UPI/bank transfer)

2. Notes
- Both columns are nullable so existing rows are unaffected.
- The checkout flow already writes to these columns; this migration makes the schema match the code.
*/

ALTER TABLE hosting_orders
  ADD COLUMN IF NOT EXISTS user_email text,
  ADD COLUMN IF NOT EXISTS payment_proof_url text;
