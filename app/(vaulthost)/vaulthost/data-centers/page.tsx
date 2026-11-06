'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Globe,
  Server,
  Zap,
  Shield,
  Activity,
  ArrowRight,
  Search,
  CheckCircle2,
  Layers,
  Radio,
  MapPin,
  Wifi,
  Lock,
  ExternalLink,
  ChevronRight,
  Terminal,
} from 'lucide-react';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

interface PoP {
  city: string;
  code: string;
  region: 'Asia-Pacific' | 'Europe' | 'North America' | 'Middle East & Africa' | 'Latin America';
  country: string;
  tier: 'Tier 4' | 'Tier 3';
  power: '2N' | 'N+1';
  transit: string;
  latency: string;
  ixp: string;
  status: 'Operational' | 'Maintenance';
}

const POPS: PoP[] = [
  // Asia-Pacific
  { city: 'Mumbai', code: 'BOM', region: 'Asia-Pacific', country: 'India', tier: 'Tier 4', power: '2N', transit: 'Tata, Airtel, Lumen', latency: '<8ms', ixp: 'NIXI, Extreme IX, DE-CIX Mumbai', status: 'Operational' },
  { city: 'Bangalore', code: 'BLR', region: 'Asia-Pacific', country: 'India', tier: 'Tier 4', power: '2N', transit: 'Airtel, Tata, Jio', latency: '<10ms', ixp: 'Extreme IX, NIXI BLR', status: 'Operational' },
  { city: 'Delhi NCR', code: 'DEL', region: 'Asia-Pacific', country: 'India', tier: 'Tier 3', power: 'N+1', transit: 'Airtel, Tata, Vodafone Idea', latency: '<12ms', ixp: 'NIXI Delhi, Extreme IX', status: 'Operational' },
  { city: 'Chennai', code: 'MAA', region: 'Asia-Pacific', country: 'India', tier: 'Tier 4', power: '2N', transit: 'Tata, Lumen, Singtel', latency: '<9ms', ixp: 'NIXI Chennai, Extreme IX', status: 'Operational' },
  { city: 'Singapore', code: 'SIN', region: 'Asia-Pacific', country: 'Singapore', tier: 'Tier 4', power: '2N', transit: 'Singtel, Telstra, NTT, Lumen', latency: '<38ms', ixp: 'Equinix SG, SGIX', status: 'Operational' },
  { city: 'Tokyo', code: 'NRT', region: 'Asia-Pacific', country: 'Japan', tier: 'Tier 4', power: '2N', transit: 'NTT, KDDI, Telia Arelion', latency: '<62ms', ixp: 'JPIX, BBIX Tokyo, Equinix TY', status: 'Operational' },
  { city: 'Sydney', code: 'SYD', region: 'Asia-Pacific', country: 'Australia', tier: 'Tier 3', power: 'N+1', transit: 'Telstra, Optus, Lumen', latency: '<85ms', ixp: 'Equinix SY, IX Australia', status: 'Operational' },

  // Europe
  { city: 'Frankfurt', code: 'FRA', region: 'Europe', country: 'Germany', tier: 'Tier 4', power: '2N', transit: 'Deutsche Telekom, Telia, Cogent', latency: '<110ms', ixp: 'DE-CIX Frankfurt, AMS-IX', status: 'Operational' },
  { city: 'London', code: 'LHR', region: 'Europe', country: 'United Kingdom', tier: 'Tier 4', power: '2N', transit: 'BT, Telia, Lumen, Colt', latency: '<115ms', ixp: 'LINX London, LONAP', status: 'Operational' },
  { city: 'Amsterdam', code: 'AMS', region: 'Europe', country: 'Netherlands', tier: 'Tier 4', power: '2N', transit: 'KPN, Telia, Cogent, GTT', latency: '<112ms', ixp: 'AMS-IX Amsterdam, NL-ix', status: 'Operational' },
  { city: 'Paris', code: 'CDG', region: 'Europe', country: 'France', tier: 'Tier 3', power: 'N+1', transit: 'Orange, Telia, Lumen', latency: '<118ms', ixp: 'France-IX Paris, Equinix PA', status: 'Operational' },
  { city: 'Stockholm', code: 'ARN', region: 'Europe', country: 'Sweden', tier: 'Tier 4', power: '2N', transit: 'Telia Arelion, Tele2, Lumen', latency: '<124ms', ixp: 'Netnod Stockholm', status: 'Operational' },

  // North America
  { city: 'San Jose', code: 'SJC', region: 'North America', country: 'United States', tier: 'Tier 4', power: '2N', transit: 'Lumen, Telia, NTT, Cogent', latency: '<175ms', ixp: 'Equinix SV, Any2 West', status: 'Operational' },
  { city: 'Chicago', code: 'ORD', region: 'North America', country: 'United States', tier: 'Tier 4', power: '2N', transit: 'Lumen, AT&T, Telia, Zayo', latency: '<168ms', ixp: 'Equinix CH, United IX', status: 'Operational' },
  { city: 'New York', code: 'JFK', region: 'North America', country: 'United States', tier: 'Tier 4', power: '2N', transit: 'Verizon, Lumen, Telia, Zayo', latency: '<160ms', ixp: 'DE-CIX New York, NYIIX', status: 'Operational' },
  { city: 'Ashburn', code: 'IAD', region: 'North America', country: 'United States', tier: 'Tier 4', power: '2N', transit: 'Lumen, NTT, Telia, Cogent', latency: '<158ms', ixp: 'Equinix Ashburn (DC2/DC4)', status: 'Operational' },

  // Latin America
  { city: 'São Paulo', code: 'GRU', region: 'Latin America', country: 'Brazil', tier: 'Tier 3', power: 'N+1', transit: 'Claro, Lumen, Telia, Cogent', latency: '<195ms', ixp: 'IX.br São Paulo, Equinix SP', status: 'Operational' },

  // Middle East & Africa
  { city: 'Dubai', code: 'DXB', region: 'Middle East & Africa', country: 'United Arab Emirates', tier: 'Tier 4', power: '2N', transit: 'Etisalat, du, Tata, Lumen', latency: '<28ms', ixp: 'UAE-IX, Equinix DX', status: 'Operational' },
  { city: 'Riyadh', code: 'RUH', region: 'Middle East & Africa', country: 'Saudi Arabia', tier: 'Tier 4', power: '2N', transit: 'STC, Mobily, Tata', latency: '<35ms', ixp: 'SaudiIX Riyadh', status: 'Operational' },
  { city: 'Johannesburg', code: 'JNB', region: 'Middle East & Africa', country: 'South Africa', tier: 'Tier 3', power: 'N+1', transit: 'Liquid Telecom, Telkom, Lumen', latency: '<140ms', ixp: 'NAPAfrica JB, JINX', status: 'Operational' },
];

