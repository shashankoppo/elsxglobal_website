import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing — VaultHost Cloud & ELSxGlobal Services',
  description:
    'Transparent pricing for VaultHost cloud infrastructure. Start free, scale to enterprise. Starter Rs 0, Professional Rs 3,999/mo, Enterprise Rs 24,999/mo, Infinite custom. ELSxGlobal services from Rs 4L-Rs 12L per engagement. 20% off annual billing.',
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
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Pricing — VaultHost Cloud & ELSxGlobal Services',
    description: 'Start free, scale to enterprise. Transparent pricing for cloud hosting and transformation services.',
    type: 'website',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
