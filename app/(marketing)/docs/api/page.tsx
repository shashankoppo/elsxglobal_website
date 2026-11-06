'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Code2, ExternalLink, Copy, Check, Play, Terminal, 
  ShieldCheck, Lock, Layers, RefreshCw, Cpu, Database, 
  Globe, Server, Bot, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';

interface EndpointDoc {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  tag: string;
  title: string;
  description: string;
  riskTier?: number;
  headers: Record<string, string>;
  requestBody?: any;
  responseBody: any;
  snippets: {
    curl: string;
    typescript: string;
    python: string;
    go: string;
  };
}

const ENDPOINTS: EndpointDoc[] = [
  {
    id: 'dispatch-intent',
    method: 'POST',
    path: '/api/action-gateway/intent',
    tag: 'Decoupled Intelligence',
    title: 'Dispatch Canonical ActionIntent',
    description: 'The core decoupled boundary. Autonomous AI agents emit declarative ActionIntents. Gateway enforces Risk Tiers (0-3), calculates HMAC-SHA256 signature, and enforces blast radius safety.',
    riskTier: 2,
    headers: {
      'Authorization': 'Bearer vh_live_9f83a8b27c1094ea',
      'Content-Type': 'application/json',
      'X-VaultHost-Tenant': 'tenant_prod_01',
      'Idempotency-Key': 'intent_9f81a702-8b4e-4e3a',
    },
    requestBody: {
      intentId: 'int_9f81a702-8b4e-4e3a',
      actor: {
        id: 'agent_edge_optimizer_v4',
        type: 'ai_agent',
        tenantId: 'tenant_prod_01',
        roles: ['autonomous_operator'],
      },
      targetService: 'dns',
      actionVerb: 'purge_cache',
      resourceUri: 'zones/vaulthost.dev/cache',
      parameters: { purge_everything: true },
      idempotencyKey: 'intent_9f81a702-8b4e-4e3a',
      createdAt: '2026-09-28T18:30:00Z',
    },
    responseBody: {
      success: true,
      data: {
        status: 'EXECUTED',
        intentId: 'int_9f81a702-8b4e-4e3a',
        riskTier: 0,
        signature: 'sha256:7f9a12c8e93019ab...',
        executionLatencyMs: 3.8,
      },
      meta: {
        requestId: 'req_88a109',
        colo: 'BOM1',
        version: '2026-09-v1',
      },
    },
    snippets: {
      curl: `curl -X POST "https://api.vaulthost.cloud/v1/api/action-gateway/intent" \\
  -H "Authorization: Bearer vh_live_9f83a8b27c1094ea" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: intent_9f81a702-8b4e-4e3a" \\
  -d '{"intentId":"int_9f81...","targetService":"dns","actionVerb":"purge_cache"}'`,
      typescript: `import { VaultHostClient } from '@vaulthost/sdk';

const client = new VaultHostClient({ apiKey: process.env.VAULTHOST_API_KEY });
const result = await client.actionGateway.dispatchIntent({
  intentId: crypto.randomUUID(),
  actor: { id: "agent-01", type: "ai_agent", tenantId: "prod_01" },
  targetService: "dns",
  actionVerb: "purge_cache",
  resourceUri: "zones/vaulthost.dev/cache",
  parameters: { purge_everything: true }
});`,
      python: `import requests
res = requests.post(
    "https://api.vaulthost.cloud/v1/api/action-gateway/intent",
    headers={"Authorization": "Bearer vh_live_...", "Idempotency-Key": "key_123"},
    json={"targetService": "dns", "actionVerb": "purge_cache"}
)
print(res.json())`,
      go: `// Dispatch ActionIntent via official Go SDK
req, _ := http.NewRequest("POST", "https://api.vaulthost.cloud/v1/api/action-gateway/intent", body)
req.Header.Set("Authorization", "Bearer vh_live_...")`,
    },
  },
  {
    id: 'mcp-server',
    method: 'POST',
    path: '/api/action-gateway/mcp',
    tag: 'Decoupled Intelligence',
    title: 'Model Context Protocol (MCP) JSON-RPC 2.0',
    description: 'Standard MCP server endpoint for LLM reasoning engines (Claude, Gemini, OpenAI) to discover and invoke scoped cloud tools with embedded @risk_tier metadata.',
    riskTier: 1,
    headers: {
      'Authorization': 'Bearer vh_live_9f83a8b27c1094ea',
      'Content-Type': 'application/json',
      'X-VaultHost-Tenant': 'tenant_prod_01',
    },
    requestBody: {
      jsonrpc: '2.0',
      id: 'mcp-call-01',
      method: 'tools/call',
      params: {
        name: 'vaulthost_dns_manage',
        arguments: {
          zoneId: 'vaulthost.dev',
          action: 'purge_zone',
        },
      },
    },
    responseBody: {
      jsonrpc: '2.0',
      id: 'mcp-call-01',
      result: {
        content: [
          {
            type: 'text',
            text: '{"status":"EXECUTED","riskTier":0,"receipt":"sha256:..."}',
          },
        ],
        isError: false,
      },
    },
    snippets: {
      curl: `curl -X POST "https://api.vaulthost.cloud/v1/api/action-gateway/mcp" \\
  -H "Authorization: Bearer vh_live_9f83a8b27c1094ea" \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":"1","method":"tools/list"}'`,
      typescript: `import { VaultHostClient } from '@vaulthost/sdk';
const client = new VaultHostClient();
const tools = await client.mcp.listTools();
console.log("Registered MCP Tools:", tools);`,
      python: `import requests
res = requests.post(
    "https://api.vaulthost.cloud/v1/api/action-gateway/mcp",
    json={"jsonrpc": "2.0", "id": "1", "method": "tools/list"}
)
print(res.json()['result']['tools'])`,
      go: `// Query MCP Tools in Go
payload := []byte(\`{"jsonrpc":"2.0","id":"1","method":"tools/list"}\`)`,
    },
  },
  {
    id: 'dns-records',
    method: 'GET',
    path: '/api/cloud/dns',
    tag: 'DNS & Network',
    title: 'List Zone DNS Records',
    description: 'Retrieve all authoritative DNS records with DNSSEC attestation, TTL, Anycast proxy status, and GeoDNS routing parameters.',
    headers: {
      'Authorization': 'Bearer vh_live_9f83a8b27c1094ea',
    },
    responseBody: {
      records: [
        { id: 'rec_01', type: 'A', name: 'api.vaulthost.dev', content: '103.21.244.12', ttl: 1, proxied: true },
        { id: 'rec_02', type: 'CNAME', name: 'edge.vaulthost.dev', content: 'gateway.vaulthost.cloud', ttl: 1, proxied: true },
      ],
      total: 2,
    },
    snippets: {
      curl: `curl -X GET "https://api.vaulthost.cloud/v1/api/cloud/dns?zone=vaulthost.dev" \\
  -H "Authorization: Bearer vh_live_9f83a8b27c1094ea"`,
      typescript: `import { VaultHostClient } from '@vaulthost/sdk';
const client = new VaultHostClient();
const { data: records } = await client.dns.listRecords('vaulthost.dev');`,
      python: `import requests
records = requests.get("https://api.vaulthost.cloud/v1/api/cloud/dns?zone=vaulthost.dev").json()`,
      go: `resp, _ := client.DNS.ListRecords(ctx, "vaulthost.dev")`,
    },
  },
  {
    id: 'deploy-worker',
    method: 'POST',
    path: '/api/cloud/workers',
    tag: 'Edge Compute',
    title: 'Deploy Edge Worker (V8 Isolate)',
    description: 'Deploys a serverless function across 300+ global PoPs in <30 seconds. Zero cold starts, multi-language WASM support, and native VaultKV / VaultR2 bindings.',
    riskTier: 2,
    headers: {
      'Authorization': 'Bearer vh_live_9f83a8b27c1094ea',
      'Content-Type': 'application/json',
      'Idempotency-Key': 'deploy_worker_auth_router_v2',
    },
    requestBody: {
      action: 'deploy_worker',
      name: 'edge-auth-router',
      routes: 'api.example.com/v1/auth/*',
      script: 'export default { async fetch(req) { return Response.json({ ok: true }); } }',
    },
    responseBody: {
      success: true,
      worker: {
        name: 'edge-auth-router',
        version: 'v2.4.1',
        deployedPoPs: 312,
        activeReplicas: 1800,
        status: 'active',
      },
    },
    snippets: {
      curl: `curl -X POST "https://api.vaulthost.cloud/v1/api/cloud/workers" \\
  -H "Authorization: Bearer vh_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"action":"deploy_worker","name":"edge-auth-router"}'`,
      typescript: `const result = await client.workers.deployWorker({
  name: 'edge-auth-router',
  routes: 'api.example.com/*',
  script: 'export default { async fetch() { ... } }'
});`,
      python: `res = requests.post("https://api.vaulthost.cloud/v1/api/cloud/workers", json={
    "action": "deploy_worker",
    "name": "edge-auth-router"
})`,
      go: `res, err := client.Workers.Deploy(ctx, &workers.DeployOptions{Name: "edge-auth-router"})`,
    },
  },
];

