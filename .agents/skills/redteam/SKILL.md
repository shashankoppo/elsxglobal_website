---
name: redteam
description: Runs red-team security and integrity checks against the platform from multiple adversarial personas.
---

# Red Team

Adversarial testing protocol run before closing every phase.

## Personas
1. **Attacker**: auth bypass, IDOR, SSRF, injection, webhook replay, prompt injection
2. **Competitor**: find false/stale/unprovable claims, screenshot inconsistencies
3. **Regulator**: misleading ads, certification wording, DPDP gaps
4. **Enterprise CTO**: security questionnaire, SLA evidence, exit/portability
5. **Slow-network user**: 4G, mid-range Android, screen reader, keyboard only
6. **Chaos agent**: kill DB, expire certs, flood API, lose a server
7. **Pre-mortem**: "6 months later this failed — why?"

## Rules
- Read-only access to codebase
- Writes only to `docs/security/`
- No phase passes with open Critical/High findings
