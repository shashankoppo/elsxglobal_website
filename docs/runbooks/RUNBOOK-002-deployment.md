# RUNBOOK-002: Deployment

## Pre-deployment Checklist
- [ ] All tests passing on `main`.
- [ ] Staging environment verified.
- [ ] Database migrations reviewed (if any).
- [ ] OpenAPI specs updated and reviewed.

## Deployment Steps (Staging → Production)
1. Trigger the Production deployment workflow in CI/CD.
2. The Action Gateway will intercept the Tier 2 mutation (Deploy).
3. **Action Gateway Tier 2 TOTP Required:** The deployer must provide their TOTP code via the internal CLI or Admin UI to authorize the deployment.
4. CI/CD proceeds with the rollout.

## Health Check Validation
- Monitor the `/api/health` endpoint.
- Verify error rates in the Observability dashboard.
- Check that the API reference matches the newly deployed OpenAPI spec.

## Rollback Procedure
1. Identify the previous stable Git SHA.
2. Revert the commit on `main` or trigger a rollback deployment specifically for that SHA.
3. Provide TOTP authorization for the rollback deployment.
4. Verify system stability.
