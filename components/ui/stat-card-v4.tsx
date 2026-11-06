'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * V4 Stat Card — flat panel, monospace number, no glow.
 * Count-up animation on scroll-into-view, respects reduced motion.
 * Zero-runtime-dependency: uses native IntersectionObserver, no framer-motion.
 */
interface StatCardV4Props {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  /** Pre-rendered icon element (not a component ref) to avoid RSC serialization issues */
  iconElement?: React.ReactNode;
  decimals?: number;
  className?: string;
}

export function StatCardV4({
  value,
  suffix = '',
  prefix = '',
  label,
  iconElement,
  decimals = 0,
  className,
}: StatCardV4Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [display, setDisplay] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { rootMargin: '-80px', threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setDisplay(value);
      return;
    }
    const duration = 1800;
    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, value, reduced]);

  return (
    <div ref={ref} className={cn('v4-panel p-5', className)}>
      {iconElement && (
        <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-chip border border-hairline bg-ink-surface-2">
          {iconElement}
        </div>
      )}
      <p className="v4-readout-primary text-2xl font-medium tabular-nums">
        {prefix}
        {display.toFixed(decimals)}
        {suffix}
      </p>
      <p className="mt-1 text-sm text-text-secondary-v4">{label}</p>
    </div>
  );
}
