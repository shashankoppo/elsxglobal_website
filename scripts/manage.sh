#!/usr/bin/env bash
# =================================================================
# ELSxGlobal + VaultHost — Master Management CLI
# =================================================================
# Usage: ./scripts/manage.sh <command> [options]
# Run './scripts/manage.sh help' for all available commands
# =================================================================
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_NAME="elsxglobal"
COMPOSE="docker compose"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"
ENV_FILE="$PROJECT_DIR/.env"
LOG_DIR="${LOG_DIR:-/var/log/elsxglobal}"
BACKUP_DIR="${BACKUP_DIR:-/opt/elsxglobal/backups}"
AUDIT_LOG="$LOG_DIR/audit.log"

# ── Colors ────────────────────────────────────────────────────────
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

# ── Helpers ───────────────────────────────────────────────────────
log()   { echo -e "$@"; }
info()  { echo -e "${BLUE}  ➜${NC}  $*"; }
ok()    { echo -e "${GREEN}  ✓${NC}  $*"; }
warn()  { echo -e "${YELLOW}  ⚠${NC}  $*"; }
fail()  { echo -e "${RED}  ✗${NC}  $*" >&2; exit 1; }
header(){ echo -e "\n${BOLD}${CYAN}=== $* ===${NC}\n"; }

# Audit log every command
_audit() {
  mkdir -p "$LOG_DIR" 2>/dev/null || true
  echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] USER=${USER:-unknown} CMD=${1:-unknown} ARGS=${*:2}" \
    >> "$AUDIT_LOG" 2>/dev/null || true
}

# Run docker compose from project dir
_compose() {
  cd "$PROJECT_DIR"
  $COMPOSE -f "$COMPOSE_FILE" "$@"
}

# Wait for a container to be healthy
_wait_healthy() {
  local container="$1"
  local max_wait="${2:-120}"
  local elapsed=0
  while [[ $elapsed -lt $max_wait ]]; do
    local status
    status=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "not_found")
    local running
    running=$(docker inspect --format='{{.State.Running}}' "$container" 2>/dev/null || echo "false")
    if [[ "$status" == "healthy" ]] || [[ "$status" == "" && "$running" == "true" ]]; then
      return 0
    fi
    echo -ne "  Waiting for $container... ${elapsed}s (${status})\r"
    sleep 3
    elapsed=$((elapsed + 3))
  done
  warn "Timeout waiting for $container to be healthy"
  return 1
}

# ── Commands ──────────────────────────────────────────────────────

cmd_status() {
  _audit status
  header "Service Status"
  _compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
  echo ""
  info "Resource usage:"
  docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" \
    $(docker ps --filter "label=com.docker.compose.project=$PROJECT_NAME" -q 2>/dev/null) 2>/dev/null || \
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>/dev/null | head -20
}

cmd_logs() {
  local service="${1:-}"
  local tail="${2:-100}"
  _audit logs "$service"
  if [[ -n "$service" ]]; then
    _compose logs -f --tail="$tail" "$service"
  else
    _compose logs -f --tail="$tail"
  fi
}

