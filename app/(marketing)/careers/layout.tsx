import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Careers at ELSxGlobal — Engineering, AI, BPO & Consulting Jobs',
  description:
    'Join ELSxGlobal across Engineering, AI Solutions, KPO Data Science, BPO Operations, Security, and Sales in Jabalpur, Mumbai, Pune, Bangalore, Eindhoven, Chicago, and Dubai.',
  path: '/careers',
  keywords: [
    'ELSxGlobal careers',
    'Next.js jobs India',
    'AI architect jobs',
    'BPO operations careers',
    'cloud engineer jobs India',
    'EvolucentSphere careers',
  ],
});

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
