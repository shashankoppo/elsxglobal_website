---
name: a11y-audit
description: Runs accessibility checks against pages using axe-core and reports WCAG 2.2 AA violations.
---

# Accessibility Audit

Runs axe-core against specified URLs and reports WCAG 2.2 AA violations.

## Usage
Requires a running dev server.
```bash
# Against local dev server
npx @axe-core/cli http://localhost:3000 --tags wcag2a,wcag2aa,wcag22aa
```

## Quality gate
- Zero serious/critical violations
- Keyboard navigation must work
- `prefers-reduced-motion` respected
- Accessible names on all icon-only links
