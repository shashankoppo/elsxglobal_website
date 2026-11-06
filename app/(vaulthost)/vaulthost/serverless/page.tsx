'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Cpu, Layout, List, Clock, Zap, ArrowRight, Server, Activity, Globe } from 'lucide-react';

export default function VaultServerlessPage() {
  return (
    <div className="v4-page bg-ink min-h-screen">
      <PageHeroV4
        eyebrow="Serverless Platform"
        title={
          <>
            Functions, Sites, Queues — <span className="text-signal">All Serverless.</span>
          </>
        }
        description="The complete serverless stack: Edge Functions (Workers), Serverless Hosting (Pages), Message Queues (Queues), Scheduled Jobs (Cron Workers), and Event Streaming — all managed, all auto-scaling."
      />

      {/* Product Hub */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ScrollReveal>
              <PanelCard className="v4-panel p-8 md:p-10 border border-hairline h-full flex flex-col">
                <Cpu className="w-12 h-12 text-signal mb-6" />
                <h3 className="text-2xl font-bold text-text-primary-v4 mb-4">VaultWorkers</h3>
                <p className="text-text-secondary-v4 mb-6 flex-grow">
                  Edge functions built on V8 isolates. Deploy your code globally in seconds with absolutely zero cold starts. Write in JavaScript, TypeScript, or WebAssembly.
                </p>
                <div className="text-sm font-medium text-signal">Learn more →</div>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <PanelCard className="v4-panel p-8 md:p-10 border border-hairline h-full flex flex-col">
                <Layout className="w-12 h-12 text-signal mb-6" />
                <h3 className="text-2xl font-bold text-text-primary-v4 mb-4">VaultPages</h3>
                <p className="text-text-secondary-v4 mb-6 flex-grow">
                  Serverless hosting for modern web apps. SSR and Jamstack support, git-connected deployments, and instant preview URLs for every commit.
                </p>
                <div className="text-sm font-medium text-signal">Learn more →</div>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <PanelCard className="v4-panel p-8 md:p-10 border border-hairline h-full flex flex-col">
                <List className="w-12 h-12 text-signal mb-6" />
                <h3 className="text-2xl font-bold text-text-primary-v4 mb-4">VaultQueues</h3>
                <p className="text-text-secondary-v4 mb-6 flex-grow">
                  Durable, guaranteed message queues with exactly-once delivery semantics. Decouple your services and build resilient asynchronous workflows.
                </p>
                <div className="text-sm font-medium text-signal">Learn more →</div>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <PanelCard className="v4-panel p-8 md:p-10 border border-hairline h-full flex flex-col">
                <Clock className="w-12 h-12 text-signal mb-6" />
                <h3 className="text-2xl font-bold text-text-primary-v4 mb-4">VaultCron</h3>
                <p className="text-text-secondary-v4 mb-6 flex-grow">
                  Scheduled Workers with declarative cron triggers. Run periodic background tasks, maintenance jobs, or data synchronizations reliably.
                </p>
                <div className="text-sm font-medium text-signal">Learn more →</div>
              </PanelCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Why Serverless */}
      <section className="v4-section bg-ink-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="v4-display text-text-primary-v4">Why Vault Serverless?</h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-6">
              <Server className="w-10 h-10 text-signal mx-auto mb-4" />
              <h4 className="font-bold text-text-primary-v4 mb-2">No Servers</h4>
              <p className="text-text-secondary-v4 text-sm">Focus entirely on your application code, zero infrastructure management.</p>
            </div>
            <div className="p-6">
              <Activity className="w-10 h-10 text-signal mx-auto mb-4" />
              <h4 className="font-bold text-text-primary-v4 mb-2">Infinite Scale</h4>
              <p className="text-text-secondary-v4 text-sm">Scales from 0 to millions of requests automatically and instantly.</p>
            </div>
            <div className="p-6">
              <Zap className="w-10 h-10 text-signal mx-auto mb-4" />
              <h4 className="font-bold text-text-primary-v4 mb-2">Pay per Use</h4>
              <p className="text-text-secondary-v4 text-sm">Pay only for actual execution time, never for idle resources.</p>
            </div>
            <div className="p-6">
              <Globe className="w-10 h-10 text-signal mx-auto mb-4" />
              <h4 className="font-bold text-text-primary-v4 mb-2">Global Deploy</h4>
              <p className="text-text-secondary-v4 text-sm">Your code deploys to all 300+ PoPs in seconds, running at the edge.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cold Start Comparison */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="bg-ink-surface border border-hairline rounded-3xl p-8 md:p-12">
              <h2 className="v4-display text-text-primary-v4 text-center mb-10">The End of Cold Starts</h2>
              
              <div className="space-y-6 max-w-4xl mx-auto">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-text-primary-v4 font-bold">VaultWorkers (V8 Isolates)</span>
                    <span className="text-signal font-bold">&lt;1ms</span>
                  </div>
                  <div className="w-full bg-ink rounded-full h-4">
                    <div className="bg-signal h-4 rounded-full" style={{ width: '2%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-text-secondary-v4">Lambda (Containers)</span>
                    <span className="text-text-secondary-v4">100-500ms</span>
                  </div>
                  <div className="w-full bg-ink rounded-full h-4">
                    <div className="bg-text-muted-v4 h-4 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-text-secondary-v4">Fargate (VMs)</span>
                    <span className="text-text-secondary-v4">2-10s</span>
                  </div>
                  <div className="w-full bg-ink rounded-full h-4">
                    <div className="bg-text-muted-v4 h-4 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Execution Model Diagram (Text-based) */}
      <section className="v4-section bg-ink-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="v4-display text-text-primary-v4 text-center mb-12">V8 Isolate Architecture</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
              <div className="v4-panel p-6 border border-hairline">
                <span className="text-text-primary-v4 font-bold">Request</span>
              </div>
              <ArrowRight className="text-text-muted-v4 hidden md:block" />
              <div className="v4-panel p-6 border border-signal text-signal bg-signal/5">
                <span className="font-bold">V8 Isolate Spawn</span>
              </div>
              <ArrowRight className="text-text-muted-v4 hidden md:block" />
              <div className="v4-panel p-6 border border-hairline">
                <span className="text-text-primary-v4 font-bold">Execute</span>
              </div>
              <ArrowRight className="text-text-muted-v4 hidden md:block" />
              <div className="v4-panel p-6 border border-hairline">
                <span className="text-text-primary-v4 font-bold">Respond</span>
              </div>
              <ArrowRight className="text-text-muted-v4 hidden md:block" />
              <div className="v4-panel p-6 border border-hairline text-text-muted-v4">
                <span className="font-bold">Isolate Recycled</span>
              </div>
            </div>
            <p className="text-center text-text-secondary-v4 mt-8">No OS. No container overhead. Pure function execution.</p>
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
              <h2 className="v4-display text-white mb-6">Start Building Serverless</h2>
              <p className="text-text-secondary-v4 mb-8 max-w-2xl mx-auto">
                Get started with VaultWorkers today. Generous free tier included.
              </p>
              <Link href="/vaulthost/workers" className="v4-btn-primary inline-flex items-center px-8 py-4">
                Build serverless <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
