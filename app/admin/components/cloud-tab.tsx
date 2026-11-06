'use client';

import { useState } from 'react';
import {
  Globe, Server, Shield, Activity, RefreshCw, AlertTriangle, CheckCircle2,
  Sliders, Search, ArrowUpRight, Cpu, HardDrive, Database, Sparkles, Zap,
  XCircle, Filter, Edit3, Save, X as XIcon, Check, BarChart3, Wifi
} from 'lucide-react';

interface PopNode {
  id: string;
  code: string;
  city: string;
  country: string;
  region: string;
  status: 'healthy' | 'drained' | 'degraded';
  latencyMs: number;
  cpuLoad: number;
  ramUsage: number;
  bandwidthGbps: number;
  bgpPeers: number;
  activeRequestsPerSec: number;
}

interface TenantQuota {
  id: string;
  name: string;
  email: string;
  plan: 'Free' | 'Pro' | 'Enterprise';
  status: 'active' | 'restricted' | 'suspended';
  workersUsed: number;
  workersLimit: number; // in Millions
  storageUsedGb: number;
  storageLimitGb: number;
  d1QueriesUsed: number;
  d1QueriesLimit: number; // in Millions
  aiTokensUsed: number;
  aiTokensLimit: number; // in Millions
}

interface AttackEvent {
  id: string;
  timestamp: string;
  targetDomain: string;
  type: string;
  vector: string;
  peakRate: string;
  mitigation: string;
  status: 'mitigated' | 'absorbing' | 'blocked';
}

const INITIAL_POPS: PopNode[] = [
  { id: 'pop-bom', code: 'BOM', city: 'Mumbai', country: 'IN', region: 'Asia-South', status: 'healthy', latencyMs: 4, cpuLoad: 38, ramUsage: 45, bandwidthGbps: 184.2, bgpPeers: 14, activeRequestsPerSec: 142000 },
  { id: 'pop-sin', code: 'SIN', city: 'Singapore', country: 'SG', region: 'Asia-East', status: 'healthy', latencyMs: 8, cpuLoad: 42, ramUsage: 51, bandwidthGbps: 220.5, bgpPeers: 22, activeRequestsPerSec: 189000 },
  { id: 'pop-fra', code: 'FRA', city: 'Frankfurt', country: 'DE', region: 'Europe-West', status: 'healthy', latencyMs: 14, cpuLoad: 49, ramUsage: 58, bandwidthGbps: 310.8, bgpPeers: 36, activeRequestsPerSec: 245000 },
  { id: 'pop-lhr', code: 'LHR', city: 'London', country: 'GB', region: 'Europe-North', status: 'healthy', latencyMs: 12, cpuLoad: 44, ramUsage: 53, bandwidthGbps: 290.1, bgpPeers: 28, activeRequestsPerSec: 210000 },
  { id: 'pop-ord', code: 'ORD', city: 'Chicago', country: 'US', region: 'NA-Central', status: 'healthy', latencyMs: 19, cpuLoad: 52, ramUsage: 61, bandwidthGbps: 340.0, bgpPeers: 32, activeRequestsPerSec: 260000 },
  { id: 'pop-sjc', code: 'SJC', city: 'San Jose', country: 'US', region: 'NA-West', status: 'healthy', latencyMs: 16, cpuLoad: 48, ramUsage: 56, bandwidthGbps: 315.4, bgpPeers: 30, activeRequestsPerSec: 235000 },
  { id: 'pop-nrt', code: 'NRT', city: 'Tokyo', country: 'JP', region: 'Asia-Pacific', status: 'healthy', latencyMs: 18, cpuLoad: 41, ramUsage: 49, bandwidthGbps: 195.0, bgpPeers: 18, activeRequestsPerSec: 168000 },
  { id: 'pop-syd', code: 'SYD', city: 'Sydney', country: 'AU', region: 'Oceania', status: 'healthy', latencyMs: 22, cpuLoad: 35, ramUsage: 42, bandwidthGbps: 124.6, bgpPeers: 16, activeRequestsPerSec: 98000 },
  { id: 'pop-gru', code: 'GRU', city: 'São Paulo', country: 'BR', region: 'SA-East', status: 'healthy', latencyMs: 25, cpuLoad: 39, ramUsage: 47, bandwidthGbps: 142.0, bgpPeers: 12, activeRequestsPerSec: 112000 },
  { id: 'pop-jnb', code: 'JNB', city: 'Johannesburg', country: 'ZA', region: 'Africa-South', status: 'healthy', latencyMs: 28, cpuLoad: 32, ramUsage: 39, bandwidthGbps: 98.4, bgpPeers: 10, activeRequestsPerSec: 84000 },
];

