import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Managed WordPress Hosting — LiteSpeed & NVMe from ₹199/mo',
  description:
    'High-speed managed WordPress hosting on LiteSpeed Web Server with LSCache, NVMe storage, automated daily offsite backups, free SSL, and WP-CLI access starting at ₹199/mo.',
  path: '/vaulthost/wordpress',
  keywords: [
    'managed WordPress hosting India',
    'LiteSpeed WordPress hosting',
    'NVMe WordPress VaultHost',
    'WooCommerce hosting India',
  ],
});

export default function WordPressLayout({ children }: { children: React.ReactNode }) {
  return children;
}
