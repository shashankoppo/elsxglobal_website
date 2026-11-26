import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/metadata';
import { services as seoServices } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: seoServices.software.title,
  description: seoServices.software.description,
  path: '/software',
  keywords: seoServices.software.keywords,
});

export default function SoftwareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
