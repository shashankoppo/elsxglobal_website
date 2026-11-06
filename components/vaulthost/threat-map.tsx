'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Shield } from 'lucide-react';

interface ThreatEvent {
  id: number;
  time: string;
  type: string;
  ip: string;
  action: string;
  x: number;
  y: number;
}

const THREAT_TYPES = [
  { type: 'SQLi Attack', action: 'BLOCKED' },
  { type: 'DDoS Flood', action: 'MITIGATED' },
  { type: 'XSS Probe', action: 'BLOCKED' },
  { type: 'Port Scan', action: 'FLAGGED' },
  { type: 'Brute Force', action: 'BLOCKED' },
  { type: 'Bot Crawl', action: 'BLOCKED' },
  { type: 'CSRF Attempt', action: 'BLOCKED' },
];

function randomIp() {
  return `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.x`;
}

function currentTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

export function ThreatMap() {
  const [threats, setThreats] = useState<ThreatEvent[]>([]);
  const [logEntries, setLogEntries] = useState<ThreatEvent[]>([]);
  const idRef = useRef(0);
  const reduced = useReducedMotion();

  const generateThreat = useCallback((): ThreatEvent => {
    const threatType = THREAT_TYPES[Math.floor(Math.random() * THREAT_TYPES.length)];
    idRef.current += 1;
    return {
      id: idRef.current,
      time: currentTime(),
      type: threatType.type,
      ip: randomIp(),
      action: threatType.action,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
    };
  }, []);

  useEffect(() => {
    const threatInterval = setInterval(() => {
      const newThreat = generateThreat();
      setThreats((prev) => [...prev.slice(-8), newThreat]);
      setLogEntries((prev) => [newThreat, ...prev].slice(0, 8));
    }, 800);
    return () => clearInterval(threatInterval);
  }, [generateThreat]);

  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-4">
      {/* Map */}
      <div className="relative rounded-2xl border border-border bg-card overflow-hidden h-[400px]">
        <div className="absolute inset-0 grid-pattern opacity-50" />

        {/* Simplified world map SVG */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 60" preserveAspectRatio="xMidYMid meet">
          <path d="M10,20 Q15,15 25,18 L30,25 L28,35 L20,40 L15,35 Z" fill="hsl(var(--border))" />
          <path d="M35,15 Q45,12 55,15 L60,25 L55,35 L45,38 L40,30 Z" fill="hsl(var(--border))" />
          <path d="M60,18 Q70,15 80,20 L85,30 L75,35 L65,30 Z" fill="hsl(var(--border))" />
          <path d="M20,45 Q30,42 40,45 L38,52 L25,52 Z" fill="hsl(var(--border))" />
          <path d="M70,40 Q78,38 85,42 L82,48 L72,48 Z" fill="hsl(var(--border))" />
        </svg>

        {/* Center shield */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-full border border-signal/30"
              animate={reduced ? {} : { scale: [1, 2], opacity: [0.8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
            />
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-signal/10 border border-signal/30 shadow-glow-blue">
              <Shield className="h-7 w-7 text-signal" />
            </div>
          </div>
        </div>

        {/* Threat dots */}
        <AnimatePresence>
          {threats.map((t) => (
            <motion.div
              key={t.id}
              className="absolute z-20"
              initial={{ left: `${t.x}%`, top: `${t.y}%`, scale: 0 }}
              animate={{ scale: [0, 1, 1], opacity: [1, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              style={{ transform: 'translate(-50%, -50%)' }}
            >
              <div className="relative">
                <div className="h-2.5 w-2.5 rounded-full bg-bad shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                <motion.div
                  className="absolute inset-0 rounded-full border border-bad"
                  animate={reduced ? {} : { scale: [1, 3], opacity: [1, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="absolute bottom-3 left-3 text-[10px] font-mono text-muted-foreground">
          38 Edge Points of Presence | 160ms avg global latency
        </div>
      </div>

      {/* Threat log */}
      <div className="rounded-2xl border border-border bg-card p-3 h-[400px] overflow-hidden flex flex-col">
        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2 px-1">
          Live Threat Log
        </h4>
        <div className="flex-1 overflow-y-auto terminal-scrollbar space-y-1.5">
          <AnimatePresence initial={false}>
            {logEntries.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[10px] font-mono p-2 rounded bg-muted/30 border border-border"
              >
                <span className="text-muted-foreground">[{t.time}]</span>{' '}
                <span className={t.action === 'FLAGGED' ? 'text-warn' : 'text-bad'}>
                  {t.type}
                </span>{' '}
                <span className="text-muted-foreground">{t.ip}</span>{' '}
                <span className={t.action === 'FLAGGED' ? 'text-warn' : 'text-good'}>
                  {t.action}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
