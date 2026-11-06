'use client';

import { useState } from 'react';
import {
  ShieldAlert, ShieldCheck, Shield, AlertTriangle, Zap, Activity,
  Search, Sliders, CheckCircle2, XCircle, Plus, Trash2, Filter,
  Globe, Eye, RefreshCw, Lock, Terminal, Radio, Server, FileText,
  AlertOctagon, Check, ArrowUpRight, Flame
} from 'lucide-react';

interface AttackLog {
  id: string;
  timestamp: string;
  targetDomain: string;
  vector: string;
  peakRate: string;
  scrubbingCenter: string;
  layer: 'L3/L4' | 'L7';
  status: 'mitigated' | 'absorbing';
  mitigationMethod: string;
  packetsDropped: string;
}

interface WafRule {
  id: string;
  name: string;
  description: string;
  ruleCount: number;
  category: 'owasp' | 'cve' | 'reputation' | 'heuristics';
  enabled: boolean;
  sensitivity: 'Low' | 'Medium' | 'High';
}

interface FirewallRule {
  id: string;
  type: 'IP_CIDR' | 'COUNTRY' | 'ASN';
  value: string;
  action: 'Block' | 'Managed Challenge' | 'JS Challenge' | 'Allow';
  hits24h: number;
  description: string;
  enabled: boolean;
}

const INITIAL_ATTACK_LOGS: AttackLog[] = [
  {
    id: 'atk-901',
    timestamp: '2 min ago',
    targetDomain: 'api.bharatpay.co',
    vector: 'UDP Flood + Memcached Amplification',
    peakRate: '340 Gbps / 84 Mpps',
    scrubbingCenter: 'BOM-01 (Mumbai Anycast)',
    layer: 'L3/L4',
    status: 'mitigated',
    mitigationMethod: 'BGP FlowSpec Filter + Anycast Scrubbing Sinkhole',
    packetsDropped: '48.2 Billion',
  },
  {
    id: 'atk-902',
    timestamp: '14 min ago',
    targetDomain: 'auth.apexdigital.io',
    vector: 'Credential Stuffing Botnet (Distributed 12k IPs)',
    peakRate: '42,000 req/s',
    scrubbingCenter: 'SIN-02 (Singapore Anycast)',
    layer: 'L7',
    status: 'mitigated',
    mitigationMethod: 'VaultBot ML Fingerprint + Managed Challenge (100% Drops)',
    packetsDropped: '2.4 Million',
  },
  {
    id: 'atk-903',
    timestamp: '42 min ago',
    targetDomain: 'cdn.hyperscaleai.dev',
    vector: 'HTTP/2 Rapid Reset (CVE-2023-44487)',
    peakRate: '18.4M req/s',
    scrubbingCenter: 'FRA-01 (Frankfurt Anycast)',
    layer: 'L7',
    status: 'mitigated',
    mitigationMethod: 'Edge Envoy Frame Rate Limiter RST Enforcement',
    packetsDropped: '112 Million',
  },
  {
    id: 'atk-904',
    timestamp: '1h 15m ago',
    targetDomain: 'dns.internal-routing.net',
    vector: 'DNS Amplification (ANY query flood)',
    peakRate: '190 Gbps / 45 Mpps',
    scrubbingCenter: 'ORD-01 (Chicago Anycast)',
    layer: 'L3/L4',
    status: 'mitigated',
    mitigationMethod: 'Anycast DNS Root Filter & RRL Rate Limiting',
    packetsDropped: '21.5 Billion',
  },
  {
    id: 'atk-905',
    timestamp: '2h 05m ago',
    targetDomain: 'checkout.bharatpay.co',
    vector: 'HTTP Slowloris & Header Starvation',
    peakRate: '28,000 conns',
    scrubbingCenter: 'LHR-01 (London Anycast)',
    layer: 'L7',
    status: 'mitigated',
    mitigationMethod: 'TCP Session Timeout Tightening (<500ms)',
    packetsDropped: '840,000',
  },
  {
    id: 'atk-906',
    timestamp: '3h 40m ago',
    targetDomain: 'gateway.apexdigital.io',
    vector: 'SYN Flood with Random Spoofed IPs',
    peakRate: '220 Gbps / 65 Mpps',
    scrubbingCenter: 'SJC-01 (San Jose Anycast)',
    layer: 'L3/L4',
    status: 'absorbing',
    mitigationMethod: 'eBPF SYN Proxy Auto-Validation',
    packetsDropped: '34.8 Billion',
  },
];

