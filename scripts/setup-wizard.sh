#!/usr/bin/env bash
# =================================================================
# ELSxGlobal + VaultHost — First-Time Setup Wizard
# Usage: sudo ./scripts/setup-wizard.sh
# =================================================================
set -euo pipefail

# ── Colours ───────────────────────────────────────────────────────
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
BOLD='\033[1m'
RESET='\033[0m'

# ── Helpers ───────────────────────────────────────────────────────
info()    { echo -e "${CYAN}  →${RESET} $*"; }
ok()      { echo -e "${GREEN}  ✔${RESET} $*"; }
warn()    { echo -e "${YELLOW}  ⚠${RESET} $*"; }
error()   { echo -e "${RED}  ✖${RESET} $*" >&2; }
die()     { error "$*"; exit 1; }
ask()     { echo -e "${BLUE}  ?${RESET} $*"; }

banner() {
  echo -e "${BOLD}${CYAN}"
  echo "  ╔══════════════════════════════════════════════╗"
  echo "  ║   ELSxGlobal + VaultHost  —  Setup Wizard   ║"
  echo "  ╚══════════════════════════════════════════════╝"
  echo -e "${RESET}"
}

section() {
  echo -e "\n${BOLD}▸ $1${RESET}"
}

# ── Script directory (project root) ───────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="${PROJECT_ROOT}/.env"

# ── 1. Requirement Checks ─────────────────────────────────────────
check_requirements() {
  section "Checking Requirements"

  # Docker ≥ 24
  if ! command -v docker &>/dev/null; then
    die "Docker is not installed. Visit https://docs.docker.com/get-docker/"
  fi
  local docker_ver
  docker_ver=$(docker version --format '{{.Server.Version}}' 2>/dev/null || echo "0.0.0")
  local docker_major; docker_major=$(echo "$docker_ver" | cut -d. -f1)
  if (( docker_major < 24 )); then
    die "Docker ${docker_ver} found — Docker 24+ required. Please upgrade."
  fi
  ok "Docker ${docker_ver}"

  # Compose v2
  if ! docker compose version &>/dev/null; then
    die "Docker Compose v2 not found. Install via 'apt install docker-compose-plugin' or equivalent."
  fi
  local compose_ver
  compose_ver=$(docker compose version --short 2>/dev/null || echo "0.0.0")
  ok "Docker Compose v2 (${compose_ver})"

  # RAM ≥ 2 GB
  local mem_kb mem_gb
  mem_kb=$(grep MemTotal /proc/meminfo | awk '{print $2}')
  mem_gb=$(( mem_kb / 1024 / 1024 ))
  if (( mem_gb < 2 )); then
    die "Only ${mem_gb}GB RAM detected — 2GB minimum required."
  fi
  ok "RAM: ${mem_gb}GB"

  # Disk ≥ 10 GB free on /
  local disk_avail_kb disk_avail_gb
  disk_avail_kb=$(df / --output=avail | tail -1 | tr -d ' ')
  disk_avail_gb=$(( disk_avail_kb / 1024 / 1024 ))
  if (( disk_avail_gb < 10 )); then
    die "Only ${disk_avail_gb}GB free — 10GB minimum required."
  fi
  ok "Free disk: ${disk_avail_gb}GB"

  # openssl
  if ! command -v openssl &>/dev/null; then
    die "openssl not found. Install it and re-run."
  fi
  ok "openssl available"

  # python3
  if ! command -v python3 &>/dev/null; then
    die "python3 not found. Install it and re-run."
  fi
  ok "python3 available"
}

# ── 2. Create Directories ─────────────────────────────────────────
create_directories() {
  section "Creating Directories"
  local dirs=(
    "/opt/elsxglobal/backups"
    "/var/log/elsxglobal"
  )
  for d in "${dirs[@]}"; do
    if [[ ! -d "$d" ]]; then
      mkdir -p "$d"
      ok "Created ${d}"
    else
      info "Already exists: ${d}"
    fi
  done
}

