import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Engineering & Strategy Blog — AI, Cloud & Enterprise Operations',
  description:
    'Insights, architectural deep dives, and enterprise transformation playbooks from ELSxGlobal engineers, strategists, and BPO/KPO practitioners.',
  path: '/blog',
  keywords: [
    'ELSxGlobal blog',
    'enterprise AI engineering blog',
    'cloud architecture insights',
    'digital transformation articles',
    'BPO automation insights',
  ],
});

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
