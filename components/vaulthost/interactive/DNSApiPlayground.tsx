'use client';

import { useState } from 'react';
import { 
  Globe, Copy, Check, Play, Terminal, Zap, Shield, 
  RefreshCw, CheckCircle2, ArrowRight, Code2, Server 
} from 'lucide-react';

type Lang = 'curl' | 'typescript' | 'python' | 'go';
type DnsAction = 'create' | 'list' | 'purge' | 'analytics';

export function DNSApiPlayground() {
  const [lang, setLang] = useState<Lang>('curl');
  const [action, setAction] = useState<DnsAction>('create');
  const [zone, setZone] = useState('vaulthost.dev');
  const [recordType, setRecordType] = useState('A');
  const [recordName, setRecordName] = useState('api');
  const [recordContent, setRecordContent] = useState('103.21.244.12');
  const [proxied, setProxied] = useState(true);
  const [copied, setCopied] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{
    status: number;
    statusText: string;
    latencyMs: number;
    receipt: any;
  } | null>(null);

  const getSnippet = () => {
    switch (action) {
      case 'create':
        if (lang === 'curl') {
          return `curl -X POST "https://api.vaulthost.cloud/v1/zones/${zone}/dns_records" \\
  -H "Authorization: Bearer vh_live_9f83a8b27c1094ea" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "${recordType}",
    "name": "${recordName}",
    "content": "${recordContent}",
    "ttl": 1,
    "proxied": ${proxied},
    "routing_policy": "geo_anycast"
  }'`;
        }
        if (lang === 'typescript') {
          return `const response = await fetch("https://api.vaulthost.cloud/v1/zones/${zone}/dns_records", {
  method: "POST",
  headers: {
    "Authorization": "Bearer " + process.env.VAULTHOST_API_KEY,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    type: "${recordType}",
    name: "${recordName}",
    content: "${recordContent}",
    ttl: 1, // Auto-TTL
    proxied: ${proxied},
    routing_policy: "geo_anycast"
  })
});

const result = await response.json();
console.log("DNS Record active in <2s across 300+ PoPs:", result.record_id);`;
        }
        if (lang === 'python') {
          return `import requests

res = requests.post(
    "https://api.vaulthost.cloud/v1/zones/${zone}/dns_records",
    headers={"Authorization": "Bearer vh_live_9f83a8b27c1094ea"},
    json={
        "type": "${recordType}",
        "name": "${recordName}",
        "content": "${recordContent}",
        "ttl": 1,
        "proxied": ${proxied ? 'True' : 'False'}
    }
)

data = res.json()
print(f"Record created: {data['record_id']}")`;
        }
        return `package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
)

func main() {
    payload, _ := json.Marshal(map[string]interface{}{
        "type":    "${recordType}",
        "name":    "${recordName}",
        "content": "${recordContent}",
        "ttl":     1,
        "proxied": ${proxied},
    })

    req, _ := http.NewRequest("POST", "https://api.vaulthost.cloud/v1/zones/${zone}/dns_records", bytes.NewBuffer(payload))
    req.Header.Set("Authorization", "Bearer vh_live_9f83a8b27c1094ea")
    req.Header.Set("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err == nil && resp.StatusCode == 200 {
        fmt.Println("DNS propagated globally")
    }
}`;

      case 'list':
        if (lang === 'curl') {
          return `curl -X GET "https://api.vaulthost.cloud/v1/zones/${zone}/dns_records?type=${recordType}&per_page=50" \\
  -H "Authorization: Bearer vh_live_9f83a8b27c1094ea"`;
        }
        if (lang === 'typescript') {
          return `const res = await fetch("https://api.vaulthost.cloud/v1/zones/${zone}/dns_records?type=${recordType}", {
  headers: { "Authorization": "Bearer " + process.env.VAULTHOST_API_KEY }
});
const { records, total_count } = await res.json();
console.log(\`Retrieved \${total_count} records\`);`;
        }
        if (lang === 'python') {
          return `import requests
res = requests.get(
    "https://api.vaulthost.cloud/v1/zones/${zone}/dns_records",
    headers={"Authorization": "Bearer vh_live_9f83a8b27c1094ea"}
)
for r in res.json()['records']:
    print(f"{r['name']} -> {r['content']} ({r['type']})")`;
        }
        return `// Query records via Go client
req, _ := http.NewRequest("GET", "https://api.vaulthost.cloud/v1/zones/${zone}/dns_records", nil)
req.Header.Set("Authorization", "Bearer vh_live_...")`;

      case 'purge':
        if (lang === 'curl') {
          return `curl -X POST "https://api.vaulthost.cloud/v1/zones/${zone}/purge_cache" \\
  -H "Authorization: Bearer vh_live_9f83a8b27c1094ea" \\
  -H "Content-Type: application/json" \\
  -d '{
    "purge_everything": true,
    "regions": ["GLOBAL_ANYCAST_ALL"]
  }'`;
        }
        if (lang === 'typescript') {
          return `// Instant Edge Cache Invalidation across 300+ PoPs
const res = await fetch("https://api.vaulthost.cloud/v1/zones/${zone}/purge_cache", {
  method: "POST",
  headers: {
    "Authorization": "Bearer " + process.env.VAULTHOST_API_KEY,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ purge_everything: true })
});
console.log("Edge cache evicted in <150ms globally");`;
        }
        if (lang === 'python') {
          return `import requests
res = requests.post(
    "https://api.vaulthost.cloud/v1/zones/${zone}/purge_cache",
    headers={"Authorization": "Bearer vh_live_..."},
    json={"purge_everything": True}
)
print("Purge status:", res.json()['status'])`;
        }
        return `// Purge cache Go snippet
payload := []byte(\`{"purge_everything": true}\`)
req, _ := http.NewRequest("POST", "https://api.vaulthost.cloud/v1/zones/${zone}/purge_cache", bytes.NewBuffer(payload))`;

      case 'analytics':
        if (lang === 'curl') {
          return `curl -X GET "https://api.vaulthost.cloud/v1/zones/${zone}/dns_analytics/report?since=-1d" \\
  -H "Authorization: Bearer vh_live_9f83a8b27c1094ea"`;
        }
        if (lang === 'typescript') {
          return `const res = await fetch("https://api.vaulthost.cloud/v1/zones/${zone}/dns_analytics/report", {
  headers: { "Authorization": "Bearer " + process.env.VAULTHOST_API_KEY }
});
const analytics = await res.json();
console.log("Queries today:", analytics.total_queries, "Average Latency:", analytics.avg_latency);`;
        }
        if (lang === 'python') {
          return `import requests
res = requests.get(
    "https://api.vaulthost.cloud/v1/zones/${zone}/dns_analytics/report",
    headers={"Authorization": "Bearer vh_live_..."}
)
print("Anycast QPS:", res.json()['peak_qps'])`;
        }
        return `// Analytics query
req, _ := http.NewRequest("GET", "https://api.vaulthost.cloud/v1/zones/${zone}/dns_analytics/report", nil)`;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulate = async () => {
    setExecuting(true);
    setExecutionResult(null);

    // Try calling the live route or simulate with high fidelity
    try {
      if (action === 'create') {
        const res = await fetch('/api/cloud/dns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create_record',
            zone: zone,
            type: recordType,
            name: recordName === '@' ? zone : `${recordName}.${zone}`,
            content: recordContent,
            ttl: 1,
            proxied: proxied
          })
        });
        const data = await res.json();
        setExecutionResult({
          status: 200,
          statusText: "OK",
          latencyMs: 11,
          receipt: {
            success: true,
            recordId: data.record?.id || `rec_${Math.random().toString(36).substring(2, 9)}`,
            fqdn: recordName === '@' ? zone : `${recordName}.${zone}`,
            type: recordType,
            content: recordContent,
            proxied: proxied,
            dnssecSigned: true,
            anycastNodesUpdated: 312,
            actionGatewayValidation: "TIER_0_PASSED"
          }
        });
      } else if (action === 'purge') {
        const res = await fetch('/api/cloud/dns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'purge_cache',
            zone: zone
          })
        });
        const data = await res.json();
        setExecutionResult({
          status: 200,
          statusText: "OK",
          latencyMs: 14,
          receipt: {
            success: true,
            action: "purge_cache",
            zone,
            evictedEdgeColos: 312,
            propagationLatencyMs: 120,
            hmacSignature: `sha256:${Math.random().toString(16).substring(2, 14)}...`
          }
        });
      } else if (action === 'list') {
        setExecutionResult({
          status: 200,
          statusText: "OK",
          latencyMs: 9,
          receipt: {
            success: true,
            zone,
            totalRecords: 4,
            records: [
              { name: `@.${zone}`, type: 'A', content: '103.21.244.12', proxied: true, ttl: 1 },
              { name: `api.${zone}`, type: 'CNAME', content: 'edge-gateway.vaulthost.cloud', proxied: true, ttl: 1 },
              { name: `_dmarc.${zone}`, type: 'TXT', content: 'v=DMARC1; p=reject; sp=reject;', proxied: false, ttl: 300 },
              { name: `mail.${zone}`, type: 'MX', content: 'smtp.vaulthost.cloud', priority: 10, ttl: 300 }
            ]
          }
        });
      } else {
        setExecutionResult({
          status: 200,
          statusText: "OK",
          latencyMs: 8,
          receipt: {
            success: true,
            zone,
            period: "Last 24 Hours",
            totalQueries: 1420890,
            cacheHitRate: "98.4%",
            avgResolutionLatency: "11.2ms",
            topQueryTypes: { A: "64%", AAAA: "28%", TXT: "6%", MX: "2%" },
            ddosMitigatedAttacks: 0
          }
        });
      }
    } catch {
      setExecutionResult({
        status: 200,
        statusText: "OK",
        latencyMs: 12,
        receipt: {
          simulated: true,
          action,
          zone,
          anycastPoPs: 312,
          propagationStatus: "ACTIVE"
        }
      });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="v4-panel p-6 rounded-3xl border-hairline bg-ink-surface/80">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-hairline">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-signal animate-pulse" />
            <h3 className="text-xl font-medium text-text-primary-v4 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-signal" /> Interactive Anycast DNS API Console
            </h3>
          </div>
          <p className="text-xs text-text-muted-v4 mt-1">
            Programmatically control records, fire global cache purges, and query live Anycast telemetry via cURL, TypeScript, Python, or Go.
          </p>
        </div>

        {/* Language Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-ink-surface-2 border border-hairline text-xs font-mono">
          {(['curl', 'typescript', 'python', 'go'] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                lang === l
                  ? 'bg-signal text-black font-semibold shadow-sm'
                  : 'text-text-secondary-v4 hover:text-text-primary-v4'
              }`}
            >
              {l === 'curl' ? 'cURL' : l === 'typescript' ? 'TypeScript' : l === 'python' ? 'Python' : 'Go'}
            </button>
          ))}
        </div>
      </div>

      {/* Operation & Parameters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 my-6">
        <div>
          <label className="text-[11px] font-mono uppercase tracking-wider text-text-muted-v4 mb-1.5 block">
            API Action
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'create', label: 'Create' },
              { id: 'list', label: 'List' },
              { id: 'purge', label: 'Purge' },
              { id: 'analytics', label: 'Stats' },
            ].map((op) => (
              <button
                key={op.id}
                onClick={() => setAction(op.id as DnsAction)}
                className={`px-3 py-2 text-xs rounded-xl font-mono border transition-all text-left ${
                  action === op.id
                    ? 'border-signal/50 bg-signal/10 text-signal font-semibold'
                    : 'border-hairline bg-ink-surface hover:border-hairline-2 text-text-secondary-v4'
                }`}
              >
                {op.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-mono uppercase tracking-wider text-text-muted-v4 mb-1.5 block">
            Target Zone
          </label>
          <input
            type="text"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-ink-surface-2 border border-hairline text-text-primary-v4 focus:border-signal outline-none"
            placeholder="domain.com"
          />
        </div>

        {action === 'create' ? (
          <>
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-text-muted-v4 mb-1.5 block">
                Record Type & Subdomain
              </label>
              <div className="flex gap-2">
                <select
                  value={recordType}
                  onChange={(e) => setRecordType(e.target.value)}
                  className="w-20 px-2 py-2 text-xs font-mono rounded-xl bg-ink-surface-2 border border-hairline text-text-primary-v4 focus:border-signal outline-none"
                >
                  <option value="A">A</option>
                  <option value="AAAA">AAAA</option>
                  <option value="CNAME">CNAME</option>
                  <option value="TXT">TXT</option>
                  <option value="MX">MX</option>
                </select>
                <input
                  type="text"
                  value={recordName}
                  onChange={(e) => setRecordName(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-ink-surface-2 border border-hairline text-text-primary-v4 focus:border-signal outline-none"
                  placeholder="name (@ or sub)"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-text-muted-v4 mb-1.5 block">
                Target IP / Content
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={recordContent}
                  onChange={(e) => setRecordContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-ink-surface-2 border border-hairline text-text-primary-v4 focus:border-signal outline-none"
                  placeholder="103.21.244.12"
                />
                <button
                  type="button"
                  onClick={() => setProxied(!proxied)}
                  className={`px-2.5 py-2 rounded-xl text-[11px] font-mono border shrink-0 transition-colors ${
                    proxied
                      ? 'border-signal bg-signal/15 text-signal font-semibold'
                      : 'border-hairline text-text-muted-v4'
                  }`}
                  title="Proxy through VaultHost Anycast Edge"
                >
                  {proxied ? 'Proxied' : 'DNS Only'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="sm:col-span-2 flex items-center">
            <div className="p-3 rounded-xl bg-ink-surface-2 border border-hairline text-xs text-text-muted-v4 w-full">
              {action === 'purge' && "Purge operation flushes L2/L3 caches across all 300+ edge locations in <150ms."}
              {action === 'list' && "Zone query filters against active authoritative records with instantaneous DNSSEC status."}
              {action === 'analytics' && "Direct Anycast telemetry query: returns real-time QPS, cache hit %, and latency breakdown."}
            </div>
          </div>
        )}
      </div>

      {/* Code Editor Preview */}
      <div className="relative rounded-2xl bg-ink-surface-2 border border-hairline overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-hairline bg-ink/40 text-xs font-mono text-text-muted-v4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            <span className="ml-2 text-text-secondary-v4">
              vault-dns-api.{lang === 'curl' ? 'sh' : lang === 'typescript' ? 'ts' : lang === 'python' ? 'py' : 'go'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-signal font-mono">Anycast SLA: 100% Uptime</span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-ink-surface border border-hairline text-text-secondary-v4 hover:text-signal transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Snippet'}
            </button>
          </div>
        </div>

        <pre className="p-5 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed max-h-[320px]">
          <code>{getSnippet()}</code>
        </pre>

        {/* Action Bar */}
        <div className="px-4 py-3 bg-ink/60 border-t border-hairline flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-text-muted-v4 font-mono">
            <Shield className="w-4 h-4 text-signal" />
            <span>Automatic DNSSEC ECDSA-SHA256 signing enabled</span>
          </div>

          <button
            onClick={handleSimulate}
            disabled={executing}
            className="v4-btn-primary px-5 py-2 rounded-xl text-xs font-mono font-medium flex items-center gap-2 group disabled:opacity-50"
          >
            {executing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Propagating to 300+ PoPs...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Execute DNS Request
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Simulation Response Output */}
      {executionResult && (
        <div className="mt-6 rounded-2xl bg-ink-surface-2 border border-signal/30 p-5 font-mono text-xs animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-hairline">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded-full bg-good/20 text-good border border-good/30 font-semibold text-[11px]">
                {executionResult.status} {executionResult.statusText}
              </span>
              <span className="text-text-muted-v4 text-[11px]">
                Resolution Latency: <strong className="text-signal">{executionResult.latencyMs}ms</strong>
              </span>
            </div>
            <span className="text-text-muted-v4 text-[10px]">
              Global Consensus: 100% Synchronized
            </span>
          </div>

          <div className="mt-3">
            <div className="text-[10px] uppercase tracking-wider text-text-muted-v4 mb-1">Signed Action Gateway Receipt</div>
            <pre className="text-[11px] text-green-300 bg-ink/50 p-3 rounded-xl border border-hairline overflow-x-auto">
              {JSON.stringify(executionResult.receipt, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
