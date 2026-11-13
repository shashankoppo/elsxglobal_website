'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import { Database, ShieldCheck, Globe, Clock, Link as LinkIcon, Lock, ArrowRight, HardDrive, Cpu, Cloud, Check } from 'lucide-react';
import { R2BucketExplorer } from '@/components/vaulthost/interactive/R2BucketExplorer';
import { S3CodePlayground } from '@/components/vaulthost/interactive/S3CodePlayground';

export default function VaultR2Page() {
  return (
    <div className="v4-page bg-ink min-h-screen">
      <PageHeroV4 
        eyebrow="VaultR2 Object Storage"
        title={<>S3-Compatible Storage. <span className="text-signal">Zero Egress Fees.</span></>}
        description="Store unlimited objects with S3-compatible APIs. No surprise bandwidth bills. Free egress within the VaultHost network — pay only for storage."
      />

      {/* Stats Bar */}
      <div className="v4-section-sm border-y border-hairline bg-ink-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">₹1.5</div>
              <div className="text-sm text-text-muted-v4">per GB/mo</div>
            </div>
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">11 9s</div>
              <div className="text-sm text-text-muted-v4">Durability SLA</div>
            </div>
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">Zero</div>
              <div className="text-sm text-text-muted-v4">Internal Egress</div>
            </div>
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">100%</div>
              <div className="text-sm text-text-muted-v4">S3-Compatible</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="v4-display text-text-primary-v4 mb-4">Object Storage, without the lock-in</h2>
              <p className="text-text-secondary-v4 max-w-2xl mx-auto text-lg">Designed for developers who want simplicity, speed, and transparent pricing.</p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ScrollReveal>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Database className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">S3 Compatible</h3>
                <p className="text-text-secondary-v4">Works seamlessly with existing AWS S3 SDKs and tools. Just change the endpoint URL.</p>
              </PanelCard>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <ShieldCheck className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Zero Egress Fees</h3>
                <p className="text-text-secondary-v4">Never pay for transferring data out to your VaultWorkers or pages again.</p>
              </PanelCard>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Globe className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Global Replication</h3>
                <p className="text-text-secondary-v4">Your data is automatically distributed closer to your users for lower latency reads.</p>
              </PanelCard>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Clock className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Lifecycle Rules</h3>
                <p className="text-text-secondary-v4">Automatically delete or archive objects based on age to save costs effortlessly.</p>
              </PanelCard>
            </ScrollReveal>
            <ScrollReveal delay={0.4}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <LinkIcon className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Presigned URLs</h3>
                <p className="text-text-secondary-v4">Generate secure, time-limited URLs for direct browser uploads or temporary downloads.</p>
              </PanelCard>
            </ScrollReveal>
            <ScrollReveal delay={0.5}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Lock className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">CORS & Access Control</h3>
                <p className="text-text-secondary-v4">Granular bucket policies and cross-origin resource sharing configured instantly.</p>
              </PanelCard>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Interactive S3 Bucket Explorer & Egress Calculator */}
      <div className="v4-section-sm bg-ink-surface border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-10">
              <span className="v4-readout text-[11px] font-semibold uppercase tracking-widest text-signal px-3 py-1 rounded-full border border-signal/30 bg-signal/5">
                Interactive S3 Console
              </span>
              <h2 className="mt-3 text-3xl v4-display text-text-primary-v4">Explore S3 Buckets &amp; Calculate Egress Savings</h2>
              <p className="mt-2 text-text-secondary-v4 max-w-xl mx-auto text-sm">
                Interact with the S3-compatible bucket explorer, generate temporary presigned download links, and calculate your savings vs AWS.
              </p>
            </div>
          </ScrollReveal>
          <R2BucketExplorer />
        </div>
      </div>

      {/* Comparison Table */}
      <div className="v4-section bg-ink-surface-2 border-b border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="v4-display text-text-primary-v4 mb-4">Stop overpaying for egress</h2>
              <p className="text-text-secondary-v4 max-w-2xl mx-auto text-lg">Compare a typical scenario: 1TB storage with 10TB of egress bandwidth.</p>
            </div>
          </ScrollReveal>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="p-4 text-text-muted-v4 font-medium">Provider</th>
                  <th className="p-4 text-text-muted-v4 font-medium">Storage (1TB)</th>
                  <th className="p-4 text-text-muted-v4 font-medium">Egress (10TB)</th>
                  <th className="p-4 text-text-primary-v4 font-bold text-xl">Total / Month</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-hairline bg-ink-surface/50">
                  <td className="p-4 text-text-primary-v4 font-medium flex items-center"><Cloud className="w-5 h-5 mr-2 text-signal" /> VaultR2</td>
                  <td className="p-4 text-text-secondary-v4">₹1,500</td>
                  <td className="p-4 text-signal font-bold">₹0</td>
                  <td className="p-4 text-signal font-bold text-xl">₹1,500</td>
                </tr>
                <tr className="border-b border-hairline">
                  <td className="p-4 text-text-primary-v4">AWS S3</td>
                  <td className="p-4 text-text-secondary-v4">~₹1,900</td>
                  <td className="p-4 text-text-secondary-v4">~₹73,100</td>
                  <td className="p-4 text-text-primary-v4 font-medium text-xl">₹75,000+</td>
                </tr>
                <tr>
                  <td className="p-4 text-text-primary-v4">Google Cloud Storage</td>
                  <td className="p-4 text-text-secondary-v4">~₹1,500</td>
                  <td className="p-4 text-text-secondary-v4">~₹58,500</td>
                  <td className="p-4 text-text-primary-v4 font-medium text-xl">₹60,000+</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Multi-Language Code Playground Block */}
      <div className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="mb-10 text-center">
              <span className="v4-readout text-[11px] font-semibold uppercase tracking-widest text-signal px-3 py-1 rounded-full border border-signal/30 bg-signal/5">
                Drop-in S3 SDK Compatibility
              </span>
              <h2 className="mt-3 text-3xl v4-display text-text-primary-v4">Code in Node.js, cURL, Python &amp; Go</h2>
              <p className="mt-2 text-text-secondary-v4 max-w-xl mx-auto text-sm">
                Switch endpoint URLs, run operations without code changes, and stream assets globally with zero egress fees.
              </p>
            </div>
          </ScrollReveal>
          <S3CodePlayground />
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
                <p className="text-text-secondary-v4 text-sm mb-6">Store files, backups, and media with zero egress fees forever.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 10GB NVMe object storage</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Zero data egress fees</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 1M API operations / month</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> S3 API compatibility</li>
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
                <div className="text-3xl font-bold text-text-primary-v4 mb-1">₹499 <span className="text-sm font-normal text-text-muted-v4">/mo</span></div>
                <p className="text-text-secondary-v4 text-sm mb-6">Reliable, high-throughput storage for production applications.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 100GB NVMe object storage</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Zero data egress fees forever</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 10M API operations / month</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Custom bucket domains &amp; CDN caching</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Priority email support</li>
                </ul>
              </div>
              <Link href="/vaulthost/checkout?plan=storage-pro" className="v4-btn-primary rounded-btn w-full text-center block py-2.5">Get Started</Link>
            </div>
            {/* Business tier */}
            <div className="v4-panel rounded-2xl p-6 border border-hairline flex flex-col justify-between">
              <div>
                <div className="text-text-muted-v4 text-sm font-medium mb-2">BUSINESS</div>
                <div className="text-3xl font-bold text-text-primary-v4 mb-1">₹1,999 <span className="text-sm font-normal text-text-muted-v4">/mo</span></div>
                <p className="text-text-secondary-v4 text-sm mb-6">Multi-terabyte distributed storage with enterprise lifecycle rules.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 1TB NVMe object storage</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Zero data egress fees forever</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Unlimited API operations</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Multi-region replication &amp; versioning</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 24/7 dedicated support &amp; 99.99% SLA</li>
                </ul>
              </div>
              <Link href="/vaulthost/checkout?plan=storage-business" className="v4-btn-primary rounded-btn w-full text-center block py-2.5">Get Started</Link>
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
                  <td className="py-3 px-4 font-semibold text-signal">VaultHost Storage</td>
                  <td className="py-3 px-4 font-medium text-text-primary-v4">₹0 Free / ₹499 Pro / ₹1,999 Business</td>
                  <td className="py-3 px-4 text-text-secondary-v4">Zero egress charges forever, S3 drop-in compatibility, fast Pune/Mumbai storage</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-text-primary-v4">AWS S3</td>
                  <td className="py-3 px-4 text-text-secondary-v4">₹15,000+/mo (for 1TB with egress)</td>
                  <td className="py-3 px-4 text-text-secondary-v4">₹8/GB storage + ₹7/GB outbound bandwidth penalty fees</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-text-primary-v4">Google Cloud Storage</td>
                  <td className="py-3 px-4 text-text-secondary-v4">₹14,000+/mo (for 1TB)</td>
                  <td className="py-3 px-4 text-text-secondary-v4">₹8.5/GB + high egress fees to public internet</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-text-primary-v4">Cloudflare R2</td>
                  <td className="py-3 px-4 text-text-secondary-v4">₹1,250/mo ($15)</td>
                  <td className="py-3 px-4 text-text-secondary-v4">$0.015/GB + Class A/B operation charges</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
