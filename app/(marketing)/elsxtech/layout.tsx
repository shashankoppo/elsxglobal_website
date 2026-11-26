import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'ELSxTech — Custom Software, AI & Cloud Engineering Division',
  description:
    'Intelligence-first engineering for the enterprise: custom software, production AI/ML pipelines, multi-cloud architecture, mobile apps, API platforms, and zero-trust cybersecurity.',
  path: '/elsxtech',
  keywords: [
    'ELSxTech',
    'custom software engineering',
    'enterprise AI integration',
    'cloud architecture India',
    'zero-trust cybersecurity',
    'API platform development',
  ],
});

export default function ElsxTechLayout({ children }: { children: React.ReactNode }) {
  return children;
}
