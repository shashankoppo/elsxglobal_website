'use client';

/**
 * ELSxGlobal Hero — Premium Enterprise Standard
 * Reference tier: Stripe · Vercel · Linear · Palantir
 *
 * Principles:
 *  - Visual richness earned through typography scale, not color noise
 *  - One accent color (signal), used surgically
 *  - Depth via layered surfaces, not glows
 *  - Interactivity that communicates authority, not gimmickry
 *  - Motion: purposeful fade/slide only — no bouncing, pulsing, aurora
 */

import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight, ArrowUpRight,
  Cpu, GitBranch, BarChart3, Briefcase,
  Shield, Globe, Zap, Lock, Activity,
  CheckCircle2,
} from 'lucide-react';

const EASE = [0.22, 1, 0.36, 1] as const;

/* ─── Industry data ─────────────────────────────────────────────── */
type Sector = 'bfsi' | 'healthcare' | 'manufacturing' | 'ecommerce' | 'govtech';

const SECTORS: Record<Sector, {
  label: string;
  stat: string;
  statSub: string;
  kpi1: string; kpi1l: string;
  kpi2: string; kpi2l: string;
  compliance: string;
}> = {
  bfsi: {
    label: 'BFSI & Banking',
    stat: '₹2,400Cr+',
    statSub: 'Daily settlement volume processed',
    kpi1: '<2ms', kpi1l: 'Fraud Telemetry',
    kpi2: '99.999%', kpi2l: 'Uptime SLA',
    compliance: 'PCI-DSS Level 1  ·  RBI Cyber Framework  ·  SOC 2 Type II',
  },
  healthcare: {
    label: 'Healthcare & Pharma',
    stat: '40%',
    statSub: 'Reduction in patient wait times',
    kpi1: '100%', kpi1l: 'Audit Traceability',
    kpi2: '0', kpi2l: 'Data Breaches',
    compliance: 'HIPAA  ·  ABDM  ·  HL7 FHIR  ·  ISO 27001',
  },
  manufacturing: {
    label: 'Manufacturing & IoT',
    stat: '35%',
    statSub: 'OEE operational improvement',
    kpi1: '99.8%', kpi1l: 'Defect Catch Rate',
    kpi2: '0', kpi2l: 'Unplanned Downtime',
    compliance: 'ISO 9001  ·  IEC 62443  ·  Zero-Downtime SLA',
  },
  ecommerce: {
    label: 'Retail & E-Commerce',
    stat: '340%',
    statSub: 'Average conversion rate improvement',
    kpi1: '<18ms', kpi1l: 'Global TTFB',
    kpi2: '11-nine', kpi2l: 'Storage Durability',
    compliance: 'SOC 2 Type II  ·  GDPR  ·  Unmetered DDoS',
  },
  govtech: {
    label: 'Government & PSU',
    stat: '10M+',
    statSub: 'Daily citizen transactions',
    kpi1: '200+', kpi1l: 'Portals Powered',
    kpi2: '100%', kpi2l: 'Data Sovereignty',
    compliance: 'MeitY Empanelled  ·  STQC Certified  ·  GIGW 3.0',
  },
};

/* ─── Platform division cards ─────────────────────────────────── */
const DIVISIONS = [
  { icon: Cpu,       name: 'ELSxTech',        color: 'text-sky-400',    stat: '200+ deployments' },
  { icon: GitBranch, name: 'ELSxBPO',         color: 'text-violet-400', stat: '68% cost reduction' },
  { icon: BarChart3, name: 'ELSxKPO',         color: 'text-emerald-400',stat: '92% forecast accuracy' },
  { icon: Briefcase, name: 'ELSxConsultancy', color: 'text-amber-400',  stat: '340+ projects' },
];

