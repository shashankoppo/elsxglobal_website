#!/usr/bin/env bash
# =================================================================
# ELSxGlobal + VaultHost — Cron Job Installer
# =================================================================
# Run once on the server: bash scripts/cron-setup.sh
# =================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="/var/log/elsxglobal"
BACKUP_DIR="/opt/elsxglobal/backups"

GREEN='\033[0;32m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
ok()   { echo -e "${GREEN}  ✓${NC}  $*"; }
info() { echo -e "${CYAN}  ➜${NC}  $*"; }

mkdir -p "$LOG_DIR" "$BACKUP_DIR"

# Create logrotate config
cat > /etc/logrotate.d/elsxglobal <<'LOGROTATE'
/var/log/elsxglobal/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 root root
    sharedscripts
    postrotate
        /bin/true
    endscript
}
LOGROTATE
ok "Logrotate config installed at /etc/logrotate.d/elsxglobal"

# Install crontab
CRON_CONTENT="# =================================================================
# ELSxGlobal + VaultHost — Production Cron Jobs
# Managed by: $SCRIPT_DIR/cron-setup.sh
# =================================================================

# Nightly backup at 2:00 AM UTC
0 2 * * * $SCRIPT_DIR/backup.sh nightly >> $LOG_DIR/backup.log 2>&1

# Health check every 5 minutes (logs only errors)
*/5 * * * * $SCRIPT_DIR/health-monitor.sh --quiet >> $LOG_DIR/health.log 2>&1

# Weekly Docker cleanup (Sunday 3:00 AM UTC)
0 3 * * 0 docker system prune -f >> $LOG_DIR/cleanup.log 2>&1

# Monthly log rotation force
0 0 1 * * /usr/sbin/logrotate -f /etc/logrotate.d/elsxglobal >> $LOG_DIR/logrotate.log 2>&1
"

# Install without overwriting existing entries
(crontab -l 2>/dev/null | grep -v "ELSxGlobal" | grep -v "elsxglobal"; echo "$CRON_CONTENT") | crontab -
ok "Cron jobs installed"

echo ""
info "Installed cron jobs:"
info "  • Nightly DB backup at 2:00 AM UTC → $BACKUP_DIR/"
info "  • Health check every 5 minutes → $LOG_DIR/health.log"
info "  • Weekly Docker cleanup on Sundays at 3:00 AM UTC"
info "  • Monthly log rotation on 1st of each month"
echo ""
echo -e "${BOLD}${GREEN}✓ Cron setup complete!${NC}"
