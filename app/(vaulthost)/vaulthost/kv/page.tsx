'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import { Zap, Globe, Clock, ServerCrash, Layers, Box, Database, ArrowRight, Check } from 'lucide-react';

export default function VaultKVPage() {
  return (
    <div className="v4-page bg-ink min-h-screen">
      <PageHeroV4 
        eyebrow="VaultKV"
        title={<>Key-Value Store. <span className="text-signal">Read Anywhere in &lt;10ms.</span></>}
        description="Globally distributed key-value storage that replicates to all edge locations. Perfect for feature flags, session data, config, and rate limiting."
      />

      {/* Stats Bar */}
      <div className="v4-section-sm border-y border-hairline bg-ink-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">&lt;10ms</div>
              <div className="text-sm text-text-muted-v4">Global Reads</div>
            </div>
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">25MB</div>
              <div className="text-sm text-text-muted-v4">Max Value Size</div>
            </div>
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">100K</div>
              <div className="text-sm text-text-muted-v4">Free Reads/Day</div>
            </div>
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">JSON</div>
              <div className="text-sm text-text-muted-v4">Native Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="v4-display text-text-primary-v4 mb-4">Fast reads, everywhere</h2>
              <p className="text-text-secondary-v4 max-w-2xl mx-auto text-lg">Designed for high-read, low-latency workloads distributed globally.</p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <ScrollReveal>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Globe className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Global Replication</h3>
                <p className="text-text-secondary-v4">Data is eventually consistent and replicated to all 300+ VaultHost edge locations automatically.</p>
              </PanelCard>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Clock className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">TTL & Expiry</h3>
                <p className="text-text-secondary-v4">Set time-to-live on keys to automatically purge temporary data like sessions or caching layers.</p>
              </PanelCard>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Layers className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Bulk Operations</h3>
                <p className="text-text-secondary-v4">Read, write, and delete multiple keys simultaneously for improved throughput and efficiency.</p>
              </PanelCard>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Box className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Namespace Isolation</h3>
                <p className="text-text-secondary-v4">Organize your keys into separate namespaces for different environments, apps, or tenants.</p>
              </PanelCard>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Code Sample Block */}
      <div className="v4-section bg-ink-surface-2 border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <div>
                <h2 className="v4-display text-text-primary-v4 mb-6">Native integration with Workers</h2>
                <p className="text-text-secondary-v4 text-lg mb-8">Access VaultKV directly from your VaultWorkers with zero overhead or external API calls required.</p>
                <div className="flex flex-wrap gap-3 mb-8">
                  {['Session storage', 'Feature flags', 'Rate limiting', 'Config store', 'Leaderboards', 'A/B test variants'].map((badge, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-ink border border-hairline text-sm text-text-primary-v4 flex items-center">
                      <Zap className="w-3 h-3 mr-2 text-signal" /> {badge}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="bg-ink-surface-2 rounded-2xl p-6 border border-hairline font-mono text-sm text-green-400 overflow-x-auto shadow-2xl">
                <pre>
                  <code>
{`export default {
  async fetch(req, env) {
    // Read JSON directly from KV
    const userProfile = await env.MY_KV.get('user:123', 'json');
    
    // Write with a 1-hour TTL
    await env.MY_KV.put(
      'session:abc', 
      JSON.stringify({ active: true }), 
      { expirationTtl: 3600 }
    );
    
    return Response.json(userProfile);
  }
};`}
                  </code>
                </pre>
              </div>
            </ScrollReveal>
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
                <p className="text-text-secondary-v4 text-sm mb-6">Sub-10ms edge caching for feature flags and session tokens.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 100K reads / day</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 1K writes / day</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 1GB key-value storage</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Sub-10ms global edge read latency</li>
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
                <div className="text-3xl font-bold text-text-primary-v4 mb-1">₹249 <span className="text-sm font-normal text-text-muted-v4">/mo</span></div>
                <p className="text-text-secondary-v4 text-sm mb-6">High-frequency distributed key-value store for web APIs.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 10M reads / month</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 1M writes / month</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 10GB key-value storage</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Key expiration TTLs &amp; metadata tags</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Priority email support</li>
                </ul>
              </div>
              <Link href="/vaulthost/checkout?plan=kv-pro" className="v4-btn-primary rounded-btn w-full text-center block py-2.5">Get Started</Link>
            </div>
            {/* Business tier */}
            <div className="v4-panel rounded-2xl p-6 border border-hairline flex flex-col justify-between">
              <div>
                <div className="text-text-muted-v4 text-sm font-medium mb-2">BUSINESS</div>
                <div className="text-3xl font-bold text-text-primary-v4 mb-1">₹999 <span className="text-sm font-normal text-text-muted-v4">/mo</span></div>
                <p className="text-text-secondary-v4 text-sm mb-6">100GB replicated cache with Redis protocol compatibility.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Unlimited reads (fair use)</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Unlimited writes (fair use)</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 100GB key-value storage</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Redis RESP protocol compatibility</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Dedicated cache nodes &amp; 99.99% SLA</li>
                </ul>
              </div>
              <Link href="/vaulthost/checkout?plan=kv-business" className="v4-btn-primary rounded-btn w-full text-center block py-2.5">Get Started</Link>
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
                  <td className="py-3 px-4 font-semibold text-signal">VaultHost KV</td>
                  <td className="py-3 px-4 font-medium text-text-primary-v4">₹0 Free / ₹249 Pro / ₹999 Business</td>
                  <td className="py-3 px-4 text-text-secondary-v4">Sub-10ms global read latency, key expiry TTLs, Redis API compatibility</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-text-primary-v4">Cloudflare KV</td>
                  <td className="py-3 px-4 text-text-secondary-v4">₹420/mo ($5) base</td>
                  <td className="py-3 px-4 text-text-secondary-v4">60-second replication propagation delay between edge nodes</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-text-primary-v4">Upstash Redis</td>
                  <td className="py-3 px-4 text-text-secondary-v4">₹1,650/mo ($20)</td>
                  <td className="py-3 px-4 text-text-secondary-v4">Per-command metered pricing escalates rapidly with sustained traffic</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-text-primary-v4">AWS DynamoDB</td>
                  <td className="py-3 px-4 text-text-secondary-v4">₹2,500 - ₹8,000/mo</td>
                  <td className="py-3 px-4 text-text-secondary-v4">Provisioned throughput RCUs/WCUs complex calculation and billing traps</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