cmd_backup() {
  local name="${1:-manual}"
  _audit backup "$name"
  header "Database Backup"

  mkdir -p "$BACKUP_DIR"
  local timestamp
  timestamp=$(date -u '+%Y-%m-%d_%H-%M-%S')
  local filename="${timestamp}_${name}.dump"
  local filepath="$BACKUP_DIR/$filename"
  local manifest_file="${filepath%.dump}.json"

  info "Creating backup: $filename"

  # Get DB connection info from env or defaults
  source "$ENV_FILE" 2>/dev/null || true
  local pg_pass="${POSTGRES_PASSWORD:-postgres_standalone_pwd_2026}"

  # Run pg_dump inside the db container
  docker exec supabase-db bash -c "PGPASSWORD='$pg_pass' pg_dump -U postgres -d postgres -Fc" > "$filepath" 2>/dev/null
  if [[ $? -ne 0 ]] || [[ ! -s "$filepath" ]]; then
    rm -f "$filepath"
    fail "Backup failed — is the database running? Check: ./manage.sh logs db"
  fi

  # Compute checksum
  local checksum
  checksum=$(sha256sum "$filepath" | awk '{print $1}')
  local size
  size=$(du -sh "$filepath" | awk '{print $1}')
  local size_bytes
  size_bytes=$(stat -c%s "$filepath" 2>/dev/null || stat -f%z "$filepath" 2>/dev/null || echo "0")

  # Get migration count from DB
  local migration_count
  migration_count=$(docker exec supabase-db psql -U postgres -d postgres -tAc \
    "SELECT COUNT(*) FROM public.schema_migrations;" 2>/dev/null || echo "unknown")

  # Write manifest
  cat > "$manifest_file" <<EOF
{
  "timestamp": "$(date -u '+%Y-%m-%dT%H:%M:%SZ')",
  "filename": "$filename",
  "size_bytes": $size_bytes,
  "size_human": "$size",
  "checksum_sha256": "$checksum",
  "migration_count": "$migration_count",
  "postgres_version": "$(docker exec supabase-db psql -U postgres -tAc 'SELECT version()' 2>/dev/null | head -1 || echo 'unknown')",
  "name": "$name"
}
EOF

  ok "Backup complete: $filename ($size)"
  ok "Checksum (SHA-256): $checksum"

  # Retention: keep last 30 (configurable)
  local keep="${BACKUP_KEEP_COUNT:-30}"
  local count
  count=$(find "$BACKUP_DIR" -name '*.dump' | wc -l)
  if [[ $count -gt $keep ]]; then
    info "Rotating old backups (keeping last $keep)..."
    find "$BACKUP_DIR" -name '*.dump' -printf '%T@ %p\n' | sort -n | head -n $((count - keep)) | \
      awk '{print $2}' | xargs -I{} sh -c 'rm -f "{}" "${1%.dump}.json"' _ {}
    ok "Cleaned up old backups"
  fi

  # Optional S3 upload
  if [[ -n "${BACKUP_S3_BUCKET:-}" ]]; then
    info "Uploading to S3: $BACKUP_S3_BUCKET..."
    aws s3 cp "$filepath" "$BACKUP_S3_BUCKET/$filename" && ok "Uploaded to S3" || warn "S3 upload failed"
  fi

  echo ""
  log "  ${CYAN}Backup stored at:${NC} $filepath"
}

cmd_restore() {
  local backup_file="${1:-}"
  _audit restore "$backup_file"

  if [[ -z "$backup_file" ]]; then
    header "Available Backups"
    if [[ -d "$BACKUP_DIR" ]]; then
      find "$BACKUP_DIR" -name '*.dump' -printf '%T@ %p\n' | sort -rn | awk '{print $2}' | \
        xargs -I{} basename {} | head -20
      echo ""
      echo -n "Enter backup filename (or full path): "
      read -r backup_file
      backup_file="$BACKUP_DIR/$backup_file"
    else
      fail "No backups directory found at $BACKUP_DIR"
    fi
  fi

  [[ -f "$backup_file" ]] || fail "Backup file not found: $backup_file"

  # Show manifest if exists
  local manifest="${backup_file%.dump}.json"
  if [[ -f "$manifest" ]]; then
    header "Backup Info"
    cat "$manifest"
    echo ""
  fi

  warn "⚠ THIS WILL OVERWRITE THE CURRENT DATABASE ⚠"
  warn "All current data will be replaced with the backup."
  echo -n "Type 'RESTORE' to confirm: "
  read -r confirm
  [[ "$confirm" == "RESTORE" ]] || fail "Restore cancelled."

  header "Restoring Database"

  # Safety backup before restore
  info "Creating pre-restore safety backup..."
  cmd_backup "pre-restore-$(date +%Y%m%d%H%M%S)" 2>/dev/null || warn "Could not create safety backup (continuing anyway)"

  info "Stopping app and dependent services..."
  _compose stop app auth rest storage meta studio api-gw 2>/dev/null || true

  info "Restoring from: $(basename "$backup_file")"
  source "$ENV_FILE" 2>/dev/null || true
  local pg_pass="${POSTGRES_PASSWORD:-postgres_standalone_pwd_2026}"

  cat "$backup_file" | docker exec -i supabase-db bash -c \
    "PGPASSWORD='$pg_pass' pg_restore -U postgres -d postgres --clean --if-exists -v" 2>&1 | tail -20

  ok "Database restored"

  info "Restarting services..."
  _compose up -d
  sleep 5

  _wait_healthy elsxglobal-app 60
  ok "Restore complete — all services restarted"
}

