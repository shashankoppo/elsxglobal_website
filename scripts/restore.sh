#!/usr/bin/env bash
# =================================================================
# ELSxGlobal + VaultHost — Disaster Recovery / Restore
# =================================================================
# Usage: ./scripts/restore.sh [backup-file]
# If no file given, shows interactive picker of available backups
# =================================================================
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_DIR/.env"
BACKUP_DIR="${BACKUP_DIR:-/opt/elsxglobal/backups}"
LOG_DIR="${LOG_DIR:-/var/log/elsxglobal}"

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

log()  { echo -e "$@"; }
info() { echo -e "${CYAN}  ➜${NC}  $*"; }
ok()   { echo -e "${GREEN}  ✓${NC}  $*"; }
warn() { echo -e "${YELLOW}  ⚠${NC}  $*"; }
fail() { echo -e "${RED}  ✗${NC}  $*" >&2; exit 1; }

source "$ENV_FILE" 2>/dev/null || true
PG_PASS="${POSTGRES_PASSWORD:-postgres_standalone_pwd_2026}"

BACKUP_FILE="${1:-}"

# Interactive backup picker
if [[ -z "$BACKUP_FILE" ]]; then
  echo ""
  log "${BOLD}${CYAN}=== Available Backups ===${NC}"
  if [[ ! -d "$BACKUP_DIR" ]]; then
    fail "No backups directory found at $BACKUP_DIR. Run ./scripts/manage.sh backup first."
  fi

  local_backups=()
  while IFS= read -r line; do
    local_backups+=("$line")
  done < <(find "$BACKUP_DIR" -name '*.dump' -printf '%T@ %p\n' | sort -rn | awk '{print $2}')

  if [[ ${#local_backups[@]} -eq 0 ]]; then
    fail "No backup files found in $BACKUP_DIR"
  fi

  for i in "${!local_backups[@]}"; do
    local f="${local_backups[$i]}"
    local sz
    sz=$(du -sh "$f" | awk '{print $1}')
    local ts
    ts=$(stat -c '%y' "$f" 2>/dev/null | cut -c1-19 || echo "")
    log "  $(( i + 1 )). $(basename "$f") ($sz) — $ts"
  done

  echo ""
  echo -n "Enter number (or full path): "
  read -r selection

  if [[ "$selection" =~ ^[0-9]+$ ]] && [[ $selection -ge 1 ]] && [[ $selection -le ${#local_backups[@]} ]]; then
    BACKUP_FILE="${local_backups[$((selection - 1))]}"
  else
    BACKUP_FILE="$selection"
  fi
fi

[[ -f "$BACKUP_FILE" ]] || fail "Backup file not found: $BACKUP_FILE"

# Show manifest
MANIFEST="${BACKUP_FILE%.dump}.json"
echo ""
log "${BOLD}${CYAN}=== Backup Details ===${NC}"
if [[ -f "$MANIFEST" ]]; then
  cat "$MANIFEST"
  echo ""
else
  local sz
  sz=$(du -sh "$BACKUP_FILE" | awk '{print $1}')
  log "  File: $(basename "$BACKUP_FILE")"
  log "  Size: $sz"
fi

# Double confirmation
echo ""
warn "⚠  WARNING: THIS IS A DESTRUCTIVE OPERATION  ⚠"
warn "All current data in the database will be replaced."
warn "File: $(basename "$BACKUP_FILE")"
echo ""
echo -n "Type 'RESTORE' (all caps) to confirm: "
read -r confirm1
[[ "$confirm1" == "RESTORE" ]] || { log "${YELLOW}Restore cancelled.${NC}"; exit 0; }

echo -n "Type the backup filename to confirm ($(basename "$BACKUP_FILE")): "
read -r confirm2
[[ "$confirm2" == "$(basename "$BACKUP_FILE")" ]] || { log "${YELLOW}Restore cancelled.${NC}"; exit 0; }

echo ""
info "Creating safety backup before restore..."
"$SCRIPT_DIR/backup.sh" "pre-restore-$(date +%Y%m%d%H%M%S)" 2>/dev/null \
  && ok "Safety backup created" \
  || warn "Safety backup failed (continuing)"

echo ""
log "${BOLD}${CYAN}=== Starting Restore ===${NC}"

info "Stopping app services (keeping database running)..."
cd "$PROJECT_DIR"
docker compose -f "$PROJECT_DIR/docker-compose.yml" stop app auth rest storage meta studio api-gw 2>/dev/null || true

info "Restoring database from: $(basename "$BACKUP_FILE")"
if cat "$BACKUP_FILE" | docker exec -i supabase-db bash -c \
  "PGPASSWORD='$PG_PASS' pg_restore -U postgres -d postgres --clean --if-exists -v" 2>&1 | \
  grep -v "^pg_restore:" | tail -20; then
  ok "Database restored successfully"
else
  warn "Some pg_restore warnings (may be normal for --clean)"
fi

info "Restarting all services..."
docker compose -f "$PROJECT_DIR/docker-compose.yml" up -d

info "Waiting for app to be healthy..."
MAX=120; E=0
while [[ $E -lt $MAX ]]; do
  RUNNING=$(docker inspect --format='{{.State.Running}}' elsxglobal-app 2>/dev/null || echo false)
  [[ "$RUNNING" == "true" ]] && break
  echo -ne "  Waiting... ${E}s\r"; sleep 3; E=$((E+3))
done

echo ""
ok "✓ Restore complete!"
log "  Run ${CYAN}./scripts/manage.sh health${NC} to verify system state."
log "  Run ${CYAN}./scripts/manage.sh status${NC} to see all containers."
