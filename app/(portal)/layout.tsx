import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PortalGroup({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative bg-background">
      {children}
    </main>
  );
}
