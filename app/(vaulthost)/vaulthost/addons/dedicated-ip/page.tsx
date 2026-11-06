import { Metadata } from 'next';
import { createMetadata, createSchemaMarkup } from '@/lib/seo';
import { AddonPage } from '@/components/hosting/extended-pages';
import { addonData } from '@/lib/data/hosting-tiers-extended';

const data = addonData['dedicated-ip'];

export const metadata: Metadata = createMetadata({
  title: data.metaTitle,
  description: data.metaDescription,
  keywords: data.keywords,
  canonical: data.canonical,
  breadcrumb: [
    { name: 'Home', url: 'https://elsxglobal.com/' },
    { name: 'VaultHost', url: 'https://elsxglobal.com/vaulthost/' },
    { name: 'Add-ons', url: 'https://elsxglobal.com/vaulthost/addons/' },
    { name: 'Dedicated IP', url: data.canonical },
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
      { name: 'Add-ons', url: 'https://elsxglobal.com/vaulthost/addons/' },
      { name: 'Dedicated IP', url: data.canonical },
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
      <AddonPage data={data} />
    </>
  );
}
