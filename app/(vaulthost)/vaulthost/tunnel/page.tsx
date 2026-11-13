'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { ArrowRight, Lock, ShieldOff, Users, FileText, LayoutDashboard, Cloud, Check } from 'lucide-react';
import { TunnelCLIGenerator } from '@/components/vaulthost/interactive/TunnelCLIGenerator';

export default function VaultTunnelPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-signal/30">
      <PageHeroV4
        eyebrow="VaultTunnel"
        title={<>Expose Local Services Securely. <span className="text-signal">No Open Ports.</span></>}
        description="Create encrypted tunnels from your servers, local machines, or Kubernetes clusters to VaultHost's edge — without opening firewall ports or configuring NAT. Compatible with cloudflared."
      />

      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-white/10 py-12 mb-24">
              <div className="text-center">
                <div className="text-3xl font-light text-white mb-2 v4-display">WireGuard</div>
                <div className="text-sm text-gray-400">Encryption Layer</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-light text-white mb-2 v4-display">0</div>
                <div className="text-sm text-gray-400">Open Inbound Ports</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-white mb-2 v4-display">NAT/CGNAT</div>
                <div className="text-sm text-gray-400">Fully Supported</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-white mb-2 v4-display">cloudflared</div>
                <div className="text-sm text-gray-400">Protocol Compatible</div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="mb-24">
              <h2 className="text-3xl font-light mb-12 text-center v4-display">Supported Tunnel Types</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: 'HTTP Tunnel', desc: 'Expose web servers and APIs safely to the internet.' },
                  { title: 'TCP Tunnel', desc: 'Connect to SSH, databases, and custom TCP protocols.' },
                  { title: 'RDP Tunnel', desc: 'Securely access Windows Remote Desktop environments.' },
                  { title: 'Kubernetes Ingress', desc: 'Expose k8s services directly to the edge without LoadBalancers.' }
                ].map((tunnel) => (
                  <div key={tunnel.title} className="p-6 rounded-xl border border-white/10 bg-white/5">
                    <h3 className="font-medium mb-2 text-white">{tunnel.title}</h3>
                    <p className="text-sm text-gray-400">{tunnel.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="mb-24">
              <h2 className="text-3xl font-light mb-12 text-center v4-display">Secure Access Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <PanelCard
                  title="No Port Forwarding Required"
                  description="Run services locally without modifying edge routers or firewalls."
                  icon={<ShieldOff className="w-6 h-6 text-signal" />}
                />
                <PanelCard
                  title="End-to-End Encrypted"
                  description="Tunnels run over fast, secure WireGuard connections to our edge."
                  icon={<Lock className="w-6 h-6 text-signal" />}
                />
                <PanelCard
                  title="Access Policies"
                  description="Restrict tunnel access to specific verified users via VaultAccess."
                  icon={<Users className="w-6 h-6 text-signal" />}
                />
                <PanelCard
                  title="Audit Logs"
                  description="Track exactly who accessed what tunnel and when in real-time."
                  icon={<FileText className="w-6 h-6 text-signal" />}
                />
                <PanelCard
                  title="Multiple Tunnels"
                  description="Manage fleets of tunnels from a single account dashboard."
                  icon={<LayoutDashboard className="w-6 h-6 text-signal" />}
                />
                <PanelCard
                  title="cloudflared Compatible"
                  description="Migrate existing Cloudflare tunnels by just updating the endpoint URL."
                  icon={<Cloud className="w-6 h-6 text-signal" />}
                />
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.25}>
            <div className="mb-24">
              <div className="text-center max-w-3xl mx-auto mb-8">
                <h2 className="text-3xl font-light mb-3 v4-display">Interactive Ingress Configurator</h2>
                <p className="text-sm text-text-muted-v4">Generate production-grade ingress configurations with zero open router ports.</p>
              </div>
              <TunnelCLIGenerator />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="mb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-light mb-6 v4-display">CLI Quickstart</h2>
                <p className="text-gray-400 mb-8">
                  Get started in minutes. Install the CLI tool on your local machine or server and create your first tunnel instantly.
                </p>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-medium mb-2">Top Use Cases:</h4>
                    <ul className="list-disc list-inside text-gray-400 space-y-2 text-sm">
                      <li>Dev sharing (share localhost previews securely)</li>
                      <li>Home server access without exposing IP</li>
                      <li>Database access without public IPs</li>
                      <li>Protecting internal team tools (Grafana, Jira, etc.)</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="bg-[#0D1117] border border-white/10 rounded-xl p-6 font-mono text-sm shadow-xl">
                <div className="flex gap-2 mb-4 border-b border-white/10 pb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="space-y-3 text-gray-300">
                  <p><span className="text-signal">$</span> vault tunnel install</p>
                  <p className="text-gray-500">✔ Successfully installed Vault CLI</p>
                  <p><span className="text-signal">$</span> vault tunnel login</p>
                  <p className="text-gray-500">✔ Authenticated successfully</p>
                  <p><span className="text-signal">$</span> vault tunnel create my-app</p>
                  <p className="text-gray-500">✔ Tunnel 'my-app' created</p>
                  <p><span className="text-signal">$</span> vault tunnel run my-app --url localhost:3000</p>
                  <p className="text-green-400">▶ Tunnel active: https://my-app.vaulttunnel.net</p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <div className="mb-24">
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
                    <p className="text-text-secondary-v4 text-sm mb-6">Expose 1 local development service without opening ports.</p>
                    <ul className="space-y-3 mb-8 text-sm">
                      <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 1 Active encrypted tunnel</li>
                      <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> HTTP / HTTPS protocol support</li>
                      <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> *.vaulthost.link public subdomains</li>
                      <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 10GB tunnel bandwidth / month</li>
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
                    <div className="text-3xl font-bold text-text-primary-v4 mb-1">₹299 <span className="text-sm font-normal text-text-muted-v4">/mo</span></div>
                    <p className="text-text-secondary-v4 text-sm mb-6">Unlimited tunnels with custom domains &amp; TCP forwarding.</p>
                    <ul className="space-y-3 mb-8 text-sm">
                      <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Unlimited active encrypted tunnels</li>
                      <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Custom domain CNAME mapping</li>
                      <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> TCP, UDP, SSH &amp; RDP forwarding</li>
                      <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 500GB high-speed bandwidth</li>
                      <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Priority email support</li>
                    </ul>
                  </div>
                  <Link href="/vaulthost/checkout?plan=tunnel-pro" className="v4-btn-primary rounded-btn w-full text-center block py-2.5">Get Started</Link>
                </div>
                {/* Business tier */}
                <div className="v4-panel rounded-2xl p-6 border border-hairline flex flex-col justify-between">
                  <div>
                    <div className="text-text-muted-v4 text-sm font-medium mb-2">BUSINESS</div>
                    <div className="text-3xl font-bold text-text-primary-v4 mb-1">₹999 <span className="text-sm font-normal text-text-muted-v4">/mo</span></div>
                    <p className="text-text-secondary-v4 text-sm mb-6">Dedicated FRP relay nodes with Zero Trust SAML identity access.</p>
                    <ul className="space-y-3 mb-8 text-sm">
                      <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Dedicated FRP edge relay servers</li>
                      <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Unlimited tunnel bandwidth</li>
                      <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Zero Trust Access SSO / SAML integration</li>
                      <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> IP allowlisting &amp; CIDR policy rules</li>
                      <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 99.99% tunnel SLA &amp; dedicated support</li>
                    </ul>
                  </div>
                  <Link href="/vaulthost/checkout?plan=tunnel-business" className="v4-btn-primary rounded-btn w-full text-center block py-2.5">Get Started</Link>
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
                      <td className="py-3 px-4 font-semibold text-signal">VaultHost Tunnel</td>
                      <td className="py-3 px-4 font-medium text-text-primary-v4">₹0 Free / ₹299 Pro / ₹999 Business</td>
                      <td className="py-3 px-4 text-text-secondary-v4">WireGuard &amp; FRP encrypted tunnels, custom domains, TCP/UDP support, Indian relays</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-text-primary-v4">ngrok Pro</td>
                      <td className="py-3 px-4 text-text-secondary-v4">₹1,650/mo ($20) per seat</td>
                      <td className="py-3 px-4 text-text-secondary-v4">Costly seat licensing and strict bandwidth throttles</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-text-primary-v4">Pinggy</td>
                      <td className="py-3 px-4 text-text-secondary-v4">₹820/mo ($10)</td>
                      <td className="py-3 px-4 text-text-secondary-v4">Single-user only, limited global points of presence</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-text-primary-v4">LocalXpose</td>
                      <td className="py-3 px-4 text-text-secondary-v4">₹650/mo ($8)</td>
                      <td className="py-3 px-4 text-text-secondary-v4">US-only server hops add notable network ping to India endpoints</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
