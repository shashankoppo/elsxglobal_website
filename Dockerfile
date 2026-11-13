# Multi-stage Dockerfile for ELSxGlobal / VaultHost (Node 22 Alpine, Coolify & Docker Compose ready)
# Stage 1: Build
FROM node:22-alpine AS builder

# libc6-compat is required on Alpine for Next.js SWC & native binaries
RUN apk add --no-cache libc6-compat

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
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --prefer-offline --no-audit

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Serve
FROM node:22-alpine AS runner

RUN apk add --no-cache libc6-compat

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=80
ENV NEXT_TELEMETRY_DISABLED=1

# Copy necessary files from builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 80

CMD ["npm", "start"]
