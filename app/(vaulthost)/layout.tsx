import { VaultHostNavbar } from '@/components/navigation/vaulthost-navbar';
import { VaultHostFooter } from '@/components/navigation/vaulthost-footer';

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
