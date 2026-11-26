import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/metadata';
import { services as seoServices } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: seoServices.erp.title,
  description: seoServices.erp.description,
  path: '/erp-crm',
  keywords: seoServices.erp.keywords,
});

export default function ErpCrmLayout({ children }: { children: React.ReactNode }) {
  return children;
}