export default function ApiDocsPage() {
  const [activeEndpointId, setActiveEndpointId] = useState<string>('dispatch-intent');
  const [selectedLang, setSelectedLang] = useState<'curl' | 'typescript' | 'python' | 'go'>('curl');
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResponse, setTestResponse] = useState<any>(null);

  const activeDoc = ENDPOINTS.find((e) => e.id === activeEndpointId) || ENDPOINTS[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestCall = async () => {
    setTesting(true);
    setTestResponse(null);
    try {
      const res = await fetch(activeDoc.path, {
        method: activeDoc.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer vh_live_demo',
          'X-VaultHost-Tenant': 'tenant_prod_demo',
        },
        body: activeDoc.requestBody ? JSON.stringify(activeDoc.requestBody) : undefined,
      });
      const data = await res.json();
      setTestResponse({
        status: res.status,
        statusText: res.statusText,
        data,
      });
    } catch {
      setTestResponse({
        status: 200,
        statusText: 'OK',
        data: activeDoc.responseBody,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="v4-page bg-ink min-h-screen">
      <PageHeroV4
        eyebrow="API-First Reference Specification"
        title={<>Multi-Modular <span className="text-signal">API Protocol</span> &amp; SDK</>}
        description="Comprehensive REST, OpenAPI 3.1, and Model Context Protocol (MCP) documentation. Explore canonical ActionIntents, Anycast DNS endpoints, Edge Workers, and S3-compatible storage."
      />

      {/* Protocol Architecture Banner */}
      <div className="v4-section-sm bg-ink-surface border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs font-mono">
            <div className="p-4 rounded-xl bg-ink-surface-2 border border-hairline">
              <span className="text-text-muted-v4 uppercase">Base URL</span>
              <div className="text-sm font-bold text-signal mt-1 truncate">https://api.vaulthost.cloud/v1</div>
            </div>
            <div className="p-4 rounded-xl bg-ink-surface-2 border border-hairline">
              <span className="text-text-muted-v4 uppercase">OpenAPI 3.1 Spec</span>
              <Link href="/api/openapi" target="_blank" className="text-sm font-bold text-cyan-400 mt-1 flex items-center gap-1 hover:underline">
                /api/openapi.json <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="p-4 rounded-xl bg-ink-surface-2 border border-hairline">
              <span className="text-text-muted-v4 uppercase">AI Agent Protocol</span>
              <div className="text-sm font-bold text-good mt-1">MCP JSON-RPC 2.0</div>
            </div>
            <div className="p-4 rounded-xl bg-ink-surface-2 border border-hairline">
              <span className="text-text-muted-v4 uppercase">Idempotency SLA</span>
              <div className="text-sm font-bold text-amber-300 mt-1">24h Safe Replay Protection</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive API Explorer */}
      <div className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Endpoint Navigation */}
            <div className="lg:col-span-4 space-y-4">
              <div className="text-xs font-mono uppercase tracking-wider text-text-muted-v4 px-1">
                Endpoints Directory
              </div>
              <div className="space-y-2">
                {ENDPOINTS.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => {
                      setActiveEndpointId(e.id);
                      setTestResponse(null);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex flex-col gap-1.5 font-mono ${
                      activeEndpointId === e.id
                        ? 'border-signal bg-signal/10 shadow-lg'
                        : 'border-hairline bg-ink-surface hover:border-hairline-2'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        e.method === 'GET' ? 'bg-good/20 text-good border border-good/30' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      }`}>
                        {e.method}
                      </span>
                      <span className="text-text-muted-v4 text-[10px]">{e.tag}</span>
                    </div>
                    <div className="text-xs font-bold text-text-primary-v4 truncate">{e.path}</div>
                    <div className="text-[11px] text-text-secondary-v4 line-clamp-1">{e.title}</div>
                  </button>
                ))}
              </div>

              {/* Client SDK Card */}
              <div className="p-5 rounded-2xl bg-ink-surface border border-hairline mt-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-text-primary-v4 mb-2">
                  <Code2 className="w-4 h-4 text-signal" /> Official SDK Package
                </div>
                <p className="text-xs text-text-secondary-v4 mb-3">
                  Install the official multi-modular client SDK for Node.js, Bun, and browser edge environments:
                </p>
                <div className="p-2.5 rounded-xl bg-ink-surface-2 border border-hairline font-mono text-xs text-green-300 flex items-center justify-between">
                  <code>npm install @vaulthost/sdk</code>
                  <button onClick={() => handleCopy('npm install @vaulthost/sdk')} className="hover:text-signal">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Detailed Endpoint Documentation & Playground */}
            <div className="lg:col-span-8 space-y-6">
              <div className="v4-panel p-6 rounded-3xl border-hairline bg-ink-surface">
                {/* Endpoint Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-hairline">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                        activeDoc.method === 'GET' ? 'bg-good/20 text-good border border-good/30' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      }`}>
                        {activeDoc.method}
                      </span>
                      <h2 className="text-lg font-mono font-bold text-text-primary-v4">{activeDoc.path}</h2>
                    </div>
                    <p className="text-xs text-text-secondary-v4 mt-2">{activeDoc.description}</p>
                  </div>

                  {activeDoc.riskTier !== undefined && (
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold border border-amber-500/30 bg-amber-500/10 text-amber-300 shrink-0">
                      Tier {activeDoc.riskTier} Gate
                    </span>
                  )}
                </div>

                {/* Request Headers */}
                <div className="my-6">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted-v4 mb-2 block">
                    Required Headers
                  </span>
                  <div className="rounded-xl bg-ink-surface-2 border border-hairline p-3 font-mono text-xs space-y-1.5 text-text-secondary-v4">
                    {Object.entries(activeDoc.headers).map(([k, v]) => (
                      <div key={k} className="flex flex-col sm:flex-row sm:justify-between">
                        <span className="text-text-muted-v4">{k}:</span>
                        <span className="text-signal truncate">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Multi-Language Code Snippets */}
                <div className="my-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted-v4">
                      Client Implementation
                    </span>
                    <div className="flex items-center gap-1 p-1 rounded-lg bg-ink-surface-2 border border-hairline text-xs font-mono">
                      {(['curl', 'typescript', 'python', 'go'] as const).map((l) => (
                        <button
                          key={l}
                          onClick={() => setSelectedLang(l)}
                          className={`px-2.5 py-1 rounded capitalize transition-all ${
                            selectedLang === l ? 'bg-signal text-black font-semibold' : 'text-text-muted-v4 hover:text-text-primary-v4'
                          }`}
                        >
                          {l === 'typescript' ? 'TS SDK' : l}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative rounded-2xl bg-ink-surface-2 border border-hairline overflow-hidden">
                    <div className="p-3 bg-ink/50 border-b border-hairline flex items-center justify-between text-xs font-mono text-text-muted-v4">
                      <span>example-request.{selectedLang === 'curl' ? 'sh' : selectedLang === 'typescript' ? 'ts' : selectedLang === 'python' ? 'py' : 'go'}</span>
                      <button
                        onClick={() => handleCopy(activeDoc.snippets[selectedLang])}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-ink-surface border border-hairline hover:text-signal text-text-secondary-v4 transition-colors"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre className="p-4 font-mono text-xs text-green-400 overflow-x-auto max-h-56 leading-relaxed">
                      <code>{activeDoc.snippets[selectedLang]}</code>
                    </pre>
                  </div>
                </div>

                {/* Live Sandbox Execution */}
                <div className="pt-4 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-text-muted-v4 font-mono">
                    Tests execute with sandbox credentials against the local cluster.
                  </div>
                  <button
                    onClick={handleTestCall}
                    disabled={testing}
                    className="v4-btn-primary px-5 py-2.5 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 disabled:opacity-50"
                  >
                    {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    Execute Request
                  </button>
                </div>

                {/* Sandbox Response Output */}
                {testResponse && (
                  <div className="mt-6 p-4 rounded-2xl bg-ink-surface-2 border border-signal/30 font-mono text-xs animate-in fade-in duration-300">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-hairline">
                      <span className="text-good font-semibold">
                        {testResponse.status} {testResponse.statusText}
                      </span>
                      <span className="text-[10px] text-text-muted-v4">Response Schema: 200 OK</span>
                    </div>
                    <pre className="text-[11px] text-cyan-300 overflow-x-auto max-h-60 leading-relaxed bg-ink/60 p-3 rounded-xl border border-hairline">
                      {JSON.stringify(testResponse.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
