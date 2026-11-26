import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/metadata';
import { services as seoServices } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: seoServices.cloud.title,
  description: seoServices.cloud.description,
  path: '/cloud',
  keywords: seoServices.cloud.keywords,
});

export default function CloudLayout({ children }: { children: React.ReactNode }) {
  return children;
}
