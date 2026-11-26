import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/metadata';
import ServicesPageClient from './services-client';

export const metadata: Metadata = buildMetadata({
  title: 'Enterprise Services — ELSxTech, ELSxBPO, ELSxKPO & ELSxConsultancy',
  description:
    'End-to-end enterprise solutions across custom software & AI (ELSxTech), omnichannel BPO automation (ELSxBPO), predictive analytics KPO (ELSxKPO), and digital transformation advisory (ELSxConsultancy).',
  path: '/services',
  keywords: [
    'ELSxGlobal services',
    'ELSxTech custom software',
    'ELSxBPO outsourcing',
    'ELSxKPO analytics',
    'ELSxConsultancy',
    'enterprise digital transformation India',
  ],
});

export default function ServicesPage() {
  return <ServicesPageClient />;
}
