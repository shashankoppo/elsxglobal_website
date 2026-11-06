import { Metadata } from 'next';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'VPS Hosting India — Managed KVM VPS from Rs 499/mo | VaultHost',
  description: 'High-performance KVM VPS hosting in India. Full root access, NVMe storage, dedicated resources, and choice of OS/Control Panel. Managed & Unmanaged options.',
  keywords: ['VPS hosting India', 'managed VPS', 'KVM VPS India', 'cheap VPS Mumbai', 'Linux VPS hosting', 'Windows VPS India', 'cPanel VPS', 'dedicated RAM VPS'],
  canonical: 'https://elsxglobal.com/vaulthost/vps/',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
