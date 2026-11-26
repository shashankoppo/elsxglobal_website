# Security Rules

## Authentication & Authorization
- Authorization at BOTH handler and data layer, never middleware-only
- Verify JWT claims: `iss`, `aud`, `exp`
- Roles from `app_metadata` or DB only, never from user-editable fields
- Constant-time secret comparison for all token/signature checks
- No service-role key in any client bundle
- RLS on every Supabase table

## API Security
- Every `/api/*` handler must authorize independently
- Zod validation on all inputs
- Rate limiting on public endpoints
- HMAC signature verification for webhooks (raw body, timing-safe compare)
- Idempotency keys for payment/mutation endpoints

## Headers & Transport
- CSP with nonces (not unsafe-inline where possible)
- HSTS with preload
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Secure, HttpOnly, SameSite cookies

## Secrets
- No secrets in git, logs, or prompts
- Rotate anything exposed immediately
- Use environment variables, never hardcode
- `.env.example` documents all required vars without values

## Compliance
- Never claim "ISO 27001 Certified" without certificate ID — use "ISO 27001-aligned"
- "PCI-DSS compliant payment processing via Razorpay" (not direct certification)
- DPDP Rules 2025 duties from 13 May 2027
- Independent pen test before any security marketing claims
