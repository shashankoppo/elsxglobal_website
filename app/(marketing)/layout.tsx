import { EnterpriseNavbarV4 } from '@/components/navigation/enterprise-navbar-v4';
import { EnterpriseFooterV4 } from '@/components/navigation/enterprise-footer-v4';
import { CommandPalette } from '@/components/site/command-palette';

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
