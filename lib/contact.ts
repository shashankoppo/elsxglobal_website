/**
 * Canonical Contact Registry
 *
 * Single source of truth for EvolucentSphere Pvt. Ltd., ELSxGlobal, and
 * VaultHost contact details. Enforced in CI by `tools/contact-guard.mjs`.
 */

export const CONTACT = {
  company: {
    legal: 'EvolucentSphere Pvt. Ltd.',
    brand: 'ELSxGlobal',
    platform: 'VaultHost',
  },
  email: {
    general: 'contact@evolucentsphere.com',
    support: 'support@elsxglobal.com',
    sales: 'sales@elsxglobal.com',
    privacy: 'privacy@evolucentsphere.com',
  },
  phone: {
    primary: '+91 72475 58873',
    secondary: '+91 87704 22622',
  },
  whatsapp: {
    primary: '+917247558873',
    url: 'https://wa.me/917247558873',
  },
  social: {
    linkedin: 'https://www.linkedin.com/company/evolucentsphere',
    twitter: 'https://twitter.com/elsxglobal',
    github: 'https://github.com/shashankoppo',
  },
  website: {
    main: 'https://elsxglobal.com',
    vaulthost: 'https://elsxglobal.com/vaulthost',
    parent: 'https://evolucentsphere.com',
  },
  grievanceOfficer: null as { name: string; email: string; phone: string } | null,
} as const;

export type ContactKey = keyof typeof CONTACT;

/** Returns the primary or secondary phone number from the contact registry. */
export function getPhone(which: 'primary' | 'secondary' = 'primary'): string {
  return CONTACT.phone[which];
}

/** Returns a canonical department email address from the contact registry. */
export function getEmail(which: keyof typeof CONTACT.email = 'general'): string {
  return CONTACT.email[which];
}

/** Returns the canonical WhatsApp direct chat URL. */
export function getWhatsAppUrl(): string {
  return CONTACT.whatsapp.url;
}
