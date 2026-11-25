'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import { Zap, Globe, Clock, ServerCrash, Layers, Box, Database, ArrowRight, Check } from 'lucide-react';
import { ProductPricingSection } from '@/components/hosting/ProductPricingSection';

export default function VaultKVPage() {
  return (
    <div className="v4-page bg-ink min-h-screen">
      <PageHeroV4 
        eyebrow="VaultKV"
        title={<>Key-Value Store. <span className="text-signal">Read Anywhere in &lt;10ms.</span></>}
        description="Globally distributed key-value storage that replicates to all edge locations. Perfect for feature flags, session data, config, and rate limiting."
      />

      {/* Stats Bar */}
      <div className="py-8 sm:py-12 border-y border-hairline bg-ink-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-semibold text-text-primary-v4 mb-1">&lt;10ms</div>
              <div className="text-xs sm:text-sm text-text-muted-v4">Global Reads</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-semibold text-text-primary-v4 mb-1">25MB</div>
              <div className="text-xs sm:text-sm text-text-muted-v4">Max Value Size</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-semibold text-text-primary-v4 mb-1">100K</div>
              <div className="text-xs sm:text-sm text-text-muted-v4">Free Reads/Day</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-semibold text-text-primary-v4 mb-1">JSON</div>
              <div className="text-xs sm:text-sm text-text-muted-v4">Native Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-12 sm:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="v4-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary-v4 mb-4">Fast reads, everywhere</h2>
              <p className="text-text-secondary-v4 max-w-2xl mx-auto text-base sm:text-lg">Designed for high-read, low-latency workloads distributed globally.</p>
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
      <div className="py-12 sm:py-16 lg:py-24 bg-ink-surface-2 border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <ScrollReveal>
              <div>
                <h2 className="v4-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary-v4 mb-6">Native integration with Workers</h2>
                <p className="text-text-secondary-v4 text-base sm:text-lg mb-8">Access VaultKV directly from your VaultWorkers with zero overhead or external API calls required.</p>
                <div className="flex flex-wrap gap-2.5 sm:gap-3 mb-8">
                  {['Session storage', 'Feature flags', 'Rate limiting', 'Config store', 'Leaderboards', 'A/B test variants'].map((badge, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-ink border border-hairline text-xs sm:text-sm text-text-primary-v4 flex items-center">
                      <Zap className="w-3 h-3 mr-2 text-signal" /> {badge}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="bg-ink-surface rounded-2xl p-4 sm:p-6 border border-hairline font-mono text-xs sm:text-sm text-green-400 overflow-x-auto shadow-2xl">
                <pre className="overflow-x-auto font-mono text-xs sm:text-sm">
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

      <ProductPricingSection productId="kv" />
    </div>
  );
}
