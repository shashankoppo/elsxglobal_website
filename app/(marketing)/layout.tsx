import type { Metadata } from 'next';
import { EnterpriseNavbarV4 } from '@/components/navigation/enterprise-navbar-v4';
import { EnterpriseFooterV4 } from '@/components/navigation/enterprise-footer-v4';
import { CommandPalette } from '@/components/site/command-palette';

export const metadata: Metadata = {
  title: {
    default: 'ELSxGlobal — Enterprise IT, AI & Cloud Solutions',
    template: '%s | ELSxGlobal',
  },
  description: 'Enterprise IT services, AI integration, BPO/KPO, cloud infrastructure, and digital transformation by EvolucentSphere Pvt. Ltd. Serving 40+ countries from India.',
  openGraph: {
    siteName: 'ELSxGlobal',
    locale: 'en_IN',
    type: 'website',
  },
};
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <EnterpriseNavbarV4 />
      <main className="relative pt-16 bg-ink text-text-primary-v4 v4-page">
        {children}
      </main>
      <EnterpriseFooterV4 />
      <CommandPalette />
    </>
  );
}
