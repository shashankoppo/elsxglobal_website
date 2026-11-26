import type { Metadata } from 'next';
import { PortalLayoutClient } from './layout-client';

export const metadata: Metadata = {
  title: { absolute: 'Client Portal | ELSxGlobal' },
  description: 'ELSxGlobal & VaultHost customer portal for managing infrastructure, domains, invoices, and support.',
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <PortalLayoutClient>{children}</PortalLayoutClient>;
}
