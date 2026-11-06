'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { SystemsReadout } from '@/components/ui/systems-readout';

const READOUT_LINES = [
  'WAF STATUS: ACTIVE   ·   THREAT ANALYSIS: <2ms   ·   BLOCK RATE: 99.97%   ·   ZERO BREACHES (YTD)',
  'DDOS MITIGATION: ARMED   ·   BOT SCORING: ACTIVE   ·   TLS 1.3: EVERYWHERE   ·   HSTS: PRELOADED',
];

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
];

function randomIp() {
  return `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.x`;
}

function currentTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

export function ThreatMapV4() {
  const [threats, setThreats] = useState<ThreatEvent[]>([]);
  const [logEntries, setLogEntries] = useState<ThreatEvent[]>([]);
  const idRef = useRef(0);
  const reduced = useReducedMotion();

  const generateThreat = useCallback((): ThreatEvent => {
    const t = THREAT_TYPES[Math.floor(Math.random() * THREAT_TYPES.length)];
    idRef.current += 1;
    return { id: idRef.current, time: currentTime(), type: t.type, ip: randomIp(), action: t.action, x: 10 + Math.random() * 80, y: 10 + Math.random() * 80 };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const newThreat = generateThreat();
      setThreats((prev) => [...prev.slice(-8), newThreat]);
      setLogEntries((prev) => [newThreat, ...prev].slice(0, 8));
    }, 800);
    return () => clearInterval(interval);
  }, [generateThreat]);

  return (
    <div className="v4-panel overflow-hidden">
      <SystemsReadout lines={READOUT_LINES} className="rounded-none" />

      <div className="grid lg:grid-cols-[1fr_280px] gap-0">
        {/* Map */}
        <div className="relative h-[360px] overflow-hidden border-r border-hairline bg-ink-surface-2">
          {/* Simplified world map */}
          <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 60" preserveAspectRatio="xMidYMid meet">
            <path d="M10,20 Q15,15 25,18 L30,25 L28,35 L20,40 L15,35 Z" fill="hsl(var(--v4-hairline))" />
            <path d="M35,15 Q45,12 55,15 L60,25 L55,35 L45,38 L40,30 Z" fill="hsl(var(--v4-hairline))" />
            <path d="M60,18 Q70,15 80,20 L85,30 L75,35 L65,30 Z" fill="hsl(var(--v4-hairline))" />
            <path d="M20,45 Q30,42 40,45 L38,52 L25,52 Z" fill="hsl(var(--v4-hairline))" />
            <path d="M70,40 Q78,38 85,42 L82,48 L72,48 Z" fill="hsl(var(--v4-hairline))" />
          </svg>

          {/* Center shield */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="relative">
              {!reduced && (
                <motion.div
                  className="absolute inset-0 rounded-full border border-signal/30"
                  animate={{ scale: [1, 2], opacity: [0.8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                />
              )}
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-signal/30 bg-signal/10">
                <Shield className="h-6 w-6 text-signal" />
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
                  <div className="h-2 w-2 rounded-full bg-bad" />
                  {!reduced && (
                    <motion.div
                      className="absolute inset-0 rounded-full border border-bad"
                      animate={{ scale: [1, 3], opacity: [1, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="absolute bottom-3 left-3 v4-readout text-[10px] text-text-muted-v4">
            38 EDGE POPS · 160ms AVG GLOBAL LATENCY
          </div>
        </div>

        {/* Threat log */}
        <div className="p-3 h-[360px] overflow-hidden flex flex-col bg-ink-surface">
          <h4 className="v4-readout text-[10px] uppercase tracking-widest text-text-secondary-v4 mb-2 px-1">
            Live Threat Log
          </h4>
          <div className="flex-1 overflow-y-auto space-y-1.5">
            <AnimatePresence initial={false}>
              {logEntries.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="v4-readout text-[10px] p-2 rounded-chip border border-hairline bg-ink-surface-2"
                >
                  <span className="text-text-muted-v4">[{t.time}]</span>{' '}
                  <span className={t.action === 'FLAGGED' ? 'text-warn' : 'text-bad'}>{t.type}</span>{' '}
                  <span className="text-text-muted-v4">{t.ip}</span>{' '}
                  <span className={t.action === 'FLAGGED' ? 'text-warn' : 'text-good'}>{t.action}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
