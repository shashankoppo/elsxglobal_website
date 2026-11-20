'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu, X, ChevronDown, Search, ShoppingCart, ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { VaultHostLogo } from '@/components/ui/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { VAULTHOST_MENU } from '@/lib/nav-config';

export function VaultHostNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [domainQuery, setDomainQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const navRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [mobileOpen]);

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpenMenu(false), 150);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenMenu(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const handleDomainSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (domainQuery.trim()) {
      router.push(`/vaulthost/domains?q=${encodeURIComponent(domainQuery.trim())}`);
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-colors backdrop-blur-md',
        scrolled ? 'bg-ink-surface/95 border-b border-hairline' : 'bg-ink-surface/80 border-b border-hairline/50'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={navRef}>
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link href="/vaulthost" className="flex items-center gap-2.5 shrink-0">
              <VaultHostLogo />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              <div
                className="relative"
                onMouseEnter={() => { cancelClose(); setOpenMenu(true); }}
                onMouseLeave={scheduleClose}
              >
                <button
                  onClick={() => setOpenMenu(!openMenu)}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-text-secondary-v4 hover:text-text-primary-v4 transition-colors"
                >
                  Products
                  <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', openMenu && 'rotate-180')} />
                </button>

                {openMenu && (
                  <div
                    className="absolute top-full pt-2 z-50"
                    style={{ left: '-1rem', width: 'min(720px, calc(100vw - 32px))' }}
                  >
                    <div className="v4-panel p-3 shadow-soft-lg">
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-0.5 max-h-[70vh] overflow-y-auto">
                        {VAULTHOST_MENU.columns.map((col) => (
                          <div key={col.heading}>
                            <p className="v4-readout text-[10px] uppercase tracking-widest text-signal mb-1.5 mt-1.5 px-2">
                              {col.heading}
                            </p>
                            {col.items.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-start gap-2.5 rounded-chip px-2 py-2 hover:bg-ink-surface-2 transition-colors group"
                              >
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-chip border border-hairline bg-ink-surface-2 group-hover:border-hairline-2 transition-colors">
                                  <item.icon className="h-3.5 w-3.5 text-signal" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-text-primary-v4 group-hover:text-signal transition-colors">
                                    {item.label}
                                  </p>
                                  <p className="text-xs text-text-muted-v4 leading-relaxed">{item.desc}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 pt-2 v4-hr">
                        <Link
                          href="/vaulthost/pricing"
                          className="flex items-center justify-center gap-2 rounded-btn px-4 py-2 v4-btn-secondary text-sm font-medium w-full"
                        >
                          View All Plans &amp; Pricing
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link href="/vaulthost/pricing" className="px-3 py-2 text-sm text-text-secondary-v4 hover:text-text-primary-v4 transition-colors">
                Pricing
              </Link>
              <Link href="/vaulthost/status" className="px-3 py-2 text-sm text-text-secondary-v4 hover:text-text-primary-v4 transition-colors">
                Status
              </Link>
              <Link href="/vaulthost/kb" className="px-3 py-2 text-sm text-text-secondary-v4 hover:text-text-primary-v4 transition-colors">
                KB
              </Link>
              <Link href="/" className="px-3 py-2 text-sm text-text-muted-v4 hover:text-text-secondary-v4 transition-colors">
                ELSxGlobal ↗
              </Link>
            </div>
          </div>

          {/* Domain Search — desktop */}
          <form onSubmit={handleDomainSearch} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted-v4" />
              <input
                type="text"
                value={domainQuery}
                onChange={(e) => setDomainQuery(e.target.value)}
                placeholder="Find your domain..."
                className="w-full pl-10 pr-4 py-2 rounded-btn border border-hairline bg-ink-surface-2 text-sm text-text-primary-v4 placeholder:text-text-muted-v4 focus:border-signal focus:outline-none transition-colors"
              />
            </div>
          </form>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-chip border border-good/20 bg-good/5">
              <span className="v4-live-dot" />
              <span className="v4-readout text-[10px] text-good uppercase tracking-widest">Operational</span>
            </div>
            <ThemeToggle />
            <Link href="/portal" className="hidden sm:block text-sm text-text-secondary-v4 hover:text-text-primary-v4 transition-colors">
              Portal
            </Link>
            <Link href="/vaulthost/pricing" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-btn v4-btn-primary text-sm">
              <ShoppingCart className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Plans</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(prev => !prev)}
              className="lg:hidden p-2 text-text-primary-v4 hover:text-signal transition-colors rounded-chip z-50 cursor-pointer"
              aria-label="Menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-6 w-6 text-signal" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <>
          {/* Solid scrim — prevents bleed-through */}
          <div
            className="lg:hidden fixed inset-0 top-16 z-[9998]"
            style={{ background: 'hsl(215,35%,5%)' }}
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div
            className="lg:hidden fixed inset-x-0 top-16 h-[calc(100dvh-4rem)] overflow-y-auto z-[9999] shadow-2xl"
            style={{ background: 'hsl(215,30%,8%)', borderTop: '1px solid hsl(215,18%,20%)' }}
          >
            {/* Top signal accent line */}
            <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--v4-signal)/0.4), transparent)' }} />

            <div className="px-4 py-5 space-y-4">
              {/* Domain search */}
              <form onSubmit={handleDomainSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'hsl(215,14%,50%)' }} />
                  <input
                    type="text"
                    value={domainQuery}
                    onChange={(e) => setDomainQuery(e.target.value)}
                    placeholder="Find your domain..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-colors"
                    style={{
                      background: 'hsl(215,25%,13%)',
                      border: '1px solid hsl(215,18%,22%)',
                      color: 'hsl(210,20%,92%)',
                    }}
                  />
                </div>
              </form>

              {/* Quick links */}
              <div className="flex gap-2">
                <Link
                  href="/vaulthost/pricing"
                  className="flex-1 text-center px-3 py-2.5 rounded-xl text-sm font-bold"
                  style={{ background: 'hsl(var(--v4-signal))', color: 'hsl(215,35%,6%)' }}
                >
                  View Plans
                </Link>
                <Link
                  href="/vaulthost/status"
                  className="flex-1 text-center px-3 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: 'hsl(215,25%,13%)', border: '1px solid hsl(215,18%,22%)', color: 'hsl(210,20%,88%)' }}
                >
                  Status
                </Link>
              </div>

              {/* Divider */}
              <div className="h-px" style={{ background: 'hsl(215,18%,18%)' }} />

              {/* Collapsible category sections */}
              {VAULTHOST_MENU.columns.map((col) => (
                <div key={col.heading}>
                  <button
                    type="button"
                    onClick={() => setMobileExpanded(mobileExpanded === col.heading ? null : col.heading)}
                    className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold rounded-xl transition-colors"
                    style={{
                      color: mobileExpanded === col.heading ? 'hsl(var(--v4-signal))' : 'hsl(215,14%,78%)',
                      background: mobileExpanded === col.heading ? 'hsl(215,25%,13%)' : 'transparent',
                    }}
                  >
                    {col.heading}
                    <ChevronDown className={cn('h-4 w-4 transition-transform duration-200 shrink-0', mobileExpanded === col.heading && 'rotate-180')} />
                  </button>
                  {mobileExpanded === col.heading && (
                    <div className="ml-2 mt-1 mb-2 rounded-xl overflow-hidden" style={{ background: 'hsl(215,25%,11%)' }}>
                      {col.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-3 px-4 py-2.5 transition-colors"
                          style={{ color: 'hsl(215,14%,72%)' }}
                        >
                          <item.icon className="h-3.5 w-3.5 shrink-0" style={{ color: 'hsl(var(--v4-signal)/0.7)' }} />
                          <div>
                            <p className="text-sm">{item.label}</p>
                            <p className="text-xs" style={{ color: 'hsl(215,14%,52%)' }}>{item.desc}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="h-px" style={{ background: 'hsl(215,18%,18%)' }} />
              <Link href="/" className="block px-4 py-2 text-sm" style={{ color: 'hsl(215,14%,52%)' }}>← Back to ELSxGlobal</Link>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
