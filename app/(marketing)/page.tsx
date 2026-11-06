'use client';

/**
 * ELSxGlobal — Home Page
 * Design tier: Stripe · Vercel · Palantir · BlackRock
 * Rich sections with purpose. Depth without noise.
 */

import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, ArrowUpRight,
  Cpu, GitBranch, BarChart3, Briefcase,
  BrainCircuit, Shield, Globe, Zap, Database, Server, Network,
  Building2, Heart, Factory, ShoppingCart, Landmark,
  Star, Users, TrendingUp, Activity, CheckCircle2, Lock,
} from 'lucide-react';
import { ElsxHero } from '@/components/home/ElsxHero';

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};

const stagger = (delay = 0) => ({
  hidden: {},
  show:   { transition: { staggerChildren: 0.09, delayChildren: delay } },
});

/* ── Count-up ──────────────────────────────────────────────────── */
function useCountUp(target: number, duration = 2000, decimals = 0) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  useEffect(() => {
    if (!inView) return;
    let s = 0;
    const inc = target / (duration / 16);
    const t = setInterval(() => {
      s += inc;
      if (s >= target) { setCount(target); clearInterval(t); }
      else setCount(parseFloat(s.toFixed(decimals)));
    }, 16);
    return () => clearInterval(t);
  }, [inView, target, duration, decimals]);
  return { count, ref };
}

/* ── Shared section label ──────────────────────────────────────── */
function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-text-muted-v4 mb-5">
      {children}
    </p>
  );
}

/* ═══════════════════════════════════════════════
   METRIC BAR
═══════════════════════════════════════════════ */

/* Each counter must be its own component — hooks cannot be called inside .map() */
function MetricItem({ target, suffix, prefix, dec, label }: {
  target: number; suffix: string; prefix: string; dec: number; label: string;
}) {
  const { count, ref } = useCountUp(target, 2000, dec);
  return (
    <div className="flex flex-col py-10 px-4 lg:px-10 first:pl-0 last:pr-0">
      <span
        ref={ref}
        className="text-[2.75rem] sm:text-[3.25rem] font-bold tracking-[-0.04em] leading-none text-text-primary-v4 mb-2 tabular-nums"
      >
        {prefix}{count}{suffix}
      </span>
      <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-text-muted-v4">
        {label}
      </span>
    </div>
  );
}

