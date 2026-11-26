---
name: seo-audit
description: Validates SEO requirements including unique titles, canonical URLs, Open Graph tags, and JSON-LD structured data.
---

# SEO Audit

Checks each indexable page for required SEO elements.

## Checklist per page
- Unique `<title>` (not matching any other page)
- Self-referencing `<link rel="canonical">`
- `<meta name="description">` present and unique
- Open Graph tags: `og:title`, `og:description`, `og:image`, `og:url`
- Twitter card tags
- JSON-LD structured data (Organization, Service, Product, FAQ, Breadcrumb as appropriate)
- Portal/admin/auth pages have `noindex`
- Unknown URLs return 404 (not soft 200)
