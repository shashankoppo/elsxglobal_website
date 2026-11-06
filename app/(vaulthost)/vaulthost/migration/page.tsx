import { Metadata } from 'next';
import { createMetadata } from '@/lib/seo';
import MigrationClient from './migration-client';

export const metadata: Metadata = createMetadata({
  title: "Free White-Glove Migration — Zero Downtime Transfer | VaultHost by ELSxGlobal",
  description: "Free white-glove migration to VaultHost. Our experts handle everything — websites, databases, DNS, email — with zero downtime. 500+ sites migrated successfully.",
  keywords: ['free website migration India', 'white-glove migration hosting', 'zero downtime transfer', 'migrate to VaultHost', 'website migration service', 'cPanel migration', 'WordPress migration India'],
  canonical: 'https://elsxglobal.com/vaulthost/migration/',
  breadcrumb: [
    { name: 'Home', url: 'https://elsxglobal.com/' },
    { name: 'VaultHost', url: 'https://elsxglobal.com/vaulthost/' },
    { name: 'Free Migration', url: 'https://elsxglobal.com/vaulthost/migration/' },
  ],
  faq: [
    { question: 'Is the migration really free?', answer: 'Yes. Free white-glove migration is included with all annual hosting plans. Our team handles the entire transfer at no additional cost.' },
    { question: 'Will there be any downtime during migration?', answer: 'No. We use a dual-DNS strategy that keeps your current site live while we set up the new one. We sync data, test everything, then flip the DNS switch for a seamless transition.' },
    { question: 'How long does migration take?', answer: 'Most migrations complete within 24-48 hours. Complex setups with multiple databases or custom applications may take up to 72 hours. We provide a timeline estimate after the assessment call.' },
    { question: 'What can you migrate?', answer: 'We migrate websites (HTML, WordPress, Joomla, Drupal, custom PHP), databases (MySQL, PostgreSQL), email accounts, DNS records, and SSL certificates. If you have a custom setup, contact us for a tailored plan.' },
    { question: 'Do I need technical knowledge?', answer: 'No. That is the point of white-glove service. You provide access to your current hosting, and we handle everything else. You will be kept informed at every step.' },
    { question: 'What if something goes wrong?', answer: 'We take full responsibility. If any issue arises during or after migration, our team fixes it at no cost. Your original hosting stays live until you confirm everything works.' },
  ],
  serviceSchema: {
    name: 'Free White-Glove Migration',
    description: 'Expert-led, zero-downtime migration service included with all annual VaultHost hosting plans. Websites, databases, email, and DNS transferred seamlessly.',
    provider: 'VaultHost by ELSxGlobal',
    areaServed: 'India',
    category: 'Migration Services',
  },
});

export default function MigrationPage() {
  return <MigrationClient />;
}
