import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Pricing — VaultHost Cloud & ELSxGlobal Services',
  description:
    'Transparent pricing for VaultHost cloud infrastructure. Start free, scale to enterprise. Starter Rs 0, Professional Rs 3,999/mo, Enterprise Rs 24,999/mo, Infinite custom. ELSxGlobal services from Rs 4L-Rs 12L per engagement. 20% off annual billing.',
  path: '/pricing',
  keywords: [
    'VaultHost pricing',
    'cloud hosting pricing India',
    'serverless pricing plans',
    'edge network pricing',
    'managed database pricing',
    'enterprise cloud hosting cost',
    'BPO services pricing India',
    'KPO analytics pricing',
    'software development engagement pricing',
    'ESG consultancy cost India',
    'free cloud hosting plan',
  ],
});

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
