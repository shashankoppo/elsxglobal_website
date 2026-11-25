import { Metadata } from 'next';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'VPS Hosting India — Enterprise KVM VPS from ₹1,480/mo | VaultHost',
  description: 'High-performance KVM VPS hosting in India priced 3–5% below AWS/GCP/Azure. Full root access, NVMe storage, Pay As You Go (730 hrs/mo) & 1/6/12-month billing cycles.',
  keywords: ['VPS hosting India', 'managed VPS', 'KVM VPS India', 'NVMe VPS Mumbai', 'Linux VPS hosting', 'Windows VPS India', 'cPanel VPS', 'dedicated RAM VPS'],
  canonical: 'https://elsxglobal.com/vaulthost/vps/',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
