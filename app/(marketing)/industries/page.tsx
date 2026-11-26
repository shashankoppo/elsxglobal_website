import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/metadata';
import IndustriesPageClient from './industries-client';

export const metadata: Metadata = buildMetadata({
  title: 'Industries We Serve — Healthcare, Fintech, Retail & Manufacturing',
  description:
    'Specialized technology, AI, BPO, and analytics frameworks across Healthcare, Financial Services, E-commerce, Logistics, Manufacturing, Real Estate, EdTech, and Startups.',
  path: '/industries',
  keywords: [
    'enterprise industry solutions',
    'healthcare software India',
    'fintech technology services',
    'e-commerce BPO support',
    'manufacturing Industry 4.0',
    'logistics supply chain AI',
  ],
});

export default function IndustriesPage() {
  return <IndustriesPageClient />;
}