const INITIAL_TENANTS: TenantQuota[] = [
  { id: 'ten-01', name: 'Apex Digital Systems', email: 'infra@apexdigital.io', plan: 'Enterprise', status: 'active', workersUsed: 42.8, workersLimit: 100, storageUsedGb: 840, storageLimitGb: 2000, d1QueriesUsed: 89.2, d1QueriesLimit: 250, aiTokensUsed: 14.5, aiTokensLimit: 50 },
  { id: 'ten-02', name: 'Fintech Payments Bharat', email: 'security@bharatpay.co', plan: 'Enterprise', status: 'active', workersUsed: 78.4, workersLimit: 150, storageUsedGb: 1420, storageLimitGb: 3000, d1QueriesUsed: 192.1, d1QueriesLimit: 400, aiTokensUsed: 28.2, aiTokensLimit: 60 },
  { id: 'ten-03', name: 'HyperScale AI Labs', email: 'founder@hyperscaleai.dev', plan: 'Pro', status: 'active', workersUsed: 8.6, workersLimit: 10, storageUsedGb: 480, storageLimitGb: 500, d1QueriesUsed: 7.9, d1QueriesLimit: 10, aiTokensUsed: 9.8, aiTokensLimit: 10 },
  { id: 'ten-04', name: 'Global Logistics Hub', email: 'devops@globallogistics.com', plan: 'Pro', status: 'active', workersUsed: 4.1, workersLimit: 10, storageUsedGb: 190, storageLimitGb: 500, d1QueriesUsed: 5.2, d1QueriesLimit: 10, aiTokensUsed: 2.1, aiTokensLimit: 10 },
  { id: 'ten-05', name: 'CloudNative Devs Studio', email: 'alex@cloudnative.tech', plan: 'Free', status: 'active', workersUsed: 0.08, workersLimit: 0.1, storageUsedGb: 8.4, storageLimitGb: 10, d1QueriesUsed: 0.09, d1QueriesLimit: 0.1, aiTokensUsed: 0.008, aiTokensLimit: 0.01 },
];

const ATTACK_FEED: AttackEvent[] = [
  { id: 'att-101', timestamp: '2 min ago', targetDomain: 'api.bharatpay.co', type: 'DDoS (L4)', vector: 'SYN Flood + UDP Reflection', peakRate: '680 Gbps / 140 Mpps', mitigation: 'BGP FlowSpec Filter (Absorbed at Edge)', status: 'mitigated' },
  { id: 'att-102', timestamp: '14 min ago', targetDomain: 'auth.apexdigital.io', type: 'Bot Attack (L7)', vector: 'Credential Stuffing Botnet', peakRate: '42,000 req/sec', mitigation: 'VaultBot JS Challenge (100% Failed Bots)', status: 'mitigated' },
  { id: 'att-103', timestamp: '38 min ago', targetDomain: 'cdn.hyperscaleai.dev', type: 'DDoS (L7)', vector: 'HTTP/2 Rapid Reset (CVE-2023-44487)', peakRate: '18.4M req/sec', mitigation: 'Anycast RST Enforcement', status: 'mitigated' },
  { id: 'att-104', timestamp: '1h 12m ago', targetDomain: 'dns.internal-routing.net', type: 'DNS Amplification', vector: 'Anycast Root Spoofing', peakRate: '320 Gbps', mitigation: 'Anycast Scrubbing Center Route Filter', status: 'mitigated' },
];

