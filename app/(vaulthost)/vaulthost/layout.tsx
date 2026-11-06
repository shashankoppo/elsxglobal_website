import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VaultHost — Cloud Infrastructure Platform | Edge, Serverless, AI-Ops',
  description:
    'VaultHost by ELSxGlobal — infinite-scale cloud hosting with 38+ edge PoPs, 4ms serverless cold starts, AI-Ops auto-scaling, zero-trust WAF, and managed databases. Deploy free in 60 seconds.',
  keywords: [
    'VaultHost cloud hosting',
    'edge network hosting',
    'serverless functions India',
    'managed databases PostgreSQL',
    'AI-Ops auto-scaling',
    'zero-trust WAF security',
    'CI/CD pipeline hosting',
    'cloud infrastructure platform India',
    'edge CDN hosting',
    'free cloud hosting trial',
  ],
  alternates: { canonical: '/vaulthost' },
  openGraph: {
    title: 'VaultHost — Infinite-Scale Cloud Infrastructure by ELSxGlobal',
    description: '38+ edge PoPs, 4ms serverless, AI-Ops scaling, zero-trust WAF. Deploy free in 60 seconds.',
    type: 'website',
  },
};

export default function VaultHostLayout({ children }: { children: React.ReactNode }) {
  return children;
}
