#!/usr/bin/env bash
# =================================================================
# ELSxGlobal + VaultHost — Health Monitor
# Usage: ./scripts/health-monitor.sh [--quiet] [--json]
# Exit codes: 0=healthy, 1=degraded, 2=critical
# =================================================================
set -euo pipefail

# ── Colour codes ──────────────────────────────────────────────────
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# ── Flags ─────────────────────────────────────────────────────────
QUIET=false
JSON_OUTPUT=false
for arg in "$@"; do
  case "$arg" in
    --quiet) QUIET=true ;;
    --json)  JSON_OUTPUT=true; QUIET=true ;;
  esac
done

# ── Constants ─────────────────────────────────────────────────────
LOG_DIR="/var/log/elsxglobal"
LOG_FILE="${LOG_DIR}/last-health.json"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

CONTAINERS=(
  "supabase-db"
  "supabase-auth"
  "supabase-rest"
  "supabase-storage"
  "supabase-meta"
  "supabase-studio"
  "supabase-gateway"
  "elsxglobal-app"
)

DISK_WARN=75
DISK_CRIT=90
MEM_WARN=80
MEM_CRIT=95
BACKUP_WARN_HOURS=25
BACKUP_DIR="/opt/elsxglobal/backups"

# ── State tracking ────────────────────────────────────────────────
OVERALL_STATUS="healthy"   # healthy | degraded | critical
declare -A CHECK_RESULTS   # name -> "ok|warn|crit:message"

# ── Helpers ───────────────────────────────────────────────────────
log() {
  $QUIET && return
  local level="$1"; shift
  case "$level" in
    ok)   echo -e "  ${GREEN}✔${RESET} $*" ;;
    warn) echo -e "  ${YELLOW}⚠${RESET} $*" ;;
    crit) echo -e "  ${RED}✖${RESET} $*" ;;
    info) echo -e "  ${CYAN}→${RESET} $*" ;;
  esac
}

header() {
  $QUIET && return
  echo -e "\n${BOLD}${CYAN}══════════════════════════════════════════${RESET}"
  echo -e "${BOLD}${CYAN}  ELSxGlobal Health Monitor — ${TIMESTAMP}${RESET}"
  echo -e "${BOLD}${CYAN}══════════════════════════════════════════${RESET}\n"
}

section() {
  $QUIET && return
  echo -e "\n${BOLD}▸ $1${RESET}"
}

set_status() {
  local name="$1" level="$2" msg="$3"
  CHECK_RESULTS["$name"]="${level}:${msg}"
  if [[ "$level" == "crit" && "$OVERALL_STATUS" != "critical" ]]; then
    OVERALL_STATUS="critical"
  elif [[ "$level" == "warn" && "$OVERALL_STATUS" == "healthy" ]]; then
    OVERALL_STATUS="degraded"
  fi
}

# ── 1. Container Checks ───────────────────────────────────────────
check_containers() {
  section "Docker Containers"
  for name in "${CONTAINERS[@]}"; do
    local state
    state=$(docker inspect --format '{{.State.Status}}' "$name" 2>/dev/null || echo "missing")
    local health
    health=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$name" 2>/dev/null || echo "missing")

    if [[ "$state" == "missing" ]]; then
      log crit "${name}: container not found"
      set_status "$name" "crit" "not found"
    elif [[ "$state" != "running" ]]; then
      log crit "${name}: state=${state}"
      set_status "$name" "crit" "state=${state}"
    elif [[ "$health" == "unhealthy" ]]; then
      log warn "${name}: running but health=unhealthy"
      set_status "$name" "warn" "unhealthy"
    else
      log ok "${name}: running (health=${health})"
      set_status "$name" "ok" "running"
    fi
  done
}

# ── 2. Application HTTP Health Check ──────────────────────────────
check_app_http() {
  section "Application HTTP"
  local url="http://localhost/api/health"
  local http_code
  http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")

  if [[ "$http_code" == "200" ]]; then
    log ok "GET ${url} → HTTP ${http_code}"
    set_status "app_http" "ok" "HTTP 200"
  elif [[ "$http_code" == "000" ]]; then
    log crit "GET ${url} → connection refused / timeout"
    set_status "app_http" "crit" "unreachable"
  else
    log warn "GET ${url} → HTTP ${http_code}"
    set_status "app_http" "warn" "HTTP ${http_code}"
  fi
}

# ── 3. Disk Usage ─────────────────────────────────────────────────
check_disk() {
  section "Disk Usage"
  local usage
  usage=$(df / --output=pcent | tail -1 | tr -d ' %')

  if (( usage >= DISK_CRIT )); then
    log crit "Root disk: ${usage}% used (critical ≥${DISK_CRIT}%)"
    set_status "disk" "crit" "${usage}% used"
  elif (( usage >= DISK_WARN )); then
    log warn "Root disk: ${usage}% used (warn ≥${DISK_WARN}%)"
    set_status "disk" "warn" "${usage}% used"
  else
    log ok "Root disk: ${usage}% used"
    set_status "disk" "ok" "${usage}% used"
  fi
}

