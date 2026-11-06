# Multi-stage Dockerfile for ELSxGlobal / VaultHost
# Stage 1: Build (Node 20 Alpine)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Serve (Node 20 Alpine)
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production
ENV PORT 80

# Copy necessary files from builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 80

CMD ["npm", "start"]
