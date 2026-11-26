import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Dedicated Bare-Metal Servers — VaultHost Enterprise Hosting',
  description:
    'Single-tenant bare-metal dedicated servers with NVMe RAID storage, dual-redundant network uplinks, hardware DDoS mitigation, and 24/7 managed support.',
  path: '/vaulthost/dedicated',
  keywords: [
    'dedicated servers India',
    'bare metal hosting VaultHost',
    'enterprise dedicated servers',
    'NVMe bare metal cloud',
  ],
});

export default function DedicatedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
