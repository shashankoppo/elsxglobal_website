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
      <div className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="v4-display text-text-primary-v4 text-center mb-16">Scalable KV pricing</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal>
              <div className="v4-panel p-8 rounded-2xl flex flex-col h-full">
                <h3 className="text-2xl font-medium text-text-primary-v4 mb-2">Free</h3>
                <div className="text-4xl font-bold text-text-primary-v4 mb-6">₹0<span className="text-lg text-text-muted-v4 font-normal">/mo</span></div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> 100K reads / day</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> 1K writes / day</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> 1GB Storage</li>
                </ul>
                <Link href="/portal" className="v4-btn-secondary w-full justify-center rounded-btn py-3">Get Started</Link>
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={0.1}>
              <div className="v4-panel p-8 rounded-2xl flex flex-col h-full border-signal border relative">
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-signal text-ink text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</div>
                <h3 className="text-2xl font-medium text-text-primary-v4 mb-2">Pro</h3>
                <div className="text-4xl font-bold text-text-primary-v4 mb-6">₹249<span className="text-lg text-text-muted-v4 font-normal">/mo</span></div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> 10M reads / mo</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> 1M writes / mo</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> 10GB Storage</li>
                </ul>
                <Link href="/portal" className="v4-btn-primary w-full justify-center rounded-btn py-3">Upgrade to Pro</Link>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="v4-panel p-8 rounded-2xl flex flex-col h-full">
                <h3 className="text-2xl font-medium text-text-primary-v4 mb-2">Business</h3>
                <div className="text-4xl font-bold text-text-primary-v4 mb-6">₹999<span className="text-lg text-text-muted-v4 font-normal">/mo</span></div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> Unlimited reads</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> Unlimited writes</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> 100GB Storage</li>
                </ul>
                <Link href="/contact" className="v4-btn-secondary w-full justify-center rounded-btn py-3">Contact Sales</Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Premium CTA */}
      <div className="v4-section" style={{ background: 'linear-gradient(135deg, rgba(10,18,36,0.98), rgba(6,12,24,1))' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
          <ScrollReveal>
            <h2 className="v4-display text-white mb-6">Start storing distributed data</h2>
            <p className="text-text-secondary-v4 max-w-2xl mx-auto mb-10 text-lg">Keep your state close to your users, no matter where they are in the world.</p>
            <Link href="/portal" className="v4-btn-primary inline-flex items-center rounded-btn px-8 py-4 text-lg">
              Create a KV Namespace <Database className="ml-2 w-5 h-5" />
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
