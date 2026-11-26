# Deployment Rules

## Supported Paths
1. **Coolify** (primary): Self-hosted, webhook deploys from GitHub
2. **Docker Compose on Debian/Ubuntu**: Equal-citizen path, must always work

## Contract
- One OCI image, one env contract, one `/api/health`
- `Dockerfile` builds the production image
- `.env.example` + `.env.supabase.example` document all required variables
- `deploy/` contains compose files for auxiliary services
- Health endpoint returns JSON with service status checks

## Rules
- Never push directly to `main`
- Production URLs and uptime stay intact during all changes
- Blue/green or feature flags for breaking changes
- Rollback must be possible in < 5 minutes
- DB migrations are expand/contract (never destructive)
- Image scanning before deploy
- Coolify UI behind VPN + 2FA
