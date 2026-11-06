import { Metadata } from 'next';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Cloud Hosting India — Auto-scaling & Multi-region from Rs 999/mo | VaultHost',
  description: 'Cloud hosting with auto-scaling, load balancing, global CDN, and multi-region deployment. Pay only for what you use. Plans from Rs 999/mo.',
  keywords: ['cloud hosting India', 'auto-scaling cloud hosting', 'cloud server Mumbai', 'multi-region hosting', 'load balancer hosting', 'CDN hosting India', 'scalable cloud hosting', 'enterprise cloud infrastructure'],
  canonical: 'https://elsxglobal.com/vaulthost/cloud/',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
