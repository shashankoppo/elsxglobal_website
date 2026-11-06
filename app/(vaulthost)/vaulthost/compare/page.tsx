import { Metadata } from 'next';
import { createMetadata } from '@/lib/seo';
import CompareClient from './compare-client';

export const metadata: Metadata = createMetadata({
  title: 'Compare Hosting Plans India — Side-by-Side Comparison | VaultHost',
  description: 'Compare all VaultHost hosting plans side by side. Shared, WordPress, VPS, cloud, and dedicated server plans with pricing, specs, and features.',
  keywords: ['compare hosting plans India', 'hosting comparison Mumbai', 'shared vs VPS vs cloud', 'hosting plan comparison', 'best hosting plan India', 'hosting features comparison', 'VPS vs dedicated comparison'],
  canonical: 'https://elsxglobal.com/vaulthost/compare/',
  breadcrumb: [
    { name: 'Home', url: 'https://elsxglobal.com/' },
    { name: 'VaultHost', url: 'https://elsxglobal.com/vaulthost/' },
    { name: 'Compare Plans', url: 'https://elsxglobal.com/vaulthost/compare/' },
  ],
  serviceSchema: {
    name: 'Hosting Plan Comparison',
    description: 'Side-by-side comparison of all hosting plans including shared, WordPress, VPS, cloud, and dedicated servers.',
    provider: 'VaultHost by ELSxGlobal',
    areaServed: 'India',
    category: 'Web Hosting',
  },
});

export default function ComparePage() {
  return <CompareClient />;
}
