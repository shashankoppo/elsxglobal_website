'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Server, Database, Globe, Cpu, Shield, Code, CheckCircle, ArrowRight, Activity, Cpu as CpuIcon } from 'lucide-react';

export default function VaultCloudPage() {
  return (
    <div className="v4-page bg-ink min-h-screen">
      <PageHeroV4
        eyebrow="VaultCloud"
        title={
          <>
            Your Entire Cloud Stack. <span className="text-signal">One Platform.</span>
          </>
        }
        description="From edge compute to managed databases, object storage to AI inference — VaultHost provides every cloud primitive you need to build, scale, and operate globally."
      />

      {/* Platform Categories Grid */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="v4-display text-text-primary-v4">A Complete Platform</h2>
              <p className="text-text-secondary-v4 mt-4 max-w-2xl mx-auto text-lg">
                Say goodbye to piecing together disparate services. VaultCloud unifies the developer experience.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ScrollReveal delay={0.1}>
              <PanelCard className="v4-panel h-full p-8 border border-hairline flex flex-col">
                <Server className="w-10 h-10 text-signal mb-6" />
                <h3 className="text-xl font-bold text-text-primary-v4 mb-4">Compute</h3>
                <ul className="space-y-3 text-text-secondary-v4 flex-grow">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-text-muted-v4" /> Workers (Edge Functions)</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-text-muted-v4" /> Pages (Serverless Hosting)</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-text-muted-v4" /> Containers (Managed runtime)</li>
                </ul>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <PanelCard className="v4-panel h-full p-8 border border-hairline flex flex-col">
                <Database className="w-10 h-10 text-signal mb-6" />
                <h3 className="text-xl font-bold text-text-primary-v4 mb-4">Data</h3>
                <ul className="space-y-3 text-text-secondary-v4 flex-grow">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-text-muted-v4" /> R2 Storage (Zero-egress Object)</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-text-muted-v4" /> D1 Database (Serverless SQL)</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-text-muted-v4" /> KV & Vectorize</li>
                </ul>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <PanelCard className="v4-panel h-full p-8 border border-hairline flex flex-col">
                <Globe className="w-10 h-10 text-signal mb-6" />
                <h3 className="text-xl font-bold text-text-primary-v4 mb-4">Network</h3>
                <ul className="space-y-3 text-text-secondary-v4 flex-grow">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-text-muted-v4" /> Premium DNS</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-text-muted-v4" /> DDoS Mitigation</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-text-muted-v4" /> Load Balancers & Tunnels</li>
                </ul>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <PanelCard className="v4-panel h-full p-8 border border-hairline flex flex-col">
                <CpuIcon className="w-10 h-10 text-signal mb-6" />
                <h3 className="text-xl font-bold text-text-primary-v4 mb-4">AI</h3>
                <ul className="space-y-3 text-text-secondary-v4 flex-grow">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-text-muted-v4" /> AI Gateway</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-text-muted-v4" /> Edge Inference</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-text-muted-v4" /> Machine Learning Pipelines</li>
                </ul>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.5}>
              <PanelCard className="v4-panel h-full p-8 border border-hairline flex flex-col">
                <Shield className="w-10 h-10 text-signal mb-6" />
                <h3 className="text-xl font-bold text-text-primary-v4 mb-4">Security</h3>
                <ul className="space-y-3 text-text-secondary-v4 flex-grow">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-text-muted-v4" /> Zero Trust Access</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-text-muted-v4" /> WAF (Web Application Firewall)</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-text-muted-v4" /> Bot Management & SSL</li>
                </ul>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.6}>
              <PanelCard className="v4-panel h-full p-8 border border-hairline flex flex-col">
                <Code className="w-10 h-10 text-signal mb-6" />
                <h3 className="text-xl font-bold text-text-primary-v4 mb-4">Developer Tools</h3>
                <ul className="space-y-3 text-text-secondary-v4 flex-grow">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-text-muted-v4" /> VaultAnalytics</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-text-muted-v4" /> Image Optimization</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-text-muted-v4" /> Stream & Email Routing</li>
                </ul>
              </PanelCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Global Infrastructure Map (Text/Icon) */}
      <section className="v4-section bg-ink-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="w-full lg:w-1/2">
                <h2 className="v4-display text-text-primary-v4 mb-6">Global by Default</h2>
                <p className="text-text-secondary-v4 text-lg mb-8">
                  Deploy once, run everywhere. VaultCloud's underlying infrastructure is deeply integrated with our anycast edge network, bringing compute and data instantly closer to your users.
                </p>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-3xl font-bold text-signal mb-2">300+</div>
                    <div className="text-text-muted-v4 text-sm uppercase tracking-wider">Edge PoPs</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-signal mb-2">15+</div>
                    <div className="text-text-muted-v4 text-sm uppercase tracking-wider">Data Center Regions</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-signal mb-2">99.999%</div>
                    <div className="text-text-muted-v4 text-sm uppercase tracking-wider">Uptime SLA</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-signal mb-2">12 Tbps</div>
                    <div className="text-text-muted-v4 text-sm uppercase tracking-wider">DDoS Capacity</div>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-1/2 bg-ink-surface-2 p-8 rounded-3xl border border-hairline flex items-center justify-center min-h-[300px]">
                <Activity className="w-32 h-32 text-signal opacity-20" />
                <span className="absolute text-text-secondary-v4 font-medium">[ Interactive Map Integration ]</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Compliance & Pricing */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ScrollReveal>
              <div className="v4-panel p-10 h-full border border-hairline rounded-3xl">
                <Shield className="w-8 h-8 text-signal mb-6" />
                <h3 className="text-2xl font-bold text-text-primary-v4 mb-4">Enterprise Compliance</h3>
                <p className="text-text-secondary-v4 mb-6">Built to meet the strict security and privacy standards of enterprise organizations.</p>
                <div className="flex flex-wrap gap-3">
                  <span className="bg-ink px-4 py-2 rounded-full border border-hairline text-sm text-text-primary-v4">SOC 2 Type II</span>
                  <span className="bg-ink px-4 py-2 rounded-full border border-hairline text-sm text-text-primary-v4">ISO 27001</span>
                  <span className="bg-ink px-4 py-2 rounded-full border border-hairline text-sm text-text-primary-v4">HIPAA-ready</span>
                  <span className="bg-ink px-4 py-2 rounded-full border border-hairline text-sm text-text-primary-v4">PCI-DSS Level 1</span>
                  <span className="bg-ink px-4 py-2 rounded-full border border-hairline text-sm text-text-primary-v4">GDPR Compliant</span>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div 
                className="p-10 h-full border border-hairline rounded-3xl"
                style={{ background: 'linear-gradient(135deg, rgba(10,18,36,0.98), rgba(6,12,24,1))' }}
              >
                <div className="w-8 h-8 rounded-full bg-signal/20 flex items-center justify-center mb-6">
                  <div className="w-3 h-3 bg-signal rounded-full"></div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Pricing Philosophy</h3>
                <p className="text-text-secondary-v4 text-lg italic leading-relaxed">
                  "No egress fees within VaultHost. No surprise bills. Every product priced transparently — pay exactly what you use."
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="v4-section bg-ink-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="v4-display text-text-primary-v4 mb-6">Ready to build on VaultCloud?</h2>
            <div className="flex justify-center gap-4 mt-10">
              <Link href="/vaulthost" className="v4-btn-secondary px-6 py-3">
                Explore platform
              </Link>
              <Link href="/portal/signup" className="v4-btn-primary px-6 py-3 flex items-center">
                Start free <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
