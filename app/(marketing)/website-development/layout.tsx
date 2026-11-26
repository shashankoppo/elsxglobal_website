import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/metadata';
import { services as seoServices } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: seoServices.website.title,
  description: seoServices.website.description,
  path: '/website-development',
  keywords: seoServices.website.keywords,
});

export default function WebsiteDevelopmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
