#!/usr/bin/env bash
# =================================================================
# ELSxGlobal + VaultHost — Automated Backup System
# =================================================================
# Usage: ./scripts/backup.sh [--name NAME] [--keep N] [--s3 BUCKET]
# Called by: manage.sh backup, cron
# Exit codes: 0=success, 1=dump_failed, 2=checksum_failed, 3=s3_failed
# =================================================================
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_DIR/.env"
LOG_DIR="${LOG_DIR:-/var/log/elsxglobal}"
BACKUP_DIR="${BACKUP_DIR:-/opt/elsxglobal/backups}"
BACKUP_LOG="$LOG_DIR/backup.log"

# Load env
source "$ENV_FILE" 2>/dev/null || true

PG_PASS="${POSTGRES_PASSWORD:-postgres_standalone_pwd_2026}"
KEEP="${BACKUP_KEEP_COUNT:-30}"
NAME="${1:-nightly}"
TIMESTAMP=$(date -u '+%Y-%m-%d_%H-%M-%S')
FILENAME="${TIMESTAMP}_${NAME}.dump"
FILEPATH="$BACKUP_DIR/$FILENAME"

_log() { echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] $*" | tee -a "$BACKUP_LOG"; }

mkdir -p "$BACKUP_DIR" "$LOG_DIR"
_log "=== Backup started: $FILENAME ==="

# Dump
_log "Running pg_dump..."
if ! docker exec supabase-db bash -c "PGPASSWORD='$PG_PASS' pg_dump -U postgres -d postgres -Fc" > "$FILEPATH" 2>>"$BACKUP_LOG"; then
  _log "ERROR: pg_dump failed"
  rm -f "$FILEPATH"
  exit 1
fi

if [[ ! -s "$FILEPATH" ]]; then
  _log "ERROR: Backup file is empty"
  rm -f "$FILEPATH"
  exit 1
fi

# Verify checksum
CHECKSUM=$(sha256sum "$FILEPATH" | awk '{print $1}')
SIZE_BYTES=$(stat -c%s "$FILEPATH" 2>/dev/null || stat -f%z "$FILEPATH" 2>/dev/null || echo "0")
SIZE_HUMAN=$(du -sh "$FILEPATH" | awk '{print $1}')

# Write manifest
MANIFEST_FILE="${FILEPATH%.dump}.json"
PG_VERSION=$(docker exec supabase-db psql -U postgres -tAc 'SELECT version()' 2>/dev/null | head -1 || echo 'unknown')
MIGRATION_COUNT=$(docker exec supabase-db psql -U postgres -d postgres -tAc \
  "SELECT COUNT(*) FROM public.schema_migrations;" 2>/dev/null | tr -d ' ' || echo "0")

cat > "$MANIFEST_FILE" <<EOF
{
  "timestamp": "$(date -u '+%Y-%m-%dT%H:%M:%SZ')",
  "filename": "$FILENAME",
  "size_bytes": $SIZE_BYTES,
  "size_human": "$SIZE_HUMAN",
  "checksum_sha256": "$CHECKSUM",
  "migration_count": "$MIGRATION_COUNT",
  "postgres_version": "$(echo "$PG_VERSION" | head -c 80)",
  "name": "$NAME",
  "host": "$(hostname -f 2>/dev/null || hostname)"
}
EOF

_log "Backup complete: $FILENAME ($SIZE_HUMAN) SHA256: $CHECKSUM"

# S3 upload (optional)
S3_BUCKET="${BACKUP_S3_BUCKET:-}"
if [[ -n "$S3_BUCKET" ]]; then
  _log "Uploading to S3: $S3_BUCKET/$FILENAME..."
  if aws s3 cp "$FILEPATH" "$S3_BUCKET/$FILENAME" && aws s3 cp "$MANIFEST_FILE" "$S3_BUCKET/${FILENAME%.dump}.json"; then
    _log "S3 upload successful"
  else
    _log "ERROR: S3 upload failed"
    exit 3
  fi
fi

# Retention
COUNT=$(find "$BACKUP_DIR" -name '*.dump' | wc -l)
if [[ $COUNT -gt $KEEP ]]; then
  _log "Rotating old backups (keeping $KEEP, found $COUNT)..."
  find "$BACKUP_DIR" -name '*.dump' -printf '%T@ %p\n' | sort -n | \
    head -n $((COUNT - KEEP)) | awk '{print $2}' | while read -r old; do
      rm -f "$old" "${old%.dump}.json"
      _log "Deleted: $(basename "$old")"
    done
fi

_log "=== Backup complete ==="
exit 0
