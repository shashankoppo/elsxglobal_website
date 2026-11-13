'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { ArrowRight, Globe, Share2, Shield, Activity, Lock, Code, Check } from 'lucide-react';
import { DNSPropagationChecker } from '@/components/vaulthost/interactive/DNSPropagationChecker';
import { DNSApiPlayground } from '@/components/vaulthost/interactive/DNSApiPlayground';

export default function VaultDNSPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-signal/30">
      <PageHeroV4
        eyebrow="VaultDNS"
        title={<>The World's Fastest <span className="text-signal">DNS.</span></>}
        description="Authoritative DNS with 100% uptime SLA, DNSSEC, DNS over HTTPS, GeoDNS routing, and DDoS-resistant anycast infrastructure. Manage all your domains from one dashboard."
      />

      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-white/10 py-12 mb-24">
              <div className="text-center">
                <div className="text-4xl font-light text-white mb-2 v4-display">&lt;11ms</div>
                <div className="text-sm text-gray-400">Global Avg Query Time</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-light text-white mb-2 v4-display">100%</div>
                <div className="text-sm text-gray-400">Uptime SLA</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-light text-white mb-2 v4-display">300+</div>
                <div className="text-sm text-gray-400">Anycast PoPs</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-light text-white mb-2 v4-display">DNSSEC</div>
                <div className="text-sm text-gray-400">Native Support</div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="mb-24">
              <h2 className="text-3xl font-light mb-8 text-center v4-display">Supported Record Types</h2>
              <div className="flex flex-wrap justify-center gap-3">
                {['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA', 'SRV', 'CAA', 'DKIM', 'DMARC', 'PTR', 'DS', 'TLSA'].map((record) => (
                  <span key={record} className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm font-mono hover:border-signal/50 transition-colors">
                    {record}
                  </span>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="mb-24">
              <div className="text-center max-w-3xl mx-auto mb-8">
                <h2 className="text-3xl font-light mb-3 v4-display">Live Anycast Propagation Simulator</h2>
                <p className="text-sm text-text-muted-v4">Query global Anycast nodes in real time to verify DNSSEC status and latency.</p>
              </div>
              <DNSPropagationChecker />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="mb-24">
              <h2 className="text-3xl font-light mb-12 text-center v4-display">Advanced Traffic Management</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <PanelCard
                  title="GeoDNS Routing"
                  description="Route users to the nearest server by country or continent for minimum latency."
                  icon={<Globe className="w-6 h-6 text-signal" />}
                />
                <PanelCard
                  title="Weighted Routing"
                  description="Perform A/B traffic splitting at the DNS level. Roll out updates gradually."
                  icon={<Share2 className="w-6 h-6 text-signal" />}
                />
                <PanelCard
                  title="Failover"
                  description="Automatic health-check based failover routing when primary endpoints go down."
                  icon={<Activity className="w-6 h-6 text-signal" />}
                />
                <PanelCard
                  title="DNS over HTTPS/TLS"
                  description="Encrypted DNS queries to protect user privacy and prevent tampering."
                  icon={<Lock className="w-6 h-6 text-signal" />}
                />
                <PanelCard
                  title="DNSSEC"
                  description="Cryptographic zone signing to prevent DNS spoofing and cache poisoning."
                  icon={<Shield className="w-6 h-6 text-signal" />}
                />
                <PanelCard
                  title="API Management"
                  description="Manage DNS via REST API, Terraform provider, and CLI tools seamlessly."
                  icon={<Code className="w-6 h-6 text-signal" />}
                />
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="mb-24 max-w-3xl mx-auto">
              <h2 className="text-3xl font-light mb-12 text-center v4-display">Unmatched Speed</h2>
              <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 font-medium text-gray-300">Provider</th>
                      <th className="px-6 py-4 font-medium text-gray-300 text-right">Avg Global Latency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    <tr className="bg-signal/10">
                      <td className="px-6 py-4 font-medium text-signal flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-signal"></span> VaultDNS
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-signal">11ms</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-gray-400">Cloudflare</td>
                      <td className="px-6 py-4 text-right font-mono text-gray-400">14ms</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-gray-400">AWS Route53</td>
                      <td className="px-6 py-4 text-right font-mono text-gray-400">17ms</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-gray-400">GoDaddy</td>
                      <td className="px-6 py-4 text-right font-mono text-gray-400">72ms</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollReveal>

          {/* Interactive DNS API Playground */}
          <ScrollReveal delay={0.35}>
            <div className="mb-24">
              <div className="text-center max-w-3xl mx-auto mb-8">
                <span className="v4-readout text-[11px] font-semibold uppercase tracking-widest text-signal px-3 py-1 rounded-full border border-signal/30 bg-signal/5">
                  Developer &amp; DevOps Ready
                </span>
                <h2 className="text-3xl font-light mt-3 mb-2 v4-display">Manage Anycast Records via API &amp; CLI</h2>
                <p className="text-sm text-text-muted-v4">
                  Test live zone record generation, trigger sub-second Anycast cache flushes, and query real-time query metrics.
                </p>
              </div>
              <DNSApiPlayground />
            </div>
          </ScrollReveal>

          {/* ── Pricing ───────────────────────────────── */}
          <ScrollReveal delay={0.4}>
            <div className="mb-24">
              <div className="text-center mb-10">
                <h2 className="v4-display text-text-primary-v4 mb-3">Simple, Transparent Pricing</h2>
                <p className="text-text-muted-v4 text-sm">Higher than GoDaddy. Way below AWS. No surprise bills.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Free */}
                <div className="v4-panel rounded-2xl p-7 border border-hairline flex flex-col">
                  <div className="text-xs font-semibold tracking-widest text-text-muted-v4 mb-2">FREE</div>
                  <div className="text-4xl font-bold text-text-primary-v4 mb-1">₹0 <span className="text-sm font-normal text-text-muted-v4">/mo</span></div>
                  <p className="text-text-secondary-v4 text-sm mb-5">Fast, reliable DNS resolution for personal websites.</p>
                  <ul className="space-y-2 text-sm text-text-secondary-v4 mb-6 flex-1">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-signal shrink-0" /> 500K queries / month</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-signal shrink-0" /> Up to 5 DNS zones</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-signal shrink-0" /> Sub-10ms global propagation</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-signal shrink-0" /> Standard DDoS protection</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-signal shrink-0" /> Community support</li>
                  </ul>
                  <Link href="/vaulthost/signup" className="v4-btn-secondary rounded-btn text-center py-2.5 text-sm">Start Free →</Link>
                </div>
                {/* Pro — highlighted */}
                <div className="v4-panel rounded-2xl p-7 border-2 border-signal relative flex flex-col">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-signal text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wider">MOST POPULAR</div>
                  <div className="text-xs font-semibold tracking-widest text-signal mb-2">PRO</div>
                  <div className="text-4xl font-bold text-text-primary-v4 mb-1">₹199 <span className="text-sm font-normal text-text-muted-v4">/mo</span></div>
                  <p className="text-text-secondary-v4 text-sm mb-5">High-query authoritative DNS with DNSSEC and health check routing.</p>
                  <ul className="space-y-2 text-sm text-text-secondary-v4 mb-6 flex-1">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-signal shrink-0" /> 10M queries / month</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-signal shrink-0" /> Up to 50 DNS zones</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-signal shrink-0" /> DNSSEC 1-click automatic signing</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-signal shrink-0" /> Health checks &amp; failover routing</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-signal shrink-0" /> Priority email support</li>
                  </ul>
                  <Link href="/vaulthost/checkout?plan=dns-pro" className="v4-btn-primary rounded-btn text-center py-2.5 text-sm">Get Started →</Link>
                </div>
                {/* Business */}
                <div className="v4-panel rounded-2xl p-7 border border-hairline flex flex-col">
                  <div className="text-xs font-semibold tracking-widest text-text-muted-v4 mb-2">BUSINESS</div>
                  <div className="text-4xl font-bold text-text-primary-v4 mb-1">₹799 <span className="text-sm font-normal text-text-muted-v4">/mo</span></div>
                  <p className="text-text-secondary-v4 text-sm mb-5">Mission-critical enterprise DNS with vanity nameservers and 100% SLA.</p>
                  <ul className="space-y-2 text-sm text-text-secondary-v4 mb-6 flex-1">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-signal shrink-0" /> Unlimited queries / month</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-signal shrink-0" /> Unlimited DNS zones</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-signal shrink-0" /> Custom vanity nameservers</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-signal shrink-0" /> Anycast BGP routing across 300+ PoPs</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-signal shrink-0" /> 100% uptime SLA guarantee</li>
                  </ul>
                  <Link href="/vaulthost/checkout?plan=dns-business" className="v4-btn-primary rounded-btn text-center py-2.5 text-sm">Get Started →</Link>
                </div>
              </div>
              {/* Competitor table */}
              <div className="overflow-x-auto rounded-2xl border border-hairline">
                <table className="w-full text-sm">
                  <thead><tr className="bg-ink-surface-2 border-b border-hairline">
                    <th className="py-3 px-5 text-left text-text-muted-v4 font-medium">Provider</th>
                    <th className="py-3 px-5 text-left text-text-muted-v4 font-medium">Entry Price</th>
                    <th className="py-3 px-5 text-left text-text-muted-v4 font-medium">Notes</th>
                  </tr></thead>
                  <tbody className="divide-y divide-hairline">
                    <tr><td className="py-3 px-5 text-signal font-semibold">VaultHost</td><td className="py-3 px-5 text-text-primary-v4">₹199/mo</td><td className="py-3 px-5 text-text-muted-v4">Zero egress. Indian data centers.</td></tr>
                    <tr><td className="py-3 px-5 text-text-secondary-v4">AWS</td><td className="py-3 px-5 text-text-secondary-v4">₹42/zone+queries</td><td className="py-3 px-5 text-text-muted-v4">Route53 query &amp; zone pricing</td></tr>
                    <tr><td className="py-3 px-5 text-text-secondary-v4">Google Cloud</td><td className="py-3 px-5 text-text-secondary-v4">₹20/zone</td><td className="py-3 px-5 text-text-muted-v4">No built-in DDoS defense on base tier</td></tr>
                    <tr><td className="py-3 px-5 text-text-secondary-v4">GoDaddy</td><td className="py-3 px-5 text-text-secondary-v4">Free with domain</td><td className="py-3 px-5 text-text-muted-v4">72ms avg latency, limited Anycast PoPs</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.5}>
            <div 
              className="rounded-3xl p-12 text-center border border-white/10 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(10,18,36,0.98), rgba(6,12,24,1))' }}
            >
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
              <div className="relative z-10">
                <h2 className="text-4xl font-light mb-6 v4-display">Ready for the fastest DNS?</h2>
                <p className="text-gray-400 mb-8 max-w-2xl mx-auto text-lg">
                  Migrate your domains in minutes with our intelligent zone importer. Zero downtime guaranteed.
                </p>
                <Link 
                  href="/portal" 
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-medium hover:bg-gray-100 transition-colors"
                >
                  Add your first domain <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
