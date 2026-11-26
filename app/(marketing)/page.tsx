import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/metadata';
import ElsxHomePage from './home-client';

export const metadata: Metadata = buildMetadata({
  title: 'ELSxGlobal | Enterprise Business Transformation Ecosystem | AI, BPO, KPO, Cloud',
  description:
    'ELSxGlobal unites custom software engineering (ELSxTech), AI-augmented BPO (ELSxBPO), predictive analytics KPO (ELSxKPO), strategic consultancy, and VaultHost cloud infrastructure for 340+ global enterprises.',
  path: '/',
  keywords: [
    'ELSxGlobal',
    'enterprise transformation ecosystem',
    'ELSxTech',
    'ELSxBPO',
    'ELSxKPO',
    'ELSxConsultancy',
    'VaultHost cloud',
    'custom software development India',
    'enterprise AI solutions',
    'digital transformation India',
  ],
});

export default function HomePage() {
  return <ElsxHomePage />;
}
