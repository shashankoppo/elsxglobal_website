import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'VaultWorkers — Serverless Edge Compute at 300+ Global Locations',
  description:
    'Run JavaScript, TypeScript, Python, and Rust functions at the edge in under 5ms latency across 300+ global locations with zero cold starts and 100K free requests/day.',
  path: '/vaulthost/workers',
  keywords: [
    'VaultWorkers',
    'serverless edge functions',
    'zero cold start edge compute',
    'VaultHost workers pricing',
  ],
});

export default function WorkersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
