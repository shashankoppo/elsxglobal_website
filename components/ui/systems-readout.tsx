'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SystemsReadoutProps {
  lines: string[];
  holdMs?: number;
  className?: string;
}

/**
 * V4 Signature Element — Live Systems Readout
 * A persistently-updating monospace status strip.
 * Cycles through system-state lines one at a time.
 * Respects prefers-reduced-motion by holding on the first line.
 */
export function SystemsReadout({ lines, holdMs = 3000, className }: SystemsReadoutProps) {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [typing, setTyping] = useState(true);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || lines.length === 0) {
      setDisplayed(lines[0] || '');
      setTyping(false);
      return;
    }

    const current = lines[idx];

    if (typing) {
      if (displayed.length < current.length) {
        const timer = setTimeout(() => {
          setDisplayed(current.slice(0, displayed.length + 1));
        }, 30);
        return () => clearTimeout(timer);
      } else {
        setTyping(false);
        const timer = setTimeout(() => setTyping(true), holdMs);
        return () => clearTimeout(timer);
      }
    } else {
      if (displayed.length > 0) {
        const timer = setTimeout(() => {
          setDisplayed(current.slice(0, displayed.length - 1));
        }, 15);
        return () => clearTimeout(timer);
      } else {
        setIdx((prev) => (prev + 1) % lines.length);
        setTyping(true);
      }
    }
  }, [displayed, typing, idx, lines, holdMs, reduced]);

  return (
    <div
      className={cn(
        'flex items-center h-8 px-4 bg-ink-surface-2 border-b border-hairline overflow-hidden',
        className
      )}
    >
      <span className="v4-live-dot" />
      <span className="v4-readout text-xs whitespace-nowrap">{displayed}</span>
    </div>
  );
}
