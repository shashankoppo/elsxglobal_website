# RUNBOOK-001: Incident Response

## Severity Levels
- **P0:** Critical system failure (e.g., core routing down, wide-scale data breach, entire Action Gateway offline). Immediate paging of all on-call engineers.
- **P1:** High impact (e.g., specific module like Workers down for many users, API latency > 5s). Paging primary on-call.
- **P2:** Medium impact (e.g., partial degradation, non-critical background jobs failing). Addressed during business hours.
- **P3:** Low impact (e.g., minor UI bugs, single user issues). Logged in backlog.

## Escalation Paths
1. Level 1: Primary On-call Engineer
2. Level 2: Engineering Manager
3. Level 3: VP of Engineering / CTO

## Key Dashboard URLs
- **Observability:** `https://admin.vaulthost.com/observability`
- **Action Gateway Audit:** `https://admin.vaulthost.com/ai-governance/audit`
- **Infrastructure Status:** `https://status.vaulthost.com`

## Actions for Common Incidents

### Service Down
1. Check Cloudflare/CDN status.
2. Verify Kubernetes/Cluster health via dashboards.
3. Review recent deployments (`/docs/runbooks/RUNBOOK-002-deployment.md`).
4. Rollback if caused by a recent release.

### DDoS Attack
1. Enable Under Attack Mode in CDN.
2. Scale up ingress controllers.
3. Apply rate-limiting rules globally via WAF.

### Data Breach Alert
1. Revoke affected API keys immediately.
2. Isolate impacted databases (snapshot and quarantine).
3. Notify the security and legal teams.

## Post-Mortem Template
Every P0/P1 incident requires a post-mortem within 48 hours.
- **Date/Time:**
- **Duration:**
- **Impact:**
- **Root Cause:**
- **Timeline:**
- **Action Items (Preventative):**
