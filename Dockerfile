# ================================================================
# ELSxGlobal / VaultHost — Production Dockerfile
# Base: node:22-slim (Debian 12 Bookworm Slim)
#   • Works on Ubuntu LTS, Debian, and Alpine Docker hosts
#   • Uses glibc (Debian) so ALL native npm modules compile cleanly
#   • No apk / Alpine-specific hacks needed
#   • Runner image is <250 MB (slim, not full Debian)
# ================================================================

# ── Stage 1: Build ───────────────────────────────────────────────
FROM node:22-slim AS builder

# Install build toolchain required by some native npm dependencies
# (node-gyp, bcrypt, canvas, sharp, etc.)
RUN apt-get update -qq \
 && apt-get install -y --no-install-recommends \
      python3 make g++ ca-certificates \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Build arguments ──────────────────────────────────────────────
# Coolify → Service → Environment Variables → Build Variables panel.
# Fallback placeholders let Next.js pre-render without real Supabase.
# Replace with real values in Coolify before going live.
ARG NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder
ARG NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_placeholder
ARG NEXT_PUBLIC_SITE_URL=https://elsxglobal.com

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_RAZORPAY_KEY_ID=$NEXT_PUBLIC_RAZORPAY_KEY_ID
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# 4 GB heap — Next.js compiles 230+ pages; default 2 GB causes OOM on large projects
ENV NODE_OPTIONS=--max-old-space-size=4096

# ── Install dependencies ─────────────────────────────────────────
# package-lock.json is committed — npm install is deterministic.
# --prefer-offline uses npm cache if available (faster Coolify builds).
COPY package*.json ./
RUN npm install --prefer-offline --no-audit

# ── Copy source ───────────────────────────────────────────────────
# .dockerignore excludes: node_modules, .next, supabase-docker,
# supabase-production, deploy, docs, scratch, .env*, .git
COPY . .

# ── Build ─────────────────────────────────────────────────────────
# ESLint + TypeScript checks are enforced in GitHub Actions CI.
# Docker builds skip them (ignoreDuringBuilds / ignoreBuildErrors in next.config.js).
RUN npm run build

# ── Stage 2: Production runtime ──────────────────────────────────
# Same Debian Slim base → consistent glibc, no Alpine compat shims needed
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=80
ENV NEXT_TELEMETRY_DISABLED=1

# Only the files Next.js needs to serve — no source code, no devDeps
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public         ./public
COPY --from=builder /app/.next          ./.next
COPY --from=builder /app/node_modules   ./node_modules
COPY --from=builder /app/package.json   ./package.json

EXPOSE 80

CMD ["npm", "start"]
