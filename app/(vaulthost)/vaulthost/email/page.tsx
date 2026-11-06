import { Metadata } from 'next';
import { createMetadata } from '@/lib/seo';
import { HostingTierPage } from '@/components/hosting/tier-page';

export const metadata: Metadata = createMetadata({
  title: 'Business Email Hosting India — Custom Domain Email from Rs 49/mo | VaultHost',
  description: 'Professional email on your custom domain with webmail, IMAP, ActiveSync, spam protection, and 99.9% uptime. Plans starting at Rs 49/mo.',
  keywords: ['email hosting India', 'business email hosting', 'custom domain email', 'professional email Mumbai', 'webmail hosting', 'IMAP email hosting', 'ActiveSync email', 'spam protection email hosting'],
  canonical: 'https://elsxglobal.com/vaulthost/email/',
  breadcrumb: [
    { name: 'Home', url: 'https://elsxglobal.com/' },
    { name: 'VaultHost', url: 'https://elsxglobal.com/vaulthost/' },
    { name: 'Email Hosting', url: 'https://elsxglobal.com/vaulthost/email/' },
  ],
  faq: [
    { question: 'What is email hosting?', answer: 'Email hosting provides professional email on your own custom domain (you@yourcompany.com) instead of a free provider. It includes webmail, IMAP/POP3/SMTP, and mobile sync.' },
    { question: 'Can I use my existing domain?', answer: 'Yes! If you already own a domain, simply point its MX records to our servers. We provide step-by-step setup instructions.' },
    { question: 'Is there a webmail client?', answer: 'Yes, every plan includes access to our webmail client. You can also use Outlook, Apple Mail, Thunderbird, or any IMAP client.' },
    { question: 'What is the storage limit?', answer: 'Storage varies by plan — from 5 GB per mailbox on Starter to 50 GB on Enterprise. You can purchase additional storage as an add-on.' },
  ],
  serviceSchema: {
    name: 'Business Email Hosting',
    description: 'Professional email hosting on custom domains with webmail, IMAP, ActiveSync, and spam protection.',
    provider: 'VaultHost by ELSxGlobal',
    areaServed: 'India',
    category: 'Email Hosting',
  },
});

export default function EmailHostingPage() {
  return <HostingTierPage tier="email" />;
}
