'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * V4 Terminal — flat panel, monospace, no rounded-2xl.
 * Types out lines one-by-one. Blinking cursor. Status colors.
 */
interface TerminalV4Props {
  lines: string[];
  speed?: number;
  className?: string;
  title?: string;
}

export function TerminalV4({
  lines,
  speed = 70,
  className,
  title = 'elsx@vaulthost: ~',
}: TerminalV4Props) {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState('');
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [done, setDone] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setVisibleLines(lines);
      setDone(true);
      return;
    }
    if (lineIdx >= lines.length) {
      setDone(true);
      return;
    }
    const line = lines[lineIdx];
    if (charIdx <= line.length) {
      const timer = setTimeout(() => {
        setCurrentLine(line.slice(0, charIdx));
        setCharIdx(charIdx + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setVisibleLines((prev) => [...prev, line]);
        setCurrentLine('');
        setLineIdx(lineIdx + 1);
        setCharIdx(0);
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [charIdx, lineIdx, lines, speed, reduced]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleLines, currentLine]);

  return (
    <div className={cn('v4-panel overflow-hidden', className)}>
      <div className="flex items-center gap-2 px-4 h-9 border-b border-hairline bg-ink-surface-2">
        <span className="v4-readout text-[10px] text-text-muted-v4">{title}</span>
      </div>
      <div
        ref={containerRef}
        className="p-4 font-mono text-xs leading-relaxed h-56 overflow-y-auto"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {visibleLines.map((line, i) => (
          <TerminalLineV4 key={i} line={line} />
        ))}
        {!done && (
          <div>
            <TerminalLineV4 line={currentLine} />
            <span className="inline-block w-1.5 h-3 bg-signal animate-pulse ml-0.5 align-middle" />
          </div>
        )}
      </div>
    </div>
  );
}

function TerminalLineV4({ line }: { line: string }) {
  if (line.startsWith('✓')) return <div className="text-good">{line}</div>;
  if (line.startsWith('▶')) return <div className="text-signal font-medium">{line}</div>;
  if (line.startsWith('>')) return <div className="text-signal">{line}</div>;
  if (line.startsWith('🔴') || line.startsWith('⚠')) return <div className="text-bad">{line}</div>;
  if (line.startsWith('🟡')) return <div className="text-warn">{line}</div>;
  return <div className="text-text-secondary-v4">{line}</div>;
}
