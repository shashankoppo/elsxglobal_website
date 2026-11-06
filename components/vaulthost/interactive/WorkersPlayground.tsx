'use client';

import { useState } from 'react';
import { Play, RotateCcw, Check, Copy, Terminal, Zap, Shield, Globe, Cpu, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { PanelCard } from '@/components/ui/panel-card';

const TEMPLATES: Record<string, { name: string; lang: string; code: string }> = {
  api: {
    name: 'JSON API Endpoint',
    lang: 'typescript',
    code: `export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname, searchParams } = new URL(request.url);
    
    // Fast edge execution
    const data = {
      status: "success",
      endpoint: pathname,
      colo: request.headers.get("cf-ray") || "BOM (Mumbai Edge)",
      timestamp: new Date().toISOString(),
      clientIP: request.headers.get("x-real-ip") || "103.21.244.0",
      edgeLatency: "2.1ms"
    };

    return Response.json(data, {
      headers: {
        "x-vaulthost-edge": "active",
        "cache-control": "public, max-age=60"
      }
    });
  }
};`,
  },
  auth: {
    name: 'JWT Auth Gate',
    lang: 'typescript',
    code: `export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return new Response(JSON.stringify({ error: "Missing Bearer Token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Verify token against VaultKV store in <3ms
    const session = await env.AUTH_KV.get(token, "json");
    if (!session) {
      return new Response(JSON.stringify({ error: "Invalid or expired session" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    return Response.json({ authenticated: true, user: session.user, role: session.role });
  }
};`,
  },
  ab: {
    name: 'A/B Variant Router',
    lang: 'typescript',
    code: `export default {
  async fetch(request: Request): Promise<Response> {
    const cookie = request.headers.get("Cookie") || "";
    let variant = cookie.includes("vh_variant=b") ? "B" : "A";

    // Hash user IP to allocate variant deterministically
    if (!cookie.includes("vh_variant")) {
      const isVariantB = Math.random() > 0.5;
      variant = isVariantB ? "B" : "A";
    }

    const response = await fetch(\`https://origin.vaulthost.cloud/\${variant.toLowerCase()}\`);
    const newHeaders = new Headers(response.headers);
    newHeaders.set("Set-Cookie", \`vh_variant=\${variant.toLowerCase()}; Path=/; Max-Age=86400\`);
    newHeaders.set("x-ab-variant", variant);

    return new Response(response.body, { status: response.status, headers: newHeaders });
  }
};`,
  },
};

const POPS = [
  { id: 'bom', name: 'Mumbai (BOM)', ping: '2.1ms' },
  { id: 'sin', name: 'Singapore (SIN)', ping: '4.8ms' },
  { id: 'fra', name: 'Frankfurt (FRA)', ping: '11.4ms' },
  { id: 'ord', name: 'Chicago (ORD)', ping: '14.2ms' },
  { id: 'hnd', name: 'Tokyo (HND)', ping: '8.6ms' },
];

export function WorkersPlayground() {
  const [selectedTemplate, setSelectedTemplate] = useState('api');
  const [code, setCode] = useState(TEMPLATES.api.code);
  const [selectedPoP, setSelectedPoP] = useState(POPS[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [workerName, setWorkerName] = useState('my-edge-worker');

  const handleTemplateChange = (key: string) => {
    setSelectedTemplate(key);
    setCode(TEMPLATES[key].code);
    setOutput(null);
  };

  const handleRun = () => {
    setIsRunning(true);
    setOutput(null);
    setTimeout(() => {
      setIsRunning(false);
      setOutput({
        status: 200,
        statusText: 'OK',
        durationMs: (Math.random() * 2 + 1.2).toFixed(1),
        memoryMb: (Math.random() * 4 + 11.5).toFixed(1),
        colo: selectedPoP.name,
        cpuTimeMs: (Math.random() * 0.8 + 0.3).toFixed(2),
        body: selectedTemplate === 'api' ? {
          status: 'success',
          message: 'Executed in V8 isolate at VaultHost edge',
          colo: selectedPoP.name,
          timestamp: new Date().toISOString(),
          edgeColdStart: '0ms (warm cache)',
          memoryUsed: '12.4 MB'
        } : selectedTemplate === 'auth' ? {
          authenticated: true,
          user: 'developer@company.com',
          role: 'admin',
          checkedAtEdge: true
        } : {
          status: 200,
          variantServed: 'Variant B (50% split)',
          cookieSet: 'vh_variant=b; Max-Age=86400',
          edgeProcessed: true
        },
        logs: [
          `[INFO] [${selectedPoP.id.toUpperCase()}] Worker execution started`,
          `[LOG] Incoming request to /api/v1 from client`,
          `[LOG] Memory footprint validated (<16MB isolate)`,
          `[INFO] Response dispatched in under 5ms`
        ]
      });
    }, 450);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="v4-panel rounded-3xl border border-hairline overflow-hidden shadow-2xl bg-ink">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-hairline bg-ink-surface/80">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal/10 text-signal border border-signal/20">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary-v4">Live Edge Worker Sandbox</h3>
            <p className="text-[11px] text-text-muted-v4">Test V8 isolate execution live across global Anycast PoPs</p>
          </div>
        </div>

        {/* Template Selectors */}
        <div className="flex flex-wrap items-center gap-1.5">
          {Object.entries(TEMPLATES).map(([key, t]) => (
            <button
              key={key}
              onClick={() => handleTemplateChange(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedTemplate === key
                  ? 'bg-signal/15 text-signal border border-signal/40'
                  : 'bg-ink-surface-2 text-text-secondary-v4 hover:text-text-primary-v4 border border-hairline'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* PoP Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-text-muted-v4 flex items-center gap-1">
            <Globe className="h-3 w-3 text-signal" /> PoP:
          </span>
          <select
            value={selectedPoP.id}
            onChange={(e) => setSelectedPoP(POPS.find(p => p.id === e.target.value) || POPS[0])}
            className="bg-ink-surface-2 border border-hairline text-text-primary-v4 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-signal/40"
          >
            {POPS.map((pop) => (
              <option key={pop.id} value={pop.id}>{pop.name} ({pop.ping})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Editor & Execution Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-hairline">
        {/* Code Editor */}
        <div className="flex flex-col h-full bg-ink p-4">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-hairline/60 text-xs text-text-muted-v4">
            <span className="font-mono text-signal">worker.ts</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] hover:text-text-primary-v4 transition-colors px-2 py-1 rounded bg-ink-surface-2 border border-hairline"
              >
                {copied ? <Check className="h-3 w-3 text-good" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={() => setCode(TEMPLATES[selectedTemplate].code)}
                title="Reset Code"
                className="p-1 rounded hover:text-text-primary-v4 transition-colors text-text-muted-v4"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            rows={15}
            className="w-full flex-1 bg-transparent font-mono text-xs text-green-400 outline-none resize-none leading-relaxed terminal-scrollbar p-2"
          />
          <div className="pt-3 border-t border-hairline flex items-center justify-between">
            <span className="text-[11px] text-text-muted-v4 flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-signal" /> V8 Isolated Environment
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRun}
                disabled={isRunning}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-btn v4-btn-primary text-xs font-semibold shadow-glow disabled:opacity-50"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                {isRunning ? 'Executing at Edge...' : 'Execute at Edge'}
              </button>
              <button
                onClick={() => setShowDeployModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-btn v4-btn-secondary text-xs font-medium"
              >
                Deploy Worker <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Live Execution Output */}
        <div className="flex flex-col h-full bg-ink-surface p-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-hairline/60 text-xs text-text-muted-v4">
            <span className="flex items-center gap-1.5 text-text-primary-v4 font-semibold">
              <Terminal className="h-3.5 w-3.5 text-signal" /> Edge Telemetry & Response
            </span>
            {output && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-good/15 text-good border border-good/30">
                HTTP {output.status} {output.statusText}
              </span>
            )}
          </div>

          {isRunning ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-text-muted-v4 gap-3">
              <div className="w-6 h-6 border-2 border-signal border-t-transparent rounded-full animate-spin" />
              <p className="text-xs">Routing to {selectedPoP.name} Anycast node...</p>
            </div>
          ) : output ? (
            <div className="flex-1 space-y-4 overflow-y-auto terminal-scrollbar pr-1">
              {/* Performance Metrics Badge Bar */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-ink-surface-2 border border-hairline text-center">
                  <span className="text-[10px] text-text-muted-v4 block">Latency</span>
                  <span className="text-sm font-bold text-signal">{output.durationMs}ms</span>
                </div>
                <div className="p-2.5 rounded-xl bg-ink-surface-2 border border-hairline text-center">
                  <span className="text-[10px] text-text-muted-v4 block">CPU Time</span>
                  <span className="text-sm font-bold text-good">{output.cpuTimeMs}ms</span>
                </div>
                <div className="p-2.5 rounded-xl bg-ink-surface-2 border border-hairline text-center">
                  <span className="text-[10px] text-text-muted-v4 block">RAM Used</span>
                  <span className="text-sm font-bold text-text-primary-v4">{output.memoryMb}MB</span>
                </div>
              </div>

              {/* JSON Response Body */}
              <div>
                <p className="text-[11px] text-text-muted-v4 mb-1">Response Payload:</p>
                <div className="rounded-xl border border-hairline bg-ink p-3 text-green-400 overflow-x-auto terminal-scrollbar">
                  <pre>{JSON.stringify(output.body, null, 2)}</pre>
                </div>
              </div>

              {/* Live Execution Logs */}
              <div>
                <p className="text-[11px] text-text-muted-v4 mb-1">Execution Stream Logs:</p>
                <div className="rounded-xl border border-hairline bg-ink/70 p-3 text-[11px] text-text-secondary-v4 space-y-1">
                  {output.logs.map((log: string, idx: number) => (
                    <div key={idx} className="leading-relaxed">
                      <span className="text-signal">&gt;</span> {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-text-muted-v4 gap-2">
              <Terminal className="h-8 w-8 text-signal/30 mb-1" />
              <p className="text-xs text-text-secondary-v4 font-medium">Sandbox Ready</p>
              <p className="text-[11px] max-w-xs">Click &ldquo;Execute at Edge&rdquo; to simulate live execution at the {selectedPoP.name} node.</p>
            </div>
          )}
        </div>
      </div>

      {/* Deploy Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="v4-panel max-w-md w-full p-6 rounded-3xl border border-signal/40 bg-ink-surface shadow-2xl relative">
            <h4 className="text-lg font-bold text-text-primary-v4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-signal" /> Deploy Worker to VaultHost
            </h4>
            <p className="text-xs text-text-secondary-v4 mt-1.5 leading-relaxed">
              Deploy this worker code directly to your global VaultHost account with automated Anycast distribution.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-text-primary-v4 block mb-1">Worker Name</label>
                <input
                  type="text"
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  className="w-full bg-ink-surface-2 border border-hairline rounded-xl px-3 py-2 text-xs text-text-primary-v4 outline-none focus:border-signal"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary-v4 block mb-1">Deploy via CLI</label>
                <div className="bg-ink p-2.5 rounded-xl border border-hairline font-mono text-[11px] text-green-400 flex items-center justify-between">
                  <span>npx vaulthost deploy {workerName}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`npx vaulthost deploy ${workerName}`);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="text-signal hover:underline text-[10px]"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowDeployModal(false)}
                className="px-4 py-2 rounded-btn text-xs text-text-muted-v4 hover:text-text-primary-v4"
              >
                Close
              </button>
              <a
                href="/portal/cloud/workers"
                className="px-5 py-2 rounded-btn v4-btn-primary text-xs font-semibold"
              >
                Open in Portal Console &rarr;
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