# ── 3. Generate Secrets ───────────────────────────────────────────
generate_jwt() {
  local secret="$1" role="$2"
  python3 - <<PYEOF
import base64, hashlib, hmac, json, time

secret = "$secret"
role   = "$role"

header  = base64.urlsafe_b64encode(json.dumps({"alg":"HS256","typ":"JWT"}).encode()).rstrip(b"=").decode()
payload = base64.urlsafe_b64encode(json.dumps({
    "role": role,
    "iss":  "supabase",
    "iat":  int(time.time()),
    "exp":  int(time.time()) + 10 * 365 * 24 * 3600,
}).encode()).rstrip(b"=").decode()

msg = f"{header}.{payload}".encode()
sig = hmac.new(secret.encode(), msg, hashlib.sha256).digest()
sig_b64 = base64.urlsafe_b64encode(sig).rstrip(b"=").decode()
print(f"{header}.{payload}.{sig_b64}")
PYEOF
}

setup_env() {
  section "Environment Configuration"

  if [[ -f "$ENV_FILE" ]]; then
    warn ".env already exists — skipping secret generation (using existing file)"
    # shellcheck disable=SC1090
    source "$ENV_FILE" 2>/dev/null || true
    return
  fi

  info "Generating secrets..."
  local pg_pass jwt_secret anon_key service_key
  pg_pass=$(openssl rand -hex 24)
  jwt_secret=$(openssl rand -hex 32)

  info "Computing JWT tokens..."
  anon_key=$(generate_jwt "$jwt_secret" "anon")
  service_key=$(generate_jwt "$jwt_secret" "service_role")

  ok "POSTGRES_PASSWORD generated"
  ok "JWT_SECRET generated"
  ok "ANON_KEY computed"
  ok "SERVICE_ROLE_KEY computed"

  # Prompt for domain
  echo ""
  ask "Enter your domain name (e.g. example.com) — or press Enter for 'localhost':"
  read -r domain_input
  local domain="${domain_input:-localhost}"

  # Write .env
  cat > "$ENV_FILE" <<EOF
# =================================================================
# ELSxGlobal + VaultHost — Environment Variables
# Generated by setup-wizard.sh on $(date -u +"%Y-%m-%dT%H:%M:%SZ")
# DO NOT commit this file to version control.
# =================================================================

# Domain
DOMAIN=${domain}
SITE_URL=https://${domain}

# Database
POSTGRES_PASSWORD=${pg_pass}
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_HOST=db
POSTGRES_PORT=5432

# JWT / API
JWT_SECRET=${jwt_secret}
JWT_EXPIRY=3600
ANON_KEY=${anon_key}
SERVICE_ROLE_KEY=${service_key}

# Auth
GOTRUE_SITE_URL=https://${domain}
GOTRUE_JWT_SECRET=${jwt_secret}
GOTRUE_JWT_AUD=authenticated
GOTRUE_DB_DATABASE_URL=postgres://postgres:${pg_pass}@db:5432/postgres

# API
PGRST_JWT_SECRET=${jwt_secret}
PGRST_DB_URI=postgres://postgres:${pg_pass}@db:5432/postgres
PGRST_DB_SCHEMA=public,storage,graphql_public

# Studio
STUDIO_DEFAULT_PROJECT=ELSxGlobal
STUDIO_PORT=3000
EOF

  chmod 600 "$ENV_FILE"
  ok ".env written to ${ENV_FILE}"
}

# ── 4. Pull Images & Start Services ───────────────────────────────
start_services() {
  section "Pulling Docker Images"
  cd "$PROJECT_ROOT"
  docker compose pull
  ok "Images pulled"

  section "Starting Services"
  docker compose up -d
  ok "Services started"
}

