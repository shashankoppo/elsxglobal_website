import { Metadata } from 'next';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Shared Hosting India — Managed cPanel Hosting from ₹790/mo | VaultHost',
  description: 'Enterprise shared hosting in India with free SSL, HestiaCP/cPanel, NVMe SSD storage, daily backups, and 24/7 support. Plans starting at ₹790/mo (3–5% below AWS/GCP) with 99.99% uptime guarantee.',
  keywords: ['shared hosting India', 'managed shared hosting', 'cPanel hosting India', 'web hosting Mumbai', 'NVMe hosting plans', 'shared web hosting', 'enterprise hosting India', 'free SSL hosting'],
  canonical: 'https://elsxglobal.com/vaulthost/shared/',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
