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
                <p className="text-text-secondary-v4 text-sm mb-6">Get started with edge compute at zero cost for side projects.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 100K requests / day</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 10ms CPU limit per request</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Basic KV store access</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Global Anycast across 300+ PoPs</li>
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
                <div className="text-3xl font-bold text-text-primary-v4 mb-1">₹699 <span className="text-sm font-normal text-text-muted-v4">/mo</span></div>
                <p className="text-text-secondary-v4 text-sm mb-6">Production-ready edge compute for growing web apps and APIs.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Unlimited requests (fair use)</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 30s CPU limit per request</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> KV + Storage + D1 native bindings</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Custom domains &amp; SSL</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Priority email &amp; ticket support</li>
                </ul>
              </div>
              <Link href="/vaulthost/checkout?plan=workers-pro" className="v4-btn-primary rounded-btn w-full text-center block py-2.5">Get Started</Link>
            </div>
            {/* Business tier */}
            <div className="v4-panel rounded-2xl p-6 border border-hairline flex flex-col justify-between">
              <div>
                <div className="text-text-muted-v4 text-sm font-medium mb-2">BUSINESS</div>
                <div className="text-3xl font-bold text-text-primary-v4 mb-1">₹2,499 <span className="text-sm font-normal text-text-muted-v4">/mo</span></div>
                <p className="text-text-secondary-v4 text-sm mb-6">Enterprise-grade edge compute with guaranteed 99.999% SLA.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Unlimited requests</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> No CPU execution limits</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> All bindings + Private peering</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 99.999% uptime SLA guarantee</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 24/7 dedicated support engineer</li>
                </ul>
              </div>
              <Link href="/vaulthost/checkout?plan=workers-business" className="v4-btn-primary rounded-btn w-full text-center block py-2.5">Get Started</Link>
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
                  <td className="py-3 px-4 font-semibold text-signal">VaultHost Workers</td>
                  <td className="py-3 px-4 font-medium text-text-primary-v4">₹0 Free / ₹699/mo Pro</td>
                  <td className="py-3 px-4 text-text-secondary-v4">&lt;5ms latency, zero cold starts, 300+ edge locations in India &amp; global</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-text-primary-v4">Cloudflare Workers</td>
                  <td className="py-3 px-4 text-text-secondary-v4">₹1,750/mo ($20)</td>
                  <td className="py-3 px-4 text-text-secondary-v4">Paid plan baseline for pro apps with usage multipliers</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-text-primary-v4">AWS Lambda@Edge</td>
                  <td className="py-3 px-4 text-text-secondary-v4">₹4,500+/mo</td>
                  <td className="py-3 px-4 text-text-secondary-v4">₹35/M requests + CPU duration + outbound data egress fees</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-text-primary-v4">Vercel Edge Functions</td>
                  <td className="py-3 px-4 text-text-secondary-v4">₹1,650/mo ($20/seat)</td>
                  <td className="py-3 px-4 text-text-secondary-v4">Per-seat license fees + limited CPU execution duration</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
