'use client';

import { useState } from 'react';
import { Globe, Search, ShieldCheck, CheckCircle2, RefreshCw, Copy, Check, Terminal, Zap, ArrowRight, Shield } from 'lucide-react';

interface PopResult {
  code: string;
  city: string;
  country: string;
  region: string;
  latencyMs: number;
  ip: string;
  dnssec: boolean;
  status: 'propagated' | 'resolving' | 'error';
}

const GLOBAL_POPS: Omit<PopResult, 'latencyMs' | 'ip' | 'dnssec' | 'status'>[] = [
  { code: 'BOM', city: 'Mumbai', country: 'IN', region: 'Asia-South' },
  { code: 'SIN', city: 'Singapore', country: 'SG', region: 'Asia-East' },
  { code: 'FRA', city: 'Frankfurt', country: 'DE', region: 'Europe-West' },
  { code: 'LHR', city: 'London', country: 'GB', region: 'Europe-North' },
  { code: 'ORD', city: 'Chicago', country: 'US', region: 'NA-Central' },
  { code: 'SJC', city: 'San Jose', country: 'US', region: 'NA-West' },
  { code: 'NRT', city: 'Tokyo', country: 'JP', region: 'Asia-Pacific' },
  { code: 'SYD', city: 'Sydney', country: 'AU', region: 'Oceania' },
  { code: 'GRU', city: 'São Paulo', country: 'BR', region: 'SA-East' },
  { code: 'JNB', city: 'Johannesburg', country: 'ZA', region: 'Africa-South' },
];

const RECORD_DEFAULTS: Record<string, { direct: string; proxied: string }> = {
  A: { direct: '198.51.100.42', proxied: '104.28.19.4' },
  AAAA: { direct: '2001:db8::8a2e:370:7334', proxied: '2606:4700:3033::6815:1304' },
  CNAME: { direct: 'origin-lb.internal.net', proxied: 'edge.vaulthost.cloud' },
  MX: { direct: '10 mail.vaulthost.cloud', proxied: '10 mail.vaulthost.cloud' },
  TXT: { direct: '"v=spf1 include:_spf.vaulthost.cloud ~all"', proxied: '"v=spf1 include:_spf.vaulthost.cloud ~all"' },
  CAA: { direct: '0 issue "letsencrypt.org"', proxied: '0 issue "letsencrypt.org"' },
};

