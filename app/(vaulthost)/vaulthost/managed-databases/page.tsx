'use client';

import { Database, Shield, Zap, Activity, Network, RefreshCw, Check, ArrowRight, Server, HardDrive, Clock } from 'lucide-react';
import { ProductPageV4 } from '@/components/shared/v4-page-templates';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import { TierPageClient } from '@/components/hosting/tier-page';

const DB_ENGINES = [
  {
    name: 'PostgreSQL',
    version: 'v16',
    icon: Database,
    color: 'text-signal',
    desc: 'The world\'s most advanced open-source relational database. Full ACID compliance, JSON support, and powerful indexing.',
    features: ['Connection pooling (PgBouncer)', 'Read replicas up to 10', 'Point-in-time recovery (30 days)', 'Full-text search', 'PostGIS spatial extension', 'Logical replication'],
    useCases: ['SaaS applications', 'Financial systems', 'Analytics workloads'],
  },
  {
    name: 'Redis',
    version: 'v7',
    icon: Zap,
    color: 'text-warn',
    desc: 'In-memory data store with sub-millisecond latency. Perfect for caching, sessions, and real-time analytics.',
    features: ['Sub-millisecond reads', 'Persistence (AOF + RDB)', 'Pub/Sub messaging', 'Stream processing', 'Cluster mode (sharding)', 'Lua scripting'],
    useCases: ['Session caching', 'Real-time leaderboards', 'Rate limiting'],
  },
];



export default function ManagedDatabasesPage() {
  return (
    <ProductPageV4 data={{
      eyebrow: 'VaultHost Databases', eyebrowIcon: Database,
      title: <>Elastic Storage That Never Fails</>,
      description: 'Auto-scaling Postgres + Redis clusters. Point-in-time recovery. 99.999% durability. Zero-downtime migrations.',
      ctaTitle: 'Provision a Database', ctaHref: '/vaulthost',
      features: [
        { icon: Database, title: 'PostgreSQL', desc: 'Auto-scaling connection pooling, read replicas, and point-in-time recovery.' },
        { icon: Zap, title: 'Redis', desc: 'In-memory cache with persistence. Sub-millisecond reads at any scale.' },
        { icon: Shield, title: 'Automated Backups', desc: 'Continuous WAL archiving. Restore to any second in the last 30 days.' },
        { icon: Network, title: 'Read Replicas', desc: 'Up to 10 replicas per cluster. Geo-distributed for global read performance.' },
        { icon: RefreshCw, title: 'Zero-Downtime Migration', desc: 'Migrate schemas without locking. Blue-green deploys for schema changes.' },
        { icon: Activity, title: 'Query Analytics', desc: 'Slow query detection, index recommendations, and automated optimization.' },
      ],
      stats: [
        { value: 99.999, suffix: '%', label: 'Durability', decimals: 3 },
        { value: 10, suffix: '', label: 'Max Replicas' },
        { value: 30, suffix: 'd', label: 'PITR Window' },
        { value: 0, suffix: 'ms', label: 'Migration Downtime' },
      ],
      children: (
        <>
          {/* Replication topology */}
          <section className="v4-section-sm bg-ink-surface">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollReveal className="text-center mb-10">
                <h2 className="text-2xl v4-display text-text-primary-v4">Replication Topology</h2>
                <p className="mt-3 text-text-secondary-v4">Primary to Read Replicas with automatic failover</p>
              </ScrollReveal>
              <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
                <div className="flex flex-col items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-panel border border-signal/30 bg-signal/10">
                    <Database className="h-7 w-7 text-signal" />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-text-primary-v4">Primary</p>
                  <p className="v4-readout text-[10px] text-text-muted-v4">READ + WRITE</p>
                </div>
                <div className="hidden lg:block h-px w-12 bg-hairline-2" />
                <div className="flex flex-col gap-3">
                  {['Replica 1 (US-EAST)', 'Replica 2 (EU-WEST)', 'Replica 3 (AP-SOUTH)'].map((r) => (
                    <div key={r} className="flex items-center gap-3 p-3 rounded-panel border border-hairline bg-ink-surface-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-chip border border-hairline bg-ink">
                        <Database className="h-4 w-4 text-good" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary-v4">{r}</p>
                        <p className="v4-readout text-[10px] text-text-muted-v4">READ-ONLY · AUTO-FAILOVER</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-10 flex items-center justify-center gap-2 text-sm text-good">
                <Shield className="h-4 w-4" /> Automatic failover in &lt; 3 seconds
              </div>
            </div>
          </section>

          {/* Database engines comparison */}
          <section className="v4-section-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollReveal className="text-center mb-10">
                <h2 className="text-2xl v4-display text-text-primary-v4">Choose Your Engine</h2>
                <p className="mt-3 text-text-secondary-v4">Two powerful databases. One unified platform.</p>
              </ScrollReveal>
              <div className="grid md:grid-cols-2 gap-6">
                {DB_ENGINES.map((engine, i) => (
                  <ScrollReveal key={engine.name} animation="fade-up" delay={i * 100}>
                    <div className="v4-panel p-8 h-full">
                      <div className="flex items-center gap-4 mb-5">
                        <div className="flex h-14 w-14 items-center justify-center rounded-panel border border-hairline bg-ink-surface-2">
                          <engine.icon className={`h-7 w-7 ${engine.color}`} />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-text-primary-v4">{engine.name}</h3>
                          <p className="text-xs text-text-muted-v4">{engine.version}</p>
                        </div>
                      </div>
                      <p className="text-sm text-text-secondary-v4 leading-relaxed mb-6">{engine.desc}</p>
                      <div className="space-y-2.5 mb-6">
                        {engine.features.map((f) => (
                          <div key={f} className="flex items-center gap-2.5 text-sm">
                            <Check className="h-4 w-4 text-good shrink-0" />
                            <span className="text-text-secondary-v4">{f}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-4 border-t border-hairline">
                        <p className="text-xs text-text-muted-v4 uppercase tracking-wider mb-2">Best for</p>
                        <div className="flex flex-wrap gap-2">
                          {engine.useCases.map((use) => (
                            <span key={use} className="text-xs px-2.5 py-1 rounded-chip border border-hairline bg-ink-surface-2 text-text-secondary-v4">{use}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing tiers */}
          <section className="v4-section-sm bg-ink-surface">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollReveal className="text-center mb-10">
                <h2 className="text-2xl v4-display text-text-primary-v4">Database Pricing</h2>
                <p className="mt-3 text-text-secondary-v4">Start small. Scale infinitely. Pay only for what you use.</p>
              </ScrollReveal>
              <TierPageClient tier="managed_database" tierName="Managed Databases" />
            </div>
          </section>

          {/* Trust indicators */}
          <section className="py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: Shield, label: 'Encrypted at Rest', desc: 'AES-256 encryption' },
                  { icon: Clock, label: '3s Failover', desc: 'Automatic recovery' },
                  { icon: HardDrive, label: 'Auto-scaling', desc: 'No downtime scaling' },
                  { icon: Server, label: 'High Availability', desc: 'Multi-AZ by default' },
                ].map((item, i) => (
                  <ScrollReveal key={item.label} animation="fade-up" delay={i * 80}>
                    <div className="flex items-center gap-3 p-4 h-full rounded-panel border border-hairline bg-ink-surface-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-chip border border-hairline shrink-0">
                        <item.icon className="h-5 w-5 text-signal" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary-v4">{item.label}</p>
                        <p className="text-xs text-text-muted-v4">{item.desc}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        </>
      ),
    }} />
  );
}
