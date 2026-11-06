import { Metadata } from 'next';
import { createMetadata } from '@/lib/seo';
import { HostingTierPage } from '@/components/hosting/tier-page';

export const metadata: Metadata = createMetadata({
  title: 'Managed WordPress Hosting India — Fast & Secure from Rs 199/mo | VaultHost',
  description: 'Managed WordPress hosting with automatic updates, built-in caching, one-click staging, and WP CLI. Free SSL and CDN included. Plans starting at Rs 199/mo.',
  keywords: ['managed wordpress hosting India', 'wordpress hosting Mumbai', 'managed WP hosting', 'wordpress CDN hosting', 'wordpress staging', 'WP CLI hosting', 'automatic wordpress updates', 'wordpress performance hosting'],
  canonical: 'https://elsxglobal.com/vaulthost/wordpress/',
  breadcrumb: [
    { name: 'Home', url: 'https://elsxglobal.com/' },
    { name: 'VaultHost', url: 'https://elsxglobal.com/vaulthost/' },
    { name: 'WordPress Hosting', url: 'https://elsxglobal.com/vaulthost/wordpress/' },
  ],
  faq: [
    { question: 'What is managed WordPress hosting?', answer: 'Managed WordPress hosting is optimized specifically for WordPress. We handle updates, security, caching, and performance optimization so you can focus on your content.' },
    { question: 'Can I use plugins?', answer: 'Yes, you can install any WordPress plugin. However, we recommend avoiding resource-heavy plugins that may impact performance.' },
    { question: 'Do you provide staging?', answer: 'Yes, all WordPress plans include one-click staging environments. Test changes before pushing them live.' },
    { question: 'Do you handle migrations?', answer: 'Yes, our team will migrate your existing WordPress site for free. Contact support after signing up.' },
  ],
  serviceSchema: {
    name: 'Managed WordPress Hosting',
    description: 'Managed WordPress hosting with automatic updates, caching, staging, and WP CLI.',
    provider: 'VaultHost by ELSxGlobal',
    areaServed: 'India',
    category: 'WordPress Hosting',
  },
});

export default function WordPressHostingPage() {
  return <HostingTierPage tier="wordpress" />;
}
