'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import { Database, Search, GitMerge, RotateCcw, Network, Link2, Check, ExternalLink, Zap } from 'lucide-react';
import { D1SQLConsole } from '@/components/vaulthost/interactive/D1SQLConsole';
import { ProductPricingSection } from '@/components/hosting/ProductPricingSection';

export default function VaultD1Page() {
  return (
    <div className="v4-page bg-ink min-h-screen">
      <PageHeroV4 
        eyebrow="VaultD1"
        title={<>SQLite at the <span className="text-signal">Global Edge</span></>}
        description="Serverless, globally distributed SQL database. Write once, read from every edge location. Compatible with Drizzle ORM, Prisma, and the SQLite ecosystem."
      />

      {/* Stats Bar */}
      <div className="py-8 sm:py-12 border-y border-hairline bg-ink-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-semibold text-text-primary-v4 mb-1">SQLite</div>
              <div className="text-xs sm:text-sm text-text-muted-v4">Native Syntax</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-semibold text-text-primary-v4 mb-1">Global</div>
              <div className="text-xs sm:text-sm text-text-muted-v4">Auto-Replication</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-semibold text-text-primary-v4 mb-1">PITR</div>
              <div className="text-xs sm:text-sm text-text-muted-v4">Point-in-Time Recovery</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-semibold text-text-primary-v4 mb-1">100%</div>
              <div className="text-xs sm:text-sm text-text-muted-v4">ORM Compatible</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-12 sm:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="v4-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary-v4 mb-4">A database built for modern serverless</h2>
              <p className="text-text-secondary-v4 max-w-2xl mx-auto text-base sm:text-lg">Enjoy the power of SQL, distributed globally without the infrastructure headaches.</p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ScrollReveal>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Search className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Familiar SQL</h3>
                <p className="text-text-secondary-v4">Built on SQLite, giving you standard relational database features, joins, and indexing.</p>
              </PanelCard>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Network className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Global Read Replicas</h3>
                <p className="text-text-secondary-v4">Reads are served from the closest edge node automatically. Writes route back to the primary.</p>
              </PanelCard>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <RotateCcw className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Time Travel Queries</h3>
                <p className="text-text-secondary-v4">Query data as it existed at any point in the past 30 days seamlessly for auditing or recovery.</p>
              </PanelCard>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Database className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">PITR Backups</h3>
                <p className="text-text-secondary-v4">Point-in-Time Recovery allows you to restore your database to any exact minute automatically.</p>
              </PanelCard>
            </ScrollReveal>
            <ScrollReveal delay={0.4}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <GitMerge className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">ORM Compatible</h3>
                <p className="text-text-secondary-v4">Works seamlessly with modern TypeScript ORMs like Drizzle, Prisma, and Kysely.</p>
              </PanelCard>
            </ScrollReveal>
            <ScrollReveal delay={0.5}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Link2 className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">REST API</h3>
                <p className="text-text-secondary-v4">Query your database over HTTP from anywhere, even from clients without native DB drivers.</p>
              </PanelCard>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Interactive D1 SQL Query Console */}
      <div className="py-12 sm:py-16 lg:py-24 bg-ink-surface border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-10">
              <span className="v4-readout text-[11px] font-semibold uppercase tracking-widest text-signal px-3 py-1 rounded-full border border-signal/30 bg-signal/5">
                Interactive SQL Studio
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold v4-display text-text-primary-v4">Execute Queries on Edge SQLite Live</h2>
              <p className="mt-2 text-text-secondary-v4 max-w-xl mx-auto text-sm sm:text-base">
                Run SQL queries directly against distributed edge replicas and benchmark single-digit millisecond response times.
              </p>
            </div>
          </ScrollReveal>
          <D1SQLConsole />
        </div>
      </div>

      {/* Comparison Table */}
      <div className="py-12 sm:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="v4-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary-v4 text-center mb-12 sm:mb-16">How we compare</h2>
          </ScrollReveal>
          
          <div className="overflow-x-auto rounded-2xl border border-hairline bg-ink-surface/30">
            <table className="w-full min-w-[560px] text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-hairline bg-ink-surface-2 text-text-muted-v4 text-xs">
                  <th className="p-4 font-semibold uppercase tracking-wider">Provider</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">Edge Native</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">Engine</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">Pricing Model</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-hairline bg-signal/5">
                  <td className="p-4 text-text-primary-v4 font-semibold flex items-center"><Zap className="w-4 h-4 mr-2 text-signal" /> VaultD1</td>
                  <td className="p-4 text-signal font-semibold">Yes (Global)</td>
                  <td className="p-4 text-text-secondary-v4">SQLite</td>
                  <td className="p-4 text-text-secondary-v4">Usage (Reads/Writes)</td>
                </tr>
                <tr className="border-b border-hairline hover:bg-ink-surface-2/30 transition-colors">
                  <td className="p-4 text-text-primary-v4 font-medium">PlanetScale</td>
                  <td className="p-4 text-text-secondary-v4">No (Single Region)</td>
                  <td className="p-4 text-text-secondary-v4">MySQL (Vitess)</td>
                  <td className="p-4 text-text-secondary-v4">Fixed Tiers + Overage</td>
                </tr>
                <tr className="border-b border-hairline hover:bg-ink-surface-2/30 transition-colors">
                  <td className="p-4 text-text-primary-v4 font-medium">Neon</td>
                  <td className="p-4 text-text-secondary-v4">No (Single Region)</td>
                  <td className="p-4 text-text-secondary-v4">PostgreSQL</td>
                  <td className="p-4 text-text-secondary-v4">Compute Time + Storage</td>
                </tr>
                <tr className="hover:bg-ink-surface-2/30 transition-colors">
                  <td className="p-4 text-text-primary-v4 font-medium">Turso</td>
                  <td className="p-4 text-text-secondary-v4">Yes (Global)</td>
                  <td className="p-4 text-text-secondary-v4">libSQL</td>
                  <td className="p-4 text-text-secondary-v4">Usage (Rows read)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ProductPricingSection productId="database" />
    </div>
  );
}
