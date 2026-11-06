import { Metadata } from 'next';
import { createMetadata, createSchemaMarkup } from '@/lib/seo';
import { HostingSubTierPage } from '@/components/hosting/extended-pages';
import { hostingSubTiers } from '@/lib/data/hosting-tiers-extended';

const data = hostingSubTiers['ssl-wildcard'];

export const metadata: Metadata = createMetadata({
  title: data.metaTitle,
  description: data.metaDescription,
  keywords: data.keywords,
  canonical: data.canonical,
  breadcrumb: [
    { name: 'Home', url: 'https://elsxglobal.com/' },
    { name: 'VaultHost', url: 'https://elsxglobal.com/vaulthost/' },
    { name: 'SSL', url: 'https://elsxglobal.com/vaulthost/ssl/' },
    { name: 'Wildcard', url: data.canonical },
  ],
  faq: data.faqs,
  serviceSchema: {
    name: data.serviceSchemaName,
    description: data.serviceSchemaDescription,
    provider: 'VaultHost by ELSxGlobal',
    areaServed: 'India',
    category: data.category,
  },
});

export default function Page() {
  const schemas = createSchemaMarkup({
    canonical: data.canonical,
    breadcrumb: [
      { name: 'Home', url: 'https://elsxglobal.com/' },
      { name: 'VaultHost', url: 'https://elsxglobal.com/vaulthost/' },
      { name: 'SSL', url: 'https://elsxglobal.com/vaulthost/ssl/' },
      { name: 'Wildcard', url: data.canonical },
    ],
    faq: data.faqs,
    serviceSchema: {
      name: data.serviceSchemaName,
      description: data.serviceSchemaDescription,
      provider: 'VaultHost by ELSxGlobal',
      areaServed: 'India',
      category: data.category,
    },
  });

  return (
    <>
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />
      ))}
      <HostingSubTierPage data={data} />
    </>
  );
}