cmd_migrate() {
  _audit migrate
  header "Database Migrations"
  _compose exec app node scripts/migrate.mjs
}

cmd_shell() {
  local service="${1:-app}"
  _audit shell "$service"
  case "$service" in
    db)   docker exec -it supabase-db psql -U postgres -d postgres ;;
    app)  docker exec -it elsxglobal-app /bin/bash ;;
    auth) docker exec -it supabase-auth /bin/sh ;;
    *)    _compose exec "$service" /bin/sh ;;
  esac
}

cmd_psql() {
  local sql="${1:-}"
  _audit psql "$sql"
  if [[ -n "$sql" ]]; then
    docker exec supabase-db psql -U postgres -d postgres -c "$sql"
  else
    docker exec -it supabase-db psql -U postgres -d postgres
  fi
}

cmd_deploy() {
  _audit deploy
  header "Deploying Latest Version"

  info "Pulling latest code from git..."
  cd "$PROJECT_DIR"
  git pull origin main

  info "Building and starting services..."
  _compose pull --ignore-buildable
  _compose up -d --build

  info "Waiting for healthy status..."
  _wait_healthy supabase-db 120
  _wait_healthy elsxglobal-app 120

  echo ""
  ok "Deployment complete"
  cmd_status
}

cmd_restart() {
  local service="${1:-}"
  _audit restart "$service"
  if [[ -n "$service" ]]; then
    info "Restarting $service..."
    _compose restart "$service"
    _wait_healthy "$service" 60 2>/dev/null || true
    ok "$service restarted"
  else
    info "Restarting all services..."
    _compose restart
    ok "All services restarted"
  fi
}

cmd_stop()  { _audit stop;  _compose down; ok "All services stopped"; }
cmd_start() { _audit start; _compose up -d; ok "All services started"; }

cmd_health() {
  _audit health
  local quiet="${1:-}"
  header "System Health Check"

  local exit_code=0

  # Containers
  for svc in supabase-db supabase-auth supabase-rest supabase-storage \
              supabase-meta supabase-studio supabase-gateway elsxglobal-app; do
    local running
    running=$(docker inspect --format='{{.State.Running}}' "$svc" 2>/dev/null || echo "false")
    local hstatus
    hstatus=$(docker inspect --format='{{.State.Health.Status}}' "$svc" 2>/dev/null || echo "")
    if [[ "$running" == "true" ]]; then
      if [[ "$hstatus" == "unhealthy" ]]; then
        log "${RED}  ✗${NC} $svc: unhealthy"; exit_code=2
      else
        log "${GREEN}  ✓${NC} $svc: running${hstatus:+ ($hstatus)}"
      fi
    else
      log "${RED}  ✗${NC} $svc: NOT RUNNING"; exit_code=2
    fi
  done

  echo ""

  # App health API
  local app_health
  app_health=$(curl -sf --max-time 10 http://localhost/api/health 2>/dev/null | \
    python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status','unknown'))" 2>/dev/null || echo "UNREACHABLE")
  if [[ "$app_health" == "UNREACHABLE" ]]; then
    log "${RED}  ✗${NC} App /api/health: UNREACHABLE"; [[ $exit_code -lt 2 ]] && exit_code=1
  else
    log "${GREEN}  ✓${NC} App /api/health: $app_health"
  fi

  # DB query
  local table_count
  table_count=$(docker exec supabase-db psql -U postgres -d postgres -tAc \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null || echo "ERROR")
  log "${GREEN}  ✓${NC} DB tables in public schema: $table_count"

  echo ""

  # Disk
  local disk_usage
  disk_usage=$(df / | tail -1 | awk '{print $5}' | tr -d '%')
  if [[ $disk_usage -ge 90 ]]; then
    log "${RED}  ✗${NC} Disk: ${disk_usage}% used — CRITICAL"; [[ $exit_code -lt 2 ]] && exit_code=2
  elif [[ $disk_usage -ge 75 ]]; then
    log "${YELLOW}  ⚠${NC} Disk: ${disk_usage}% used — WARNING"; [[ $exit_code -lt 1 ]] && exit_code=1
  else
    log "${GREEN}  ✓${NC} Disk: ${disk_usage}% used"
  fi

  # Memory
  local mem_pct
  mem_pct=$(free | awk '/^Mem:/{printf "%.0f", ($3/$2)*100}')
  if [[ ${mem_pct:-0} -ge 95 ]]; then
    log "${RED}  ✗${NC} Memory: ${mem_pct}% used — CRITICAL"; [[ $exit_code -lt 2 ]] && exit_code=2
  elif [[ ${mem_pct:-0} -ge 80 ]]; then
    log "${YELLOW}  ⚠${NC} Memory: ${mem_pct}% used — WARNING"; [[ $exit_code -lt 1 ]] && exit_code=1
  else
    log "${GREEN}  ✓${NC} Memory: ${mem_pct:-?}% used"
  fi

  echo ""
  case $exit_code in
    0) log "${GREEN}${BOLD}✓ All systems healthy${NC}" ;;
    1) log "${YELLOW}${BOLD}⚠ System degraded — check warnings above${NC}" ;;
    2) log "${RED}${BOLD}✗ CRITICAL — immediate action required${NC}" ;;
  esac

  return $exit_code
}

