'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Server,
  Cpu,
  HardDrive,
  Zap,
  Shield,
  Activity,
  Terminal,
  ArrowRight,
  Check,
  CheckCircle2,
  Layers,
  Globe,
  RefreshCw,
  Sliders,
  Database,
  Network,
  Code,
  Sparkles,
} from 'lucide-react';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

interface VpsPlan {
  id: string;
  name: string;
  vcpu: number;
  ram: string;
  storage: string;
  bandwidth: string;
  priceMonthly: number;
  priceAnnual: number;
  popular?: boolean;
}

const VPS_PLANS: VpsPlan[] = [
  { id: 'nano', name: 'VPS Nano', vcpu: 1, ram: '2 GB DDR5', storage: '40 GB NVMe', bandwidth: '1 TB', priceMonthly: 399, priceAnnual: 319 },
  { id: 'standard', name: 'VPS Standard', vcpu: 2, ram: '4 GB DDR5', storage: '80 GB NVMe', bandwidth: '3 TB', priceMonthly: 799, priceAnnual: 639 },
  { id: 'pro', name: 'VPS Pro', vcpu: 4, ram: '8 GB DDR5', storage: '160 GB NVMe', bandwidth: '6 TB', priceMonthly: 1499, priceAnnual: 1199, popular: true },
  { id: 'elite', name: 'VPS Elite', vcpu: 8, ram: '16 GB DDR5', storage: '320 GB NVMe', bandwidth: '10 TB', priceMonthly: 2999, priceAnnual: 2399 },
  { id: 'ultra', name: 'VPS Ultra', vcpu: 16, ram: '32 GB DDR5', storage: '640 GB NVMe', bandwidth: '15 TB', priceMonthly: 5999, priceAnnual: 4799 },
  { id: 'beast', name: 'VPS Beast', vcpu: 32, ram: '64 GB DDR5', storage: '1.2 TB NVMe', bandwidth: '20 TB', priceMonthly: 11999, priceAnnual: 9599 },
];

const OS_OPTIONS = [
  { id: 'ubuntu', name: 'Ubuntu 24.04 LTS', category: 'Linux', iconColor: '#E95420', desc: 'Latest LTS release with Linux kernel 6.8 & systemd 255' },
  { id: 'debian', name: 'Debian 12 Bookworm', category: 'Linux', iconColor: '#A81D33', desc: 'Rock-solid stability for production databases & backends' },
  { id: 'rocky', name: 'Rocky Linux 9', category: 'Linux', iconColor: '#10B981', desc: 'Enterprise 1:1 RHEL binary compatibility for corporate stacks' },
  { id: 'alpine', name: 'Alpine Linux 3.20', category: 'Linux', iconColor: '#0D597F', desc: 'Ultra-lightweight 5MB base, perfect for container runtimes' },
  { id: 'windows', name: 'Windows Server 2022', category: 'Windows', iconColor: '#0078D6', desc: 'Full Datacenter edition with RDP and Active Directory support' },
  { id: 'custom', name: 'Custom ISO Upload', category: 'Custom', iconColor: '#A855F7', desc: 'Boot from your own FreeBSD, pfSense, NixOS, or custom image' },
];

