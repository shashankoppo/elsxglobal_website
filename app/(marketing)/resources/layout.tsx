import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Enterprise Resources Hub — Whitepapers, Playbooks & Checklists',
  description:
    'Download enterprise transformation guides, AI implementation roadmaps, cloud migration playbooks, ERP selection frameworks, and SOC 2 compliance checklists.',
  path: '/resources',
  keywords: [
    'enterprise IT whitepapers',
    'cloud migration playbook',
    'AI transformation guide',
    'ERP selection framework',
    'cybersecurity checklist',
  ],
});

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
