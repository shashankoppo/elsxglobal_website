'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { ArrowRight, ShieldCheck, Key, Laptop, Eye, Terminal, ActivitySquare } from 'lucide-react';

export default function VaultZeroTrustPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-signal/30">
      <PageHeroV4
        eyebrow="Zero Trust Security"
        title={<>Replace Your VPN with <span className="text-signal">Zero Trust.</span></>}
        description="Identity-aware access proxy that protects every internal app, SSH server, and database — without VPN clients. Verify every request with SSO, MFA, and device posture checks."
      />

      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-white/10 py-12 mb-24">
              <div className="text-center">
                <div className="text-3xl font-light text-white mb-2 v4-display">SSO + MFA</div>
                <div className="text-sm text-gray-400">On Every App</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-white mb-2 v4-display">Device Trust</div>
                <div className="text-sm text-gray-400">Posture Checks</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-white mb-2 v4-display">No Client</div>
                <div className="text-sm text-gray-400">Browser-based Access</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-white mb-2 v4-display">100%</div>
                <div className="text-sm text-gray-400">Audit Trail</div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="mb-24">
              <h2 className="text-3xl font-light mb-12 text-center v4-display">The Zero Trust Ecosystem</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 rounded-2xl border border-white/10 bg-white/5">
                  <h3 className="text-xl font-medium mb-3 text-white">VaultAccess</h3>
                  <p className="text-sm text-gray-400 mb-4">Zero Trust Network Access (ZTNA) — protect internal web apps with identity policies and SSO instead of putting them on a VPN.</p>
                </div>
                <div className="p-8 rounded-2xl border border-white/10 bg-white/5">
                  <h3 className="text-xl font-medium mb-3 text-white">VaultGateway</h3>
                  <p className="text-sm text-gray-400 mb-4">Secure Web Gateway — enforce DNS/HTTP filtering and protect devices from malware and phishing on corporate networks.</p>
                </div>
                <div className="p-8 rounded-2xl border border-white/10 bg-white/5">
                  <h3 className="text-xl font-medium mb-3 text-white">VaultWARP</h3>
                  <p className="text-sm text-gray-400 mb-4">Zero Trust Network — lightweight device agent for secure browsing, routing, and deep posture evaluation.</p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="mb-24">
              <h2 className="text-3xl font-light mb-12 text-center v4-display">Comprehensive Controls</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <PanelCard
                  title="Identity Integrations"
                  description="Connect Okta, Azure AD, Google Workspace, or generic SAML providers."
                  icon={<Key className="w-6 h-6 text-signal" />}
                />
                <PanelCard
                  title="Per-App Policies"
                  description="Build granular rules (e.g. require MFA for prod DB, just SSO for wiki)."
                  icon={<ShieldCheck className="w-6 h-6 text-signal" />}
                />
                <PanelCard
                  title="Device Trust"
                  description="Verify OS version, firewall status, and disk encryption before access."
                  icon={<Laptop className="w-6 h-6 text-signal" />}
                />
                <PanelCard
                  title="Session Recording"
                  description="Optionally record SSH and RDP sessions for compliance and auditing."
                  icon={<Eye className="w-6 h-6 text-signal" />}
                />
                <PanelCard
                  title="SSH & RDP Proxying"
                  description="Access servers directly from a browser without local SSH clients."
                  icon={<Terminal className="w-6 h-6 text-signal" />}
                />
                <PanelCard
                  title="Risk-Based Auth"
                  description="Dynamically adjust authentication requirements based on user behavior."
                  icon={<ActivitySquare className="w-6 h-6 text-signal" />}
                />
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="mb-24 max-w-5xl mx-auto">
              <h2 className="text-3xl font-light mb-12 text-center v4-display">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-white/10 -translate-y-1/2 z-0"></div>
                {[
                  { step: 1, title: 'User Requests', desc: 'Employee navigates to internal.app.com.' },
                  { step: 2, title: 'Verify Context', desc: 'VaultAccess checks SSO identity & device posture.' },
                  { step: 3, title: 'Access Granted', desc: 'If compliant, user connects instantly.' },
                  { step: 4, title: 'Logs Generated', desc: 'Every action is securely audited.' }
                ].map((item) => (
                  <div key={item.step} className="relative z-10 bg-black border border-white/10 rounded-xl p-6 text-center">
                    <div className="w-10 h-10 rounded-full bg-signal/10 border border-signal text-signal flex items-center justify-center mx-auto mb-4 font-mono font-bold">
                      {item.step}
                    </div>
                    <h3 className="font-medium mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <div className="mb-24">
              <h2 className="text-3xl font-light mb-12 text-center v4-display">Zero Trust Pricing</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 rounded-2xl border border-white/10 bg-white/5 flex flex-col">
                  <h3 className="text-xl font-medium mb-2">Free</h3>
                  <div className="text-3xl font-light mb-6">₹0<span className="text-sm text-gray-400">/mo</span></div>
                  <ul className="space-y-3 text-gray-400 mb-8 flex-1 text-sm">
                    <li>✓ 5 Users</li>
                    <li>✓ 5 Applications</li>
                    <li>✓ Basic Identity (GitHub, Email)</li>
                    <li>✓ VaultAccess Proxy</li>
                  </ul>
                  <Link href="/portal" className="block text-center py-3 rounded-lg border border-white/20 hover:bg-white/10 transition-colors">
                    Start Free
                  </Link>
                </div>
                <div className="p-8 rounded-2xl border border-signal/50 bg-signal/5 flex flex-col relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-signal text-black text-xs font-bold px-3 py-1 rounded-full">RECOMMENDED</div>
                  <h3 className="text-xl font-medium mb-2 text-signal">Teams</h3>
                  <div className="text-3xl font-light mb-6 text-white">₹149<span className="text-sm text-gray-400">/user/mo</span></div>
                  <ul className="space-y-3 text-gray-300 mb-8 flex-1 text-sm">
                    <li>✓ Unlimited Applications</li>
                    <li>✓ SSO Integrations (Okta, Azure)</li>
                    <li>✓ Device Posture Checks</li>
                    <li>✓ Browser SSH/RDP</li>
                  </ul>
                  <Link href="/portal" className="block text-center py-3 rounded-lg bg-signal text-black font-medium hover:bg-signal/90 transition-colors">
                    Start Free Trial
                  </Link>
                </div>
                <div className="p-8 rounded-2xl border border-white/10 bg-white/5 flex flex-col">
                  <h3 className="text-xl font-medium mb-2">Enterprise</h3>
                  <div className="text-3xl font-light mb-6">Custom</div>
                  <ul className="space-y-3 text-gray-400 mb-8 flex-1 text-sm">
                    <li>✓ VaultGateway & VaultWARP</li>
                    <li>✓ Session Recording</li>
                    <li>✓ Data Loss Prevention (DLP)</li>
                    <li>✓ 24/7 Support SLA</li>
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
                <h2 className="text-4xl font-light mb-6 v4-display">Modernize your workforce access.</h2>
                <p className="text-gray-400 mb-8 max-w-2xl mx-auto text-lg">
                  Deploy zero trust architecture in minutes. Secure your internal tools and let employees work from anywhere.
                </p>
                <Link 
                  href="/portal" 
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-medium hover:bg-gray-100 transition-colors"
                >
                  Start your Zero Trust journey <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
