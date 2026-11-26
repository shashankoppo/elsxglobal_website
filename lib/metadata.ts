import type { Metadata } from 'next';

export const SITE_URL = 'https://elsxglobal.com';
export const SITE_NAME = 'ELSxGlobal';
export const DEFAULT_OG_IMAGE = '/og-image.jpg';

export interface BuildMetadataOptions {
  title: string;
  description: string;
  path: string; // e.g. '/', '/about', '/vaulthost/pricing'
  ogImage?: string;
  noIndex?: boolean;
  keywords?: string[];
}

export function buildMetadata(opts: BuildMetadataOptions): Metadata {
  const normalizedPath = opts.path.startsWith('/') ? opts.path : `/${opts.path}`;
  const url = normalizedPath === '/' ? SITE_URL : `${SITE_URL}${normalizedPath}`;
  const fullTitle = opts.title.includes(SITE_NAME) ? opts.title : `${opts.title} | ${SITE_NAME}`;
  const image = opts.ogImage || DEFAULT_OG_IMAGE;

  return {
    // Use `absolute` so the root layout's `template: '%s | ELSxGlobal'` does not double-append the site name.
    title: { absolute: fullTitle },
    description: opts.description,
    ...(opts.keywords ? { keywords: opts.keywords } : {}),
    ...(opts.noIndex ? { robots: { index: false, follow: false } } : {}),
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description: opts.description,
      url,
      siteName: SITE_NAME,
      locale: 'en_IN',
      type: 'website',
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: opts.description,
      images: [image],
    },
  };
}
