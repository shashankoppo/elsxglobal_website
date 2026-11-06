'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { ArrowRight, BrainCircuit, ShieldQuestion, ShieldAlert, ShieldCheck, Timer, CheckSquare } from 'lucide-react';

export default function VaultBotManagementPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-signal/30">
      <PageHeroV4
        eyebrow="Bot Management"
        title={<>Stop Bad Bots. <span className="text-signal">Welcome Good Ones.</span></>}
        description="Machine learning-powered bot detection that blocks scrapers, credential stuffers, fake account creation, and API abuse — while allowing Googlebot, Bingbot, and legitimate crawlers through."
      />

      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-white/10 py-12 mb-24">
              <div className="text-center">
                <div className="text-4xl font-light text-white mb-2 v4-display">99.7%</div>
                <div className="text-sm text-gray-400">Detection Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-light text-white mb-2 v4-display">&lt;0.01%</div>
                <div className="text-sm text-gray-400">False Positive Rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-light text-white mb-2 v4-display">6h</div>
                <div className="text-sm text-gray-400">ML Model Updates</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-light text-white mb-2 v4-display">50+</div>
                <div className="text-sm text-gray-400">Bot Signatures</div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="mb-24">
              <h2 className="text-3xl font-light mb-8 text-center v4-display">Bot Categories Blocked</h2>
              <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                {['Credential Stuffing', 'Content Scraping', 'Fake Account Creation', 'Inventory Hoarding', 'API Abuse', 'Click Fraud', 'DDoS Botnets', 'Vulnerability Scanning'].map((category) => (
                  <span key={category} className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm font-medium hover:border-signal/50 transition-colors">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="mb-24">
              <h2 className="text-3xl font-light mb-12 text-center v4-display">Advanced Protection Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <PanelCard
                  title="ML Fingerprinting"
                  description="Device, browser, and behavior analysis using trained machine learning models."
                  icon={<BrainCircuit className="w-6 h-6 text-signal" />}
                />
                <PanelCard
                  title="JavaScript Challenge"
                  description="Invisible cryptographic challenges that basic bots cannot solve."
                  icon={<ShieldQuestion className="w-6 h-6 text-signal" />}
                />
                <PanelCard
                  title="CAPTCHA Integration"
                  description="Seamless fallback to interactive CAPTCHAs for suspicious but unconfirmed traffic."
                  icon={<CheckSquare className="w-6 h-6 text-signal" />}
                />
                <PanelCard
                  title="IP Reputation"
                  description="Real-time threat intelligence database blocking known bad actors globally."
                  icon={<ShieldCheck className="w-6 h-6 text-signal" />}
                />
                <PanelCard
                  title="Rate Limiting"
                  description="Enforce thresholds per-IP, per-user, or per-endpoint to stop abuse."
                  icon={<Timer className="w-6 h-6 text-signal" />}
                />
                <PanelCard
                  title="Allowlist Management"
                  description="Safely whitelist essential crawlers like Googlebot, Bing, or your own internal tools."
                  icon={<ShieldCheck className="w-6 h-6 text-signal" />}
                />
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="mb-24 max-w-3xl mx-auto">
              <h2 className="text-3xl font-light mb-12 text-center v4-display">How We Detect Bots</h2>
              <div className="bg-white/5 rounded-2xl border border-white/10 p-8 space-y-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-white font-medium">Browser Fingerprinting</span>
                  <span className="text-gray-400 text-sm">Validating canvas, WebGL, fonts</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-white font-medium">TLS Fingerprinting (JA3)</span>
                  <span className="text-gray-400 text-sm">Analyzing SSL hello packets</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-white font-medium">Behavioral Analysis</span>
                  <span className="text-gray-400 text-sm">Mouse movements, keystroke dynamics</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-white font-medium">Request Pattern Analysis</span>
                  <span className="text-gray-400 text-sm">Detecting automated traversal</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">IP Reputation Scoring</span>
                  <span className="text-gray-400 text-sm">Datacenter, TOR, Proxy detection</span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <div className="mb-24">
              <h2 className="text-3xl font-light mb-12 text-center v4-display">Bot Management Pricing</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 rounded-2xl border border-white/10 bg-white/5 flex flex-col">
                  <h3 className="text-xl font-medium mb-2">Free</h3>
                  <div className="text-3xl font-light mb-6">₹0<span className="text-sm text-gray-400">/mo</span></div>
                  <ul className="space-y-3 text-gray-400 mb-8 flex-1 text-sm">
                    <li>✓ Basic Rate Limiting</li>
                    <li>✓ Known Bad IP Blocking</li>
                    <li>✓ Standard Analytics</li>
                  </ul>
                  <Link href="/portal" className="block text-center py-3 rounded-lg border border-white/20 hover:bg-white/10 transition-colors">
                    Start Free
                  </Link>
                </div>
                <div className="p-8 rounded-2xl border border-signal/50 bg-signal/5 flex flex-col relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-signal text-black text-xs font-bold px-3 py-1 rounded-full">RECOMMENDED</div>
                  <h3 className="text-xl font-medium mb-2 text-signal">Pro</h3>
                  <div className="text-3xl font-light mb-6 text-white">₹999<span className="text-sm text-gray-400">/mo</span></div>
                  <ul className="space-y-3 text-gray-300 mb-8 flex-1 text-sm">
                    <li>✓ ML Bot Detection</li>
                    <li>✓ Invisible JS Challenges</li>
                    <li>✓ Advanced Fingerprinting</li>
                    <li>✓ Granular Controls</li>
                  </ul>
                  <Link href="/portal" className="block text-center py-3 rounded-lg bg-signal text-black font-medium hover:bg-signal/90 transition-colors">
                    Upgrade to Pro
                  </Link>
                </div>
                <div className="p-8 rounded-2xl border border-white/10 bg-white/5 flex flex-col">
                  <h3 className="text-xl font-medium mb-2">Enterprise</h3>
                  <div className="text-3xl font-light mb-6">Custom</div>
                  <ul className="space-y-3 text-gray-400 mb-8 flex-1 text-sm">
                    <li>✓ Custom SLAs</li>
                    <li>✓ Dedicated Threat Analyst</li>
                    <li>✓ Custom Bot Signatures</li>
                    <li>✓ API integrations</li>
                  </ul>
                  <Link href="/portal" className="block text-center py-3 rounded-lg border border-white/20 hover:bg-white/10 transition-colors">
                    Contact Sales
                  </Link>
                </div>
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
                <h2 className="text-4xl font-light mb-6 v4-display">Protect your endpoints today.</h2>
                <p className="text-gray-400 mb-8 max-w-2xl mx-auto text-lg">
                  Enable machine-learning powered bot protection with a single click and stop malicious traffic instantly.
                </p>
                <Link 
                  href="/portal" 
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-medium hover:bg-gray-100 transition-colors"
                >
                  Enable bot protection <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
