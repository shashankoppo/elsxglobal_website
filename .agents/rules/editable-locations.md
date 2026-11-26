# Editable Locations Rule

Office and location content is fully editable by authorized agents.

## Guidelines
- All offices on the site are real and founder-attested
- Authorized agents may add, update, restyle, or reorganize location/office content
- Contact fields (phone/email) MUST always import from `lib/contact.ts`
- Run `node tools/contact-guard.mjs` to verify contact normalization
- Location pages: `app/(marketing)/locations/*`, footer, contact page, About, VaultHost footer
- Never invent office addresses — use only founder-provided information
- When updating location content, ensure consistency across all pages that reference the same office
