import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'VaultHost — Cloud Infrastructure Platform | Edge, Serverless, AI-Ops',
    template: '%s | VaultHost by ELSxGlobal',
  },
  description:
    'VaultHost by ELSxGlobal — infinite-scale cloud hosting with 38+ edge PoPs, 4ms serverless cold starts, AI-Ops auto-scaling, zero-trust WAF, and managed databases.',
  openGraph: {
    title: 'VaultHost — Infinite-Scale Cloud Infrastructure by ELSxGlobal',
    description: '38+ edge PoPs, 4ms serverless, AI-Ops scaling, zero-trust WAF. Deploy free in 60 seconds.',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
};

export default function VaultHostLayout({ children }: { children: React.ReactNode }) {
  return children;
}