function MetricBar() {
  const items = [
    { target: 340,   suffix: '+',  prefix: '',  dec: 0, label: 'Enterprise Clients' },
    { target: 4.2,   suffix: 'B+', prefix: '$', dec: 1, label: 'Revenue Enabled' },
    { target: 99.99, suffix: '%',  prefix: '',  dec: 2, label: 'Platform Uptime' },
    { target: 40,    suffix: '+',  prefix: '',  dec: 0, label: 'Countries Served' },
  ];
  return (
    <section className="border-y border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-hairline">
          {items.map((item) => (
            <MetricItem key={item.label} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   CLIENT MARQUEE
═══════════════════════════════════════════════ */
const MARQUEE_ITEMS = [
  'Fortune 500 Manufacturing', 'BFSI Conglomerate', 'Healthcare Network',
  'E-Commerce Group', 'Government Enterprise', 'Logistics Leader',
  'EdTech Unicorn', 'Fintech Scale-up', 'Pharma Major',
  'Energy PSU', 'SaaS Unicorn', 'Real Estate Group',
];

function ClientMarquee() {
  return (
    <section className="relative py-5 border-b border-hairline overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html:
        '@keyframes mq{from{transform:translateX(0)}to{transform:translateX(-50%)}}' +
        '.mq{display:flex;width:max-content;animation:mq 44s linear infinite;}' +
        '.mq:hover{animation-play-state:paused}'
      }} />
      <div className="absolute inset-y-0 left-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right,hsl(var(--v4-ink)),transparent)' }} />
      <div className="absolute inset-y-0 right-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left,hsl(var(--v4-ink)),transparent)' }} />
      <div className="mq">
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((tag, i) => (
          <div key={i} className="flex items-center shrink-0">
            <span className="text-[11px] font-semibold text-text-muted-v4 whitespace-nowrap tracking-[0.08em] uppercase px-8 py-2.5">
              {tag}
            </span>
            <span className="w-px h-3 bg-hairline shrink-0" />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   ECOSYSTEM — Bento grid
═══════════════════════════════════════════════ */
const DIVISIONS = [
  {
    name: 'ELSxTech',
    sub:  'Intelligence-First Engineering',
    desc: 'Custom software, AI/ML, cloud-native architecture, and zero-trust cybersecurity engineered to enterprise scale. 200+ production deployments without a single data breach.',
    icon: Cpu,
    accent: '#60a5fa',   // sky-400
    chips: ['AI / ML', 'Cloud-Native', 'Zero-Trust', 'Microservices'],
    metrics: [{ v: '200+', l: 'Deployments' }, { v: '99.98%', l: 'SLA Compliance' }],
    href: '/services',
    wide: true,
  },
  {
    name: 'ELSxBPO',
    sub:  'Process Automation at Scale',
    desc: 'RPA, document AI, and 24/7 workflow orchestration. Turn operational costs into strategic advantage.',
    icon: GitBranch,
    accent: '#a78bfa',   // violet-400
    chips: ['RPA', 'Document AI'],
    metrics: [{ v: '68%', l: 'Cost Reduction' }],
    href: '/services',
    wide: false,
  },
  {
    name: 'ELSxKPO',
    sub:  'Decision Intelligence',
    desc: 'Predictive analytics, market research, and financial modeling that transforms data into decisions.',
    icon: BarChart3,
    accent: '#34d399',   // emerald-400
    chips: ['Analytics', 'Modeling'],
    metrics: [{ v: '92%', l: 'Forecast Accuracy' }],
    href: '/services',
    wide: false,
  },
  {
    name: 'ELSxConsultancy',
    sub:  'Strategic Transformation',
    desc: 'ESG frameworks, Lean Six Sigma, M&A advisory, and digital transformation roadmaps for C-suite-level systemic change.',
    icon: Briefcase,
    accent: '#fbbf24',   // amber-400
    chips: ['ESG', 'M&A Advisory', 'Lean Six Sigma'],
    metrics: [{ v: '340+', l: 'Projects' }, { v: '18', l: 'Industries' }],
    href: '/services',
    wide: true,
  },
];

function EcosystemSection() {
  return (
    <section className="py-24 sm:py-32 border-b border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={stagger()}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.08 }}
          className="mb-14"
        >
          <motion.div variants={fadeUp}><SectionLabel>The Platform</SectionLabel></motion.div>
          <motion.h2
            variants={fadeUp}
            className="text-4xl sm:text-5xl font-bold tracking-[-0.032em] leading-[1.06] text-text-primary-v4 max-w-xl"
          >
            Four divisions.
            <br />
            <span className="text-text-secondary-v4 font-semibold">
              One integrated platform.
            </span>
          </motion.h2>
        </motion.div>

        {/* Bento grid — same visual language as Stripe's product grid */}
        <motion.div
          variants={stagger(0.06)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {DIVISIONS.map((d) => (
            <motion.div
              key={d.name}
              variants={fadeUp}
              className={d.wide ? 'lg:col-span-2' : ''}
            >
              <Link href={d.href} className="group block h-full">
                <div className="relative h-full rounded-2xl border border-hairline bg-ink-surface overflow-hidden transition-colors hover:bg-ink-surface-2 p-7 flex flex-col">
                  {/* Hover top accent line */}
                  <div
                    className="absolute top-0 inset-x-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(90deg, transparent, ${d.accent}60, transparent)` }}
                  />

                  {/* Icon */}
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-hairline mb-6"
                    style={{ background: `${d.accent}10`, borderColor: `${d.accent}25` }}
                  >
                    <d.icon className="h-4.5 w-4.5" style={{ color: d.accent }} />
                  </div>

                  {/* Name + tag */}
                  <h3 className="text-base font-bold text-text-primary-v4 mb-1">{d.name}</h3>
                  <p className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-4" style={{ color: `${d.accent}99` }}>
                    {d.sub}
                  </p>
                  <p className="text-sm text-text-secondary-v4 leading-relaxed mb-6">{d.desc}</p>

                  {/* Capability chips */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {d.chips.map((c) => (
                      <span
                        key={c}
                        className="px-2.5 py-1 rounded text-[11px] font-semibold border border-hairline text-text-muted-v4"
                      >
                        {c}
                      </span>
                    ))}
                  </div>

                  {/* Metrics */}
                  <div className="mt-auto pt-5 border-t border-hairline flex items-center justify-between">
                    <div className="flex gap-7">
                      {d.metrics.map((m) => (
                        <div key={m.l}>
                          <p className="text-lg font-bold text-text-primary-v4">{m.v}</p>
                          <p className="text-[11px] text-text-muted-v4">{m.l}</p>
                        </div>
                      ))}
                    </div>
                    <ArrowUpRight
                      className="w-4 h-4 text-text-muted-v4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                    />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   AI SECTION
═══════════════════════════════════════════════ */
const LOG_LINES = [
  { t: 'cmd', v: '> Initialising ELSx Intelligence Engine v2.5...' },
  { t: 'ok',  v: '✓ 340 enterprise data streams connected' },
  { t: 'cmd', v: '> Running supply-chain anomaly detection...' },
  { t: 'ok',  v: '✓ 47 anomalies resolved — ₹2.3Cr saved' },
  { t: 'cmd', v: '> Generating market-expansion strategy...' },
  { t: 'ok',  v: '✓ 3 high-signal opportunities identified' },
  { t: 'cmd', v: '> Dispatching Action Gateway intent...' },
  { t: 'ok',  v: '✓ Tier-1 approved · latency 4ms · HMAC verified' },
  { t: 'cmd', v: '> Updating forecast model (live signals)...' },
  { t: 'ok',  v: '✓ Accuracy: 94.2% (+1.8% vs baseline)' },
];

const AI_FEATURES = [
  { icon: TrendingUp,   label: 'Predictive Business Intelligence', desc: 'Forecast market shifts 14–90 days ahead with 92%+ accuracy.' },
  { icon: Activity,     label: 'Real-Time Anomaly Detection',      desc: 'Catch fraud, outages, and supply-chain risks in under 200ms.' },
  { icon: Network,      label: 'Multi-System Orchestration',       desc: 'Unify 340+ enterprise data streams into one intelligence layer.' },
  { icon: CheckCircle2, label: 'Action Gateway Safety Rail',       desc: 'Every AI action is risk-tiered, HMAC-signed, and fully audited.' },
];

function AISection() {
  const [logs, setLogs] = useState<typeof LOG_LINES>([]);
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      setLogs(p => {
        const next = [...p, LOG_LINES[i % LOG_LINES.length]];
        return next.length > 7 ? next.slice(-7) : next;
      });
      i++;
    }, 820);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="py-24 sm:py-32 border-b border-hairline bg-ink-surface/40 dark:bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 xl:gap-24 items-start">

          {/* Left */}
          <motion.div
            variants={stagger()}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
          >
            <motion.div variants={fadeUp}><SectionLabel>Intelligence Layer</SectionLabel></motion.div>
            <motion.h2
              variants={fadeUp}
              className="text-4xl sm:text-5xl font-bold tracking-[-0.032em] leading-[1.06] mb-6 text-text-primary-v4"
            >
              AI that doesn&apos;t just
              <br />
              <span className="text-text-secondary-v4 font-semibold">analyze — it acts.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-base text-text-secondary-v4 leading-relaxed mb-10">
              Every ELSxGlobal division runs on a shared intelligence core that learns,
              predicts, and executes — with the Action Gateway ensuring every decision
              is safe, auditable, and reversible.
            </motion.p>
            <motion.ul variants={stagger(0.05)} className="space-y-0 mb-10">
              {AI_FEATURES.map((f) => (
                <motion.li
                  key={f.label}
                  variants={fadeUp}
                  className="flex items-start gap-4 py-4 border-b border-hairline last:border-0"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-hairline bg-ink-surface mt-0.5">
                    <f.icon className="h-4 w-4 text-text-secondary-v4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary-v4 mb-0.5">{f.label}</p>
                    <p className="text-xs text-text-muted-v4 leading-relaxed">{f.desc}</p>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
            <motion.div variants={fadeUp}>
              <Link href="/ai-solutions" className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary-v4 hover:text-text-primary-v4 transition-colors group">
                Explore AI Solutions
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Right — terminal */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div className="rounded-xl border border-slate-800/80 overflow-hidden" style={{ background: '#0d1117' }}>
              {/* Titlebar */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-800/60" style={{ background: '#161b22' }}>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <span className="ml-3 text-[11px] text-slate-500 font-mono tracking-wide">
                  elsx-intelligence · engine v2.5.0
                </span>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-400 font-mono font-semibold tracking-widest uppercase">Live</span>
                </div>
              </div>

              {/* Log body */}
              <div className="p-5 h-[240px] overflow-hidden flex flex-col justify-end gap-1.5 font-mono text-[12px]">
                <AnimatePresence initial={false}>
                  {logs.map((line, i) => (
                    <motion.div
                      key={`${i}-${line.v.slice(0, 12)}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={line.t === 'ok' ? 'text-emerald-400' : 'text-slate-400'}
                    >
                      {line.v}
                    </motion.div>
                  ))}
                </AnimatePresence>
                <motion.div
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 1.1 }}
                  className="w-2 h-3.5 bg-slate-600 inline-block"
                />
              </div>

              {/* Footer */}
              <div className="px-5 py-2.5 border-t border-slate-800/60 flex items-center gap-6 text-[11px] font-mono text-slate-500" style={{ background: '#161b22' }}>
                <span>340 streams</span>
                <span>4ms latency</span>
                <span>Tier-1 gateway</span>
                <span className="ml-auto">engine.v2.5.0</span>
              </div>
            </div>

            {/* Stats below terminal */}
            <div className="grid grid-cols-3 gap-px bg-hairline border border-hairline rounded-xl overflow-hidden mt-4">
              {[
                { v: '14–90d', l: 'Forecast Horizon' },
                { v: '94.2%', l: 'Model Accuracy' },
                { v: '<200ms', l: 'Anomaly Response' },
              ].map((s) => (
                <div key={s.l} className="bg-ink-surface px-5 py-4">
                  <p className="text-base font-bold text-text-primary-v4 tracking-tight">{s.v}</p>
                  <p className="text-[11px] text-text-muted-v4 mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   VAULTHOST
═══════════════════════════════════════════════ */
const VAULT = [
  { icon: Zap,          title: 'VaultWorkers',   desc: 'Edge compute in <5ms · 300+ PoPs',          href: '/vaulthost/workers',    accent: '#60a5fa' },
  { icon: Database,     title: 'VaultR2',        desc: 'Zero-egress S3 · 11-nines durability',      href: '/vaulthost/storage',    accent: '#34d399' },
  { icon: BrainCircuit, title: 'VaultAI',        desc: '15+ AI providers · 60% cost reduction',     href: '/vaulthost/ai-gateway', accent: '#a78bfa' },
  { icon: Network,      title: 'VaultDNS',       desc: '<11ms anycast · DNSSEC · 100% SLA',         href: '/vaulthost/dns',        accent: '#fbbf24' },
  { icon: Server,       title: 'VaultD1',        desc: 'Serverless SQLite at the global edge',      href: '/vaulthost/database',   accent: '#4ade80' },
  { icon: Lock,         title: 'Zero Trust',     desc: 'Identity-aware access · replace VPN',       href: '/vaulthost/zero-trust', accent: '#f87171' },
];

function VaultHostSection() {
  return (
    <section className="py-24 sm:py-32 border-b border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={stagger()}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.08 }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-14"
        >
          <div>
            <motion.div variants={fadeUp}><SectionLabel>VaultHost — Cloud & Edge</SectionLabel></motion.div>
            <motion.h2
              variants={fadeUp}
              className="text-4xl sm:text-5xl font-bold tracking-[-0.032em] leading-[1.06] text-text-primary-v4"
            >
              The infrastructure
              <br />
              <span className="text-text-secondary-v4 font-semibold">that never sleeps.</span>
            </motion.h2>
          </div>
          <motion.div variants={fadeUp} className="flex flex-wrap gap-3 lg:shrink-0">
            <Link href="/vaulthost" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-btn text-sm font-semibold v4-btn-primary">
              Explore 30+ Products <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/vaulthost/compare" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-btn text-sm font-semibold v4-btn-secondary">
              Compare vs Cloudflare & AWS
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          variants={stagger(0.05)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {VAULT.map((p) => (
            <motion.div key={p.title} variants={fadeUp}>
              <Link href={p.href} className="group block h-full">
                <div className="relative h-full rounded-2xl border border-hairline bg-ink-surface hover:bg-ink-surface-2 transition-colors overflow-hidden p-6">
                  <div
                    className="absolute top-0 inset-x-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(90deg, transparent, ${p.accent}50, transparent)` }}
                  />
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-hairline mb-5"
                    style={{ background: `${p.accent}10`, borderColor: `${p.accent}22` }}
                  >
                    <p.icon className="h-4 w-4" style={{ color: p.accent }} />
                  </div>
                  <h3 className="text-sm font-bold text-text-primary-v4 mb-1.5">{p.title}</h3>
                  <p className="text-xs text-text-muted-v4 leading-relaxed">{p.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   INDUSTRIES
═══════════════════════════════════════════════ */
const INDUSTRIES = [
  { name: 'BFSI & Fintech',           icon: Building2,    stat: '₹2,400Cr+ processed',    desc: 'Core banking, payments, fraud detection, KYC/AML',   href: '/industries/fintech-banking',       accent: '#60a5fa' },
  { name: 'Healthcare & Pharma',      icon: Heart,        stat: '40% wait-time reduction', desc: 'HIPAA/ABDM EHR, telemedicine, clinical AI',          href: '/industries/healthcare-pharma',     accent: '#34d399' },
  { name: 'Manufacturing & IoT',      icon: Factory,      stat: '35% OEE improvement',     desc: 'Industry 4.0, predictive maintenance, digital twin',  href: '/industries/manufacturing-iot',     accent: '#fbbf24' },
  { name: 'E-Commerce & Retail',      icon: ShoppingCart, stat: '340% conversion lift',    desc: 'Headless commerce, AI personalization, omnichannel',  href: '/industries/e-commerce-retail',     accent: '#a78bfa' },
  { name: 'Government & PSU',         icon: Landmark,     stat: '200+ GovTech projects',   desc: 'E-governance, citizen portals, compliance automation', href: '/industries',                       accent: '#4ade80' },
  { name: 'Logistics & Supply Chain', icon: Globe,        stat: '28% cost reduction',      desc: 'WMS, TMS, route optimization, vendor portals',        href: '/industries/logistics-supply-chain', accent: '#f87171' },
];

function IndustriesSection() {
  return (
    <section className="py-24 sm:py-32 border-b border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={stagger()}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.08 }}
          className="mb-14"
        >
          <motion.div variants={fadeUp}><SectionLabel>Industries</SectionLabel></motion.div>
          <motion.h2
            variants={fadeUp}
            className="text-4xl sm:text-5xl font-bold tracking-[-0.032em] leading-[1.06] text-text-primary-v4"
          >
            Built for the
            <br />
            <span className="text-text-secondary-v4 font-semibold">hardest industries.</span>
          </motion.h2>
        </motion.div>

        <motion.div
          variants={stagger(0.05)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {INDUSTRIES.map((ind) => (
            <motion.div key={ind.name} variants={fadeUp}>
              <Link href={ind.href} className="group block h-full">
                <div className="relative h-full rounded-2xl border border-hairline bg-ink-surface hover:bg-ink-surface-2 transition-colors overflow-hidden p-6 flex flex-col">
                  <div
                    className="absolute top-0 inset-x-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(90deg, transparent, ${ind.accent}50, transparent)` }}
                  />
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-hairline mb-5"
                    style={{ background: `${ind.accent}10`, borderColor: `${ind.accent}22` }}
                  >
                    <ind.icon className="h-4.5 w-4.5" style={{ color: ind.accent }} />
                  </div>
                  <h3 className="text-sm font-bold text-text-primary-v4 mb-2">{ind.name}</h3>
                  <p className="text-xs text-text-muted-v4 leading-relaxed flex-1">{ind.desc}</p>
                  <div className="mt-5 pt-4 border-t border-hairline flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-secondary-v4">{ind.stat}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-text-muted-v4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   SOCIAL PROOF
═══════════════════════════════════════════════ */
const TESTIMONIALS = [
  {
    quote: 'ELSxGlobal reduced our operational costs by 64% while improving SLA compliance to 99.98%. They are not a vendor — they are a capability multiplier.',
    author: 'Chief Technology Officer',
    company: 'Fortune 500 Logistics Group',
  },
  {
    quote: 'The AI Intelligence Layer gave us 14-day demand forecasts with 93% accuracy. Our inventory write-offs dropped by ₹18Cr in the first year alone.',
    author: 'VP Operations',
    company: 'BFSI Conglomerate',
  },
  {
    quote: 'VaultHost cut our infrastructure bill by 41% versus AWS. Zero cold starts, true S3-compatible storage with no egress surprises. Genuinely better.',
    author: 'Head of Engineering',
    company: 'SaaS Unicorn',
  },
];

function SocialProof() {
  return (
    <section className="py-24 sm:py-32 border-b border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={stagger()}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.08 }}
          className="mb-14"
        >
          <motion.div variants={fadeUp}><SectionLabel>Client Results</SectionLabel></motion.div>
          <motion.h2
            variants={fadeUp}
            className="text-4xl sm:text-5xl font-bold tracking-[-0.032em] leading-[1.06] text-text-primary-v4"
          >
            Measured outcomes.
            <br />
            <span className="text-text-secondary-v4 font-semibold">Not promises.</span>
          </motion.h2>
        </motion.div>

        <motion.div
          variants={stagger(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid sm:grid-cols-3 gap-4"
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={i} variants={fadeUp}>
              <div className="h-full rounded-2xl border border-hairline bg-ink-surface p-7 flex flex-col">
                <div className="flex gap-0.5 mb-5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-amber-400/80 text-amber-400/80" />
                  ))}
                </div>
                <p className="text-sm text-text-secondary-v4 leading-relaxed flex-1 mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="border-t border-hairline pt-5">
                  <p className="text-xs font-semibold text-text-primary-v4">{t.author}</p>
                  <p className="text-[11px] text-text-muted-v4 mt-0.5">{t.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   FINAL CTA
═══════════════════════════════════════════════ */
function FinalCTA() {
  return (
    <section className="py-28 sm:py-36">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          {/* Big CTA block — Stripe style */}
          <div className="relative rounded-2xl border border-hairline overflow-hidden bg-ink-surface">
            {/* Subtle gradient top band */}
            <div
              className="absolute top-0 inset-x-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent 10%, hsl(var(--v4-signal)/0.35) 50%, transparent 90%)' }}
            />
            <div className="px-10 sm:px-16 lg:px-20 py-16 sm:py-20 lg:py-24">
              <div className="max-w-2xl">
                <SectionLabel>Ready to begin</SectionLabel>
                <h2 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-[-0.035em] leading-[1.05] text-text-primary-v4 mb-5">
                  Build what matters.
                  <br />
                  <span className="text-text-secondary-v4 font-semibold">Start today.</span>
                </h2>
                <p className="text-base sm:text-lg text-text-secondary-v4 leading-relaxed mb-10">
                  Join 340+ enterprises who replaced fragmented vendors with the ELSxGlobal
                  unified ecosystem. An initial briefing takes under 30 minutes.
                </p>
                <div className="flex flex-wrap gap-4 mb-7">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-btn text-sm font-semibold v4-btn-primary"
                  >
                    Schedule Executive Briefing <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/vaulthost"
                    className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-btn text-sm font-semibold v4-btn-secondary"
                  >
                    Deploy on VaultHost Free
                  </Link>
                </div>
                <p className="text-xs text-text-muted-v4">
                  No commitment · No credit card · NDA available on request
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   PAGE ROOT
═══════════════════════════════════════════════ */
export default function ElsxHomePage() {
  return (
    <div className="relative bg-ink text-text-primary-v4">
      <ElsxHero />
      <MetricBar />
      <ClientMarquee />
      <EcosystemSection />
      <AISection />
      <VaultHostSection />
      <IndustriesSection />
      <SocialProof />
      <FinalCTA />
    </div>
  );
}