# ── 4. Memory Usage ───────────────────────────────────────────────
check_memory() {
  section "Memory Usage"
  local total used usage
  total=$(grep MemTotal /proc/meminfo | awk '{print $2}')
  used=$(( total - $(grep MemAvailable /proc/meminfo | awk '{print $2}') ))
  usage=$(( used * 100 / total ))

  local used_mb=$(( used / 1024 ))
  local total_mb=$(( total / 1024 ))

  if (( usage >= MEM_CRIT )); then
    log crit "Memory: ${usage}% (${used_mb}MB / ${total_mb}MB) — critical ≥${MEM_CRIT}%"
    set_status "memory" "crit" "${usage}% used"
  elif (( usage >= MEM_WARN )); then
    log warn "Memory: ${usage}% (${used_mb}MB / ${total_mb}MB) — warn ≥${MEM_WARN}%"
    set_status "memory" "warn" "${usage}% used"
  else
    log ok "Memory: ${usage}% (${used_mb}MB / ${total_mb}MB)"
    set_status "memory" "ok" "${usage}% used"
  fi
}

# ── 5. Backup Age ─────────────────────────────────────────────────
check_backup() {
  section "Backup Freshness"
  if [[ ! -d "$BACKUP_DIR" ]]; then
    log warn "Backup directory not found: ${BACKUP_DIR}"
    set_status "backup" "warn" "directory missing"
    return
  fi

  local latest
  latest=$(find "$BACKUP_DIR" -maxdepth 1 -type f \( -name "*.sql.gz" -o -name "*.dump" -o -name "*.tar.gz" \) \
    -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | awk '{print $2}')

  if [[ -z "$latest" ]]; then
    log warn "No backup files found in ${BACKUP_DIR}"
    set_status "backup" "warn" "no backups found"
    return
  fi

  local mod_time now age_seconds age_hours
  mod_time=$(stat -c %Y "$latest")
  now=$(date +%s)
  age_seconds=$(( now - mod_time ))
  age_hours=$(( age_seconds / 3600 ))
  local base; base=$(basename "$latest")

  if (( age_hours >= BACKUP_WARN_HOURS )); then
    log warn "Latest backup: ${base} — ${age_hours}h old (warn ≥${BACKUP_WARN_HOURS}h)"
    set_status "backup" "warn" "${age_hours}h old"
  else
    log ok "Latest backup: ${base} — ${age_hours}h old"
    set_status "backup" "ok" "${age_hours}h old"
  fi
}

# ── 6. Summary & Output ───────────────────────────────────────────
print_summary() {
  $QUIET && return
  echo -e "\n${BOLD}═══════════════ SUMMARY ═══════════════${RESET}"
  case "$OVERALL_STATUS" in
    healthy)  echo -e "  ${GREEN}${BOLD}✔ All checks HEALTHY${RESET}" ;;
    degraded) echo -e "  ${YELLOW}${BOLD}⚠ System DEGRADED — review warnings${RESET}" ;;
    critical) echo -e "  ${RED}${BOLD}✖ System CRITICAL — immediate action required${RESET}" ;;
  esac
  echo ""
}

save_json() {
  mkdir -p "$LOG_DIR" 2>/dev/null || true

  # Build checks JSON array
  local checks_json="["
  local first=true
  for key in "${!CHECK_RESULTS[@]}"; do
    local val="${CHECK_RESULTS[$key]}"
    local lvl="${val%%:*}"
    local msg="${val#*:}"
    $first || checks_json+=","
    checks_json+="{\"name\":\"${key}\",\"status\":\"${lvl}\",\"message\":\"${msg}\"}"
    first=false
  done
  checks_json+="]"

  local exit_code=0
  [[ "$OVERALL_STATUS" == "degraded" ]] && exit_code=1
  [[ "$OVERALL_STATUS" == "critical" ]] && exit_code=2

  local json
  json=$(cat <<EOF
{
  "timestamp": "${TIMESTAMP}",
  "overall_status": "${OVERALL_STATUS}",
  "exit_code": ${exit_code},
  "checks": ${checks_json}
}
EOF
)
  echo "$json" > "$LOG_FILE" 2>/dev/null || {
    # Non-fatal: log dir may not be writable without sudo
    true
  }

  if $JSON_OUTPUT; then
    echo "$json"
  fi
}

# ── Main ──────────────────────────────────────────────────────────
main() {
  header
  check_containers
  check_app_http
  check_disk
  check_memory
  check_backup
  print_summary
  save_json

  case "$OVERALL_STATUS" in
    healthy)  exit 0 ;;
    degraded) exit 1 ;;
    critical) exit 2 ;;
  esac
}

main
