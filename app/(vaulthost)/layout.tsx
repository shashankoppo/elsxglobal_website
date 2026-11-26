import type { Metadata } from 'next';
import { VaultHostNavbar } from '@/components/navigation/vaulthost-navbar';
import { VaultHostFooter } from '@/components/navigation/vaulthost-footer';

export const metadata: Metadata = {
  title: {
    default: 'VaultHost — India-First Cloud Platform',
    template: '%s | VaultHost by ELSxGlobal',
  },
  description: 'Premium cloud hosting, VPS, managed WordPress, DNS, edge workers, and AI gateway — India-first with INR billing, zero lock-in, and radical transparency.',
  openGraph: {
    siteName: 'VaultHost by ELSxGlobal',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function VaultHostLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <VaultHostNavbar />
      <main className="relative pt-16 bg-ink text-text-primary-v4 v4-page">
        {children}
      </main>
      <VaultHostFooter />
    </>
  );
}