const INITIAL_WAF_RULES: WafRule[] = [
  {
    id: 'waf-owasp',
    name: 'OWASP Top 10 Security Core',
    description: 'Mitigates Broken Access Control, Injection, Cryptographic Failures, and SSRF attacks globally.',
    ruleCount: 84,
    category: 'owasp',
    enabled: true,
    sensitivity: 'High',
  },
  {
    id: 'waf-cve',
    name: 'Zero-Day Virtual Patching Engine',
    description: 'Autonomous zero-day heuristic defense protecting against unpatched Apache, Log4j, Spring4Shell, and OpenSSL CVEs.',
    ruleCount: 142,
    category: 'cve',
    enabled: true,
    sensitivity: 'High',
  },
  {
    id: 'waf-bots',
    name: 'Bad User Agent & Known Scraper Blocker',
    description: 'Enforces strict signatures on headless browsers, automated Python requests, and malicious web spiders.',
    ruleCount: 310,
    category: 'reputation',
    enabled: true,
    sensitivity: 'Medium',
  },
  {
    id: 'waf-sqli-xss',
    name: 'SQL Injection / XSS Deep Heuristics',
    description: 'Deep payload inspection of URL query parameters, JSON request bodies, and headers for script injection.',
    ruleCount: 96,
    category: 'heuristics',
    enabled: true,
    sensitivity: 'High',
  },
  {
    id: 'waf-dlp',
    name: 'Sensitive Data Leak Prevention (DLP)',
    description: 'Detects and redacts accidentally exposed API tokens, private keys, and credit card PANs in HTTP responses.',
    ruleCount: 28,
    category: 'heuristics',
    enabled: true,
    sensitivity: 'Medium',
  },
];

const INITIAL_FIREWALL_RULES: FirewallRule[] = [
  { id: 'fw-1', type: 'IP_CIDR', value: '198.51.100.0/24', action: 'Block', hits24h: 18450, description: 'Compromised VPN Exit Subnet', enabled: true },
  { id: 'fw-2', type: 'COUNTRY', value: 'KP, IR', action: 'Block', hits24h: 3410, description: 'High-risk sanction jurisdictions', enabled: true },
  { id: 'fw-3', type: 'ASN', value: 'AS14061 (DigitalOcean abuse pool)', action: 'Managed Challenge', hits24h: 94200, description: 'Scraper cloud ASN', enabled: true },
  { id: 'fw-4', type: 'IP_CIDR', value: '203.0.113.45/32', action: 'Allow', hits24h: 420, description: 'Admin office static IP bypass', enabled: true },
];

