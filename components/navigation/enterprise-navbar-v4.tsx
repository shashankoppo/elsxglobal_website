'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu, X, ChevronDown, Search, ArrowRight, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { NAV_PILLARS } from '@/lib/nav-config';

export function EnterpriseNavbarV4() {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [isMac, setIsMac] = useState(false);
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform));
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 150);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenMenu(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [mobileOpen]);

  const triggerCmdK = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true }));
  };

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b',
        scrolled
          ? 'bg-ink-surface/95 backdrop-blur-md border-hairline shadow-soft'
          : 'bg-ink/80 backdrop-blur-sm border-hairline/60'
      )}
    >
      <nav className="max-w-screen-xl mx-auto px-4 sm:px-6" ref={navRef}>
        <div className="flex h-16 items-center justify-between gap-2">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 v4-focus-ring rounded-chip">
            <Logo />
          </Link>

          {/* Desktop Nav — only show at xl to avoid overflow */}
          <div className="hidden xl:flex items-center gap-0">
            {NAV_PILLARS.map((pillar, index) => {
              /* Shorten labels for nav display */
              const shortLabel: Record<string, string> = {
                'Enterprise Services': 'Services',
                'Industries & Locations': 'Industries',
                'Company & Resources': 'Company',
              };
              const displayLabel = shortLabel[pillar.label] ?? pillar.label;

              if (!pillar.menu) {
                return (
                  <Link
                    key={pillar.label}
                    href={pillar.href}
                    className={cn(
                      'px-2.5 py-2 text-sm font-medium rounded-btn transition-colors v4-focus-ring whitespace-nowrap',
                      pathname === pillar.href ? 'text-signal' : 'text-text-secondary-v4 hover:text-text-primary-v4'
                    )}
                  >
                    {displayLabel}
                  </Link>
                );
              }
              return (
                <div
                  key={pillar.label}
                  className="relative"
                  onMouseEnter={() => { cancelClose(); setOpenMenu(pillar.label); }}
                  onMouseLeave={scheduleClose}
                >
                  <button
                    onClick={() => setOpenMenu(openMenu === pillar.label ? null : pillar.label)}
                    aria-expanded={openMenu === pillar.label}
                    aria-controls={`mega-menu-${pillar.label.replace(/\s+/g, '-').toLowerCase()}`}
                    className={cn(
                      'flex items-center gap-1 px-2.5 py-2 text-sm font-medium rounded-btn transition-colors v4-focus-ring whitespace-nowrap',
                      openMenu === pillar.label ? 'text-signal' : 'text-text-secondary-v4 hover:text-text-primary-v4'
                    )}
                  >
                    {displayLabel}
                    <ChevronDown className={cn('h-3 w-3 transition-transform duration-200 shrink-0', openMenu === pillar.label && 'rotate-180')} />
                  </button>
                  {openMenu === pillar.label && (
                    <MegaMenu
                      pillar={pillar}
                      id={`mega-menu-${pillar.label.replace(/\s+/g, '-').toLowerCase()}`}
                      onMouseEnter={cancelClose}
                      onMouseLeave={scheduleClose}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Right CTA group */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Search — icon only on lg, full bar on xl+ */}
            <button
              onClick={triggerCmdK}
              className="hidden lg:flex items-center gap-1.5 px-2 py-1.5 rounded-btn border border-hairline bg-ink-surface-2 text-sm text-text-muted-v4 hover:border-hairline-2 hover:text-text-secondary-v4 transition-colors v4-focus-ring"
              aria-label="Search"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden 2xl:inline text-xs">Search</span>
              <kbd className="hidden 2xl:inline-flex items-center rounded border border-hairline px-1 py-0.5 text-[10px] v4-readout">{isMac ? '⌘' : 'Ctrl'}K</kbd>
            </button>
            <ThemeToggle />
            <Link href="/portal" className="hidden lg:block text-sm font-medium text-text-secondary-v4 hover:text-text-primary-v4 transition-colors v4-focus-ring rounded-chip px-2 whitespace-nowrap">
              Sign In
            </Link>
            <Link
              href="/vaulthost"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-btn v4-btn-primary text-sm v4-focus-ring whitespace-nowrap"
            >
              <span className="hidden sm:inline">Start Free</span>
              <span className="sm:hidden">Start</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            {/* Mobile menu toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="xl:hidden p-2 text-text-primary-v4 v4-focus-ring rounded-chip" aria-label="Menu">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile menu — shows below xl */}
      {mobileOpen && (
        <div className="xl:hidden fixed inset-x-0 top-16 bottom-0 bg-ink-surface border-t border-hairline overflow-y-auto z-40 animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {NAV_PILLARS.map((pillar) => (
              <div key={pillar.label}>
                {pillar.menu ? (
                  <>
                    <button
                      onClick={() => setMobileExpanded(mobileExpanded === pillar.label ? null : pillar.label)}
                      className="flex items-center justify-between w-full px-3 py-3 text-sm font-medium text-text-secondary-v4 hover:text-text-primary-v4 rounded-btn hover:bg-ink-surface-2 transition-colors"
                    >
                      {pillar.label}
                      <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', mobileExpanded === pillar.label && 'rotate-180')} />
                    </button>
                    {mobileExpanded === pillar.label && (
                      <div className="ml-3 pl-3 border-l border-hairline space-y-0.5 mt-1 mb-2">
                        {pillar.menu.columns.map((col) => (
                          <div key={col.heading}>
                            <p className="v4-readout text-[10px] uppercase tracking-widest text-signal mt-2 mb-1 px-2">
                              {col.heading}
                            </p>
                            {col.items.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-2 px-3 py-2.5 text-sm text-text-secondary-v4 hover:text-signal rounded-btn transition-colors"
                              >
                                <item.icon className="h-4 w-4 text-signal shrink-0" />
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={pillar.href}
                    className="block px-3 py-3 text-sm font-medium text-text-secondary-v4 hover:text-text-primary-v4 rounded-btn hover:bg-ink-surface-2 transition-colors"
                  >
                    {pillar.label}
                  </Link>
                )}
              </div>
            ))}
            <div className="pt-4 mt-4 v4-hr space-y-2">
              <Link href="/portal" className="block px-3 py-3 text-sm font-medium text-text-secondary-v4 hover:text-text-primary-v4 rounded-btn hover:bg-ink-surface-2 transition-colors">
                Sign In
              </Link>
              <Link href="/vaulthost" className="flex items-center justify-center gap-2 px-4 py-3 rounded-btn v4-btn-primary text-sm font-medium">
                Start Free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/* ── Mega Menu ── */
function MegaMenu({
  pillar,
  id,
  onMouseEnter,
  onMouseLeave,
}: {
  pillar: { label: string; href: string; menu: import('@/lib/nav-config').NavMenu };
  id: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const colCount = pillar.menu.columns.length;

  const gridClass =
    colCount <= 2 ? 'grid-cols-1 md:grid-cols-2' :
    colCount === 3 ? 'grid-cols-1 md:grid-cols-3' :
    colCount === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' :
    colCount === 6 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6' :
    'grid-cols-1 md:grid-cols-3 lg:grid-cols-5';

  const menuWidth =
    colCount <= 2 ? 'w-[calc(100vw-2rem)] md:w-[540px]' :
    colCount === 3 ? 'w-[calc(100vw-2rem)] md:w-[740px]' :
    colCount === 4 ? 'w-[calc(100vw-2rem)] lg:w-[980px]' :
    colCount === 6 ? 'w-[calc(100vw-2rem)] 2xl:w-[1360px] xl:w-[1240px] lg:w-[1020px]' :
    'w-[calc(100vw-2rem)] lg:w-[1140px]';

  return (
    <div
      id={id}
      role="region"
      aria-label={`${pillar.label} submenu`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        'fixed top-16 left-1/2 -translate-x-1/2 pt-2 z-50 max-w-[calc(100vw-2rem)] pointer-events-auto',
        menuWidth
      )}
    >
      <div className="v4-panel p-5 shadow-2xl bg-ink/98 backdrop-blur-2xl border border-hairline-2 rounded-3xl relative overflow-hidden">
        {/* Subtle gradient glow */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className={cn('grid', gridClass, 'gap-x-6 gap-y-8 relative z-10', 'max-h-[75vh] overflow-y-auto terminal-scrollbar pr-2')}>
          {pillar.menu.columns.map((col) => (
            <div key={col.heading}>
              <p className="v4-readout text-[11px] font-semibold uppercase tracking-widest text-signal mb-3 px-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-signal/20 flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-signal" />
                </span>
                {col.heading}
              </p>
              <div className="space-y-1">
                {col.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-ink-surface-2 transition-all duration-200 group relative"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-hairline bg-ink-surface shadow-sm group-hover:border-signal/30 group-hover:bg-signal/5 group-hover:text-signal transition-all">
                      <item.icon className="h-4 w-4 text-text-muted-v4 group-hover:text-signal transition-colors" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text-primary-v4 group-hover:text-signal transition-colors flex items-center gap-2">
                        {item.label}
                        <ChevronRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-signal" />
                      </p>
                      <p className="text-xs text-text-muted-v4 leading-relaxed mt-0.5 line-clamp-2">{item.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 v4-hr relative z-10">
          <Link
            href={pillar.menu.footerLink.href}
            className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 bg-ink-surface border border-hairline hover:border-signal/30 hover:bg-signal/5 text-sm font-medium w-full text-text-primary-v4 hover:text-signal transition-all group"
          >
            {pillar.menu.footerLink.label}
            <ArrowRight className="h-4 w-4 text-text-muted-v4 group-hover:text-signal transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}
