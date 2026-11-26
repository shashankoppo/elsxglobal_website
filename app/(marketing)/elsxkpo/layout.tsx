import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'ELSxKPO — Predictive Analytics & Knowledge Process Outsourcing',
  description:
    'ELSxKPO transforms raw enterprise data into decision intelligence: market research, 92%-accuracy predictive analytics, financial modeling, sentiment tracking, and M&A due diligence.',
  path: '/elsxkpo',
  keywords: [
    'ELSxKPO',
    'knowledge process outsourcing India',
    'predictive analytics services',
    'financial modeling KPO',
    'market research intelligence',
    'due diligence support',
  ],
});

export default function ElsxKPOLayout({ children }: { children: React.ReactNode }) {
  return children;
}
