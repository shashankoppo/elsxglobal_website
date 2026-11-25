import { Metadata } from 'next';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Cloud Hosting India — Auto-scaling & Multi-region from ₹1,480/mo | VaultHost',
  description: 'Enterprise cloud hosting 3–5% below AWS, GCP & Azure with zero egress fees, Pay As You Go hourly billing, and 1/6/12-month cycles. Plans from ₹1,480/mo.',
  keywords: ['cloud hosting India', 'auto-scaling cloud hosting', 'cloud server Mumbai', 'multi-region hosting', 'load balancer hosting', 'CDN hosting India', 'scalable cloud hosting', 'enterprise cloud infrastructure'],
  canonical: 'https://elsxglobal.com/vaulthost/cloud/',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