const REGIONS = ['All', 'Asia-Pacific', 'Europe', 'North America', 'Middle East & Africa', 'Latin America'] as const;

export default function DataCentersPage() {
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTestPoP, setActiveTestPoP] = useState<PoP>(POPS[0]);

  const filteredPoPs = useMemo(() => {
    return POPS.filter((pop) => {
      const matchesRegion = selectedRegion === 'All' || pop.region === selectedRegion;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        pop.city.toLowerCase().includes(q) ||
        pop.code.toLowerCase().includes(q) ||
        pop.country.toLowerCase().includes(q) ||
        pop.transit.toLowerCase().includes(q);
      return matchesRegion && matchesQuery;
    });
  }, [selectedRegion, searchQuery]);

  return (
    <div className="v4-page pb-32">
      {/* Hero Section */}
      <PageHeroV4
        eyebrow="Global Infrastructure"
        eyebrowIcon="globe"
        title={
          <>
            Planetary Anycast Edge with <span className="text-signal">300+ PoPs</span>
          </>
        }
        description="VaultHost’s bare-metal and edge network spans 100+ countries across 6 continents. Connected via Tier-1 transit backbones with direct peering at major internet exchange points (IXPs)."
      >
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link
            href="/portal/signup"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-btn v4-btn-primary text-sm font-medium"
          >
            Deploy Workloads at Edge <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#directory"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-btn v4-btn-secondary text-sm font-medium"
          >
            Explore 300+ PoPs
          </a>
        </div>
      </PageHeroV4>

      {/* Network Metrics Strip */}
      <section className="v4-section-sm border-t border-hairline bg-ink-surface/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl border border-hairline bg-ink-surface-2/60">
              <div className="text-3xl lg:text-4xl font-bold v4-display text-text-primary-v4">300+</div>
              <div className="text-xs uppercase tracking-wider text-text-muted-v4 mt-1 font-mono">Anycast Edge PoPs</div>
            </div>
            <div className="p-4 rounded-xl border border-hairline bg-ink-surface-2/60">
              <div className="text-3xl lg:text-4xl font-bold v4-display text-signal">12+ Tbps</div>
              <div className="text-xs uppercase tracking-wider text-text-muted-v4 mt-1 font-mono">Backbone Capacity</div>
            </div>
            <div className="p-4 rounded-xl border border-hairline bg-ink-surface-2/60">
              <div className="text-3xl lg:text-4xl font-bold v4-display text-text-primary-v4">&lt;15ms</div>
              <div className="text-xs uppercase tracking-wider text-text-muted-v4 mt-1 font-mono">India Metro Latency</div>
            </div>
            <div className="p-4 rounded-xl border border-hairline bg-ink-surface-2/60">
              <div className="text-3xl lg:text-4xl font-bold v4-display text-emerald-400">99.999%</div>
              <div className="text-xs uppercase tracking-wider text-text-muted-v4 mt-1 font-mono">Core Network SLA</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive PoP Directory */}
      <section id="directory" className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <span className="v4-readout text-xs px-2.5 py-1 rounded-chip border border-hairline bg-ink-surface-2 text-signal">
                PoP Locator
              </span>
              <h2 className="text-3xl font-bold v4-display mt-3 text-text-primary-v4">
                Interactive Global Edge Directory
              </h2>
              <p className="text-sm text-text-secondary-v4 mt-2 max-w-xl">
                Filter by continent or search by city, airport code, or Tier classification to inspect transit and latency.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted-v4" />
              <input
                type="text"
                placeholder="Search city, code (BOM, FRA)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-ink-surface border border-hairline text-text-primary-v4 placeholder:text-text-muted-v4 focus:outline-none focus:border-signal"
              />
            </div>
          </div>

          {/* Region Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-hairline pb-4">
            {REGIONS.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-4 py-2 rounded-btn text-xs font-medium transition-all ${
                  selectedRegion === region
                    ? 'v4-btn-primary text-text-primary-v4'
                    : 'bg-ink-surface-2 border border-hairline text-text-secondary-v4 hover:text-text-primary-v4 hover:border-hairline-2'
                }`}
              >
                {region} {region === 'All' ? `(${POPS.length})` : ''}
              </button>
            ))}
          </div>

          {/* PoP Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPoPs.map((pop) => (
              <PanelCard
                key={pop.code}
                className="p-5 flex flex-col justify-between hover:border-signal/50 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-ink-surface-2 border border-hairline flex items-center justify-center font-mono font-bold text-xs text-signal">
                        {pop.code}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-text-primary-v4 leading-tight">{pop.city}</h3>
                        <p className="text-xs text-text-muted-v4">{pop.country}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[11px] font-mono text-emerald-400">{pop.tier}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4 text-xs">
                    <div className="flex justify-between py-1 border-b border-hairline/50">
                      <span className="text-text-muted-v4">Power Redundancy</span>
                      <span className="font-mono text-text-secondary-v4">{pop.power} Dual Feed</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-hairline/50">
                      <span className="text-text-muted-v4">Transit Backbone</span>
                      <span className="text-text-primary-v4 font-mono text-[11px] truncate max-w-[170px]" title={pop.transit}>
                        {pop.transit}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-hairline/50">
                      <span className="text-text-muted-v4">IXP Peerings</span>
                      <span className="text-text-secondary-v4 font-mono text-[11px] truncate max-w-[170px]" title={pop.ixp}>
                        {pop.ixp}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-text-muted-v4">Edge Latency</span>
                      <span className="font-mono font-semibold text-signal">{pop.latency}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-hairline flex items-center justify-between">
                  <button
                    onClick={() => setActiveTestPoP(pop)}
                    className="text-xs text-signal hover:underline flex items-center gap-1 font-mono"
                  >
                    Simulate Ping <ChevronRight className="h-3 w-3" />
                  </button>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {pop.status}
                  </span>
                </div>
              </PanelCard>
            ))}
          </div>

          {filteredPoPs.length === 0 && (
            <div className="text-center py-16 border border-hairline rounded-2xl bg-ink-surface">
              <Search className="h-10 w-10 text-text-muted-v4 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-text-primary-v4">No data center found</h3>
              <p className="text-sm text-text-muted-v4 mt-1">Try searching another city, country, or airport code.</p>
            </div>
          )}
        </div>
      </section>

      {/* Latency & Ping Looking Glass Simulator */}
      <section className="v4-section-sm bg-ink-surface/30 border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5">
              <span className="v4-readout text-xs px-2.5 py-1 rounded-chip border border-hairline bg-ink-surface-2 text-signal">
                Looking Glass Diagnostic
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold v4-display mt-3 text-text-primary-v4">
                Verify Anycast Latency &amp; Routing
              </h2>
              <p className="text-sm text-text-secondary-v4 mt-3 leading-relaxed">
                Test connectivity, packet round-trip time (RTT), and BGP path stability to any of our Tier-4 PoP locations directly from our looking glass console.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {POPS.slice(0, 5).map((p) => (
                  <button
                    key={p.code}
                    onClick={() => setActiveTestPoP(p)}
                    className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                      activeTestPoP.code === p.code
                        ? 'bg-signal text-black font-semibold'
                        : 'bg-ink-surface border border-hairline text-text-secondary-v4 hover:text-text-primary-v4'
                    }`}
                  >
                    {p.city} ({p.code})
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-xl border border-hairline bg-ink p-5 font-mono text-xs shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-hairline/60 text-text-muted-v4">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-signal" />
                    <span>looking-glass@vaulthost-edge:~#</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> Connected
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-text-secondary-v4">
                  <p className="text-text-primary-v4 font-semibold">
                    $ ping -c 4 {activeTestPoP.code.toLowerCase()}.edge.vaulthost.net
                  </p>
                  <p className="text-text-muted-v4">
                    PING {activeTestPoP.code.toLowerCase()}.edge.vaulthost.net (185.199.{activeTestPoP.code.charCodeAt(0) % 255}.14) 56(84) bytes of data.
                  </p>
                  <p>64 bytes from {activeTestPoP.city} gateway: icmp_seq=1 ttl=58 time={activeTestPoP.latency}</p>
                  <p>64 bytes from {activeTestPoP.city} gateway: icmp_seq=2 ttl=58 time={activeTestPoP.latency}</p>
                  <p>64 bytes from {activeTestPoP.city} gateway: icmp_seq=3 ttl=58 time={activeTestPoP.latency}</p>
                  <p>64 bytes from {activeTestPoP.city} gateway: icmp_seq=4 ttl=58 time={activeTestPoP.latency}</p>
                  <div className="pt-2 text-text-primary-v4 border-t border-hairline/40">
                    --- {activeTestPoP.city} ({activeTestPoP.code}) ping statistics ---
                    <br />
                    4 packets transmitted, 4 received, 0% packet loss, RTT avg = {activeTestPoP.latency}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transit & Peering Specs */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="v4-readout text-xs px-2.5 py-1 rounded-chip border border-hairline bg-ink-surface-2 text-signal">
              Interconnection &amp; Peering
            </span>
            <h2 className="text-3xl font-bold v4-display mt-3 text-text-primary-v4">
              Direct Tier-1 Transit &amp; 40+ IXP Exchanges
            </h2>
            <p className="text-sm text-text-secondary-v4 mt-3">
              We peer directly at the internet's most critical junctions to bypass congested public hops and guarantee deterministic latency.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <PanelCard className="p-6">
              <div className="w-10 h-10 rounded-xl bg-ink-surface-2 border border-hairline flex items-center justify-center text-signal mb-4">
                <Wifi className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary-v4 mb-2">12+ Tbps Global Edge Capacity</h3>
              <p className="text-sm text-text-secondary-v4 leading-relaxed">
                Multi-homed uplinks across Tata Communications, Lumen, Telia Arelion, Bharti Airtel, Singtel, and Cogent prevent carrier congestion even during massive regional fiber cuts.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-text-muted-v4 font-mono">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-signal" /> Multiple 100GbE / 400GbE interfaces
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-signal" /> Automated BGP failover &lt; 300ms
                </li>
              </ul>
            </PanelCard>

            <PanelCard className="p-6">
              <div className="w-10 h-10 rounded-xl bg-ink-surface-2 border border-hairline flex items-center justify-center text-signal mb-4">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary-v4 mb-2">40+ Direct IXP Peering Fabrics</h3>
              <p className="text-sm text-text-secondary-v4 leading-relaxed">
                VaultHost maintains open settlement-free peering policies at major internet exchanges including DE-CIX, Extreme IX, AMS-IX, LINX, Equinix IX, and NIXI.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-text-muted-v4 font-mono">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-signal" /> 1-hop routing to Indian ISPs &amp; 5G carriers
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-signal" /> PeeringDB registered ASN: AS134982
                </li>
              </ul>
            </PanelCard>

            <PanelCard className="p-6">
              <div className="w-10 h-10 rounded-xl bg-ink-surface-2 border border-hairline flex items-center justify-center text-signal mb-4">
                <Radio className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary-v4 mb-2">Intelligent Anycast Routing</h3>
              <p className="text-sm text-text-secondary-v4 leading-relaxed">
                Requests automatically route to the nearest topological data center. If any node experiences maintenance, BGP announcements withdraw instantly without dropped connections.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-text-muted-v4 font-mono">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-signal" /> BGP Flowspec auto-scrubbing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-signal" /> Zero-loss dynamic route withdrawal
                </li>
              </ul>
            </PanelCard>
          </div>
        </div>
      </section>

      {/* Compliance & Physical Security */}
      <section className="v4-section-sm bg-ink-surface/40 border-t border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="v4-readout text-xs px-2.5 py-1 rounded-chip border border-hairline bg-ink-surface-2 text-signal">
              Security Standard
            </span>
            <h2 className="text-3xl font-bold v4-display mt-3 text-text-primary-v4">
              Fortified Physical &amp; Environmental Security
            </h2>
            <p className="text-sm text-text-secondary-v4 mt-2">
              Every facility strictly complies with global enterprise assurance frameworks and physical access controls.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                title: 'ISO 27001 Certified',
                desc: 'Audited information security management systems governing operational staff and physical access.',
                icon: Shield,
              },
              {
                title: 'SOC 2 Type II Verified',
                desc: 'Independent annual audits verifying security, availability, confidentiality, and processing integrity.',
                icon: Lock,
              },
              {
                title: 'Biometric Access & Mantraps',
                desc: 'Multi-factor iris and biometric palm scanners with anti-tailgating mantraps and 24/7 armed perimeter security.',
                icon: Server,
              },
              {
                title: 'VESDA & N+1 Power',
                desc: 'Very Early Smoke Detection Apparatus, dual diesel backup generators with 72-hour on-site fuel reserves.',
                icon: Zap,
              },
            ].map((item) => (
              <div key={item.title} className="p-5 rounded-xl border border-hairline bg-ink-surface">
                <div className="w-9 h-9 rounded-lg bg-ink-surface-2 border border-hairline flex items-center justify-center text-signal mb-3">
                  <item.icon className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-semibold text-text-primary-v4 mb-1">{item.title}</h4>
                <p className="text-xs text-text-secondary-v4 leading-relaxed">{item.desc}</p>
              </div>
            ))}
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
                Instant Provisioning
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold v4-display text-text-primary-v4 mt-4 mb-4">
                Deploy Your Workloads to the Nearest PoP
              </h2>
              <p className="text-sm sm:text-base text-text-secondary-v4 mb-8 leading-relaxed">
                Route global traffic to edge nodes in under 20ms. Provision compute, storage, and caching across 300+ PoPs in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/portal/signup"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-btn v4-btn-primary text-sm font-medium"
                >
                  Create Cloud Account <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-btn v4-btn-secondary text-sm font-medium"
                >
                  Talk to Infrastructure Architect
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
