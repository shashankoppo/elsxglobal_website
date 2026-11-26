import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/metadata';
import { services as seoServices } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: seoServices.ai.title,
  description: seoServices.ai.description,
  path: '/ai-solutions',
  keywords: seoServices.ai.keywords,
});

export default function AiSolutionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