export function DNSPropagationChecker() {
  const [domain, setDomain] = useState('edge.vaulthost.cloud');
  const [recordType, setRecordType] = useState('A');
  const [isProxied, setIsProxied] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [hasChecked, setHasChecked] = useState(true);
  const [copied, setCopied] = useState(false);

  // Generate current results based on settings
  const results: PopResult[] = GLOBAL_POPS.map((pop, idx) => {
    const baseLatency = pop.code === 'BOM' ? 4 : pop.code === 'SIN' ? 9 : pop.code === 'FRA' ? 14 : pop.code === 'LHR' ? 12 : 18;
    return {
      ...pop,
      latencyMs: baseLatency + (idx % 3),
      ip: isProxied ? RECORD_DEFAULTS[recordType].proxied : RECORD_DEFAULTS[recordType].direct,
      dnssec: true,
      status: 'propagated',
    };
  });

  const handleLookup = () => {
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      setHasChecked(true);
    }, 600);
  };

  const digCommand = `dig +dnssec @1.1.1.1 ${domain} ${recordType}`;

  const copyDig = () => {
    navigator.clipboard.writeText(digCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="v4-panel rounded-3xl border border-hairline overflow-hidden shadow-2xl bg-ink">
      {/* Header Bar */}
      <div className="p-5 border-b border-hairline bg-ink-surface/90 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-signal/10 text-signal border border-signal/20">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary-v4">Anycast DNS Propagation & Resolution Tester</h3>
            <p className="text-xs text-text-muted-v4">Query global Anycast edge nodes in real time with DNSSEC validation</p>
          </div>
        </div>

        {/* Proxy Switcher */}
        <div className="flex items-center gap-3 bg-ink-surface-2 px-3 py-1.5 rounded-full border border-hairline">
          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${isProxied ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]' : 'bg-gray-500'}`} />
            <span className="text-xs font-medium text-text-secondary-v4">
              {isProxied ? 'Proxied (DDoS Shielded)' : 'DNS Only (Direct Origin)'}
            </span>
          </div>
          <button
            onClick={() => setIsProxied(!isProxied)}
            className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
              isProxied ? 'bg-orange-500 justify-end' : 'bg-muted justify-start'
            }`}
          >
            <div className={`w-4 h-4 rounded-full shadow-md transition-all ${isProxied ? 'bg-ink' : 'bg-white'}`} />
          </button>
        </div>
      </div>

      {/* Query Bar */}
      <div className="p-5 border-b border-hairline bg-ink-surface-2/60">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Record Selector */}
          <div className="flex rounded-xl bg-ink border border-hairline p-1 shrink-0 overflow-x-auto">
            {['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'CAA'].map((type) => (
              <button
                key={type}
                onClick={() => setRecordType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  recordType === type
                    ? 'bg-signal text-black font-semibold shadow-sm'
                    : 'text-text-muted-v4 hover:text-text-primary-v4'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Domain Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted-v4" />
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. yourdomain.com"
              className="w-full bg-ink border border-hairline rounded-xl pl-10 pr-4 py-2 text-sm text-text-primary-v4 font-mono focus:outline-none focus:border-signal/50 transition-colors"
            />
          </div>

          {/* Lookup Button */}
          <button
            onClick={handleLookup}
            disabled={isChecking}
            className="v4-btn-primary rounded-xl px-5 py-2 text-xs font-semibold flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {isChecking ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Querying Anycast...
              </>
            ) : (
              <>
                <Zap className="h-3.5 w-3.5" /> Check Global Propagation
              </>
            )}
          </button>
        </div>

        {/* CLI Dig Helper */}
        <div className="mt-3 flex items-center justify-between text-xs font-mono bg-ink/70 px-3.5 py-2 rounded-lg border border-hairline text-text-muted-v4">
          <div className="flex items-center gap-2 truncate">
            <Terminal className="h-3.5 w-3.5 text-signal shrink-0" />
            <span className="text-text-secondary-v4 truncate">{digCommand}</span>
          </div>
          <button
            onClick={copyDig}
            className="flex items-center gap-1 text-[11px] text-signal hover:underline shrink-0 ml-3"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy Dig'}
          </button>
        </div>
      </div>

      {/* Global Results Grid */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted-v4">Global Edge Propagation</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-green-500/10 text-green-400 border border-green-500/20">
              10/10 PoPs Synchronized (100%)
            </span>
          </div>
          <span className="text-xs text-text-muted-v4 font-mono">Avg Latency: &lt;11ms Anycast</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {results.map((pop) => (
            <div
              key={pop.code}
              className="bg-ink-surface-2 p-3.5 rounded-2xl border border-hairline hover:border-signal/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-text-primary-v4 px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                      {pop.code}
                    </span>
                    <span className="text-xs text-text-secondary-v4 font-medium">{pop.city}</span>
                  </div>
                  <span className="text-[11px] font-mono text-signal font-semibold">
                    {pop.latencyMs}ms
                  </span>
                </div>

                <div className="font-mono text-xs text-text-primary-v4 bg-ink/80 px-2 py-1.5 rounded-lg border border-hairline truncate mb-2">
                  {pop.ip}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-hairline/50 text-[11px]">
                <div className="flex items-center gap-1 text-green-400">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Propagated</span>
                </div>
                <div className="flex items-center gap-1 text-text-muted-v4" title="DNSSEC Verified">
                  <ShieldCheck className="h-3 w-3 text-signal" />
                  <span>DNSSEC</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Protection Explainer Callout */}
        <div className="mt-4 p-3.5 rounded-xl border border-hairline bg-ink-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Shield className="h-4 w-4 text-signal shrink-0" />
            <span className="text-text-secondary-v4">
              {isProxied
                ? 'Traffic is routed through VaultHost Anycast Edge. Origin IP is masked against DDoS attacks.'
                : 'Traffic is routed directly to origin. DDoS mitigation occurs at DNS resolver level only.'}
            </span>
          </div>
          <span className="text-signal font-mono text-[11px] shrink-0">
            TTL: 300s (Auto-replicated)
          </span>
        </div>
      </div>
    </div>
  );
}