# ── 5. Wait for Healthy ───────────────────────────────────────────
wait_for_healthy() {
  section "Waiting for Services to Become Healthy"
  local max_wait=300  # 5 minutes
  local interval=10
  local elapsed=0

  while (( elapsed < max_wait )); do
    local exit_code=0
    bash "${SCRIPT_DIR}/health-monitor.sh" --quiet || exit_code=$?
    if (( exit_code == 0 )); then
      ok "All services healthy after ${elapsed}s"
      return 0
    fi
    info "Not yet healthy (${elapsed}s elapsed) — retrying in ${interval}s..."
    sleep "$interval"
    elapsed=$(( elapsed + interval ))
  done

  warn "Services did not reach healthy state within ${max_wait}s."
  warn "Check logs with: docker compose logs --tail=50"
  return 1
}

# ── 6. Install Cron Jobs ──────────────────────────────────────────
install_cron() {
  section "Cron Jobs"
  ask "Would you like to install cron jobs for health monitoring and backups? [y/N]"
  read -r answer
  if [[ "${answer,,}" != "y" ]]; then
    info "Skipping cron installation."
    return
  fi

  local cron_health="*/5 * * * * ${SCRIPT_DIR}/health-monitor.sh --quiet >> /var/log/elsxglobal/health.log 2>&1"
  local cron_backup="0 2 * * * /opt/elsxglobal/backups/backup.sh >> /var/log/elsxglobal/backup.log 2>&1"

  (crontab -l 2>/dev/null || true; echo "$cron_health") | sort -u | crontab -
  ok "Installed: health-monitor every 5 minutes"

  if [[ -f "/opt/elsxglobal/backups/backup.sh" ]]; then
    (crontab -l 2>/dev/null || true; echo "$cron_backup") | sort -u | crontab -
    ok "Installed: backup at 02:00 daily"
  else
    warn "Backup script not found at /opt/elsxglobal/backups/backup.sh — skipping backup cron"
  fi
}

# ── 7. Success Panel ──────────────────────────────────────────────
success_panel() {
  # Load domain from .env if available
  local domain="localhost"
  if [[ -f "$ENV_FILE" ]]; then
    local d; d=$(grep '^DOMAIN=' "$ENV_FILE" | cut -d= -f2 | tr -d '"' || true)
    [[ -n "$d" ]] && domain="$d"
  fi

  local pg_pass="<see .env>"
  if [[ -f "$ENV_FILE" ]]; then
    local p; p=$(grep '^POSTGRES_PASSWORD=' "$ENV_FILE" | cut -d= -f2 | tr -d '"' || true)
    [[ -n "$p" ]] && pg_pass="${p:0:8}…"
  fi

  echo ""
  echo -e "${BOLD}${GREEN}"
  echo "  ╔══════════════════════════════════════════════════════╗"
  echo "  ║           🚀  Setup Complete!                        ║"
  echo "  ╠══════════════════════════════════════════════════════╣"
  printf "  ║  %-20s  %-32s ║\n" "Website URL:"  "https://${domain}"
  printf "  ║  %-20s  %-32s ║\n" "Studio URL:"   "https://${domain}/studio"
  printf "  ║  %-20s  %-32s ║\n" "API URL:"      "https://${domain}/rest/v1/"
  printf "  ║  %-20s  %-32s ║\n" "Auth URL:"     "https://${domain}/auth/v1/"
  printf "  ║  %-20s  %-32s ║\n" "Postgres:"     "localhost:5432 (pw: ${pg_pass})"
  echo "  ╠══════════════════════════════════════════════════════╣"
  echo "  ║  Run health check:  ./scripts/health-monitor.sh     ║"
  echo "  ║  View logs:         docker compose logs -f          ║"
  echo "  ║  Stop:              docker compose down             ║"
  echo "  ╚══════════════════════════════════════════════════════╝"
  echo -e "${RESET}"
}

# ── Main ──────────────────────────────────────────────────────────
main() {
  banner
  check_requirements
  create_directories
  setup_env
  start_services
  wait_for_healthy || true
  install_cron
  success_panel
}

main
