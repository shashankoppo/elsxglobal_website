'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Logo } from '@/components/site/logo';
import {
  LayoutDashboard, Server, Globe, Receipt, Bell, Menu, X,
  Search, User, LogOut, ChevronDown, Shield, Database, Mail,
  CreditCard, Zap, HardDrive, Bot, Lock, Layers,
} from 'lucide-react';

const coreNav = [
  { href: '/portal', label: 'Dashboard', icon: LayoutDashboard },
];

const cloudNav = [
  { href: '/portal/cloud', label: 'Cloud Overview', icon: Layers },
  { href: '/portal/cloud/workers', label: 'Edge Workers', icon: Zap },
  { href: '/portal/cloud/storage', label: 'VaultR2 Storage', icon: HardDrive },
  { href: '/portal/cloud/database', label: 'VaultD1 SQL', icon: Database },
  { href: '/portal/cloud/dns', label: 'Anycast DNS', icon: Globe },
  { href: '/portal/cloud/ai', label: 'VaultAI Gateway', icon: Bot },
  { href: '/portal/cloud/tunnels', label: 'VaultTunnels', icon: Lock },
];

const operationsNav = [
  { href: '/portal/service', label: 'Hosting Slices', icon: Server },
  { href: '/portal/invoice', label: 'Invoices & Billing', icon: Receipt },
  { href: '/portal/support', label: 'Support Tickets', icon: Mail },
  { href: '/portal/profile', label: 'Profile & Security', icon: Shield },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data.user) setUser({ email: data.user.email || '' });
    };
    init();
  }, []);

  const handleSignOut = async () => {
    await createClient().auth.signOut();
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/portal/support?q=${encodeURIComponent(search)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-background/80 backdrop-blur sticky top-0 z-50">
        <Link href="/portal" className="inline-flex items-center gap-2">
          <Logo className="h-7 w-7" />
          <span className="font-semibold">Portal</span>
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-muted">
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 border-r border-border bg-muted/20 z-40 transition-transform flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="p-6 hidden lg:block">
            <Link href="/portal" className="inline-flex items-center gap-2.5">
              <Logo className="h-8 w-8" />
              <span className="font-semibold">ELS<span className="text-primary">x</span>Global</span>
            </Link>
          </div>

          <div className="px-4 mb-3 hidden lg:block">
            <div className="liquid-glass rounded-xl p-3">
              <p className="text-[11px] text-muted-foreground">Signed in as</p>
              <p className="text-xs font-medium truncate">{user?.email || 'Loading...'}</p>
            </div>
          </div>

          <nav className="px-3 space-y-4 flex-1 overflow-y-auto terminal-scrollbar pr-2">
            {/* Core */}
            <div className="space-y-1">
              {coreNav.map((item) => {
                const active = pathname === item.href || (item.href === '/portal' && pathname === '/portal/dashboard');
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${active ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Cloud & Edge Platform */}
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-mono font-semibold tracking-wider text-signal px-3 mb-1">
                Cloud &amp; Edge (Anycast)
              </p>
              {cloudNav.map((item) => {
                const active = pathname === item.href || (item.href !== '/portal/cloud' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${active ? 'bg-signal/15 text-signal border border-signal/30' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Operations */}
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-mono font-semibold tracking-wider text-muted-foreground px-3 mb-1">
                Hosting &amp; Account
              </p>
              {operationsNav.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${active ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="p-4 border-t border-border space-y-1">
            <Link href="/vaulthost" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              <Server className="h-4 w-4" />Browse Plans
            </Link>
            <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-red-500 hover:bg-red-500/5 transition-colors">
              <LogOut className="h-4 w-4" />Sign Out
            </button>
          </div>
        </aside>

        {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Main content area */}
        <div className="flex-1 lg:ml-0 min-w-0">
          {/* Topbar */}
          <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border">
            <div className="flex items-center justify-between px-4 lg:px-8 h-16">
              <form onSubmit={handleSearch} className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search knowledge base..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-muted/30 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </form>

              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-muted transition-colors relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
                </button>

                {/* User dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-56 liquid-glass-strong rounded-2xl p-2 z-50 shadow-xl">
                        <div className="px-3 py-2 border-b border-border mb-2">
                          <p className="text-sm font-medium truncate">{user?.email || 'User'}</p>
                          <p className="text-xs text-muted-foreground">Customer Portal</p>
                        </div>
                        <Link href="/portal/profile" onClick={() => setUserMenuOpen(false)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                          <User className="h-4 w-4" />Profile
                        </Link>
                        <Link href="/portal/notifications" onClick={() => setUserMenuOpen(false)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                          <Bell className="h-4 w-4" />Notifications
                        </Link>
                        <Link href="/portal" onClick={() => setUserMenuOpen(false)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                          <CreditCard className="h-4 w-4" />Billing
                        </Link>
                        <div className="border-t border-border mt-2 pt-2">
                          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/5 transition-colors">
                            <LogOut className="h-4 w-4" />Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="p-4 lg:p-8 max-w-7xl mx-auto w-full min-w-0 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
