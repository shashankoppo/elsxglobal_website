'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import { Database, Search, GitMerge, RotateCcw, Network, Link2, Check, ExternalLink, Zap } from 'lucide-react';
import { D1SQLConsole } from '@/components/vaulthost/interactive/D1SQLConsole';

export default function VaultD1Page() {
  return (
    <div className="v4-page bg-ink min-h-screen">
      <PageHeroV4 
        eyebrow="VaultD1"
        title={<>SQLite at the <span className="text-signal">Global Edge</span></>}
        description="Serverless, globally distributed SQL database. Write once, read from every edge location. Compatible with Drizzle ORM, Prisma, and the SQLite ecosystem."
      />

      {/* Stats Bar */}
      <div className="v4-section-sm border-y border-hairline bg-ink-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">SQLite</div>
              <div className="text-sm text-text-muted-v4">Native Syntax</div>
            </div>
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">Global</div>
              <div className="text-sm text-text-muted-v4">Auto-Replication</div>
            </div>
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">PITR</div>
              <div className="text-sm text-text-muted-v4">Point-in-Time Recovery</div>
            </div>
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">100%</div>
              <div className="text-sm text-text-muted-v4">ORM Compatible</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="v4-display text-text-primary-v4 mb-4">A database built for modern serverless</h2>
              <p className="text-text-secondary-v4 max-w-2xl mx-auto text-lg">Enjoy the power of SQL, distributed globally without the infrastructure headaches.</p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      <div className="v4-section-sm bg-ink-surface border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-10">
              <span className="v4-readout text-[11px] font-semibold uppercase tracking-widest text-signal px-3 py-1 rounded-full border border-signal/30 bg-signal/5">
                Interactive SQL Studio
              </span>
              <h2 className="mt-3 text-3xl v4-display text-text-primary-v4">Execute Queries on Edge SQLite Live</h2>
              <p className="mt-2 text-text-secondary-v4 max-w-xl mx-auto text-sm">
                Run SQL queries directly against distributed edge replicas and benchmark single-digit millisecond response times.
              </p>
            </div>
          </ScrollReveal>
          <D1SQLConsole />
        </div>
      </div>

      {/* Comparison Table */}
      <div className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="v4-display text-text-primary-v4 text-center mb-16">How we compare</h2>
          </ScrollReveal>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="p-4 text-text-muted-v4 font-medium">Provider</th>
                  <th className="p-4 text-text-muted-v4 font-medium">Edge Native</th>
                  <th className="p-4 text-text-muted-v4 font-medium">Engine</th>
                  <th className="p-4 text-text-muted-v4 font-medium">Pricing Model</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-hairline bg-ink-surface/50">
                  <td className="p-4 text-text-primary-v4 font-medium flex items-center"><Zap className="w-5 h-5 mr-2 text-signal" /> VaultD1</td>
                  <td className="p-4 text-signal font-medium">Yes (Global)</td>
                  <td className="p-4 text-text-secondary-v4">SQLite</td>
                  <td className="p-4 text-text-secondary-v4">Usage (Reads/Writes)</td>
                </tr>
                <tr className="border-b border-hairline">
                  <td className="p-4 text-text-primary-v4">PlanetScale</td>
                  <td className="p-4 text-text-secondary-v4">No (Single Region)</td>
                  <td className="p-4 text-text-secondary-v4">MySQL (Vitess)</td>
                  <td className="p-4 text-text-secondary-v4">Fixed Tiers + Overage</td>
                </tr>
                <tr className="border-b border-hairline">
                  <td className="p-4 text-text-primary-v4">Neon</td>
                  <td className="p-4 text-text-secondary-v4">No (Single Region)</td>
                  <td className="p-4 text-text-secondary-v4">PostgreSQL</td>
                  <td className="p-4 text-text-secondary-v4">Compute Time + Storage</td>
                </tr>
                <tr>
                  <td className="p-4 text-text-primary-v4">Turso</td>
                  <td className="p-4 text-text-secondary-v4">Yes (Global)</td>
                  <td className="p-4 text-text-secondary-v4">libSQL</td>
                  <td className="p-4 text-text-secondary-v4">Usage (Rows read)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <section className="v4-section border-t border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="v4-display text-text-primary-v4 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-text-secondary-v4">Higher than GoDaddy. Way below AWS.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Free tier */}
            <div className="v4-panel rounded-2xl p-6 border border-hairline flex flex-col justify-between">
              <div>
                <div className="text-text-muted-v4 text-sm font-medium mb-2">FREE</div>
                <div className="text-3xl font-bold text-text-primary-v4 mb-1">₹0 <span className="text-sm font-normal text-text-muted-v4">/mo</span></div>
                <p className="text-text-secondary-v4 text-sm mb-6">Serverless distributed SQL database at zero cost.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 500MB distributed storage</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 100K row reads / day</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 10K row writes / day</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 24-hour time-travel rollback</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Community support</li>
                </ul>
              </div>
              <Link href="/vaulthost/signup" className="v4-btn-secondary rounded-btn w-full text-center block py-2.5">Start Free</Link>
            </div>
            {/* Pro tier — highlighted */}
            <div className="v4-panel rounded-2xl p-6 border-2 border-signal relative flex flex-col justify-between">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-signal text-ink text-xs font-semibold px-3 py-1 rounded-full">MOST POPULAR</div>
              <div>
                <div className="text-signal text-sm font-medium mb-2">PRO</div>
                <div className="text-3xl font-bold text-text-primary-v4 mb-1">₹349 <span className="text-sm font-normal text-text-muted-v4">/mo</span></div>
                <p className="text-text-secondary-v4 text-sm mb-6">Production edge database with 10GB storage and read replicas.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 10GB distributed storage</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 25M row reads / month</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 5M row writes / month</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 7-day time-travel recovery</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Automatic read replicas</li>
                </ul>
              </div>
              <Link href="/vaulthost/checkout?plan=database-pro" className="v4-btn-primary rounded-btn w-full text-center block py-2.5">Get Started</Link>
            </div>
            {/* Business tier */}
            <div className="v4-panel rounded-2xl p-6 border border-hairline flex flex-col justify-between">
              <div>
                <div className="text-text-muted-v4 text-sm font-medium mb-2">BUSINESS</div>
                <div className="text-3xl font-bold text-text-primary-v4 mb-1">₹1,499 <span className="text-sm font-normal text-text-muted-v4">/mo</span></div>
                <p className="text-text-secondary-v4 text-sm mb-6">100GB distributed SQL database with instant time-travel rollback.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 100GB distributed storage</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Unlimited row reads (fair use)</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Unlimited row writes (fair use)</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 30-day time-travel backup</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Dedicated instances &amp; 99.99% SLA</li>
                </ul>
              </div>
              <Link href="/vaulthost/checkout?plan=database-business" className="v4-btn-primary rounded-btn w-full text-center block py-2.5">Get Started</Link>
            </div>
          </div>
          {/* Competitor comparison */}
          <div className="border border-hairline rounded-2xl overflow-hidden mb-12">
            <table className="w-full text-sm">
              <thead className="bg-ink-surface-2 text-text-secondary-v4">
                <tr>
                  <th className="py-3 px-4 text-left font-medium">Provider</th>
                  <th className="py-3 px-4 text-left font-medium">Pricing</th>
                  <th className="py-3 px-4 text-left font-medium">Comparison / Advantage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                <tr className="bg-signal/5">
                  <td className="py-3 px-4 font-semibold text-signal">VaultHost D1 Database</td>
                  <td className="py-3 px-4 font-medium text-text-primary-v4">₹0 Free / ₹349 Pro / ₹1,499 Business</td>
                  <td className="py-3 px-4 text-text-secondary-v4">Serverless SQLite at edge, zero cold starts, fast Pune/Mumbai nodes, time-travel restore</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-text-primary-v4">PlanetScale</td>
                  <td className="py-3 px-4 text-text-secondary-v4">₹3,200/mo ($39)</td>
                  <td className="py-3 px-4 text-text-secondary-v4">No free tier, high baseline for MySQL database workloads</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-text-primary-v4">Neon Serverless</td>
                  <td className="py-3 px-4 text-text-secondary-v4">₹1,580/mo ($19)</td>
                  <td className="py-3 px-4 text-text-secondary-v4">Compute hours drain quickly on idle connections</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-text-primary-v4">AWS RDS PostgreSQL</td>
                  <td className="py-3 px-4 text-text-secondary-v4">₹3,500 - ₹12,000/mo</td>
                  <td className="py-3 px-4 text-text-secondary-v4">Requires VPC, NAT gateways, storage provisioning, and complex maintenance</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
