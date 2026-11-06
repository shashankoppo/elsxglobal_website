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

      {/* Premium CTA */}
      <div className="v4-section" style={{ background: 'linear-gradient(135deg, rgba(10,18,36,0.98), rgba(6,12,24,1))' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
          <ScrollReveal>
            <h2 className="v4-display text-white mb-6">Start storing for free</h2>
            <p className="text-text-secondary-v4 max-w-2xl mx-auto mb-10 text-lg">Sign up today and get your first 10GB of storage completely free, forever.</p>
            <Link href="/portal" className="v4-btn-primary inline-flex items-center rounded-btn px-8 py-4 text-lg">
              Get 10GB Free <HardDrive className="ml-2 w-5 h-5" />
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
