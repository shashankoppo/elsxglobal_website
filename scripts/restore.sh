#!/bin/sh
# ================================================================
# ELSxGlobal — One-Command Database Restore Script
# ================================================================
# Restores from any .dump or .sql.gz backup file
#
# Usage:
#   ./scripts/restore.sh                                    # restore latest
#   ./scripts/restore.sh backup_2026-11-19T02-00-00.dump   # specific backup
#   ./scripts/restore.sh /backups/backup_2026-11-19.dump   # full path
#   docker compose exec backup /restore.sh                  # from container
#
# ⚠️  WARNING: This DROPS and recreates the database.
#     All current data will be replaced.
#     Always backup first!
# ================================================================

set -e

BACKUP_DIR="/backups"
RESTORE_FILE="$1"

echo "============================================================"
echo " ELSxGlobal Database Restore"
echo " Started: $(date)"
echo "============================================================"

# ── Safety confirmation ───────────────────────────────────────────
echo ""
echo "  ⚠️  WARNING: This will REPLACE ALL current data!"
echo ""

# ── Determine connection ──────────────────────────────────────────
if [ -n "$DATABASE_URL" ] && [ "$DATABASE_URL" != "placeholder" ]; then
  PG_CONN="$DATABASE_URL"
  echo "[restore] Using DATABASE_URL for connection"
else
  PG_HOST="${POSTGRES_HOST:-db}"
  PG_PORT="${POSTGRES_PORT:-5432}"
  PG_DB="${POSTGRES_DB:-elsxglobal}"
  PG_USER="${POSTGRES_USER:-postgres}"
  PG_CONN="postgresql://${PG_USER}:${PGPASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DB}"
  echo "[restore] Using host: ${PG_HOST}:${PG_PORT}/${PG_DB}"
fi

# ── Find backup file ──────────────────────────────────────────────
if [ -z "$RESTORE_FILE" ]; then
  # Restore from latest
  if [ -f "${BACKUP_DIR}/latest.txt" ]; then
    LATEST_NAME=$(cat "${BACKUP_DIR}/latest.txt")
    RESTORE_FILE="${BACKUP_DIR}/${LATEST_NAME}.dump"
    echo "[restore] Auto-selected latest: ${RESTORE_FILE}"
  else
    # Find the most recent .dump
    RESTORE_FILE=$(ls -t "${BACKUP_DIR}"/*.dump 2>/dev/null | head -1)
    if [ -z "$RESTORE_FILE" ]; then
      echo "[restore] ❌ No backup files found in ${BACKUP_DIR}"
      echo "[restore]    Run ./backup.sh first to create a backup."
      exit 1
    fi
    echo "[restore] Auto-selected most recent: ${RESTORE_FILE}"
  fi
elif [ ! -f "$RESTORE_FILE" ]; then
  # Try prepending BACKUP_DIR
  if [ -f "${BACKUP_DIR}/${RESTORE_FILE}" ]; then
    RESTORE_FILE="${BACKUP_DIR}/${RESTORE_FILE}"
  else
    echo "[restore] ❌ File not found: ${RESTORE_FILE}"
    echo "[restore]    Available backups:"
    ls "${BACKUP_DIR}"/*.dump 2>/dev/null | while read -r f; do echo "      $(basename "$f")"; done
    exit 1
  fi
fi

echo "[restore] Restoring from: ${RESTORE_FILE}"
FILE_SIZE=$(du -sh "$RESTORE_FILE" | cut -f1)
echo "[restore] File size: ${FILE_SIZE}"

# ── Determine format ──────────────────────────────────────────────
case "$RESTORE_FILE" in
  *.dump)
    FORMAT="custom"
    ;;
  *.sql.gz)
    FORMAT="sql_gz"
    ;;
  *.sql)
    FORMAT="sql"
    ;;
  *)
    echo "[restore] ❌ Unknown file format. Expected .dump, .sql.gz, or .sql"
    exit 1
    ;;
esac

# ── Perform restore ───────────────────────────────────────────────
echo ""
echo "[restore] Starting restore (format: ${FORMAT})..."

case "$FORMAT" in
  custom)
    # Custom pg_dump format — fastest, supports parallel restore
    pg_restore \
      --clean \
      --if-exists \
      --no-owner \
      --no-privileges \
      --verbose \
      --dbname="$PG_CONN" \
      "$RESTORE_FILE" && echo "[restore] ✅ pg_restore complete"
    ;;

  sql_gz)
    # Gzipped SQL — decompress and pipe to psql
    echo "[restore] Decompressing and piping to psql..."
    gunzip -c "$RESTORE_FILE" | psql "$PG_CONN" && echo "[restore] ✅ SQL restore complete"
    ;;

  sql)
    # Plain SQL
    psql "$PG_CONN" < "$RESTORE_FILE" && echo "[restore] ✅ SQL restore complete"
    ;;
esac

# ── Notify PostgREST to reload schema ────────────────────────────
echo "[restore] Notifying PostgREST to reload schema..."
psql "$PG_CONN" -c "NOTIFY pgrst, 'reload schema';" 2>/dev/null || true

# ── Re-run migrations to ensure latest schema ────────────────────
echo ""
echo "[restore] Running migrations to ensure latest schema..."
if [ -f "/app/scripts/migrate.mjs" ]; then
  node /app/scripts/migrate.mjs && echo "[restore] ✅ Migrations applied"
else
  echo "[restore] ℹ️  migrate.mjs not found — skipping migration step"
fi

echo ""
echo "[restore] ✅ Restore complete! $(date)"
echo "[restore]    Your database has been restored from: $(basename "$RESTORE_FILE")"
