#!/bin/sh
set -e

echo "================================================================="
echo " Starting ELSxGlobal / VaultHost Production Container"
echo " Time: $(date -u)"
echo " Environment: ${NODE_ENV:-production} | Port: ${PORT:-80}"
echo "================================================================="

# 1. Run automatic Supabase database migrations
echo "==> Step 1: Checking and applying Supabase database migrations..."
if [ -f "/app/scripts/migrate.mjs" ]; then
  node /app/scripts/migrate.mjs || {
    echo "==> [WARN] Migration runner returned non-zero. Check Supabase credentials or logs above."
  }
else
  echo "==> [INFO] /app/scripts/migrate.mjs not found, skipping migrations."
fi

# 2. Start Next.js production server
echo "==> Step 2: Launching Next.js application server on port ${PORT:-80}..."
if [ "$#" -gt 0 ]; then
  exec "$@"
elif [ -f "./node_modules/.bin/next" ]; then
  exec ./node_modules/.bin/next start -p ${PORT:-80} -H 0.0.0.0
else
  exec npx next start -p ${PORT:-80} -H 0.0.0.0
fi
