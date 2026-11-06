import { Metadata } from 'next';
import { createMetadata, createSchemaMarkup } from '@/lib/seo';
import { LegalPage } from '@/components/hosting/extended-pages';
import { legalData } from '@/lib/data/hosting-tiers-extended';

const data = legalData['sla'];

export const metadata: Metadata = createMetadata({
  title: data.metaTitle,
  description: data.metaDescription,
  keywords: data.keywords,
  canonical: data.canonical,
  breadcrumb: [
    { name: 'Home', url: 'https://elsxglobal.com/' },
    { name: 'VaultHost', url: 'https://elsxglobal.com/vaulthost/' },
    { name: 'SLA', url: data.canonical },
  ],
});

export default function Page() {
  const schemas = createSchemaMarkup({
    canonical: data.canonical,
    breadcrumb: [
      { name: 'Home', url: 'https://elsxglobal.com/' },
      { name: 'VaultHost', url: 'https://elsxglobal.com/vaulthost/' },
      { name: 'SLA', url: data.canonical },
    ],
  });

  return (
    <>
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />
      ))}
      <LegalPage data={data} />
    </>
  );
}
