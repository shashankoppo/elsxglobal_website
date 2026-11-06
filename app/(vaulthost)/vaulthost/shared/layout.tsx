import { Metadata } from 'next';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Shared Hosting India — Affordable cPanel Hosting from Rs 99/mo | VaultHost',
  description: 'Affordable shared hosting in India with free SSL, cPanel, NVMe SSD storage, daily backups, and 24/7 support. Plans starting at Rs 99/mo with 99.99% uptime guarantee.',
  keywords: ['shared hosting India', 'cheap shared hosting', 'cPanel hosting India', 'web hosting Mumbai', 'affordable hosting plans', 'shared web hosting', 'budget hosting India', 'free SSL hosting'],
  canonical: 'https://elsxglobal.com/vaulthost/shared/',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
