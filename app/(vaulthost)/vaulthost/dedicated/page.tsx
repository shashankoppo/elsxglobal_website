'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Cpu,
  Server,
  HardDrive,
  Zap,
  Shield,
  Activity,
  Terminal,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Sliders,
  Wrench,
  Headphones,
  Sparkles,
  Layers,
  Wifi,
  Radio,
  Gauge,
} from 'lucide-react';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

interface DedicatedRig {
  id: string;
  name: string;
  badge?: string;
  cpu: string;
  cores: string;
  ram: string;
  storage: string;
  network: string;
  remote: string;
  price: number;
}

const RIGS: DedicatedRig[] = [
  {
    id: 'epyc-64',
    name: 'EPYC Compute-64',
    badge: 'Popular Compute',
    cpu: 'AMD EPYC 9354',
    cores: '32 Cores / 64 Threads @ 3.25GHz Boost',
    ram: '128 GB DDR5 ECC Reg (4800MHz)',
    storage: '2x 1.92 TB Enterprise NVMe (RAID 1)',
    network: '10 Gbps Unmetered Uplink',
    remote: 'Dedicated IPMI 2.0 / HTML5 KVM',
    price: 14999,
  },
  {
    id: 'epyc-128',
    name: 'EPYC Heavy-128',
    badge: 'Flagship Power',
    cpu: 'AMD EPYC 9554',
    cores: '64 Cores / 128 Threads @ 3.75GHz Boost',
    ram: '256 GB DDR5 ECC Reg (4800MHz)',
    storage: '4x 3.84 TB Enterprise NVMe U.2 (Hardware RAID 10)',
    network: '20 Gbps Dual-LACP Unmetered',
    remote: 'Dedicated IPMI 2.0 / HTML5 KVM',
    price: 26999,
  },
  {
    id: 'xeon-32',
    name: 'Xeon Enterprise-32',
    badge: 'Database Workhorse',
    cpu: 'Dual Intel Xeon Silver 4410Y',
    cores: '24 Cores / 48 Threads Total',
    ram: '128 GB DDR5 ECC Reg',
    storage: '2x 960 GB Enterprise NVMe + Broadcom MegaRAID',
    network: '10 Gbps Unmetered Uplink',
    remote: 'Dell iDRAC9 Enterprise',
    price: 16999,
  },
  {
    id: 'ai-gpu',
    name: 'AI GPU Rig',
    badge: 'LLM & Training',
    cpu: 'AMD EPYC 9354 + 2x NVIDIA A100 (80GB PCIe)',
    cores: '32 Cores / 64 Threads + 160GB HBM2e VRAM',
    ram: '256 GB DDR5 ECC Reg',
    storage: '4x 3.84 TB NVMe Gen4 + NVLink Bridge',
    network: '25 Gbps SFP28 Fabric Uplink',
    remote: 'Dedicated IPMI + NVIDIA System Management Interface',
    price: 64999,
  },
];