export function CloudTab({ showToast }: { showToast: (t: 'success' | 'error', m: string) => void }) {
  const [activeSubTab, setActiveSubTab] = useState<'pops' | 'tenants' | 'ddos'>('pops');
  const [pops, setPops] = useState<PopNode[]>(INITIAL_POPS);
  const [tenants, setTenants] = useState<TenantQuota[]>(INITIAL_TENANTS);
  const [searchTenant, setSearchTenant] = useState('');
  const [editingTenant, setEditingTenant] = useState<TenantQuota | null>(null);
  const [isDraining, setIsDraining] = useState<string | null>(null);

  // DDoS controls
  const [underAttackMode, setUnderAttackMode] = useState(false);
  const [flowSpecActive, setFlowSpecActive] = useState(true);
  const [botFingerprintActive, setBotFingerprintActive] = useState(true);

  // Toggle Drain traffic for a PoP
  const handleToggleDrain = (popId: string) => {
    setIsDraining(popId);
    setTimeout(() => {
      setPops(prev =>
        prev.map(p => {
          if (p.id === popId) {
            const nextStatus = p.status === 'drained' ? 'healthy' : 'drained';
            showToast('success', `${p.city} (${p.code}) PoP traffic ${nextStatus === 'drained' ? 'drained to adjacent nodes' : 'restored to Anycast BGP pool'}`);
            return { ...p, status: nextStatus };
          }
          return p;
        })
      );
      setIsDraining(null);
    }, 600);
  };

  const handleGlobalPurge = () => {
    showToast('success', 'Global Anycast Edge Cache purged successfully across all 300+ PoPs');
  };

  const handleBgpReconverge = () => {
    showToast('success', 'BGP Tier-1 Anycast routes reconverged. FlowSpec rules synchronized.');
  };

  const handleSaveTenant = () => {
    if (!editingTenant) return;
    setTenants(prev => prev.map(t => t.id === editingTenant.id ? editingTenant : t));
    showToast('success', `Quotas updated for ${editingTenant.name}`);
    setEditingTenant(null);
  };

  const filteredTenants = tenants.filter(t =>
    t.name.toLowerCase().includes(searchTenant.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTenant.toLowerCase()) ||
    t.plan.toLowerCase().includes(searchTenant.toLowerCase())
  );

  const totalBandwidth = pops.reduce((sum, p) => p.status === 'healthy' ? sum + p.bandwidthGbps : sum, 0).toFixed(1);
  const totalRps = pops.reduce((sum, p) => p.status === 'healthy' ? sum + p.activeRequestsPerSec : sum, 0).toLocaleString();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border/50 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-signal animate-pulse" />
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Global Cloud & Edge Fleet</h1>
          </div>
          <p className="text-[13px] text-muted-foreground mt-1">
            Real-time Anycast BGP telemetry, tenant resource quota management, and unmetered DDoS mitigation
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleBgpReconverge}
            className="px-3 py-1.5 rounded-md border border-border bg-background hover:bg-muted text-[12px] font-medium text-foreground transition-colors flex items-center gap-1.5"
          >
            <Wifi className="h-3.5 w-3.5 text-signal" /> Reconverge BGP
          </button>
          <button
            onClick={handleGlobalPurge}
            className="px-3 py-1.5 rounded-md bg-signal text-black hover:bg-signal/90 text-[12px] font-medium transition-colors flex items-center gap-1.5"
          >
            <Zap className="h-3.5 w-3.5" /> Purge Global Edge Cache
          </button>
        </div>
      </div>

      {/* Global Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between text-muted-foreground mb-1 text-xs">
            <span>Global Ingress Traffic</span>
            <Activity className="h-4 w-4 text-signal" />
          </div>
          <div className="text-2xl font-semibold tracking-tight text-foreground">{totalBandwidth} <span className="text-xs font-normal text-muted-foreground">Gbps</span></div>
          <div className="text-[11px] text-green-500 mt-1 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> 100% Anycast BGP Healthy
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between text-muted-foreground mb-1 text-xs">
            <span>Active Edge Requests</span>
            <BarChart3 className="h-4 w-4 text-signal" />
          </div>
          <div className="text-2xl font-semibold tracking-tight text-foreground">{totalRps} <span className="text-xs font-normal text-muted-foreground">req/s</span></div>
          <div className="text-[11px] text-muted-foreground mt-1">Across 300+ Edge Isolates</div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between text-muted-foreground mb-1 text-xs">
            <span>DDoS Protection Status</span>
            <Shield className="h-4 w-4 text-signal" />
          </div>
          <div className="text-2xl font-semibold tracking-tight text-green-500">Unmetered</div>
          <div className="text-[11px] text-muted-foreground mt-1">L3/L4/L7 Scrubbing Active</div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between text-muted-foreground mb-1 text-xs">
            <span>Active Cloud Tenants</span>
            <Server className="h-4 w-4 text-signal" />
          </div>
          <div className="text-2xl font-semibold tracking-tight text-foreground">{tenants.length}</div>
          <div className="text-[11px] text-muted-foreground mt-1">Workers, R2, D1, AI Gateway</div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          onClick={() => setActiveSubTab('pops')}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeSubTab === 'pops'
              ? 'border-signal text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Globe className="h-3.5 w-3.5" /> Anycast PoP Fleet ({pops.length})
        </button>
        <button
          onClick={() => setActiveSubTab('tenants')}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeSubTab === 'tenants'
              ? 'border-signal text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sliders className="h-3.5 w-3.5" /> Tenant Quotas & Provisioning ({tenants.length})
        </button>
        <button
          onClick={() => setActiveSubTab('ddos')}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeSubTab === 'ddos'
              ? 'border-signal text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Shield className="h-3.5 w-3.5" /> DDoS Mitigation & Threats ({ATTACK_FEED.length})
        </button>
      </div>

      {/* TAB 1: ANYCAST POP FLEET */}
      {activeSubTab === 'pops' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border/50 flex flex-wrap items-center justify-between gap-3 bg-muted/20">
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Active Tier-1 PoP Hubs (Anycast BGP)
              </span>
              <span className="text-xs text-muted-foreground">
                Click &apos;Drain Traffic&apos; to gracefully withdraw BGP routes for zero-downtime maintenance
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/30 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-medium">PoP Code</th>
                    <th className="px-4 py-3 font-medium">Location</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Latency</th>
                    <th className="px-4 py-3 font-medium">CPU Load</th>
                    <th className="px-4 py-3 font-medium">RAM Usage</th>
                    <th className="px-4 py-3 font-medium">Bandwidth</th>
                    <th className="px-4 py-3 font-medium">BGP Peers</th>
                    <th className="px-4 py-3 font-medium text-right">Maintenance Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pops.map((pop) => (
                    <tr key={pop.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-foreground">
                        <span className="px-2 py-0.5 rounded bg-muted border border-border">
                          {pop.code}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {pop.city}, {pop.country}
                        <span className="text-[10px] text-muted-foreground block">{pop.region}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          pop.status === 'healthy'
                            ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${pop.status === 'healthy' ? 'bg-green-500' : 'bg-amber-500'}`} />
                          {pop.status === 'healthy' ? 'BGP Active' : 'Traffic Drained'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-signal">{pop.latencyMs}ms</td>
                      <td className="px-4 py-3">
                        <div className="w-24 bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${pop.cpuLoad > 70 ? 'bg-amber-500' : 'bg-signal'}`}
                            style={{ width: `${pop.cpuLoad}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-0.5 block">{pop.cpuLoad}%</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-24 bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${pop.ramUsage > 70 ? 'bg-amber-500' : 'bg-blue-500'}`}
                            style={{ width: `${pop.ramUsage}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-0.5 block">{pop.ramUsage}%</span>
                      </td>
                      <td className="px-4 py-3 font-mono">{pop.bandwidthGbps} Gbps</td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">{pop.bgpPeers} Tier-1</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleToggleDrain(pop.id)}
                          disabled={isDraining === pop.id}
                          className={`px-3 py-1 rounded text-[11px] font-medium transition-colors ${
                            pop.status === 'drained'
                              ? 'bg-green-500/10 border border-green-500/30 text-green-500 hover:bg-green-500/20'
                              : 'bg-amber-500/10 border border-amber-500/30 text-amber-500 hover:bg-amber-500/20'
                          }`}
                        >
                          {isDraining === pop.id ? (
                            <RefreshCw className="h-3 w-3 animate-spin inline" />
                          ) : pop.status === 'drained' ? (
                            'Restore Traffic'
                          ) : (
                            'Drain Traffic'
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TENANT QUOTAS */}
      {activeSubTab === 'tenants' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tenant by company, email, or plan..."
                value={searchTenant}
                onChange={(e) => setSearchTenant(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-signal"
              />
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              Showing {filteredTenants.length} of {tenants.length} tenants
            </span>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/30 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-medium">Tenant</th>
                    <th className="px-4 py-3 font-medium">Plan</th>
                    <th className="px-4 py-3 font-medium">Workers Invocations</th>
                    <th className="px-4 py-3 font-medium">VaultR2 Storage</th>
                    <th className="px-4 py-3 font-medium">VaultD1 SQL Queries</th>
                    <th className="px-4 py-3 font-medium">VaultAI Tokens</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{tenant.name}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">{tenant.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          tenant.plan === 'Enterprise'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : tenant.plan === 'Pro'
                            ? 'bg-signal/10 text-signal border border-signal/20'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {tenant.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-foreground">{tenant.workersUsed}M / {tenant.workersLimit}M</div>
                        <div className="w-24 bg-muted rounded-full h-1 mt-1 overflow-hidden">
                          <div
                            className={`h-full ${(tenant.workersUsed / tenant.workersLimit) > 0.85 ? 'bg-amber-500' : 'bg-signal'}`}
                            style={{ width: `${Math.min(100, (tenant.workersUsed / tenant.workersLimit) * 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-foreground">{tenant.storageUsedGb} GB / {tenant.storageLimitGb} GB</div>
                        <div className="w-24 bg-muted rounded-full h-1 mt-1 overflow-hidden">
                          <div
                            className={`h-full ${(tenant.storageUsedGb / tenant.storageLimitGb) > 0.85 ? 'bg-amber-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min(100, (tenant.storageUsedGb / tenant.storageLimitGb) * 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-foreground">{tenant.d1QueriesUsed}M / {tenant.d1QueriesLimit}M</div>
                        <div className="w-24 bg-muted rounded-full h-1 mt-1 overflow-hidden">
                          <div
                            className={`h-full ${(tenant.d1QueriesUsed / tenant.d1QueriesLimit) > 0.85 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(100, (tenant.d1QueriesUsed / tenant.d1QueriesLimit) * 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-foreground">{tenant.aiTokensUsed}M / {tenant.aiTokensLimit}M</div>
                        <div className="w-24 bg-muted rounded-full h-1 mt-1 overflow-hidden">
                          <div
                            className={`h-full ${(tenant.aiTokensUsed / tenant.aiTokensLimit) > 0.85 ? 'bg-amber-500' : 'bg-violet-500'}`}
                            style={{ width: `${Math.min(100, (tenant.aiTokensUsed / tenant.aiTokensLimit) * 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setEditingTenant({ ...tenant })}
                          className="px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-foreground text-[11px] font-medium transition-colors flex items-center gap-1 ml-auto"
                        >
                          <Edit3 className="h-3 w-3 text-signal" /> Adjust Quotas
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edit Quotas Modal */}
          {editingTenant && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="rounded-xl border border-border bg-card w-full max-w-lg p-6 shadow-2xl space-y-4 animate-scale-in">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Adjust Quotas for {editingTenant.name}</h3>
                    <p className="text-xs text-muted-foreground">{editingTenant.email} • {editingTenant.plan} Tier</p>
                  </div>
                  <button onClick={() => setEditingTenant(null)} className="p-1 rounded-md text-muted-foreground hover:text-foreground">
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="text-muted-foreground font-medium block mb-1">Workers Limit (Million requests/mo)</label>
                    <input
                      type="number"
                      value={editingTenant.workersLimit}
                      onChange={(e) => setEditingTenant({ ...editingTenant, workersLimit: Number(e.target.value) })}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-muted-foreground font-medium block mb-1">VaultR2 Storage Limit (GB)</label>
                    <input
                      type="number"
                      value={editingTenant.storageLimitGb}
                      onChange={(e) => setEditingTenant({ ...editingTenant, storageLimitGb: Number(e.target.value) })}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-muted-foreground font-medium block mb-1">VaultD1 Queries Limit (Million queries/mo)</label>
                    <input
                      type="number"
                      value={editingTenant.d1QueriesLimit}
                      onChange={(e) => setEditingTenant({ ...editingTenant, d1QueriesLimit: Number(e.target.value) })}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-muted-foreground font-medium block mb-1">VaultAI Gateway Tokens Limit (Million tokens/mo)</label>
                    <input
                      type="number"
                      value={editingTenant.aiTokensLimit}
                      onChange={(e) => setEditingTenant({ ...editingTenant, aiTokensLimit: Number(e.target.value) })}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <button
                    onClick={() => setEditingTenant(null)}
                    className="px-4 py-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTenant}
                    className="px-4 py-2 rounded-lg bg-signal text-black font-semibold text-xs flex items-center gap-1.5"
                  >
                    <Save className="h-3.5 w-3.5" /> Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DDOS & EDGE SECURITY */}
      {activeSubTab === 'ddos' && (
        <div className="space-y-6">
          {/* Security Rule Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-card p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Under Attack Mode</span>
                  <AlertTriangle className={`h-4 w-4 ${underAttackMode ? 'text-red-500' : 'text-muted-foreground'}`} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Challenge all incoming HTTP requests globally with invisible cryptographic proof-of-work.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs font-mono font-medium">{underAttackMode ? 'ACTIVE (Global Challenge)' : 'Standard Mitigation'}</span>
                <button
                  onClick={() => {
                    setUnderAttackMode(!underAttackMode);
                    showToast('success', `Under Attack Mode ${!underAttackMode ? 'ACTIVATED globally' : 'deactivated'}`);
                  }}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    underAttackMode ? 'bg-red-500 text-white' : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  {underAttackMode ? 'Disable' : 'Enable Now'}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wider">BGP FlowSpec Filter</span>
                  <Wifi className="h-4 w-4 text-signal" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Instantly discard malicious L3/L4 volumetric packet vectors at Tier-1 routing hardware.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs font-mono text-green-500 font-medium">BGP Hardware Scrubbing Active</span>
                <button
                  onClick={() => setFlowSpecActive(!flowSpecActive)}
                  className={`px-3 py-1 rounded text-xs font-semibold ${flowSpecActive ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-muted'}`}
                >
                  {flowSpecActive ? 'Enforced' : 'Paused'}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Bot Fingerprinting</span>
                  <Sparkles className="h-4 w-4 text-signal" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Machine learning TLS fingerprinting and behavioral anomaly analysis across all incoming sessions.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs font-mono text-green-500 font-medium">99.7% Accuracy</span>
                <button
                  onClick={() => setBotFingerprintActive(!botFingerprintActive)}
                  className={`px-3 py-1 rounded text-xs font-semibold ${botFingerprintActive ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-muted'}`}
                >
                  {botFingerprintActive ? 'Enforced' : 'Paused'}
                </button>
              </div>
            </div>
          </div>

          {/* Real-time Attack Log Table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Live Mitigated Threats & Attacks Feed
                </span>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                Average mitigation time: &lt;3.2s
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/30 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-medium">Timestamp</th>
                    <th className="px-4 py-3 font-medium">Target Hostname</th>
                    <th className="px-4 py-3 font-medium">Attack Type</th>
                    <th className="px-4 py-3 font-medium">Attack Vector</th>
                    <th className="px-4 py-3 font-medium">Peak Rate</th>
                    <th className="px-4 py-3 font-medium">Mitigation Engine</th>
                    <th className="px-4 py-3 font-medium text-right">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {ATTACK_FEED.map((event) => (
                    <tr key={event.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-muted-foreground">{event.timestamp}</td>
                      <td className="px-4 py-3 font-mono font-medium text-foreground">{event.targetDomain}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/10 text-red-500 border border-red-500/20 font-semibold">
                          {event.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{event.vector}</td>
                      <td className="px-4 py-3 font-mono text-signal font-semibold">{event.peakRate}</td>
                      <td className="px-4 py-3 text-foreground">{event.mitigation}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-500">
                          <CheckCircle2 className="h-3 w-3" /> Absorbed (0 Impact)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
