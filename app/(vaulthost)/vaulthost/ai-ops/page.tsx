'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Brain, LineChart, TrendingDown, ShieldAlert, Cpu, MessageSquare, ArrowRight, ShieldCheck, Activity } from 'lucide-react';

export default function VaultAIOpsPage() {
  return (
    <div className="v4-page bg-ink min-h-screen">
      <PageHeroV4
        eyebrow="VaultAIOps"
        title={
          <>
            Your Cloud. <span className="text-signal">AI-Operated.</span>
          </>
        }
        description="VaultHost is the first cloud platform with native AI Operations built in. AI agents can query metrics, propose deployments, and trigger actions — but never execute mutations without cryptographic human authorization."
      />

      {/* Decoupled Intelligence Banner */}
      <section className="v4-section-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="bg-signal/10 border border-signal/30 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
              <Brain className="w-12 h-12 text-signal flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-text-primary-v4 mb-2">Architectural Principle: Decoupled Intelligence</h3>
                <p className="text-text-secondary-v4">
                  <strong>3 Planes:</strong> Reasoning (AI), Execution (Action Gateway), Infrastructure. The AI engine only analyzes and proposes. It <em>never</em> touches infrastructure directly.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ScrollReveal delay={0.1}>
              <PanelCard className="v4-panel h-full p-8 flex flex-col border border-hairline">
                <Activity className="w-10 h-10 text-signal mb-6" />
                <h3 className="text-xl font-bold text-text-primary-v4 mb-3">Anomaly Detection</h3>
                <p className="text-text-secondary-v4 flex-grow">
                  Automatic detection of traffic spikes, error rate surges, and latency outliers using ML baselining.
                </p>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <PanelCard className="v4-panel h-full p-8 flex flex-col border border-hairline">
                <LineChart className="w-10 h-10 text-signal mb-6" />
                <h3 className="text-xl font-bold text-text-primary-v4 mb-3">Auto-Scaling Props</h3>
                <p className="text-text-secondary-v4 flex-grow">
                  AI proposes optimal replica counts based on historical traffic patterns and forecasted demand.
                </p>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <PanelCard className="v4-panel h-full p-8 flex flex-col border border-hairline">
                <TrendingDown className="w-10 h-10 text-signal mb-6" />
                <h3 className="text-xl font-bold text-text-primary-v4 mb-3">Cost Optimization</h3>
                <p className="text-text-secondary-v4 flex-grow">
                  Identifies overprovisioned resources, recommends right-sizing, and estimates monthly savings.
                </p>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <PanelCard className="v4-panel h-full p-8 flex flex-col border border-hairline">
                <ShieldAlert className="w-10 h-10 text-signal mb-6" />
                <h3 className="text-xl font-bold text-text-primary-v4 mb-3">Incident RCA</h3>
                <p className="text-text-secondary-v4 flex-grow">
                  When incidents occur, AI traces logs, correlates events, and generates human-readable Root Cause Analysis in seconds.
                </p>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.5}>
              <PanelCard className="v4-panel h-full p-8 flex flex-col border border-hairline">
                <Cpu className="w-10 h-10 text-signal mb-6" />
                <h3 className="text-xl font-bold text-text-primary-v4 mb-3">Capacity Planning</h3>
                <p className="text-text-secondary-v4 flex-grow">
                  Predictive capacity planning forecasts your 30/60/90 day resource needs based on growth trends.
                </p>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.6}>
              <PanelCard className="v4-panel h-full p-8 flex flex-col border border-hairline">
                <MessageSquare className="w-10 h-10 text-signal mb-6" />
                <h3 className="text-xl font-bold text-text-primary-v4 mb-3">Natural Language Chat</h3>
                <p className="text-text-secondary-v4 flex-grow">
                  Chat with your infrastructure: "What's causing high latency on api.example.com?"
                </p>
              </PanelCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Action Gateway Safety */}
      <section className="v4-section bg-ink-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <ShieldCheck className="w-16 h-16 text-signal mx-auto mb-6" />
              <h2 className="v4-display text-text-primary-v4">Action Gateway Safety Matrix</h2>
              <p className="text-text-secondary-v4 mt-4 max-w-2xl mx-auto">
                All mutations require human verification. Operations are classified into risk tiers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-ink border-t-4 border-green-500 p-6 rounded-b-xl border-x border-b border-hairline">
                <h4 className="font-bold text-text-primary-v4 mb-2">Tier 0 (Safe)</h4>
                <p className="text-sm text-text-secondary-v4">Query metrics, fetch logs, read configurations.</p>
              </div>
              <div className="bg-ink border-t-4 border-cyan-500 p-6 rounded-b-xl border-x border-b border-hairline">
                <h4 className="font-bold text-text-primary-v4 mb-2">Tier 1 (Low)</h4>
                <p className="text-sm text-text-secondary-v4">Scale up replicas, add read replicas.</p>
              </div>
              <div className="bg-ink border-t-4 border-amber-500 p-6 rounded-b-xl border-x border-b border-hairline">
                <h4 className="font-bold text-text-primary-v4 mb-2">Tier 2 (Medium)</h4>
                <p className="text-sm text-text-secondary-v4">Scale down, restart services, clear cache.</p>
              </div>
              <div className="bg-ink border-t-4 border-red-500 p-6 rounded-b-xl border-x border-b border-hairline">
                <h4 className="font-bold text-text-primary-v4 mb-2">Tier 3 (High)</h4>
                <p className="text-sm text-text-secondary-v4">Delete resources, modify DNS, change IAM.</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Integrations */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-text-primary-v4 mb-6">Unified AI Context</h2>
            <p className="text-text-secondary-v4 max-w-3xl mx-auto">
              VaultAIOps natively integrates with VaultMonitor metrics, VaultWorkers logs, D1 query analytics, and R2 storage telemetry to provide the AI engine with complete visibility across your stack.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <div 
              className="rounded-3xl border border-hairline p-12"
              style={{ background: 'linear-gradient(135deg, rgba(10,18,36,0.98), rgba(6,12,24,1))' }}
            >
              <h2 className="v4-display text-white mb-6">Embrace the Future of Cloud Ops</h2>
              <div className="flex justify-center gap-4 mt-8">
                <Link href="/docs/ai-agent" className="v4-btn-secondary px-6 py-3">
                  Learn Architecture
                </Link>
                <Link href="/portal" className="v4-btn-primary px-6 py-3 flex items-center">
                  Enable AIOps <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