export default function DedicatedHostingPage() {
  const [selectedRig, setSelectedRig] = useState<DedicatedRig>(RIGS[0]);
  const [extraRam, setExtraRam] = useState(0); // GB
  const [extraStorage, setExtraStorage] = useState(false); // +1x 3.84TB NVMe
  const [enableBgp, setEnableBgp] = useState(false); // Bring your own ASN / IP

  // Calculate customized quote
  const calculatedTotal =
    selectedRig.price +
    (extraRam / 64) * 2000 +
    (extraStorage ? 4000 : 0) +
    (enableBgp ? 3000 : 0);

  return (
    <div className="v4-page pb-32">
      {/* Hero Section */}
      <PageHeroV4
        eyebrow="Bare-Metal Compute"
        eyebrowIcon="cpu"
        title={
          <>
            Dedicated Bare Metal. <span className="text-signal">100% Raw Power.</span>
          </>
        }
        description="Single-tenant physical servers with zero virtualization overhead. Powered by AMD EPYC 9004 and Intel Xeon Scalable processors with unmetered 10Gbps network connectivity."
      >
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <a
            href="#rigs"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-btn v4-btn-primary text-sm font-medium"
          >
            Explore Bare Metal Rigs <ArrowRight className="h-4 w-4" />
          </a>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-btn v4-btn-secondary text-sm font-medium"
          >
            Request Custom Deployment
          </Link>
        </div>
      </PageHeroV4>

      {/* Metrics Strip */}
      <section className="v4-section-sm border-t border-hairline bg-ink-surface/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl border border-hairline bg-ink-surface-2/60">
              <div className="text-3xl font-bold v4-display text-signal">0% Overhead</div>
              <div className="text-xs uppercase tracking-wider text-text-muted-v4 mt-1 font-mono">100% Dedicated Silicon</div>
            </div>
            <div className="p-4 rounded-xl border border-hairline bg-ink-surface-2/60">
              <div className="text-3xl font-bold v4-display text-text-primary-v4">4 Hours</div>
              <div className="text-xs uppercase tracking-wider text-text-muted-v4 mt-1 font-mono">Hardware Replacement SLA</div>
            </div>
            <div className="p-4 rounded-xl border border-hairline bg-ink-surface-2/60">
              <div className="text-3xl font-bold v4-display text-emerald-400">100% Power</div>
              <div className="text-xs uppercase tracking-wider text-text-muted-v4 mt-1 font-mono">Dual A+B Feed Guarantee</div>
            </div>
            <div className="p-4 rounded-xl border border-hairline bg-ink-surface-2/60">
              <div className="text-3xl font-bold v4-display text-text-primary-v4">IPMI / iDRAC</div>
              <div className="text-xs uppercase tracking-wider text-text-muted-v4 mt-1 font-mono">Out-of-Band Remote Control</div>
            </div>
          </div>
        </div>
      </section>

      {/* Server Configurations Grid */}
      <section id="rigs" className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="v4-readout text-xs px-2.5 py-1 rounded-chip border border-hairline bg-ink-surface-2 text-signal">
              Heavy-Duty Workstations
            </span>
            <h2 className="text-3xl font-bold v4-display mt-3 text-text-primary-v4">
              Enterprise Dedicated Configurations
            </h2>
            <p className="text-sm text-text-secondary-v4 mt-3">
              Pre-racked, burn-in tested, and provisioned in Tier-4 facilities with direct connection to Tier-1 backbones.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {RIGS.map((rig) => {
              const isSelected = selectedRig.id === rig.id;
              return (
                <div
                  key={rig.id}
                  onClick={() => setSelectedRig(rig)}
                  className={`rounded-2xl border p-6 flex flex-col justify-between transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-signal bg-ink-surface shadow-xl ring-1 ring-signal/50'
                      : 'border-hairline bg-ink-surface/50 hover:border-hairline-2 hover:bg-ink-surface'
                  }`}
                >
                  {rig.badge && (
                    <div className="absolute -top-3 right-6 bg-signal text-black text-[10px] font-bold font-mono uppercase px-2.5 py-0.5 rounded-full shadow">
                      {rig.badge}
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-text-primary-v4">{rig.name}</h3>
                        <p className="text-xs text-text-muted-v4 mt-0.5">{rig.cpu}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold v4-display text-text-primary-v4">
                          ₹{rig.price.toLocaleString()}
                          <span className="text-xs font-normal text-text-muted-v4">/mo</span>
                        </div>
                        <div className="text-[10px] text-emerald-400 font-mono">Zero Setup Fee</div>
                      </div>
                    </div>

                    <div className="space-y-2.5 my-6 text-xs font-mono">
                      <div className="flex items-center justify-between py-1.5 border-b border-hairline/50">
                        <span className="text-text-muted-v4 flex items-center gap-2">
                          <Cpu className="h-3.5 w-3.5 text-signal" /> Processing Power
                        </span>
                        <span className="text-text-primary-v4 font-semibold">{rig.cores}</span>
                      </div>
                      <div className="flex items-center justify-between py-1.5 border-b border-hairline/50">
                        <span className="text-text-muted-v4 flex items-center gap-2">
                          <Server className="h-3.5 w-3.5 text-signal" /> RAM Configuration
                        </span>
                        <span className="text-text-primary-v4 font-semibold">{rig.ram}</span>
                      </div>
                      <div className="flex items-center justify-between py-1.5 border-b border-hairline/50">
                        <span className="text-text-muted-v4 flex items-center gap-2">
                          <HardDrive className="h-3.5 w-3.5 text-signal" /> Storage Array
                        </span>
                        <span className="text-text-primary-v4 font-semibold">{rig.storage}</span>
                      </div>
                      <div className="flex items-center justify-between py-1.5 border-b border-hairline/50">
                        <span className="text-text-muted-v4 flex items-center gap-2">
                          <Activity className="h-3.5 w-3.5 text-signal" /> Network Interface
                        </span>
                        <span className="text-text-primary-v4 font-semibold">{rig.network}</span>
                      </div>
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-text-muted-v4 flex items-center gap-2">
                          <Terminal className="h-3.5 w-3.5 text-signal" /> Remote Console
                        </span>
                        <span className="text-text-primary-v4 font-semibold">{rig.remote}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-hairline flex items-center justify-between">
                    <span className="text-xs text-text-muted-v4">
                      {isSelected ? 'Currently Selected' : 'Click to customize'}
                    </span>
                    <Link
                      href={`/contact?server=${rig.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-btn v4-btn-primary text-xs font-medium"
                    >
                      Provision Server <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Customizer & Add-on Calculator */}
      <section className="v4-section-sm bg-ink-surface/30 border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6">
              <span className="v4-readout text-xs px-2.5 py-1 rounded-chip border border-hairline bg-ink-surface-2 text-signal">
                Server Customizer
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold v4-display mt-3 text-text-primary-v4">
                Tailor Hardware to Your Specific Workload
              </h2>
              <p className="text-sm text-text-secondary-v4 mt-2">
                Modify memory density, enterprise NVMe storage arrays, and BGP routing prefixes for <span className="text-text-primary-v4 font-semibold">{selectedRig.name}</span>.
              </p>

              <div className="mt-6 space-y-4">
                {/* Extra RAM */}
                <div className="p-4 rounded-xl border border-hairline bg-ink-surface">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-text-primary-v4">Additional DDR5 ECC Memory</span>
                    <span className="text-xs font-mono text-signal">+{extraRam} GB</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 64, 128, 256].map((ram) => (
                      <button
                        key={ram}
                        onClick={() => setExtraRam(ram)}
                        className={`py-1.5 text-xs font-mono rounded ${
                          extraRam === ram
                            ? 'bg-signal text-black font-semibold'
                            : 'bg-ink-surface-2 border border-hairline text-text-secondary-v4 hover:text-text-primary-v4'
                        }`}
                      >
                        {ram === 0 ? 'None' : `+${ram}GB`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Extra NVMe */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-hairline bg-ink-surface">
                  <div>
                    <div className="text-xs font-semibold text-text-primary-v4">Add 1x 3.84TB Enterprise NVMe Drive</div>
                    <div className="text-[11px] text-text-muted-v4">+₹4,000 / month (Hot-swap Gen4)</div>
                  </div>
                  <button
                    onClick={() => setExtraStorage(!extraStorage)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      extraStorage ? 'bg-signal' : 'bg-ink-surface-2 border border-hairline'
                    }`}
                  >
                    <div
                      className={`bg-black w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        extraStorage ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* BGP Anycast Prefix Announcement */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-hairline bg-ink-surface">
                  <div>
                    <div className="text-xs font-semibold text-text-primary-v4">BGP Anycast / BYO-IP Prefix Announcement</div>
                    <div className="text-[11px] text-text-muted-v4">+₹3,000 / month (Announce custom /24 subnet)</div>
                  </div>
                  <button
                    onClick={() => setEnableBgp(!enableBgp)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      enableBgp ? 'bg-signal' : 'bg-ink-surface-2 border border-hairline'
                    }`}
                  >
                    <div
                      className={`bg-black w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        enableBgp ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Estimated Quote Card */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-hairline bg-ink p-6 font-mono text-xs shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-hairline/60">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-signal" />
                    <span className="font-semibold text-text-primary-v4">Hardware Build Summary</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400">READY TO PROVISION</span>
                </div>

                <div className="space-y-3 py-4 border-b border-hairline/40">
                  <div className="flex justify-between">
                    <span className="text-text-muted-v4">Base Server Model</span>
                    <span className="text-text-primary-v4">{selectedRig.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted-v4">Processor</span>
                    <span className="text-text-secondary-v4 text-right">{selectedRig.cpu}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted-v4">Total System RAM</span>
                    <span className="text-signal">{selectedRig.ram} {extraRam > 0 ? `+ ${extraRam}GB extra` : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted-v4">Storage Drives</span>
                    <span className="text-text-secondary-v4 text-right">
                      {selectedRig.storage} {extraStorage ? '+ 1x 3.84TB NVMe' : ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted-v4">BGP Session</span>
                    <span className="text-text-primary-v4">{enableBgp ? 'Custom Prefix Announced' : 'Default Anycast Pool'}</span>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-text-muted-v4 uppercase">Estimated Monthly Fee</div>
                    <div className="text-3xl font-bold v4-display text-text-primary-v4 mt-0.5">
                      ₹{calculatedTotal.toLocaleString()}
                      <span className="text-xs font-normal text-text-muted-v4"> / mo</span>
                    </div>
                  </div>
                  <Link
                    href={`/contact?server=${selectedRig.id}&ram=${extraRam}&storage=${extraStorage}&bgp=${enableBgp}`}
                    className="px-6 py-3 rounded-btn v4-btn-primary text-xs font-medium inline-flex items-center gap-2"
                  >
                    Lock in Quote <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hardware Features */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="v4-readout text-xs px-2.5 py-1 rounded-chip border border-hairline bg-ink-surface-2 text-signal">
              Hardware Grade
            </span>
            <h2 className="text-3xl font-bold v4-display mt-3 text-text-primary-v4">
              Enterprise Silicon &amp; Redundant Power
            </h2>
            <p className="text-sm text-text-secondary-v4 mt-3">
              We never use desktop or consumer parts. Every server chassis is enterprise-grade Supermicro or Dell PowerEdge.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PanelCard className="p-6">
              <div className="w-10 h-10 rounded-xl bg-ink-surface-2 border border-hairline flex items-center justify-center text-signal mb-4">
                <Terminal className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-text-primary-v4 mb-2">Dedicated IPMI / iDRAC</h3>
              <p className="text-xs text-text-secondary-v4 leading-relaxed">
                Full out-of-band HTML5 console access with remote media mounting, bios reconfiguration, and hardware sensor telemetry.
              </p>
            </PanelCard>

            <PanelCard className="p-6">
              <div className="w-10 h-10 rounded-xl bg-ink-surface-2 border border-hairline flex items-center justify-center text-signal mb-4">
                <HardDrive className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-text-primary-v4 mb-2">Hardware MegaRAID</h3>
              <p className="text-xs text-text-secondary-v4 leading-relaxed">
                Broadcom MegaRAID PCIe Gen4 controllers with 4GB NV-cache and Battery Backup Units (BBU) ensure zero write loss.
              </p>
            </PanelCard>

            <PanelCard className="p-6">
              <div className="w-10 h-10 rounded-xl bg-ink-surface-2 border border-hairline flex items-center justify-center text-signal mb-4">
                <Wrench className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-text-primary-v4 mb-2">Hot-Swappable U.2/U.3</h3>
              <p className="text-xs text-text-secondary-v4 leading-relaxed">
                Hot-swappable enterprise NVMe drives allow immediate drive replacement during degradation without taking down the server.
              </p>
            </PanelCard>

            <PanelCard className="p-6">
              <div className="w-10 h-10 rounded-xl bg-ink-surface-2 border border-hairline flex items-center justify-center text-signal mb-4">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-text-primary-v4 mb-2">Dual Platinum 2N PSUs</h3>
              <p className="text-xs text-text-secondary-v4 leading-relaxed">
                Independent A+B utility power feeds backed by dual rotary UPS systems and on-site diesel generators with 72-hour fuel reserves.
              </p>
            </PanelCard>
          </div>
        </div>
      </section>

      {/* SLA & Guarantees Strip */}
      <section className="v4-section-sm bg-ink-surface/40 border-t border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-5 rounded-xl border border-hairline bg-ink-surface">
              <div className="w-8 h-8 rounded-lg bg-ink-surface-2 border border-hairline flex items-center justify-center text-emerald-400 mx-auto mb-3">
                <Zap className="h-4 w-4" />
              </div>
              <div className="text-lg font-bold text-text-primary-v4">100% Power SLA</div>
              <p className="text-xs text-text-muted-v4 mt-1">Dual independent A+B power feeds guaranteed</p>
            </div>
            <div className="p-5 rounded-xl border border-hairline bg-ink-surface">
              <div className="w-8 h-8 rounded-lg bg-ink-surface-2 border border-hairline flex items-center justify-center text-signal mx-auto mb-3">
                <Activity className="h-4 w-4" />
              </div>
              <div className="text-lg font-bold text-text-primary-v4">99.99% Network SLA</div>
              <p className="text-xs text-text-muted-v4 mt-1">Multi-homed Tier-1 transit backbones</p>
            </div>
            <div className="p-5 rounded-xl border border-hairline bg-ink-surface">
              <div className="w-8 h-8 rounded-lg bg-ink-surface-2 border border-hairline flex items-center justify-center text-purple-400 mx-auto mb-3">
                <Clock className="h-4 w-4" />
              </div>
              <div className="text-lg font-bold text-text-primary-v4">4-Hour Hardware SLA</div>
              <p className="text-xs text-text-muted-v4 mt-1">On-site cold spares swapped in under 4 hours</p>
            </div>
            <div className="p-5 rounded-xl border border-hairline bg-ink-surface">
              <div className="w-8 h-8 rounded-lg bg-ink-surface-2 border border-hairline flex items-center justify-center text-signal mx-auto mb-3">
                <Headphones className="h-4 w-4" />
              </div>
              <div className="text-lg font-bold text-text-primary-v4">24/7 Enterprise NOC</div>
              <p className="text-xs text-text-muted-v4 mt-1">Direct Slack &amp; phone line to datacenter engineers</p>
            </div>
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
                Custom Architecture
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold v4-display text-text-primary-v4 mt-4 mb-4">
                Need a Custom Bare-Metal Cluster?
              </h2>
              <p className="text-sm sm:text-base text-text-secondary-v4 mb-8 leading-relaxed">
                From high-density virtualization clusters and Kafka event streams to multi-GPU AI training rigs, our enterprise engineers deliver custom builds in under 24 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-btn v4-btn-primary text-sm font-medium"
                >
                  Custom Quote &amp; Instant Setup <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/vaulthost/data-centers"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-btn v4-btn-secondary text-sm font-medium"
                >
                  Inspect Datacenter Facilities
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