/* ─── Trust strip ────────────────────────────────────────────── */
const TRUST = [
  { icon: Shield,       label: 'ISO 27001' },
  { icon: CheckCircle2, label: 'SOC 2 Type II' },
  { icon: Globe,        label: '40+ Countries' },
  { icon: Zap,          label: '99.999% SLA' },
  { icon: Lock,         label: 'Post-Quantum TLS' },
  { icon: Activity,     label: '300+ Edge PoPs' },
];

/* ─── Main Component ─────────────────────────────────────────── */
export function ElsxHero() {
  const [sector, setSector] = useState<Sector>('bfsi');
  const data = SECTORS[sector];
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const rawY = useTransform(scrollY, [0, 600], [0, -60]);
  const bgY = useSpring(rawY, { stiffness: 60, damping: 20 });

  return (
    <section ref={sectionRef} className="relative overflow-hidden pt-10 sm:pt-14 pb-0">

      {/* ── Depth layer: very subtle gradient only, no blobs ── */}
      <motion.div
        style={{ y: bgY }}
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden
      >
        {/* Quiet radial from top — premium depth, not neon aurora */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 100% 70% at 50% -10%, hsl(var(--v4-signal)/0.06) 0%, transparent 65%)',
          }}
        />
        {/* Hairline grid — dark mode only */}
        <div className="absolute inset-0 hidden dark:block opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--v4-hairline)/0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--v4-hairline)/0.5) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 20%, transparent 80%)',
          }}
        />
      </motion.div>

      {/* ── Content ──────────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Eyebrow status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-10"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
            </span>
            <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-text-muted-v4">
              Live · 340+ enterprises operational
            </span>
          </div>
          <span className="hidden sm:block w-px h-3 bg-hairline" />
          <span className="text-[11px] text-text-muted-v4">
            Founded in India · Offices across 4 continents
          </span>
        </motion.div>

        {/* ── Two-column layout ─────────────────────────────── */}
        <div className="grid lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px] gap-12 xl:gap-20 items-start">

          {/* LEFT — Headline + Selector + CTAs */}
          <div>
            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.06 }}
              className="text-[clamp(2.1rem,5vw,5rem)] font-bold tracking-[-0.04em] leading-[1.08] text-text-primary-v4 mb-5"
            >
              Enterprise transformation
              <br />
              <span className="text-text-secondary-v4 font-semibold">
                at the highest standard.
              </span>
            </motion.h1>

            {/* Descriptor */}
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: EASE, delay: 0.14 }}
              className="text-base sm:text-[1.05rem] text-text-secondary-v4 leading-[1.75] mb-8 max-w-[55ch]"
            >
              ELSxGlobal delivers integrated technology, intelligence, and infrastructure
              through four world-class divisions — built for institutions that cannot
              afford to compromise on precision or scale.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.22 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-12"
            >
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-btn text-sm font-semibold v4-btn-primary w-full sm:w-auto"
              >
                Schedule Executive Briefing
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-btn text-sm font-semibold v4-btn-secondary group w-full sm:w-auto"
              >
                View All Services
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </motion.div>

            {/* Industry sector selector */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.30 }}
              className="border-t border-hairline pt-8"
            >
              <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-text-muted-v4 mb-4">
                Performance by sector
              </p>
              <div className="flex flex-wrap gap-2 mb-7">
                {(Object.keys(SECTORS) as Sector[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSector(key)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                      sector === key
                        ? 'bg-text-primary-v4 border-text-primary-v4 text-ink'
                        : 'border-hairline text-text-muted-v4 bg-transparent hover:border-hairline-2 hover:text-text-secondary-v4'
                    }`}
                  >
                    {SECTORS[key].label}
                  </button>
                ))}
              </div>

              {/* Animated sector stat readout */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={sector}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6 sm:gap-8 items-start">
                    {/* Big stat */}
                    <div>
                      <p className="text-4xl sm:text-5xl md:text-[3.25rem] font-bold tracking-[-0.04em] leading-none text-text-primary-v4">
                        {data.stat}
                      </p>
                      <p className="text-xs text-text-muted-v4 mt-1.5 max-w-[18ch] leading-snug">
                        {data.statSub}
                      </p>
                    </div>
                    {/* KPIs */}
                    <div className="border-t sm:border-t-0 sm:border-l border-hairline pt-4 sm:pt-0 sm:pl-8 flex flex-col gap-3">
                      <div className="flex gap-6">
                        <div>
                          <p className="text-base font-bold text-text-primary-v4">{data.kpi1}</p>
                          <p className="text-[11px] text-text-muted-v4">{data.kpi1l}</p>
                        </div>
                        <div>
                          <p className="text-base font-bold text-text-primary-v4">{data.kpi2}</p>
                          <p className="text-[11px] text-text-muted-v4">{data.kpi2l}</p>
                        </div>
                      </div>
                      <p className="text-[11px] text-text-muted-v4 leading-relaxed border-t border-hairline pt-3">
                        {data.compliance}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* RIGHT — Platform overview card */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, ease: EASE, delay: 0.18 }}
            className="hidden lg:block"
          >
            <div className="rounded-2xl border border-hairline bg-ink-surface overflow-hidden">
              {/* Card header */}
              <div className="px-6 py-4 border-b border-hairline flex items-center justify-between">
                <span className="text-xs font-semibold text-text-primary-v4 tracking-wide">Platform Overview</span>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
                  </span>
                  <span className="text-[10px] font-semibold text-signal tracking-widest uppercase">Live</span>
                </div>
              </div>

              {/* Division rows */}
              <div className="divide-y divide-hairline">
                {DIVISIONS.map((d, i) => (
                  <motion.div
                    key={d.name}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, ease: EASE, delay: 0.3 + i * 0.07 }}
                    className="flex items-center justify-between px-6 py-4 hover:bg-ink-surface-2 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline bg-ink">
                        <d.icon className={`h-3.5 w-3.5 ${d.color}`} />
                      </div>
                      <span className="text-sm font-semibold text-text-primary-v4">{d.name}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-text-muted-v4 group-hover:text-text-secondary-v4 transition-colors">
                      {d.stat}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Platform metrics strip */}
              <div className="border-t border-hairline grid grid-cols-2 divide-x divide-hairline">
                {[
                  { v: '$4.2B+', l: 'Revenue Enabled' },
                  { v: '99.999%', l: 'Platform Uptime' },
                ].map((m) => (
                  <div key={m.l} className="px-6 py-4">
                    <p className="text-lg font-bold text-text-primary-v4 tracking-tight">{m.v}</p>
                    <p className="text-[11px] text-text-muted-v4 mt-0.5">{m.l}</p>
                  </div>
                ))}
              </div>

              {/* CTA footer */}
              <div className="border-t border-hairline px-6 py-4">
                <Link
                  href="/vaulthost"
                  className="flex items-center justify-between text-xs font-semibold text-text-secondary-v4 hover:text-text-primary-v4 transition-colors group"
                >
                  <span>Explore VaultHost Infrastructure</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Social proof beneath card */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.55 }}
              className="mt-4 flex items-center gap-3 px-1"
            >
              <div className="flex -space-x-2">
                {['#14ffca', '#60a5fa', '#a78bfa', '#f59e0b', '#34d399'].map((c, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-ink-surface flex items-center justify-center text-[10px] font-bold"
                    style={{ background: `${c}20`, color: c }}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-text-muted-v4">
                <span className="font-semibold text-text-secondary-v4">340+ enterprises</span> trust ELSxGlobal globally
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ── Trust / credential strip ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.44 }}
        className="relative z-10 mt-14 border-t border-hairline overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 divide-hairline">
            {TRUST.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-6 py-3.5 sm:py-4 border-r-0 sm:border-r border-hairline last:border-r-0"
              >
                <Icon className="w-3.5 h-3.5 shrink-0 text-text-muted-v4" />
                <span className="text-[11px] font-semibold text-text-muted-v4 whitespace-nowrap tracking-wide">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

    </section>
  );
}
