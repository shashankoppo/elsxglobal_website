---
name: adr-writer
description: Creates Architecture Decision Records following the project ADR template in docs/adr/.
---

# ADR Writer

Creates new Architecture Decision Records in `docs/adr/`.

## Template
```markdown
# ADR-NNN: Title

**Status:** Proposed | Accepted | Deprecated | Superseded
**Date:** YYYY-MM-DD
**Deciders:** Team/person

## Context
What is the issue that we're seeing that is motivating this decision?

## Decision
What is the change that we're proposing and/or doing?

## Consequences
- **Positive:** ...
- **Negative:** ...
- **Mitigation:** ...
```

## Naming
Files: `ADR-NNN-kebab-case-title.md`
Sequential numbering from existing ADRs.
