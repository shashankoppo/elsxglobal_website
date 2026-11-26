---
name: ship
description: Run the full release checklist and prepare for production deploy.
---

# /ship

Pre-deploy verification sequence.

## Steps
1. Run release checklist from `.agents/skills/release-checklist/SKILL.md`
2. Verify all quality gates pass
3. Generate deployment summary
4. Confirm rollback plan
5. Tag release
