import type { Metadata } from 'next';
import { CONTACT } from '@/lib/contact';
import { buildMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Contact ELSxGlobal — Start Your Transformation Journey',
  description: `Get in touch with ELSxGlobal. Email ${CONTACT.email.general}. Offices in Jabalpur, Indore, Pune, Eindhoven, Chicago. Response within 4 business hours. Book a free consultation today.`,
  path: '/contact',
  keywords: [
    'contact ELSxGlobal',
    'enterprise transformation consultation',
    'BPO services contact India',
    'KPO analytics inquiry',
    'VaultHost hosting signup',
    'software development company contact',
    'ESG consultancy inquiry',
    'business transformation consultation India',
    'contact EvolucentSphere',
  ],
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
