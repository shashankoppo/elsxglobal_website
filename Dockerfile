# ================================================================
# ELSxGlobal / VaultHost — Production Dockerfile
# Base: node:20-slim (Debian Bookworm)
#   • Native @next/swc-linux-x64-gnu binary support for Next 13.5.1
#   • Fast builds with native glibc and no WASM fallback
#   • Includes devDependencies (Tailwind, PostCSS, Autoprefixer) for build
# ================================================================

# ── Stage 1: Build ───────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

# Build arguments with production/placeholder fallbacks for Next.js build-time prerendering
ARG NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder
ARG NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_placeholder
ARG NEXT_PUBLIC_SITE_URL=https://elsxglobal.com

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_RAZORPAY_KEY_ID=$NEXT_PUBLIC_RAZORPAY_KEY_ID
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Install all dependencies including devDependencies (needed for build: tailwind, postcss, autoprefixer)
COPY package*.json ./
RUN npm install --include=dev --prefer-offline --no-audit

# Copy application source (.dockerignore filters out unnecessary files)
COPY . .

# Build Next.js application in production mode
ENV NODE_ENV=production
RUN npm run build

# ── Stage 2: Serve ───────────────────────────────────────────────
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=80
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Copy compiled output and runtime assets
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public         ./public
COPY --from=builder /app/.next          ./.next
COPY --from=builder /app/node_modules   ./node_modules
COPY --from=builder /app/package.json   ./package.json

EXPOSE 80

CMD ["npm", "start"]
