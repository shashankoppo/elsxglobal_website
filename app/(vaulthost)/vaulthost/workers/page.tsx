'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import { Zap, Globe, Code2, Database, Clock, Wifi, Terminal, Activity, ArrowRight, Check } from 'lucide-react';

import { WorkersPlayground } from '@/components/vaulthost/interactive/WorkersPlayground';

export default function VaultWorkersPage() {
  return (
    <div className="v4-page bg-ink min-h-screen">
      <PageHeroV4 
        eyebrow="VaultWorkers"
        title={<>Run Code at the <span className="text-signal">Edge</span> — Not the Data Center</>}
        description="Deploy JavaScript, TypeScript, Python, and Rust functions that execute within milliseconds of your users — at 300+ locations globally. Zero cold starts. Zero servers to manage."
      />

      {/* Stats Bar */}
      <div className="v4-section-sm border-y border-hairline bg-ink-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">&lt;5ms</div>
              <div className="text-sm text-text-muted-v4">Latency</div>
            </div>
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">300+</div>
              <div className="text-sm text-text-muted-v4">Edge Locations</div>
            </div>
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">100K</div>
              <div className="text-sm text-text-muted-v4">Free Req/Day</div>
            </div>
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">99.999%</div>
              <div className="text-sm text-text-muted-v4">Uptime SLA</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Edge Worker Sandbox */}
      <div className="v4-section bg-ink-surface-2 border-b border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-10">
              <span className="v4-readout text-[11px] font-semibold uppercase tracking-widest text-signal px-3 py-1 rounded-full border border-signal/30 bg-signal/5">
                Interactive Edge Runtime
              </span>
              <h2 className="mt-3 text-3xl v4-display text-text-primary-v4">Write &amp; Execute Code Live at the Edge</h2>
              <p className="mt-2 text-text-secondary-v4 max-w-xl mx-auto text-sm">
                Edit the TypeScript code below and test real-time V8 isolate execution across global Anycast PoPs.
              </p>
            </div>
          </ScrollReveal>
          <WorkersPlayground />
        </div>
      </div>

      {/* Features Grid */}
      <div className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="v4-display text-text-primary-v4 mb-4">Everything you need to build at the edge</h2>
              <p className="text-text-secondary-v4 max-w-2xl mx-auto text-lg">Powerful features built for modern serverless architectures.</p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ScrollReveal>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Zap className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Zero Cold Starts</h3>
                <p className="text-text-secondary-v4">Powered by V8 isolates, your code boots in under 5ms. No container boot times, just instant execution.</p>
              </PanelCard>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Globe className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Global Edge</h3>
                <p className="text-text-secondary-v4">Your functions run in 300+ PoPs around the world automatically. No regions to configure.</p>
              </PanelCard>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Code2 className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Multi-Language</h3>
                <p className="text-text-secondary-v4">Write your workers in JS, TS, Python, Rust, or any language that compiles to WebAssembly.</p>
              </PanelCard>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Database className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Built-in KV & Storage</h3>
                <p className="text-text-secondary-v4">Access VaultKV, R2, and D1 natively from your workers without configuring external SDKs.</p>
              </PanelCard>
            </ScrollReveal>
            <ScrollReveal delay={0.4}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Clock className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Cron Triggers</h3>
                <p className="text-text-secondary-v4">Schedule recurring jobs and tasks directly from your code. No dedicated cron servers needed.</p>
              </PanelCard>
            </ScrollReveal>
            <ScrollReveal delay={0.5}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Wifi className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">WebSocket Support</h3>
                <p className="text-text-secondary-v4">Keep persistent connections alive at the edge for real-time chat, gaming, and live updates.</p>
              </PanelCard>
            </ScrollReveal>
          </div>
        </div>
      </div>


      {/* Use Cases */}
      <div className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="v4-display text-text-primary-v4 text-center mb-16">Endless Use Cases</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {['API endpoints', 'Auth middleware', 'A/B testing', 'Request transformation'].map((useCase, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="v4-panel p-6 rounded-2xl text-center flex flex-col items-center justify-center min-h-[120px]">
                  <Activity className="w-6 h-6 text-signal mb-3" />
                  <div className="font-medium text-text-primary-v4">{useCase}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="v4-section bg-ink-surface-2 border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="v4-display text-text-primary-v4 text-center mb-16">Simple, predictable pricing</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free */}
            <ScrollReveal>
              <div className="v4-panel p-8 rounded-2xl flex flex-col h-full">
                <h3 className="text-2xl font-medium text-text-primary-v4 mb-2">Free</h3>
                <div className="text-4xl font-bold text-text-primary-v4 mb-6">₹0<span className="text-lg text-text-muted-v4 font-normal">/mo</span></div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> 100K requests / day</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> 10ms CPU time per request</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> Community support</li>
                </ul>
                <Link href="/portal" className="v4-btn-secondary w-full justify-center rounded-btn py-3">Get Started</Link>
              </div>
            </ScrollReveal>
            
            {/* Pro */}
            <ScrollReveal delay={0.1}>
              <div className="v4-panel p-8 rounded-2xl flex flex-col h-full border-signal border relative">
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-signal text-ink text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</div>
                <h3 className="text-2xl font-medium text-text-primary-v4 mb-2">Pro</h3>
                <div className="text-4xl font-bold text-text-primary-v4 mb-6">₹149<span className="text-lg text-text-muted-v4 font-normal">/mo</span></div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> Unlimited requests</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> 30s CPU time per request</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> Email support</li>
                </ul>
                <Link href="/portal" className="v4-btn-primary w-full justify-center rounded-btn py-3">Upgrade to Pro</Link>
              </div>
            </ScrollReveal>

            {/* Enterprise */}
            <ScrollReveal delay={0.2}>
              <div className="v4-panel p-8 rounded-2xl flex flex-col h-full">
                <h3 className="text-2xl font-medium text-text-primary-v4 mb-2">Enterprise</h3>
                <div className="text-4xl font-bold text-text-primary-v4 mb-6">Custom</div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> Custom SLA</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> Dedicated account manager</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> Custom deployment options</li>
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
            <h2 className="v4-display text-white mb-6">Deploy your first Worker in 60 seconds</h2>
            <p className="text-text-secondary-v4 max-w-2xl mx-auto mb-10 text-lg">Join thousands of developers building fast, global applications without managing servers.</p>
            <Link href="/portal" className="v4-btn-primary inline-flex items-center rounded-btn px-8 py-4 text-lg">
              Get Started for Free <Terminal className="ml-2 w-5 h-5" />
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
