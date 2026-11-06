'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { ArrowRight, HeartPulse, ShieldAlert, Users, Lock, Server, Link as LinkIcon } from 'lucide-react';

export default function VaultLoadBalancerPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-signal/30">
      <PageHeroV4
        eyebrow="VaultLoadBalancer"
        title={<>Smart Traffic Distribution. <span className="text-signal">Global Scale.</span></>}
        description="Distribute traffic intelligently across your servers with active health checks, geographic steering, session affinity, and automatic failover. Works at both DNS and HTTP layers."
      />

      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-white/10 py-12 mb-24">
              <div className="text-center">
                <div className="text-4xl font-light text-white mb-2 v4-display">&lt;1s</div>
                <div className="text-sm text-gray-400">Failover Time</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-light text-white mb-2 v4-display">60s</div>
                <div className="text-sm text-gray-400">Health Check Interval</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-light text-white mb-2 v4-display">5</div>
                <div className="text-sm text-gray-400">Routing Algorithms</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-light text-white mb-2 v4-display">L4 + L7</div>
                <div className="text-sm text-gray-400">Protocol Support</div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="mb-24">
              <h2 className="text-3xl font-light mb-12 text-center v4-display">Intelligent Routing Algorithms</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { name: 'Round Robin', desc: 'Distribute requests sequentially across available servers.' },
                  { name: 'Weighted', desc: 'Send specific percentages (X% to A, Y% to B) for canary deployments.' },
                  { name: 'Geo-Steering', desc: 'Route users to the geographically nearest server or region.' },
                  { name: 'Least Connections', desc: 'Send new requests to the server with fewest active connections.' },
                  { name: 'IP Hash', desc: 'Session affinity ensuring a user always hits the same server.' },
                  { name: 'Random', desc: 'Distribute requests randomly across healthy origin servers.' }
                ].map((algo) => (
                  <div key={algo.name} className="p-6 rounded-xl border border-white/10 bg-white/5">
                    <h3 className="font-medium mb-2 text-white">{algo.name}</h3>
                    <p className="text-sm text-gray-400">{algo.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="mb-24">
              <h2 className="text-3xl font-light mb-12 text-center v4-display">Core Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <PanelCard
                  title="Active Health Checks"
                  description="Continuously monitor server health via custom HTTP/TCP checks."
                  icon={<HeartPulse className="w-6 h-6 text-signal" />}
                />
                <PanelCard
                  title="Automatic Failover"
                  description="Instantly route traffic away from degraded or offline servers."
                  icon={<ShieldAlert className="w-6 h-6 text-signal" />}
                />
                <PanelCard
                  title="Session Persistence"
                  description="Keep users tied to specific servers for stateful applications."
                  icon={<Users className="w-6 h-6 text-signal" />}
                />
                <PanelCard
                  title="SSL Termination"
                  description="Offload TLS encryption at the edge to reduce load on origins."
                  icon={<Lock className="w-6 h-6 text-signal" />}
                />
                <PanelCard
                  title="HTTP/2 + gRPC"
                  description="Modern protocol support for low-latency, multiplexed connections."
                  icon={<Server className="w-6 h-6 text-signal" />}
                />
                <PanelCard
                  title="Custom URLs"
                  description="Define custom paths and expected status codes for health checks."
                  icon={<LinkIcon className="w-6 h-6 text-signal" />}
                />
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="mb-24">
              <h2 className="text-3xl font-light mb-12 text-center v4-display">Load Balancing Pricing</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 rounded-2xl border border-white/10 bg-white/5 flex flex-col">
                  <h3 className="text-xl font-medium mb-2">Free</h3>
                  <div className="text-3xl font-light mb-6">₹0<span className="text-sm text-gray-400">/mo</span></div>
                  <ul className="space-y-3 text-gray-400 mb-8 flex-1 text-sm">
                    <li>✓ 1 Load Balancer</li>
                    <li>✓ 2 Origin Servers</li>
                    <li>✓ HTTP/HTTPS only</li>
                    <li>✓ Basic Health Checks</li>
                  </ul>
                  <Link href="/portal" className="block text-center py-3 rounded-lg border border-white/20 hover:bg-white/10 transition-colors">
                    Start Free
                  </Link>
                </div>
                <div className="p-8 rounded-2xl border border-signal/50 bg-signal/5 flex flex-col relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-signal text-black text-xs font-bold px-3 py-1 rounded-full">RECOMMENDED</div>
                  <h3 className="text-xl font-medium mb-2 text-signal">Pro</h3>
                  <div className="text-3xl font-light mb-6 text-white">₹499<span className="text-sm text-gray-400">/mo</span></div>
                  <ul className="space-y-3 text-gray-300 mb-8 flex-1 text-sm">
                    <li>✓ 5 Load Balancers</li>
                    <li>✓ 10 Origin Servers</li>
                    <li>✓ Geo-Steering</li>
                    <li>✓ TCP/UDP Support</li>
                  </ul>
                  <Link href="/portal" className="block text-center py-3 rounded-lg bg-signal text-black font-medium hover:bg-signal/90 transition-colors">
                    Upgrade to Pro
                  </Link>
                </div>
                <div className="p-8 rounded-2xl border border-white/10 bg-white/5 flex flex-col">
                  <h3 className="text-xl font-medium mb-2">Business</h3>
                  <div className="text-3xl font-light mb-6">₹1,999<span className="text-sm text-gray-400">/mo</span></div>
                  <ul className="space-y-3 text-gray-400 mb-8 flex-1 text-sm">
                    <li>✓ Unlimited Load Balancers</li>
                    <li>✓ Unlimited Origins</li>
                    <li>✓ Custom Algorithms</li>
                    <li>✓ Advanced Analytics</li>
                  </ul>
                  <Link href="/portal" className="block text-center py-3 rounded-lg border border-white/20 hover:bg-white/10 transition-colors">
                    Choose Business
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <div 
              className="rounded-3xl p-12 text-center border border-white/10 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(10,18,36,0.98), rgba(6,12,24,1))' }}
            >
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
              <div className="relative z-10">
                <h2 className="text-4xl font-light mb-6 v4-display">Scale your infrastructure instantly.</h2>
                <p className="text-gray-400 mb-8 max-w-2xl mx-auto text-lg">
                  Deploy load balancers across the globe in seconds and keep your applications highly available.
                </p>
                <Link 
                  href="/portal" 
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-medium hover:bg-gray-100 transition-colors"
                >
                  Create a load balancer <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
