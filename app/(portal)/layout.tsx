export default function PortalGroup({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative bg-background">
      {children}
    </main>
  );
}
