#!/bin/sh
# ================================================================
# ELSxGlobal — Full Database Backup Script
# ================================================================
# Backs up:
#   1. Full pg_dump (schema + data + sequences + everything)
#   2. Keeps last N days locally
#   3. Optionally uploads to S3/R2
#
# Usage:
#   ./scripts/backup.sh                    # auto (uses env vars)
#   ./scripts/backup.sh mybackup           # custom name
#   docker compose exec backup /backup.sh  # from container
# ================================================================

set -e

TIMESTAMP=$(date +"%Y-%m-%dT%H-%M-%S")
BACKUP_NAME="${1:-backup_${TIMESTAMP}}"
BACKUP_DIR="/backups"
BACKUP_FILE="${BACKUP_DIR}/${BACKUP_NAME}.dump"
KEEP_DAYS="${BACKUP_KEEP_DAYS:-30}"

echo "============================================================"
echo " ELSxGlobal Database Backup"
echo " Started: $(date)"
echo " Output:  ${BACKUP_FILE}"
echo "============================================================"

# ── Determine connection ──────────────────────────────────────────
if [ -n "$DATABASE_URL" ] && [ "$DATABASE_URL" != "placeholder" ]; then
  PG_CONN="$DATABASE_URL"
  echo "[backup] Using DATABASE_URL for connection"
else
  PG_HOST="${POSTGRES_HOST:-db}"
  PG_PORT="${POSTGRES_PORT:-5432}"
  PG_DB="${POSTGRES_DB:-elsxglobal}"
  PG_USER="${POSTGRES_USER:-postgres}"
  PG_CONN="postgresql://${PG_USER}:${PGPASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DB}"
  echo "[backup] Using host: ${PG_HOST}:${PG_PORT}/${PG_DB}"
fi

mkdir -p "$BACKUP_DIR"

# ── Full backup (custom format = compressed + parallel restore) ───
echo "[backup] Running pg_dump..."
pg_dump \
  --format=custom \
  --compress=9 \
  --verbose \
  --no-password \
  "$PG_CONN" \
  --file="$BACKUP_FILE"

BACKUP_SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
echo "[backup] ✅ Backup complete: ${BACKUP_FILE} (${BACKUP_SIZE})"

# ── Also create a plain SQL backup (human-readable) ──────────────
SQL_FILE="${BACKUP_DIR}/${BACKUP_NAME}.sql.gz"
echo "[backup] Creating plain SQL backup (gzipped)..."
pg_dump \
  --format=plain \
  --no-password \
  "$PG_CONN" \
  | gzip -9 > "$SQL_FILE"

SQL_SIZE=$(du -sh "$SQL_FILE" | cut -f1)
echo "[backup] ✅ SQL backup: ${SQL_FILE} (${SQL_SIZE})"

# ── Write backup manifest ─────────────────────────────────────────
MANIFEST="${BACKUP_DIR}/latest.txt"
echo "${BACKUP_NAME}" > "$MANIFEST"
echo "[backup] Latest backup recorded in ${MANIFEST}"

# ── Upload to S3/R2 (optional) ───────────────────────────────────
if [ -n "$S3_BUCKET" ] && [ -n "$AWS_ACCESS_KEY_ID" ]; then
  echo "[backup] Uploading to S3/R2: s3://${S3_BUCKET}/db-backups/"

  S3_ARGS=""
  if [ -n "$S3_ENDPOINT" ]; then
    S3_ARGS="--endpoint-url ${S3_ENDPOINT}"
  fi

  aws s3 cp "$BACKUP_FILE" "s3://${S3_BUCKET}/db-backups/${BACKUP_NAME}.dump" $S3_ARGS
  aws s3 cp "$SQL_FILE"    "s3://${S3_BUCKET}/db-backups/${BACKUP_NAME}.sql.gz" $S3_ARGS
  echo "[backup] ✅ Uploaded to S3/R2"
else
  echo "[backup] S3 not configured — keeping local only"
fi

# ── Prune old backups ─────────────────────────────────────────────
echo "[backup] Removing backups older than ${KEEP_DAYS} days..."
find "$BACKUP_DIR" -name "backup_*.dump"   -mtime +${KEEP_DAYS} -delete
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +${KEEP_DAYS} -delete
REMAINING=$(ls "$BACKUP_DIR"/*.dump 2>/dev/null | wc -l)
echo "[backup] ${REMAINING} backup(s) retained"

# ── List all backups ──────────────────────────────────────────────
echo ""
echo "[backup] Current backups in ${BACKUP_DIR}:"
ls -lh "$BACKUP_DIR"/*.dump 2>/dev/null | awk '{print "  " $5 "  " $9}' || echo "  (none)"

echo ""
echo "[backup] ✅ Done. $(date)"