export function SecurityTab({ showToast }: { showToast: (type: 'success' | 'error', msg: string) => void }) {
  const [underAttackMode, setUnderAttackMode] = useState(false);
  const [attackLogs, setAttackLogs] = useState<AttackLog[]>(INITIAL_ATTACK_LOGS);
  const [wafRules, setWafRules] = useState<WafRule[]>(INITIAL_WAF_RULES);
  const [firewallRules, setFirewallRules] = useState<FirewallRule[]>(INITIAL_FIREWALL_RULES);
  const [searchLog, setSearchLog] = useState('');
  const [vectorFilter, setVectorFilter] = useState('all');

  // New Rule Form
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [newRuleType, setNewRuleType] = useState<'IP_CIDR' | 'COUNTRY' | 'ASN'>('IP_CIDR');
  const [newRuleValue, setNewRuleValue] = useState('');
  const [newRuleAction, setNewRuleAction] = useState<'Block' | 'Managed Challenge' | 'JS Challenge' | 'Allow'>('Block');
  const [newRuleDesc, setNewRuleDesc] = useState('');

  // Attack detail modal
  const [selectedAttack, setSelectedAttack] = useState<AttackLog | null>(null);

  // Toggle Under Attack Mode
  const handleToggleUnderAttack = async () => {
    const nextState = !underAttackMode;
    setUnderAttackMode(nextState);
    try {
      await fetch('/api/cloud/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_under_attack', enabled: nextState }),
      });
    } catch {}
    if (nextState) {
      showToast('error', '⚠️ UNDER ATTACK MODE ACTIVATED: Non-interactive JS challenges deployed to 100% of untrusted edge visitors!');
    } else {
      showToast('success', 'Under Attack Mode deactivated — standard adaptive heuristic scrubbing restored');
    }
  };

  // Toggle WAF Rule
  const handleToggleWafRule = (id: string) => {
    setWafRules(prev => prev.map(r => {
      if (r.id === id) {
        const next = !r.enabled;
        showToast('success', `${r.name} ruleset ${next ? 'activated' : 'deactivated'}`);
        return { ...r, enabled: next };
      }
      return r;
    }));
  };

  // Add firewall rule
  const handleAddFirewallRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleValue.trim()) return;
    const newRule: FirewallRule = {
      id: `fw-${Date.now()}`,
      type: newRuleType,
      value: newRuleValue.trim(),
      action: newRuleAction,
      hits24h: 0,
      description: newRuleDesc || 'Custom admin mitigation rule',
      enabled: true,
    };
    setFirewallRules([newRule, ...firewallRules]);
    try {
      await fetch('/api/cloud/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_rule', rule: newRule }),
      });
    } catch {}
    showToast('success', `Firewall rule for ${newRule.value} successfully propagated to 38 scrubbing clusters`);
    setShowAddRuleModal(false);
    setNewRuleValue('');
    setNewRuleDesc('');
  };

  // Delete firewall rule
  const handleDeleteRule = async (id: string) => {
    setFirewallRules(prev => prev.filter(r => r.id !== id));
    try {
      await fetch('/api/cloud/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_rule', id }),
      });
    } catch {}
    showToast('success', 'Firewall rule removed from edge');
  };

  // Toggle firewall rule
  const handleToggleRule = (id: string) => {
    setFirewallRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    showToast('success', 'Rule status updated');
  };

  const filteredLogs = attackLogs.filter(log => {
    const matchesSearch = log.targetDomain.toLowerCase().includes(searchLog.toLowerCase()) ||
                          log.vector.toLowerCase().includes(searchLog.toLowerCase()) ||
                          log.scrubbingCenter.toLowerCase().includes(searchLog.toLowerCase());
    const matchesVector = vectorFilter === 'all' || log.layer === vectorFilter;
    return matchesSearch && matchesVector;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-hairline gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-signal animate-pulse" />
            <h1 className="text-xl font-semibold tracking-tight text-text-primary-v4">
              DDoS, WAF & Bot Threat Defense
            </h1>
          </div>
          <p className="text-[13px] text-text-muted-v4 mt-1">
            Global Anycast packet scrubbing, Layer 7 WAF inspection, and machine-learning botnet neutralizer
          </p>
        </div>

        {/* Emergency Under Attack Mode Switch */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleUnderAttack}
            className={`px-3.5 py-1.5 rounded-btn font-semibold text-xs transition-all flex items-center gap-2 border ${
              underAttackMode
                ? 'bg-bad text-white border-bad shadow-lg shadow-bad/20 animate-pulse'
                : 'bg-ink-surface hover:bg-ink-surface-2 border-hairline text-text-primary-v4'
            }`}
          >
            <Flame className={`h-4 w-4 ${underAttackMode ? 'text-white' : 'text-bad'}`} />
            {underAttackMode ? 'UNDER ATTACK MODE (ACTIVE)' : 'Enable "Under Attack" Mode'}
          </button>
        </div>
      </div>

      {/* Emergency Banner if Under Attack Mode */}
      {underAttackMode && (
        <div className="p-4 rounded-panel bg-bad/15 border border-bad/30 flex items-center justify-between gap-4 animate-fade-in text-xs">
          <div className="flex items-center gap-3">
            <AlertOctagon className="h-5 w-5 text-bad shrink-0" />
            <div>
              <div className="font-bold text-bad">EMERGENCY DEFENSE PROTOCOL ACTIVE</div>
              <div className="text-text-secondary-v4">
                Every visitor must solve an invisible cryptographic challenge before connecting to origins. False positives minimized by biometric entropy checks.
              </div>
            </div>
          </div>
          <button
            onClick={handleToggleUnderAttack}
            className="px-3 py-1 bg-ink-surface border border-hairline hover:bg-ink-surface-2 rounded-btn text-text-primary-v4 shrink-0 font-medium"
          >
            Stand Down
          </button>
        </div>
      )}

      {/* Top Live Threat Telemetry */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="v4-panel p-4">
          <div className="flex items-center justify-between text-text-muted-v4 mb-1 text-xs">
            <span>Current Ingress Scrubbing</span>
            <Activity className="h-4 w-4 text-signal" />
          </div>
          <div className="text-2xl font-semibold tracking-tight text-text-primary-v4">
            340 <span className="text-xs font-normal text-text-muted-v4">Gbps</span>
          </div>
          <div className="text-[11px] text-good mt-1 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Absorbing L3/L4 volumetric floods
          </div>
        </div>

        <div className="v4-panel p-4">
          <div className="flex items-center justify-between text-text-muted-v4 mb-1 text-xs">
            <span>Attacks Blocked Today</span>
            <ShieldAlert className="h-4 w-4 text-bad" />
          </div>
          <div className="text-2xl font-semibold tracking-tight text-text-primary-v4">
            1,842
          </div>
          <div className="text-[11px] text-text-muted-v4 mt-1">
            +18% vs 7-day average
          </div>
        </div>

        <div className="v4-panel p-4">
          <div className="flex items-center justify-between text-text-muted-v4 mb-1 text-xs">
            <span>Active Scrubbing Centers</span>
            <Server className="h-4 w-4 text-signal" />
          </div>
          <div className="text-2xl font-semibold tracking-tight text-text-primary-v4">
            38 <span className="text-xs font-normal text-text-muted-v4">Clusters</span>
          </div>
          <div className="text-[11px] text-good mt-1 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> 100% PoPs FlowSpec converged
          </div>
        </div>

        <div className="v4-panel p-4">
          <div className="flex items-center justify-between text-text-muted-v4 mb-1 text-xs">
            <span>False Positive Rate</span>
            <ShieldCheck className="h-4 w-4 text-good" />
          </div>
          <div className="text-2xl font-semibold tracking-tight text-good">
            &lt; 0.001%
          </div>
          <div className="text-[11px] text-text-muted-v4 mt-1">
            Verified by client challenge telemetry
          </div>
        </div>
      </div>

      {/* Bot Management Breakdown & WAF Rulesets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bot Management Visual Breakdown */}
        <div className="lg:col-span-5 v4-panel p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-signal" />
              <h2 className="font-semibold text-sm text-text-primary-v4">Bot Management Score Distribution</h2>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-chip bg-signal/10 text-signal border border-signal/20 font-medium">
              ML Heuristic Active
            </span>
          </div>

          <p className="text-[12px] text-text-muted-v4">
            Real-time classification of 284,000 req/s across global edge isolates:
          </p>

          {/* Traffic Breakdown Bar */}
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-ink-surface-2">
            <div style={{ width: '78%' }} className="bg-good" title="Human (78%)" />
            <div style={{ width: '12%' }} className="bg-signal" title="Verified Bots (12%)" />
            <div style={{ width: '8%' }} className="bg-warn" title="Suspicious (8%)" />
            <div style={{ width: '2%' }} className="bg-bad" title="Malicious Automated (2%)" />
          </div>

          {/* Breakdown Legend Cards */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-btn bg-ink-surface-2 border border-hairline space-y-1">
              <div className="flex items-center gap-1.5 text-text-muted-v4">
                <span className="w-2 h-2 rounded-full bg-good" /> Human Traffic
              </div>
              <div className="text-base font-semibold text-text-primary-v4 v4-readout-primary">78%</div>
              <div className="text-[10px] text-text-muted-v4">Browser fingerprint verified</div>
            </div>

            <div className="p-2.5 rounded-btn bg-ink-surface-2 border border-hairline space-y-1">
              <div className="flex items-center gap-1.5 text-text-muted-v4">
                <span className="w-2 h-2 rounded-full bg-signal" /> Verified Bots
              </div>
              <div className="text-base font-semibold text-text-primary-v4 v4-readout-primary">12%</div>
              <div className="text-[10px] text-text-muted-v4">Googlebot, Bingbot, Odoo</div>
            </div>

            <div className="p-2.5 rounded-btn bg-ink-surface-2 border border-hairline space-y-1">
              <div className="flex items-center gap-1.5 text-text-muted-v4">
                <span className="w-2 h-2 rounded-full bg-warn" /> Suspicious
              </div>
              <div className="text-base font-semibold text-text-primary-v4 v4-readout-primary">8%</div>
              <div className="text-[10px] text-text-muted-v4">Challenged via JS puzzle</div>
            </div>

            <div className="p-2.5 rounded-btn bg-ink-surface-2 border border-hairline space-y-1">
              <div className="flex items-center gap-1.5 text-text-muted-v4">
                <span className="w-2 h-2 rounded-full bg-bad" /> Malicious Scrapers
              </div>
              <div className="text-base font-semibold text-text-primary-v4 v4-readout-primary">2%</div>
              <div className="text-[10px] text-bad font-semibold">100% Drop at Edge</div>
            </div>
          </div>

          <div className="p-3 rounded-btn bg-ink-surface-2 border border-hairline text-xs space-y-1">
            <div className="font-medium text-text-primary-v4 flex items-center justify-between">
              <span>Challenge Solve Rate</span>
              <span className="text-good font-semibold">94.2%</span>
            </div>
            <div className="text-[11px] text-text-muted-v4">
              Humans pass in &lt;180ms without visual captchas. Headless botnets fail at 99.8%.
            </div>
          </div>
        </div>

        {/* WAF Managed Rulesets */}
        <div className="lg:col-span-7 v4-panel p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-signal" />
              <h2 className="font-semibold text-sm text-text-primary-v4">WAF Managed Core Rulesets</h2>
            </div>
            <span className="text-[11px] text-text-muted-v4 v4-readout">
              {wafRules.reduce((sum, r) => sum + r.ruleCount, 0)} Active Signatures
            </span>
          </div>

          <div className="space-y-2.5">
            {wafRules.map(rule => (
              <div
                key={rule.id}
                className="p-3 rounded-btn bg-ink-surface-2 border border-hairline flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text-primary-v4">{rule.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-ink-surface border border-hairline text-text-muted-v4 font-mono">
                      {rule.ruleCount} rules
                    </span>
                    <span className="text-[10px] text-signal font-medium">
                      {rule.sensitivity} Sensitivity
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted-v4 line-clamp-1">{rule.description}</p>
                </div>

                <button
                  onClick={() => handleToggleWafRule(rule.id)}
                  className={`w-10 h-5.5 rounded-full transition-colors relative p-0.5 shrink-0 ${
                    rule.enabled ? 'bg-signal' : 'bg-ink-surface border border-hairline'
                  }`}
                >
                  <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                    rule.enabled ? 'translate-x-4.5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* IP Rate Limiting & Geo-Blocking Rule Builder */}
      <div className="v4-panel p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-hairline gap-3">
          <div>
            <h2 className="font-semibold text-sm text-text-primary-v4">IP Rate Limiting & Geo/ASN Access Control</h2>
            <p className="text-[12px] text-text-muted-v4">Custom perimeter rules deployed to all 38 global Anycast scrubbing centers</p>
          </div>
          <button
            onClick={() => setShowAddRuleModal(true)}
            className="px-3 py-1.5 rounded-btn bg-signal text-black font-semibold text-xs hover:bg-signal/90 flex items-center gap-1.5 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" /> Add Perimeter Rule
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-hairline text-text-muted-v4 text-[11px] uppercase tracking-wider font-semibold">
                <th className="pb-2.5">Type</th>
                <th className="pb-2.5">Pattern / Match Value</th>
                <th className="pb-2.5">Action</th>
                <th className="pb-2.5">Description</th>
                <th className="pb-2.5">24h Hits</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5 text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {firewallRules.map(rule => (
                <tr key={rule.id} className="hover:bg-ink-surface-2/60 transition-colors">
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-chip text-[10px] font-mono bg-ink-surface border border-hairline text-text-secondary-v4">
                      {rule.type}
                    </span>
                  </td>
                  <td className="py-3 font-mono font-medium text-text-primary-v4">{rule.value}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-chip text-[11px] font-semibold border ${
                      rule.action === 'Block'
                        ? 'bg-bad/10 text-bad border-bad/20'
                        : rule.action === 'Allow'
                        ? 'bg-good/10 text-good border-good/20'
                        : 'bg-warn/10 text-warn border-warn/20'
                    }`}>
                      {rule.action}
                    </span>
                  </td>
                  <td className="py-3 text-text-muted-v4">{rule.description}</td>
                  <td className="py-3 v4-readout-primary font-medium text-text-primary-v4">
                    {rule.hits24h.toLocaleString()}
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`text-[10px] px-2 py-0.5 rounded-chip font-medium border ${
                        rule.enabled
                          ? 'bg-good/10 text-good border-good/20'
                          : 'bg-ink-surface text-text-muted-v4 border-hairline'
                      }`}
                    >
                      {rule.enabled ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1 rounded text-text-muted-v4 hover:text-bad hover:bg-bad/10 transition-colors"
                      title="Delete rule"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-time Attack Log Table */}
      <div className="v4-panel p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-hairline gap-3">
          <div>
            <h2 className="font-semibold text-sm text-text-primary-v4">Real-time Ingress Scrubbing Attack Log</h2>
            <p className="text-[12px] text-text-muted-v4">Live volumetric DDoS, botnet floods, and protocol exploits mitigated by Anycast clusters</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-48 sm:w-60">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted-v4" />
              <input
                type="text"
                placeholder="Search domain, vector..."
                value={searchLog}
                onChange={(e) => setSearchLog(e.target.value)}
                className="w-full pl-8 pr-3 py-1 rounded-btn bg-ink-surface border border-hairline text-xs text-text-primary-v4 placeholder:text-text-muted-v4 focus:outline-none focus:border-signal"
              />
            </div>
            <select
              value={vectorFilter}
              onChange={(e) => setVectorFilter(e.target.value)}
              className="px-2.5 py-1 rounded-btn bg-ink-surface border border-hairline text-xs text-text-primary-v4 focus:outline-none focus:border-signal"
            >
              <option value="all">All Layers</option>
              <option value="L3/L4">L3/L4 Network</option>
              <option value="L7">L7 Application</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-hairline text-text-muted-v4 text-[11px] uppercase tracking-wider font-semibold">
                <th className="pb-2.5">Time</th>
                <th className="pb-2.5">Target Domain</th>
                <th className="pb-2.5">Layer</th>
                <th className="pb-2.5">Attack Vector</th>
                <th className="pb-2.5">Peak Rate</th>
                <th className="pb-2.5">Scrubbing PoP</th>
                <th className="pb-2.5">Mitigation Status</th>
                <th className="pb-2.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-ink-surface-2/60 transition-colors">
                  <td className="py-3 text-text-muted-v4 whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-3 font-semibold text-text-primary-v4">{log.targetDomain}</td>
                  <td className="py-3">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                      log.layer === 'L3/L4' ? 'bg-signal/10 text-signal' : 'bg-purple-500/10 text-purple-400'
                    }`}>
                      {log.layer}
                    </span>
                  </td>
                  <td className="py-3 text-text-secondary-v4 max-w-xs truncate">{log.vector}</td>
                  <td className="py-3 v4-readout-primary font-bold text-text-primary-v4 whitespace-nowrap">
                    {log.peakRate}
                  </td>
                  <td className="py-3 v4-readout text-[11px] text-text-muted-v4 whitespace-nowrap">
                    {log.scrubbingCenter}
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-chip font-medium border ${
                      log.status === 'mitigated'
                        ? 'bg-good/10 text-good border-good/20'
                        : 'bg-warn/10 text-warn border-warn/20 animate-pulse'
                    }`}>
                      <CheckCircle2 className="h-3 w-3" />
                      {log.status === 'mitigated' ? 'Mitigated' : 'Absorbing'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => setSelectedAttack(log)}
                      className="px-2 py-1 rounded-btn bg-ink-surface hover:bg-ink-surface-2 border border-hairline text-text-secondary-v4 hover:text-text-primary-v4 text-[11px] transition-colors"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Perimeter Rule Modal */}
      {showAddRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="v4-panel max-w-md w-full p-6 space-y-4 shadow-2xl bg-ink-surface border border-hairline">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <h3 className="font-semibold text-text-primary-v4 text-sm flex items-center gap-2">
                <Plus className="h-4 w-4 text-signal" /> Add Perimeter Firewall Rule
              </h3>
              <button onClick={() => setShowAddRuleModal(false)} className="text-text-muted-v4 hover:text-text-primary-v4">
                <XCircle className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddFirewallRule} className="space-y-3 text-xs">
              <div>
                <label className="text-text-muted-v4 font-medium mb-1 block">Rule Match Target</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['IP_CIDR', 'COUNTRY', 'ASN'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewRuleType(t)}
                      className={`py-1.5 rounded-btn font-medium text-xs border transition-colors ${
                        newRuleType === t
                          ? 'bg-signal text-black border-signal font-semibold'
                          : 'bg-ink-surface-2 text-text-secondary-v4 border-hairline'
                      }`}
                    >
                      {t === 'IP_CIDR' ? 'IP / CIDR' : t === 'COUNTRY' ? 'Country ISO' : 'BGP ASN'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-text-muted-v4 font-medium mb-1 block">
                  {newRuleType === 'IP_CIDR' ? 'IPv4 / IPv6 Subnet (e.g. 198.51.100.0/24)' :
                   newRuleType === 'COUNTRY' ? 'Two-letter ISO Codes (e.g. RU, CN, IR)' :
                   'Autonomous System Number (e.g. AS14061)'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={newRuleType === 'IP_CIDR' ? '192.0.2.0/24' : newRuleType === 'COUNTRY' ? 'US, GB, IN' : 'AS13335'}
                  value={newRuleValue}
                  onChange={(e) => setNewRuleValue(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-btn bg-ink-surface-2 border border-hairline text-text-primary-v4 font-mono text-xs focus:outline-none focus:border-signal"
                />
              </div>

              <div>
                <label className="text-text-muted-v4 font-medium mb-1 block">Edge Enforcement Action</label>
                <select
                  value={newRuleAction}
                  onChange={(e) => setNewRuleAction(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-btn bg-ink-surface-2 border border-hairline text-text-primary-v4 text-xs focus:outline-none focus:border-signal"
                >
                  <option value="Block">Block (Drop connection immediately at BGP layer)</option>
                  <option value="Managed Challenge">Managed Challenge (Adaptive JS/biometric puzzle)</option>
                  <option value="JS Challenge">JS Challenge (Headless browser execution test)</option>
                  <option value="Allow">Allow (Whitelist and bypass WAF rate limits)</option>
                </select>
              </div>

              <div>
                <label className="text-text-muted-v4 font-medium mb-1 block">Reason / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Known malicious scraper cluster"
                  value={newRuleDesc}
                  onChange={(e) => setNewRuleDesc(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-btn bg-ink-surface-2 border border-hairline text-text-primary-v4 text-xs focus:outline-none focus:border-signal"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
                <button
                  type="button"
                  onClick={() => setShowAddRuleModal(false)}
                  className="px-3 py-1.5 rounded-btn border border-hairline text-text-muted-v4 hover:text-text-primary-v4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-btn bg-signal text-black font-semibold text-xs hover:bg-signal/90"
                >
                  Deploy to 38 Scrubbing PoPs
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Attack Modal */}
      {selectedAttack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="v4-panel max-w-lg w-full p-6 space-y-4 shadow-2xl bg-ink-surface border border-hairline">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <h3 className="font-semibold text-text-primary-v4 text-sm flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-bad" /> Telemetry: {selectedAttack.id}
              </h3>
              <button onClick={() => setSelectedAttack(null)} className="text-text-muted-v4 hover:text-text-primary-v4">
                <XCircle className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-btn bg-ink-surface-2 border border-hairline">
                <div>
                  <span className="text-text-muted-v4">Target Domain:</span>
                  <div className="font-semibold text-text-primary-v4">{selectedAttack.targetDomain}</div>
                </div>
                <div>
                  <span className="text-text-muted-v4">Layer & Vector:</span>
                  <div className="font-semibold text-text-primary-v4">{selectedAttack.layer} - {selectedAttack.vector}</div>
                </div>
                <div>
                  <span className="text-text-muted-v4">Peak Volumetric Rate:</span>
                  <div className="font-mono text-signal font-bold">{selectedAttack.peakRate}</div>
                </div>
                <div>
                  <span className="text-text-muted-v4">Ingress PoP:</span>
                  <div className="text-text-primary-v4">{selectedAttack.scrubbingCenter}</div>
                </div>
              </div>

              <div>
                <span className="text-text-muted-v4 font-medium mb-1 block">Active Mitigation Mechanism</span>
                <div className="p-2.5 rounded-btn bg-ink-surface-2 border border-hairline text-text-primary-v4 font-mono text-[11px]">
                  {selectedAttack.mitigationMethod}
                </div>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-btn bg-good/10 border border-good/20 text-good">
                <span>Total Malicious Packets Filtered:</span>
                <span className="font-bold font-mono">{selectedAttack.packetsDropped}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-hairline">
              <button
                onClick={() => setSelectedAttack(null)}
                className="px-3 py-1.5 rounded-btn bg-signal text-black font-semibold text-xs hover:bg-signal/90"
              >
                Close Telemetry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