export default function VpsHostingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<VpsPlan>(VPS_PLANS[2]); // Default Pro
  const [selectedOs, setSelectedOs] = useState<string>('ubuntu');

  return (
    <div className="v4-page pb-32">
      {/* Hero Section */}
      <PageHeroV4
        eyebrow="Cloud Compute"
        eyebrowIcon="server"
        title={
          <>
            Next-Gen VPS Hosting on <span className="text-signal">Pure NVMe &amp; AMD EPYC</span>
          </>
        }
        description="Deploy high-frequency cloud servers in seconds. Dedicated vCPU, PCIe 4.0 NVMe storage, 10Gbps redundant network uplinks, and complete root access across Mumbai and global regions."
      >
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link
            href={`/portal?plan=${selectedPlan.id}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-btn v4-btn-primary text-sm font-medium"
          >
            Launch VPS in 60s <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#benchmarks"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-btn v4-btn-secondary text-sm font-medium"
          >
            Compare Geekbench 6 Specs
          </a>
        </div>
      </PageHeroV4>

      {/* Compute Metrics Strip */}
      <section className="v4-section-sm border-t border-hairline bg-ink-surface/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl border border-hairline bg-ink-surface-2/60">
              <div className="text-3xl font-bold v4-display text-signal">3.7 GHz+</div>
              <div className="text-xs uppercase tracking-wider text-text-muted-v4 mt-1 font-mono">AMD EPYC 9004 Boost</div>
            </div>
            <div className="p-4 rounded-xl border border-hairline bg-ink-surface-2/60">
              <div className="text-3xl font-bold v4-display text-text-primary-v4">320,000</div>
              <div className="text-xs uppercase tracking-wider text-text-muted-v4 mt-1 font-mono">PCIe 4.0 NVMe IOPS</div>
            </div>
            <div className="p-4 rounded-xl border border-hairline bg-ink-surface-2/60">
              <div className="text-3xl font-bold v4-display text-text-primary-v4">10 Gbps</div>
              <div className="text-xs uppercase tracking-wider text-text-muted-v4 mt-1 font-mono">Redundant Network Uplink</div>
            </div>
            <div className="p-4 rounded-xl border border-hairline bg-ink-surface-2/60">
              <div className="text-3xl font-bold v4-display text-emerald-400">60 Seconds</div>
              <div className="text-xs uppercase tracking-wider text-text-muted-v4 mt-1 font-mono">Automated Provisioning</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Plan Selector */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="v4-readout text-xs px-2.5 py-1 rounded-chip border border-hairline bg-ink-surface-2 text-signal">
                Compute Engine
              </span>
              <h2 className="text-3xl font-bold v4-display mt-3 text-text-primary-v4">
                Select Your Cloud VPS Instance
              </h2>
              <p className="text-sm text-text-secondary-v4 mt-2 max-w-xl">
                Scalable compute configurations powered by enterprise NVMe and dedicated vCPU execution threads.
              </p>
            </div>

            {/* Monthly / Annual Toggle */}
            <div className="flex items-center gap-3 bg-ink-surface p-1 rounded-lg border border-hairline self-start md:self-auto">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  !isAnnual ? 'bg-ink-surface-2 text-text-primary-v4 shadow-sm' : 'text-text-muted-v4 hover:text-text-secondary-v4'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isAnnual ? 'bg-signal text-black font-semibold shadow-sm' : 'text-text-muted-v4 hover:text-text-secondary-v4'
                }`}
              >
                Annual <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded font-mono">Save 20%</span>
              </button>
            </div>
          </div>

          {/* VPS Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {VPS_PLANS.map((plan) => {
              const isSelected = selectedPlan.id === plan.id;
              const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`rounded-2xl border p-6 flex flex-col justify-between transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-signal bg-ink-surface shadow-lg ring-1 ring-signal/50'
                      : 'border-hairline bg-ink-surface/50 hover:border-hairline-2 hover:bg-ink-surface'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 right-6 bg-signal text-black text-[10px] font-bold font-mono uppercase px-2.5 py-0.5 rounded-full shadow">
                      Most Popular
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-text-primary-v4">{plan.name}</h3>
                        <p className="text-xs text-text-muted-v4 mt-0.5">High-frequency AMD EPYC</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold v4-display text-text-primary-v4">
                          ₹{price.toLocaleString()}
                          <span className="text-xs font-normal text-text-muted-v4">/mo</span>
                        </div>
                        {isAnnual && (
                          <div className="text-[10px] text-signal font-mono">Billed ₹{(price * 12).toLocaleString()}/yr</div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2.5 my-6 text-xs font-mono">
                      <div className="flex items-center justify-between py-1.5 border-b border-hairline/50">
                        <span className="text-text-muted-v4 flex items-center gap-2">
                          <Cpu className="h-3.5 w-3.5 text-signal" /> vCPU Cores
                        </span>
                        <span className="text-text-primary-v4 font-semibold">{plan.vcpu} Dedicated vCPU</span>
                      </div>
                      <div className="flex items-center justify-between py-1.5 border-b border-hairline/50">
                        <span className="text-text-muted-v4 flex items-center gap-2">
                          <Server className="h-3.5 w-3.5 text-signal" /> Memory
                        </span>
                        <span className="text-text-primary-v4 font-semibold">{plan.ram}</span>
                      </div>
                      <div className="flex items-center justify-between py-1.5 border-b border-hairline/50">
                        <span className="text-text-muted-v4 flex items-center gap-2">
                          <HardDrive className="h-3.5 w-3.5 text-signal" /> Storage
                        </span>
                        <span className="text-text-primary-v4 font-semibold">{plan.storage}</span>
                      </div>
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-text-muted-v4 flex items-center gap-2">
                          <Activity className="h-3.5 w-3.5 text-signal" /> Monthly Transfer
                        </span>
                        <span className="text-text-primary-v4 font-semibold">{plan.bandwidth} @ 10Gbps</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-hairline">
                    <Link
                      href={`/portal?plan=${plan.id}&billing=${isAnnual ? 'annual' : 'monthly'}`}
                      className={`w-full py-2.5 px-4 rounded-btn text-xs font-medium inline-flex items-center justify-center gap-2 transition-all ${
                        isSelected ? 'v4-btn-primary' : 'bg-ink-surface-2 border border-hairline text-text-primary-v4 hover:bg-ink-surface'
                      }`}
                    >
                      Configure &amp; Deploy <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* OS Selection Grid */}
      <section className="v4-section-sm bg-ink-surface/30 border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="v4-readout text-xs px-2.5 py-1 rounded-chip border border-hairline bg-ink-surface-2 text-signal">
              Distributions
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold v4-display mt-3 text-text-primary-v4">
              Deploy with Your Preferred Operating System
            </h2>
            <p className="text-sm text-text-secondary-v4 mt-2">
              Automated cloud-init bootstrapping installs your chosen distribution in under 60 seconds with your SSH public keys pre-loaded.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {OS_OPTIONS.map((os) => {
              const isSelected = selectedOs === os.id;
              return (
                <div
                  key={os.id}
                  onClick={() => setSelectedOs(os.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-signal bg-ink-surface shadow-md'
                      : 'border-hairline bg-ink-surface/40 hover:border-hairline-2 hover:bg-ink-surface'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: os.iconColor }} />
                      <h4 className="text-sm font-semibold text-text-primary-v4">{os.name}</h4>
                    </div>
                    {isSelected && <span className="text-[10px] font-mono text-signal bg-signal/10 px-2 py-0.5 rounded">Selected</span>}
                  </div>
                  <p className="text-xs text-text-secondary-v4 leading-relaxed">{os.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enterprise Features */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="v4-readout text-xs px-2.5 py-1 rounded-chip border border-hairline bg-ink-surface-2 text-signal">
              Infrastructure Standard
            </span>
            <h2 className="text-3xl font-bold v4-display mt-3 text-text-primary-v4">
              Enterprise Features Included as Standard
            </h2>
            <p className="text-sm text-text-secondary-v4 mt-3">
              Zero upsells for core reliability. Every VaultVPS instance includes mission-critical tooling by default.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <PanelCard className="p-6">
              <div className="w-10 h-10 rounded-xl bg-ink-surface-2 border border-hairline flex items-center justify-center text-signal mb-4">
                <RefreshCw className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-text-primary-v4 mb-2">1-Click Snapshot Backups</h3>
              <p className="text-xs text-text-secondary-v4 leading-relaxed">
                Take live atomic snapshots of your entire disk volume in seconds without halting server execution. Revert instantaneously in case of failed upgrades.
              </p>
            </PanelCard>

            <PanelCard className="p-6">
              <div className="w-10 h-10 rounded-xl bg-ink-surface-2 border border-hairline flex items-center justify-center text-signal mb-4">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-text-primary-v4 mb-2">Terabit DDoS Mitigation</h3>
              <p className="text-xs text-text-secondary-v4 leading-relaxed">
                Multi-layer Anycast scrubbing centers absorb volumetric SYN floods, UDP amplification, and Layer 7 HTTP floods automatically without rerouting penalties.
              </p>
            </PanelCard>

            <PanelCard className="p-6">
              <div className="w-10 h-10 rounded-xl bg-ink-surface-2 border border-hairline flex items-center justify-center text-signal mb-4">
                <Network className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-text-primary-v4 mb-2">Private VPC &amp; 10Gbps Links</h3>
              <p className="text-xs text-text-secondary-v4 leading-relaxed">
                Interconnect your database and web nodes through isolated private VLAN networks with sub-millisecond latency and zero bandwidth metering.
              </p>
            </PanelCard>

            <PanelCard className="p-6">
              <div className="w-10 h-10 rounded-xl bg-ink-surface-2 border border-hairline flex items-center justify-center text-signal mb-4">
                <Code className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-text-primary-v4 mb-2">REST API &amp; Terraform Provider</h3>
              <p className="text-xs text-text-secondary-v4 leading-relaxed">
                Manage cloud lifecycles programmatically via our fully typed OpenAPI specs, official Go/Python SDKs, and certified HashiCorp Terraform provider.
              </p>
            </PanelCard>

            <PanelCard className="p-6">
              <div className="w-10 h-10 rounded-xl bg-ink-surface-2 border border-hairline flex items-center justify-center text-signal mb-4">
                <Terminal className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-text-primary-v4 mb-2">Full Root Access &amp; Out-of-Band VNC</h3>
              <p className="text-xs text-text-secondary-v4 leading-relaxed">
                Unrestricted root administrative privileges. In case of network lockouts, access your server console directly via browser-based HTML5 VNC.
              </p>
            </PanelCard>

            <PanelCard className="p-6">
              <div className="w-10 h-10 rounded-xl bg-ink-surface-2 border border-hairline flex items-center justify-center text-signal mb-4">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-text-primary-v4 mb-2">Dedicated IPv4 + Routed /64 IPv6</h3>
              <p className="text-xs text-text-secondary-v4 leading-relaxed">
                Clean, unblacklisted static IPv4 addresses paired with a dedicated /64 IPv6 block per instance. Custom reverse DNS (rDNS) configurable from UI.
              </p>
            </PanelCard>
          </div>
        </div>
      </section>

      {/* Benchmark Comparison */}
      <section id="benchmarks" className="v4-section-sm bg-ink-surface/40 border-t border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="v4-readout text-xs px-2.5 py-1 rounded-chip border border-hairline bg-ink-surface-2 text-signal">
              Performance Verification
            </span>
            <h2 className="text-3xl font-bold v4-display mt-3 text-text-primary-v4">
              Real-World Geekbench &amp; I/O Benchmarks
            </h2>
            <p className="text-sm text-text-secondary-v4 mt-2">
              See how VaultVPS Pro compares directly against equivalent tier cloud instances on AWS EC2 and DigitalOcean.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="py-4 px-4 font-medium text-text-secondary-v4">Metric (4 vCPU / 8GB Instance)</th>
                  <th className="py-4 px-4 font-semibold text-signal">
                    VaultVPS Pro
                    <div className="text-xs text-text-muted-v4 font-normal mt-0.5">AMD EPYC 9004</div>
                  </th>
                  <th className="py-4 px-4 font-semibold text-text-primary-v4">
                    AWS EC2 t4g.xlarge
                    <div className="text-xs text-text-muted-v4 font-normal mt-0.5">Graviton3</div>
                  </th>
                  <th className="py-4 px-4 font-semibold text-text-primary-v4">
                    DigitalOcean Premium
                    <div className="text-xs text-text-muted-v4 font-normal mt-0.5">AMD EPYC 7002</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline text-xs font-mono">
                <tr>
                  <td className="py-3 px-4 font-medium font-sans text-text-primary-v4">Geekbench 6 Multi-Core Score</td>
                  <td className="py-3 px-4 text-signal font-bold">9,840 pts (Fastest)</td>
                  <td className="py-3 px-4 text-text-secondary-v4">6,420 pts</td>
                  <td className="py-3 px-4 text-text-secondary-v4">5,890 pts</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium font-sans text-text-primary-v4">NVMe Random 4K Read IOPS</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">320,000 IOPS</td>
                  <td className="py-3 px-4 text-text-muted-v4">16,000 IOPS (gp3 baseline)</td>
                  <td className="py-3 px-4 text-text-secondary-v4">45,000 IOPS</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium font-sans text-text-primary-v4">Network Port Speed</td>
                  <td className="py-3 px-4 text-signal font-bold">10 Gbps Redundant</td>
                  <td className="py-3 px-4 text-text-secondary-v4">Up to 5 Gbps Burst</td>
                  <td className="py-3 px-4 text-text-muted-v4">1 Gbps Shared</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium font-sans text-text-primary-v4">Monthly Cost in India</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold text-sm">₹1,499 / mo</td>
                  <td className="py-3 px-4 text-text-muted-v4">~₹6,200 / mo + Data Transfer</td>
                  <td className="py-3 px-4 text-text-muted-v4">~₹4,800 / mo</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium font-sans text-text-primary-v4">Free Egress Bandwidth</td>
                  <td className="py-3 px-4 text-signal">6,000 GB Included</td>
                  <td className="py-3 px-4 text-text-muted-v4">100 GB Included ($0.09/GB after)</td>
                  <td className="py-3 px-4 text-text-secondary-v4">5,000 GB Included</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Premium CTA */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-3xl border border-hairline p-8 sm:p-12 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(10,18,36,0.98), rgba(6,12,24,1))' }}
          >
            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="v4-readout text-xs px-2.5 py-1 rounded-chip border border-hairline bg-ink-surface-2 text-signal">
                Instant Cloud Launch
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold v4-display text-text-primary-v4 mt-4 mb-4">
                Launch Your High-Frequency VPS in 60s
              </h2>
              <p className="text-sm sm:text-base text-text-secondary-v4 mb-8 leading-relaxed">
                Deploy with dedicated AMD EPYC cores, blazing fast NVMe storage, and 10Gbps uplink connectivity. Full root access and zero noisy neighbors.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={`/portal?plan=${selectedPlan.id}`}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-btn v4-btn-primary text-sm font-medium"
                >
                  Deploy {selectedPlan.name} (₹{isAnnual ? selectedPlan.priceAnnual : selectedPlan.priceMonthly}/mo){' '}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-btn v4-btn-secondary text-sm font-medium"
                >
                  Need Custom Specs? Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
