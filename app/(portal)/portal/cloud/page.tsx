'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Zap, HardDrive, Database, Globe, Bot, Lock, ArrowRight,
  Plus, Activity, Shield, TrendingUp, CheckCircle2, Terminal,
  Cpu, ArrowUpRight, BarChart3, Layers, Sparkles
} from 'lucide-react';
import { PanelCard } from '@/components/ui/panel-card';

const CLOUD_SERVICES = [
  {
    id: 'workers',
    title: 'Edge Workers & Pages',
    desc: 'Deploy serverless V8 functions at 300+ Anycast PoPs with <5ms cold starts.',
    icon: Zap,
    href: '/portal/cloud/workers',
    activeCount: 3,
    metric: '1.42M req/24h',
    status: 'Healthy',
    badge: 'Compute'
  },
  {
    id: 'storage',
    title: 'VaultR2 Object Storage',
    desc: 'S3-compatible object storage with ZERO egress fees across the globe.',
    icon: HardDrive,
    href: '/portal/cloud/storage',
    activeCount: 2,
    metric: '48.6 GB stored',
    status: 'Healthy',
    badge: 'Storage'
  },
  {
    id: 'database',
    title: 'VaultD1 Edge SQL',
    desc: 'Serverless SQLite databases auto-replicated worldwide with single-digit read latency.',
    icon: Database,
    href: '/portal/cloud/database',
    activeCount: 1,
    metric: '280k queries/24h',
    status: 'Healthy',
    badge: 'Database'
  },
  {
    id: 'dns',
    title: 'Anycast DNS & Domains',
    desc: 'Authoritative DNS with <11ms resolution, DNSSEC, and automated Anycast DDoS defense.',
    icon: Globe,
    href: '/portal/cloud/dns',
    activeCount: 2,
    metric: '100% SLA Uptime',
    status: 'Healthy',
    badge: 'Network'
  },
  {
    id: 'ai',
    title: 'VaultAI Gateway',
    desc: 'Universal proxy for 15+ AI providers with semantic caching and cost controls.',
    icon: Bot,
    href: '/portal/cloud/ai',
    activeCount: 1,
    metric: '48.2% Cache Hits',
    status: 'Active',
    badge: 'AI Platform'
  },
  {
    id: 'tunnels',
    title: 'VaultTunnel Ingress',
    desc: 'Expose local services and private Kubernetes clusters securely without opening ports.',
    icon: Lock,
    href: '/portal/cloud/tunnels',
    activeCount: 2,
    metric: '2 Tunnels Online',
    status: 'Connected',
    badge: 'Security'
  },
];

export default function CloudOverviewPage() {
  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl v4-panel p-8 border-signal/20 bg-gradient-to-br from-ink-surface to-background/50">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Zap className="w-64 h-64 text-signal" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="v4-readout text-[11px] font-semibold uppercase tracking-widest text-signal px-2.5 py-0.5 rounded-full border border-signal/30 bg-signal/10">
                Cloud &amp; Edge Console
              </span>
              <span className="flex items-center gap-1.5 text-xs text-good font-mono bg-good/10 px-2 py-0.5 rounded-full border border-good/20">
                <span className="w-1.5 h-1.5 rounded-full bg-good animate-pulse" /> 300+ PoPs Operational
              </span>
            </div>
            <h1 className="text-3xl font-bold text-text-primary-v4">
              VaultHost Cloud Platform
            </h1>
            <p className="mt-2 text-sm text-text-secondary-v4 max-w-2xl leading-relaxed">
              Manage your global edge workers, zero-egress R2 buckets, distributed D1 databases, Anycast DNS, and AI Gateway from a unified command center.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/portal/cloud/workers"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-btn v4-btn-primary text-xs font-semibold shadow-glow"
            >
              <Plus className="h-4 w-4" /> Create Service
            </Link>
            <a
              href="/vaulthost"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-btn v4-btn-secondary text-xs font-medium"
            >
              Documentation <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Global Quick Telemetry Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Edge Invocations (24h)', value: '1,420,840', change: '+18.4%', icon: Zap, color: 'text-signal' },
          { label: 'R2 Bandwidth Saved', value: '4.82 TB', change: '$433 saved', icon: HardDrive, color: 'text-good' },
          { label: 'AI Gateway Cache Hit', value: '48.2%', change: '<2ms avg latency', icon: Sparkles, color: 'text-signal' },
          { label: 'Anycast Threat Mitigation', value: '14,210', change: '100% blocked', icon: Shield, color: 'text-text-primary-v4' },
        ].map((stat) => (
          <PanelCard key={stat.label} className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-muted-v4 font-medium">{stat.label}</span>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-text-primary-v4">{stat.value}</p>
              <p className="text-[11px] text-signal font-mono mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> {stat.change}
              </p>
            </div>
          </PanelCard>
        ))}
      </div>

      {/* Cloud Services Catalog Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary-v4">Active Cloud Facilities</h2>
          <span className="text-xs text-text-muted-v4 font-mono">6 services enabled on your tenant</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CLOUD_SERVICES.map((s) => {
            const Icon = s.icon;
            return (
              <Link key={s.id} href={s.href} className="group block">
                <PanelCard className="p-6 h-full flex flex-col justify-between border-hairline hover:border-signal/40 transition-all duration-200 group-hover:-translate-y-0.5">
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink-surface-2 border border-hairline group-hover:border-signal/30 group-hover:bg-signal/10 group-hover:text-signal transition-all">
                        <Icon className="h-5 w-5 text-signal" />
                      </div>
                      <span className="v4-readout text-[10px] px-2 py-0.5 rounded-full border border-hairline bg-ink-surface-2 text-text-muted-v4 group-hover:border-signal/30 group-hover:text-signal transition-colors">
                        {s.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-text-primary-v4 group-hover:text-signal transition-colors flex items-center justify-between">
                      {s.title}
                      <ArrowRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-signal" />
                    </h3>
                    <p className="mt-2 text-xs text-text-secondary-v4 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-hairline/60 flex items-center justify-between text-xs font-mono">
                    <span className="text-text-primary-v4 font-semibold">{s.metric}</span>
                    <span className="flex items-center gap-1 text-good">
                      <CheckCircle2 className="h-3 w-3" /> {s.status}
                    </span>
                  </div>
                </PanelCard>
              </Link>
            );
          })}
        </div>
      </div>

      {/* CLI Quickstart Banner */}
      <div className="p-6 rounded-3xl bg-ink border border-hairline font-mono text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Terminal className="h-5 w-5 text-signal shrink-0" />
          <div>
            <p className="text-text-primary-v4 font-semibold font-sans">VaultHost Developer CLI</p>
            <p className="text-[11px] text-text-muted-v4 font-mono mt-0.5">Deploy workers, manage R2 buckets, and run SQL queries from your terminal.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-ink-surface-2 px-3 py-2 rounded-xl border border-hairline text-green-400 font-mono text-xs w-full md:w-auto overflow-x-auto">
          <code>npm install -g @vaulthost/cli &amp;&amp; vh login</code>
        </div>
      </div>
    </div>
  );
}
