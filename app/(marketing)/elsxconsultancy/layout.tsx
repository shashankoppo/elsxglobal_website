import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'ELSxConsultancy — Digital Transformation & Technology Strategy',
  description:
    'Senior technology consultants delivering digital transformation roadmaps, vendor selection, GDPR/HIPAA/SOC2/ISO compliance readiness, change management, and performance optimization.',
  path: '/elsxconsultancy',
  keywords: [
    'ELSxConsultancy',
    'digital transformation consulting',
    'technology roadmapping',
    'IT compliance advisory',
    'change management consulting',
  ],
});

export default function ElsxConsultancyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
