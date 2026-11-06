'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, CornerDownLeft, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

import { ALL_NAV_ITEMS } from '@/lib/nav-config';

export interface CommandItem {
  label: string;
  href: string;
  category: string;
  desc?: string;
  keywords?: string;
}

export function CommandPalette() {
  const items = ALL_NAV_ITEMS;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const toggle = useCallback(() => setOpen((v) => !v), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggle();
      } else if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, toggle]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items.slice(0, 8);
    const q = query.toLowerCase();
    return items
      .filter((item) => {
        const haystack = `${item.label} ${item.category} ${item.desc || ''} ${(item as { keywords?: string }).keywords || ''}`.toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 10);
  }, [query, items]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filtered.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [filtered]);

  const flatList = Object.values(grouped).flat();

  const handleSelect = useCallback((href: string) => {
    router.push(href);
    setOpen(false);
  }, [router, setOpen]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatList.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && flatList[activeIndex]) {
      e.preventDefault();
      handleSelect(flatList[activeIndex].href);
    }
  };

  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector(`[data-idx="${activeIndex}"]`) as HTMLElement | null;
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (!open) return null;

  let runningIdx = -1;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={() => setOpen(false)}
      />
      <div className="relative w-full max-w-xl liquid-glass-strong rounded-2xl border border-border/60 shadow-2xl overflow-hidden animate-fade-up">
        <div className="flex items-center gap-3 px-4 border-b border-border/60">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search pages, services, hosting plans..."
            className="flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-border/60 px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono">
            ESC
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[50vh] overflow-y-auto p-2">
          {flatList.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No results for "{query}"
            </div>
          ) : (
            Object.entries(grouped).map(([category, groupItems]) => (
              <div key={category} className="mb-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1.5">
                  {category}
                </p>
                {groupItems.map((item) => {
                  runningIdx++;
                  const idx = runningIdx;
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={`${category}-${item.href}`}
                      data-idx={idx}
                      onClick={() => handleSelect(item.href)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={cn(
                        'flex items-center gap-3 w-full px-2.5 py-2.5 rounded-lg text-left transition-colors group',
                        isActive ? 'bg-primary/10' : 'hover:bg-muted/40'
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm font-medium truncate', isActive ? 'text-primary' : 'text-foreground')}>
                          {item.label}
                        </p>
                        {item.desc && (
                          <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
                        )}
                      </div>
                      {isActive && (
                        <CornerDownLeft className="h-3.5 w-3.5 text-primary shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/60 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <ArrowUp className="h-3 w-3" />
              <ArrowDown className="h-3 w-3" />
              navigate
            </span>
            <span className="flex items-center gap-1">
              <CornerDownLeft className="h-3 w-3" />
              select
            </span>
          </div>
          <span>{flatList.length} results</span>
        </div>
      </div>
    </div>
  );
}
