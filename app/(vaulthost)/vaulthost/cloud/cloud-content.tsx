'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { Cloud, Zap, ArrowRight, Server, Shield, Network, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { HostingTierPage } from '@/components/hosting/tier-page';

const FEATURES = [
  { icon: BrainCircuit, title: 'AI-Ops Auto-Scaling', desc: 'Predictive machine learning models allocate resources ahead of traffic spikes instantly.' },
  { icon: Network, title: 'Multi-Region Load Balancing', desc: 'Distribute traffic across 38+ edge locations globally for zero-downtime reliability.' },
  { icon: Cloud, title: 'Managed Kubernetes', desc: 'Deploy containerized workloads effortlessly with our fully managed K8s orchestration.' },
  { icon: Zap, title: 'Microsecond Latency', desc: 'Built on next-gen hardware with direct fiber peerings to major ISPs globally.' },
];

export default function CloudContent() {
  return (
    <div className="v4-page pb-32">
      <PageHeroV4
        eyebrow="Cloud Infrastructure"
        eyebrowIcon={Cloud}
        title={<>Infinite Scale.<br/>Zero Operations.</>}
        description="Deploy to our globally distributed, auto-scaling cloud network. Built for enterprises that demand 99.999% uptime and microsecond latency."
      >
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link href="#pricing" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-btn v4-btn-primary text-sm font-medium">
            View Pricing <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/vaulthost/pricing" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-btn v4-btn-secondary text-sm font-medium">
            Custom Architecture
          </Link>
        </div>
      </PageHeroV4>

      {/* Features Grid */}
      <section className="v4-section-sm border-t border-hairline bg-ink-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feat) => (
              <div key={feat.title} className="liquid-glass-card rounded-2xl p-6">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feat.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feat.title}</h3>
                <p className="text-sm text-text-muted-v4">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
          <h2 className="text-3xl font-bold v4-display mb-4">Cloud Compute Instances</h2>
          <p className="text-text-secondary-v4 max-w-2xl mx-auto">Predictable pricing for auto-scaling infrastructure. Pay for what you reserve.</p>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HostingTierPage tier="cloud" />
        </div>
      </section>
    </div>
  );
}
