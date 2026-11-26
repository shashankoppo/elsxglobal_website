import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/metadata';
import VaultHostHomeContent from './vaulthost-home-content';

export const metadata: Metadata = buildMetadata({
  title: 'VaultHost — Cloud Infrastructure Platform | Edge, Serverless, AI-Ops',
  description:
    'VaultHost by ELSxGlobal — infinite-scale cloud hosting with 38+ edge PoPs, 4ms serverless cold starts, AI-Ops auto-scaling, zero-trust WAF, and managed databases. Deploy free in 60 seconds.',
  path: '/vaulthost',
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
});

export default function VaultHostHomePage() {
  return <VaultHostHomeContent />;
}