cmd_rotate_secrets() {
  _audit rotate-secrets
  header "Secret Rotation"

  warn "This will generate new POSTGRES_PASSWORD and JWT_SECRET."
  warn "You must ALSO update these in Coolify environment variables after rotation."
  echo -n "Continue? [y/N]: "
  read -r confirm
  [[ "$confirm" =~ ^[Yy]$ ]] || { info "Cancelled"; exit 0; }

  source "$ENV_FILE" 2>/dev/null || true
  local old_pg_pass="${POSTGRES_PASSWORD:-postgres_standalone_pwd_2026}"

  local new_pg_pass
  new_pg_pass=$(openssl rand -hex 24)
  local new_jwt_secret
  new_jwt_secret=$(openssl rand -hex 32)

  info "Rotating PostgreSQL password..."
  docker exec supabase-db psql -U postgres -c \
    "ALTER USER postgres PASSWORD '$new_pg_pass';" && ok "PostgreSQL password rotated"

  info "Updating .env file..."
  sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$new_pg_pass|" "$ENV_FILE"
  sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$new_jwt_secret|" "$ENV_FILE"
  ok ".env updated"

  info "Restarting auth and rest services to pick up new JWT secret..."
  _compose restart auth rest
  ok "Services restarted"

  echo ""
  warn "ACTION REQUIRED: Update these in Coolify → Environment Variables:"
  log "  ${BOLD}POSTGRES_PASSWORD${NC} = $new_pg_pass"
  log "  ${BOLD}JWT_SECRET${NC}        = $new_jwt_secret"
  echo ""
  warn "You will also need to regenerate ANON_KEY and SERVICE_ROLE_KEY JWTs"
  warn "using the new JWT_SECRET. Use: https://supabase.com/docs/guides/self-hosting"
}

cmd_cleanup() {
  _audit cleanup
  header "Docker Cleanup"
  info "Removing dangling images and unused build cache..."
  local before
  before=$(docker system df --format '{{.TotalSpace}}' 2>/dev/null || echo "?")
  docker system prune -f
  local after
  after=$(docker system df --format '{{.TotalSpace}}' 2>/dev/null || echo "?")
  ok "Cleanup complete (before: $before, after: $after)"
}

cmd_version() {
  _audit version
  header "Version Info"
  local app_version
  app_version=$(cat "$PROJECT_DIR/package.json" | python3 -c "import sys,json; print(json.load(sys.stdin)['version'])" 2>/dev/null || echo "unknown")
  log "  App version:     $app_version"
  log "  Node.js:         $(docker exec elsxglobal-app node --version 2>/dev/null || echo 'N/A')"
  log "  PostgreSQL:      $(docker exec supabase-db psql -U postgres -tAc 'SELECT version()' 2>/dev/null | head -c 60 || echo 'N/A')"
  log "  Docker:          $(docker version --format '{{.Server.Version}}' 2>/dev/null || echo 'N/A')"
  log "  Docker Compose:  $(docker compose version --short 2>/dev/null || echo 'N/A')"
}

