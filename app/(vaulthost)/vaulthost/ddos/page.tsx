'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { ArrowRight, ShieldAlert, Activity, Route, Fingerprint, Map, CheckCircle2 } from 'lucide-react';

export default function VaultDDoSPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-signal/30">
      <PageHeroV4
        eyebrow="DDoS Protection"
        title={<>Unmetered DDoS Protection. <span className="text-signal">Always On.</span></>}
        description="Automatic, unmetered DDoS mitigation at L3/L4/L7. Every VaultHost plan includes unlimited DDoS protection — no extra charge, no bandwidth caps. Average mitigation in under 3 seconds."
      />

      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-white/10 py-12 mb-24">
              <div className="text-center">
                <div className="text-4xl font-light text-white mb-2 v4-display">&lt;3s</div>
                <div className="text-sm text-gray-400">Mitigation Time</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-light text-white mb-2 v4-display">Unlimited</div>
                <div className="text-sm text-gray-400">Attack Size</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-light text-white mb-2 v4-display">L3/L4/L7</div>
                <div className="text-sm text-gray-400">Full Stack Coverage</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-light text-white mb-2 v4-display">₹0</div>
                <div className="text-sm text-gray-400">Extra Charge</div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="mb-24">
              <h2 className="text-3xl font-light mb-8 text-center v4-display">Attack Types Covered</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {['TCP SYN Flood', 'UDP Flood', 'ICMP Flood', 'HTTP Flood', 'Slowloris', 'DNS Amplification', 'NTP Amplification', 'Application Layer'].map((attack) => (
                  <div key={attack} className="p-4 rounded-xl border border-white/10 bg-white/5 text-center text-sm font-medium hover:border-red-500/50 hover:bg-red-500/5 transition-colors">
                    {attack}
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="mb-24">
              <h2 className="text-3xl font-light mb-12 text-center v4-display">Enterprise-Grade Mitigation</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <PanelCard
                  title="Always-On Protection"
                  description="No manual activation required. Traffic is constantly monitored and scrubbed inline."
                  icon={<ShieldAlert className="w-6 h-6 text-signal" />}
                />
                <PanelCard
                  title="Anycast Scrubbing"
                  description="Attacks are absorbed at the edge globally. Only clean traffic is forwarded to origin."
                  icon={<Activity className="w-6 h-6 text-signal" />}
                />
                <PanelCard
                  title="FlowSpec BGP"
                  description="Route-level blocking at the network layer to drop massive volumetric attacks instantly."
                  icon={<Route className="w-6 h-6 text-signal" />}
                />
                <PanelCard
                  title="L7 Challenge"
                  description="Dynamic CAPTCHA and JS challenges for suspicious application-layer traffic."
                  icon={<Fingerprint className="w-6 h-6 text-signal" />}
                />
                <PanelCard
                  title="Real-time Threat Map"
                  description="Live analytics dashboard showing attack origins, vectors, and mitigated bandwidth."
                  icon={<Map className="w-6 h-6 text-signal" />}
                />
                <PanelCard
                  title="Zero Impact"
                  description="99.9% accuracy with <0.001% false positive rate for legitimate traffic."
                  icon={<CheckCircle2 className="w-6 h-6 text-signal" />}
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
                  { step: 1, title: 'Attack Detected', desc: 'Real-time anomaly detection spots spikes.' },
                  { step: 2, title: 'Traffic Rerouted', desc: 'BGP anycast routes to scrubbing centers.' },
                  { step: 3, title: 'Packets Dropped', desc: 'Malicious packets discarded instantly.' },
                  { step: 4, title: 'Clean Traffic', desc: 'Valid requests forwarded to origin.' }
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
              <div className="max-w-3xl mx-auto p-8 rounded-2xl border border-signal bg-signal/5 text-center">
                <ShieldAlert className="w-12 h-12 text-signal mx-auto mb-4" />
                <h2 className="text-2xl font-light mb-2 v4-display text-signal">INCLUDED FREE</h2>
                <p className="text-lg text-gray-300 mb-0">
                  DDoS protection isn't an upsell. It is included automatically on all VaultHost plans at no extra cost.
                </p>
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
                <h2 className="text-4xl font-light mb-6 v4-display">Sleep well during attacks.</h2>
                <p className="text-gray-400 mb-8 max-w-2xl mx-auto text-lg">
                  Deploy your applications behind VaultHost and let our edge infrastructure absorb the hits.
                </p>
                <Link 
                  href="/portal" 
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-medium hover:bg-gray-100 transition-colors"
                >
                  Activate DDoS protection <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
