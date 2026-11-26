---
name: contact-normalize
description: Ensures all contact information across the codebase references lib/contact.ts instead of hardcoded values.
---

# Contact Normalize

Finds and reports hardcoded contact details that should import from `lib/contact.ts`.

## Usage
```bash
node tools/contact-guard.mjs            # Check all files
node tools/contact-guard.mjs --working  # Check only modified files
```

## What it checks
- Phone numbers matching `+91` pattern
- Email addresses with `@elsxglobal`, `@evolucentsphere`, `@vaulthost`
- WhatsApp URLs with `wa.me`
- Files should import from `lib/contact` instead of hardcoding
