import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'ELSxBPO — RPA & AI-Augmented Business Process Outsourcing',
  description:
    'Turn enterprise operations into a competitive advantage with RPA deployment, 24/7 AI-augmented contact centers, OCR document processing, workflow orchestration, and finance BPO.',
  path: '/elsxbpo',
  keywords: [
    'ELSxBPO',
    'AI-augmented BPO India',
    'RPA automation services',
    '24/7 contact center outsourcing',
    'document OCR processing',
    'finance accounting BPO',
  ],
});

export default function ElsxBPOLayout({ children }: { children: React.ReactNode }) {
  return children;
}
