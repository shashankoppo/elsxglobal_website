import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Client Case Studies — Proven Enterprise Outcomes',
  description:
    'Explore measurable client transformations delivered by ELSxGlobal across logistics, BFSI, healthcare, manufacturing, and enterprise cloud infrastructure.',
  path: '/case-studies',
  keywords: [
    'ELSxGlobal case studies',
    'enterprise digital transformation results',
    'AI implementation ROI',
    'BPO cost reduction case studies',
    'cloud migration stories India',
  ],
});

export default function CaseStudiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
