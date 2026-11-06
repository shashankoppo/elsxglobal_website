'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Globe, MapPin, Zap, Shield, ArrowRight, Server, Activity, ArrowRightLeft } from 'lucide-react';

export default function VaultEdgePage() {
  return (
    <div className="v4-page bg-ink min-h-screen">
      <PageHeroV4
        eyebrow="VaultEdge Network"
        title={
          <>
            Your Users Deserve <span className="text-signal">Sub-10ms Responses.</span>
          </>
        }
        description="VaultHost's anycast edge network spans 300+ points of presence across 6 continents. Every request is served from the location closest to your user — not from a single origin data center."
      />

      {/* Stats Bar */}
      <section className="v4-section-sm border-b border-hairline bg-ink-surface-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-text-primary-v4">300+</div>
              <div className="text-text-muted-v4 text-sm mt-1">PoPs Globally</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-text-primary-v4">12 Tbps</div>
              <div className="text-text-muted-v4 text-sm mt-1">Network Capacity</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-text-primary-v4">&lt;11ms</div>
              <div className="text-text-muted-v4 text-sm mt-1">Avg DNS Latency</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-text-primary-v4">99.999%</div>
              <div className="text-text-muted-v4 text-sm mt-1">Uptime SLA</div>
            </div>
          </div>
        </div>
      </section>

      {/* What is Anycast */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="bg-ink-surface border border-hairline rounded-3xl p-8 md:p-16">
              <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="w-full lg:w-1/2">
                  <h2 className="v4-display text-text-primary-v4 mb-6">What is Anycast?</h2>
                  <p className="text-text-secondary-v4 mb-6 text-lg">
                    Traditional hosting uses a single IP mapped to a single server (Unicast), leading to high latency for users far away.
                  </p>
                  <p className="text-text-secondary-v4 text-lg">
                    VaultEdge uses <strong>Anycast</strong> to advertise the same IP address from all 300+ PoPs worldwide. Traffic automatically and instantly routes to the nearest physical location, slashing latency and absorbing massive DDoS attacks.
                  </p>
                </div>
                <div className="w-full lg:w-1/2 flex flex-col gap-6">
                  <div className="bg-ink p-6 rounded-2xl border border-hairline flex items-center justify-between">
                    <span className="text-text-secondary-v4 font-medium">Unicast</span>
                    <ArrowRightLeft className="text-text-muted-v4 w-5 h-5" />
                    <span className="text-red-400 font-bold">150ms+ Latency</span>
                  </div>
                  <div className="bg-ink-surface-2 p-6 rounded-2xl border border-signal/50 flex items-center justify-between">
                    <span className="text-text-primary-v4 font-medium">Anycast (VaultEdge)</span>
                    <ArrowRightLeft className="text-signal w-5 h-5" />
                    <span className="text-signal font-bold">&lt;15ms Latency</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Global PoP Grid */}
      <section className="v4-section bg-ink-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="v4-display text-text-primary-v4">Our Global Footprint</h2>
              <p className="text-text-secondary-v4 mt-4 text-lg">Strategic presence in every major internet exchange.</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PanelCard className="v4-panel p-8 border border-hairline">
              <h3 className="text-xl font-bold text-text-primary-v4 flex items-center mb-6">
                <MapPin className="w-5 h-5 mr-3 text-signal" /> Asia Pacific (45 PoPs)
              </h3>
              <p className="text-text-secondary-v4 leading-relaxed">
                Mumbai, Bangalore, Delhi, Chennai, Singapore, Tokyo, Sydney, Seoul, Hong Kong, Taipei...
              </p>
            </PanelCard>

            <PanelCard className="v4-panel p-8 border border-hairline">
              <h3 className="text-xl font-bold text-text-primary-v4 flex items-center mb-6">
                <MapPin className="w-5 h-5 mr-3 text-signal" /> Europe (65 PoPs)
              </h3>
              <p className="text-text-secondary-v4 leading-relaxed">
                Frankfurt, London, Amsterdam, Paris, Stockholm, Madrid, Milan, Warsaw, Dublin...
              </p>
            </PanelCard>

            <PanelCard className="v4-panel p-8 border border-hairline">
              <h3 className="text-xl font-bold text-text-primary-v4 flex items-center mb-6">
                <MapPin className="w-5 h-5 mr-3 text-signal" /> Americas (55 PoPs)
              </h3>
              <p className="text-text-secondary-v4 leading-relaxed">
                New York, Chicago, Los Angeles, São Paulo, Ashburn, Seattle, Toronto, Mexico City...
              </p>
            </PanelCard>

            <PanelCard className="v4-panel p-8 border border-hairline">
              <h3 className="text-xl font-bold text-text-primary-v4 flex items-center mb-6">
                <MapPin className="w-5 h-5 mr-3 text-signal" /> Middle East & Africa (18 PoPs)
              </h3>
              <p className="text-text-secondary-v4 leading-relaxed">
                Dubai, Riyadh, Cape Town, Johannesburg, Tel Aviv, Doha, Muscat...
              </p>
            </PanelCard>
          </div>
        </div>
      </section>

      {/* Services Running on Edge */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="v4-display text-text-primary-v4 text-center mb-16">Powered by the Edge</h2>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-ink border border-hairline rounded-2xl p-6">
              <Globe className="w-8 h-8 text-signal mb-4" />
              <h4 className="font-bold text-text-primary-v4 mb-2">DNS</h4>
              <p className="text-text-secondary-v4 text-sm">Authoritative & recursive DNS resolution distributed globally.</p>
            </div>
            <div className="bg-ink border border-hairline rounded-2xl p-6">
              <Shield className="w-8 h-8 text-signal mb-4" />
              <h4 className="font-bold text-text-primary-v4 mb-2">DDoS Mitigation</h4>
              <p className="text-text-secondary-v4 text-sm">L3/L4/L7 anycast scrubbing. Absorbs attacks at the edge.</p>
            </div>
            <div className="bg-ink border border-hairline rounded-2xl p-6">
              <Zap className="w-8 h-8 text-signal mb-4" />
              <h4 className="font-bold text-text-primary-v4 mb-2">Edge Workers</h4>
              <p className="text-text-secondary-v4 text-sm">V8 isolates running your code instantly across all PoPs.</p>
            </div>
            <div className="bg-ink border border-hairline rounded-2xl p-6">
              <Server className="w-8 h-8 text-signal mb-4" />
              <h4 className="font-bold text-text-primary-v4 mb-2">CDN Caching</h4>
              <p className="text-text-secondary-v4 text-sm">Static and dynamic asset delivery optimized per region.</p>
            </div>
            <div className="bg-ink border border-hairline rounded-2xl p-6">
              <Shield className="w-8 h-8 text-signal mb-4" />
              <h4 className="font-bold text-text-primary-v4 mb-2">WAF</h4>
              <p className="text-text-secondary-v4 text-sm">Web Application Firewall protecting against OWASP top 10.</p>
            </div>
            <div className="bg-ink border border-hairline rounded-2xl p-6">
              <Activity className="w-8 h-8 text-signal mb-4" />
              <h4 className="font-bold text-text-primary-v4 mb-2">Load Balancer</h4>
              <p className="text-text-secondary-v4 text-sm">Global traffic steering and health checks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Comparison */}
      <section className="v4-section bg-ink-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="v4-display text-text-primary-v4 text-center mb-12">Performance Matters</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-hairline">
                    <th className="py-4 px-6 text-text-muted-v4 font-medium">Metric</th>
                    <th className="py-4 px-6 text-text-muted-v4 font-medium">Origin Only (US)</th>
                    <th className="py-4 px-6 text-text-muted-v4 font-medium">Traditional CDN</th>
                    <th className="py-4 px-6 text-signal font-bold">VaultEdge</th>
                  </tr>
                </thead>
                <tbody className="text-text-secondary-v4">
                  <tr className="border-b border-hairline bg-ink-surface-2">
                    <td className="py-4 px-6 font-medium text-text-primary-v4">Latency (India)</td>
                    <td className="py-4 px-6">250ms</td>
                    <td className="py-4 px-6">80ms</td>
                    <td className="py-4 px-6 text-signal font-bold">&lt;15ms</td>
                  </tr>
                  <tr className="border-b border-hairline">
                    <td className="py-4 px-6 font-medium text-text-primary-v4">TTFB (Time to First Byte)</td>
                    <td className="py-4 px-6">300ms</td>
                    <td className="py-4 px-6">120ms</td>
                    <td className="py-4 px-6 text-signal font-bold">&lt;30ms</td>
                  </tr>
                  <tr className="border-b border-hairline bg-ink-surface-2">
                    <td className="py-4 px-6 font-medium text-text-primary-v4">Cache Hit Ratio</td>
                    <td className="py-4 px-6">0%</td>
                    <td className="py-4 px-6">65%</td>
                    <td className="py-4 px-6 text-signal font-bold">95%+</td>
                  </tr>
                  <tr className="border-b border-hairline">
                    <td className="py-4 px-6 font-medium text-text-primary-v4">DDoS Absorption</td>
                    <td className="py-4 px-6">Low (Server fails)</td>
                    <td className="py-4 px-6">Medium (PoP fails)</td>
                    <td className="py-4 px-6 text-signal font-bold">12 Tbps (Global)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div 
              className="rounded-3xl border border-hairline p-12 text-center"
              style={{ background: 'linear-gradient(135deg, rgba(10,18,36,0.98), rgba(6,12,24,1))' }}
            >
              <h2 className="v4-display text-white mb-6">Deploy to the Edge Today</h2>
              <p className="text-text-secondary-v4 mb-8 max-w-2xl mx-auto text-lg">
                Join the thousands of applications already leveraging VaultEdge for unparalleled speed and security.
              </p>
              <Link href="/portal/signup" className="v4-btn-primary inline-flex items-center px-8 py-4">
                Deploy to the edge <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
