import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Compare ELSxGlobal Divisions — Tech, BPO, KPO & Consultancy',
  description:
    'Side-by-side comparison of ELSxTech, ELSxBPO, ELSxKPO, and ELSxConsultancy engagement models, team structures, timelines, and pricing ranges.',
  path: '/compare',
  keywords: [
    'compare ELSxGlobal services',
    'ELSxTech vs ELSxBPO',
    'KPO vs BPO engagement model',
    'enterprise advisory comparison',
  ],
});

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