cmd_studio_url() {
  source "$ENV_FILE" 2>/dev/null || true
  local server_ip
  server_ip=$(curl -4 -sf --max-time 5 ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')
  local studio_port="${STUDIO_PORT:-54323}"
  echo ""
  log "${CYAN}Supabase Studio:${NC}  http://${server_ip}:${studio_port}"
  log "${CYAN}API Gateway:${NC}      http://${server_ip}:8000"
  log "${CYAN}Website:${NC}          ${NEXT_PUBLIC_SITE_URL:-https://www.elsxglobal.com}"
}

cmd_top() {
  docker stats $(docker ps --filter "label=com.docker.compose.project=$PROJECT_NAME" -q 2>/dev/null) 2>/dev/null || \
  docker stats
}

cmd_help() {
  echo ""
  log "${BOLD}${BLUE}ELSxGlobal + VaultHost Management CLI${NC}"
  log "${CYAN}Usage:${NC} ./scripts/manage.sh <command> [args]"
  echo ""
  log "${BOLD}OPERATIONS${NC}"
  log "  ${GREEN}status${NC}                   Show all container status and resource usage"
  log "  ${GREEN}logs${NC} [service] [tail N]  Stream logs (services: app db auth rest storage meta studio api-gw)"
  log "  ${GREEN}top${NC}                      Live resource monitor (docker stats)"
  log "  ${GREEN}health${NC}                   Full health check with disk, memory, DB, app"
  log "  ${GREEN}version${NC}                  Show version info for all components"
  echo ""
  log "${BOLD}LIFECYCLE${NC}"
  log "  ${GREEN}start${NC}                    Start all services"
  log "  ${GREEN}stop${NC}                     Stop all services"
  log "  ${GREEN}restart${NC} [service]        Restart one or all services"
  log "  ${GREEN}deploy${NC}                   Pull latest git + build + restart + health check"
  echo ""
  log "${BOLD}DATABASE${NC}"
  log "  ${GREEN}backup${NC} [--name NAME]     Create compressed DB backup with manifest"
  log "  ${GREEN}restore${NC} [backup-file]    Restore from backup (interactive picker if no file given)"
  log "  ${GREEN}migrate${NC}                  Run pending database migrations"
  log "  ${GREEN}psql${NC} [sql]               Open psql console (or run SQL non-interactively)"
  echo ""
  log "${BOLD}SHELL ACCESS${NC}"
  log "  ${GREEN}shell${NC} [service]          Open shell (default: app). 'db' opens psql"
  echo ""
  log "${BOLD}MAINTENANCE${NC}"
  log "  ${GREEN}studio-url${NC}               Print Supabase Studio and API URLs"
  log "  ${GREEN}rotate-secrets${NC}           Generate new POSTGRES_PASSWORD and JWT_SECRET"
  log "  ${GREEN}cleanup${NC}                  Remove unused Docker images and build cache"
  echo ""
  log "${BOLD}EXAMPLES${NC}"
  log "  ./scripts/manage.sh status"
  log "  ./scripts/manage.sh logs app"
  log "  ./scripts/manage.sh backup --name pre-upgrade"
  log "  ./scripts/manage.sh restore /opt/elsxglobal/backups/2026-11-21_02-00-00_nightly.dump"
  log "  ./scripts/manage.sh psql \"SELECT count(*) FROM hosting_orders;\""
  log "  ./scripts/manage.sh shell db"
  echo ""
}

# ── Main dispatcher ───────────────────────────────────────────────
CMD="${1:-help}"
shift 2>/dev/null || true

case "$CMD" in
  status)         cmd_status ;;
  logs)           cmd_logs "$@" ;;
  backup)         cmd_backup "${1:-manual}" ;;
  restore)        cmd_restore "${1:-}" ;;
  migrate)        cmd_migrate ;;
  shell)          cmd_shell "${1:-app}" ;;
  psql)           cmd_psql "${1:-}" ;;
  deploy)         cmd_deploy ;;
  restart)        cmd_restart "${1:-}" ;;
  stop)           cmd_stop ;;
  start)          cmd_start ;;
  health)         cmd_health ;;
  rotate-secrets) cmd_rotate_secrets ;;
  studio-url)     cmd_studio_url ;;
  cleanup)        cmd_cleanup ;;
  version)        cmd_version ;;
  top)            cmd_top ;;
  help|--help|-h) cmd_help ;;
  *)              warn "Unknown command: $CMD"; cmd_help; exit 1 ;;
esac
