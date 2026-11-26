---
name: route-audit
description: Audits Next.js App Router routes for duplicates, missing metadata, and structural issues.
---

# Route Audit

Walks the `app/` directory to map all pages and API routes, detecting structural issues.

## Usage
```bash
node tools/route-audit.mjs         # Table output
node tools/route-audit.mjs --json  # JSON output for CI
```

## What it detects
- Duplicate routes (same URL from different file paths)
- Pages missing metadata exports
- Client-only pages without server wrappers
- Dynamic routes without `generateStaticParams`
- Route groups and their URL mappings
