'use client';

import { useState } from 'react';
import { Sparkles, Zap, Brain, Check, RefreshCw, Layers, ArrowRight, ShieldCheck, DollarSign } from 'lucide-react';

const MODELS = [
  { id: 'gpt-4o', name: 'OpenAI GPT-4o', provider: 'OpenAI', latencyBase: 620, costPerK: 0.005 },
  { id: 'claude-3-5', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', latencyBase: 580, costPerK: 0.003 },
  { id: 'gemini-1-5', name: 'Gemini 1.5 Pro', provider: 'Google', latencyBase: 510, costPerK: 0.0025 },
  { id: 'llama-3-1', name: 'Llama 3.1 70B', provider: 'Groq (Ultra-fast)', latencyBase: 120, costPerK: 0.0007 },
  { id: 'mistral-large', name: 'Mistral Large 2', provider: 'Mistral AI', latencyBase: 490, costPerK: 0.002 },
];

const PRESETS = [
  'Generate an edge middleware auth rule in TypeScript',
  'Summarize the differences between AWS S3 and VaultR2 egress pricing',
  'Write a Python function to compute cosine similarity for vector embeddings',
];

export function AIGatewayTester() {
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [prompt, setPrompt] = useState(PRESETS[0]);
  const [semanticCache, setSemanticCache] = useState(true);
  const [hasRunOnce, setHasRunOnce] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [requestCount, setRequestCount] = useState(0);

  const handleTest = () => {
    setIsLoading(true);
    setResult(null);

    // If semantic cache is enabled and requestCount > 0, simulate Cache HIT
    const isCacheHit = semanticCache && hasRunOnce;

    setTimeout(() => {
      setIsLoading(false);
      setHasRunOnce(true);
      setRequestCount(prev => prev + 1);

      if (isCacheHit) {
        setResult({
          cacheStatus: 'HIT (Semantic Match 99.4%)',
          latencyMs: (Math.random() * 1.5 + 1.2).toFixed(1),
          cost: '$0.0000',
          savings: '100% saved via VaultAI Cache',
          tokens: 184,
          provider: selectedModel.provider,
          model: selectedModel.name,
          response: `[VaultAI Gateway Cache HIT: Stored in edge KV near your location in 1.4ms]\n\n\`\`\`typescript\n// Authenticate requests at the edge in <2ms\nexport async function verifyToken(req: Request) {\n  const token = req.headers.get("Authorization");\n  return token && token.startsWith("Bearer vh_");\n}\n\`\`\``
        });
      } else {
        setResult({
          cacheStatus: 'MISS (Origin Model Query)',
          latencyMs: (selectedModel.latencyBase + (Math.random() * 40 - 20)).toFixed(0),
          cost: `$${(selectedModel.costPerK * 0.25).toFixed(4)}`,
          savings: 'Cached for future queries',
          tokens: 184,
          provider: selectedModel.provider,
          model: selectedModel.name,
          response: `\`\`\`typescript\n// Generated via ${selectedModel.name} through VaultAI Gateway\nexport async function verifyToken(req: Request) {\n  const token = req.headers.get("Authorization");\n  if (!token) return false;\n  // Validated via Anycast Edge isolate\n  return token.startsWith("Bearer vh_");\n}\n\`\`\``
        });
      }
    }, isCacheHit ? 180 : 800);
  };

  return (
    <div className="v4-panel rounded-3xl border border-hairline overflow-hidden shadow-2xl bg-ink">
      {/* Header */}
      <div className="p-5 border-b border-hairline bg-ink-surface/90 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-signal/10 text-signal border border-signal/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary-v4">VaultAI Gateway Simulator</h3>
            <p className="text-xs text-text-muted-v4">Test universal routing, failover, and sub-2ms semantic caching live</p>
          </div>
        </div>

        {/* Semantic Cache Toggle */}
        <div className="flex items-center gap-2 bg-ink-surface-2 px-3 py-1.5 rounded-full border border-hairline">
          <span className="text-xs text-text-secondary-v4 font-medium flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-signal" /> Semantic Cache:
          </span>
          <button
            onClick={() => setSemanticCache(!semanticCache)}
            className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
              semanticCache ? 'bg-signal justify-end' : 'bg-muted justify-start'
            }`}
          >
            <div className={`w-4 h-4 rounded-full shadow-md transition-all ${semanticCache ? 'bg-ink' : 'bg-white'}`} />
          </button>
          <span className={`text-[11px] font-mono ${semanticCache ? 'text-signal font-semibold' : 'text-text-muted-v4'}`}>
            {semanticCache ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-hairline">
        {/* Left Config Column */}
        <div className="lg:col-span-5 p-5 space-y-4 bg-ink">
          {/* Model Selector */}
          <div>
            <label className="text-xs font-semibold text-text-primary-v4 block mb-2">Target AI Model</label>
            <div className="space-y-1.5">
              {MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setSelectedModel(m); setHasRunOnce(false); setResult(null); }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    selectedModel.id === m.id
                      ? 'bg-signal/10 border-signal/40 text-signal'
                      : 'bg-ink-surface-2 border-hairline text-text-secondary-v4 hover:text-text-primary-v4'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Brain className="h-3.5 w-3.5" />
                    {m.name}
                  </span>
                  <span className="text-[10px] text-text-muted-v4 font-mono">{m.provider}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Presets */}
          <div>
            <label className="text-xs font-semibold text-text-primary-v4 block mb-1.5">Sample Query</label>
            <div className="space-y-1 mb-2">
              {PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => { setPrompt(p); setHasRunOnce(false); setResult(null); }}
                  className="w-full text-left text-[11px] p-2 rounded-lg bg-ink-surface border border-hairline/60 text-text-secondary-v4 hover:text-signal truncate hover:border-signal/30 transition-colors"
                >
                  &quot;{p}&quot;
                </button>
              ))}
            </div>
            <textarea
              value={prompt}
              onChange={(e) => { setPrompt(e.target.value); setHasRunOnce(false); setResult(null); }}
              rows={3}
              className="w-full bg-ink-surface-2 border border-hairline rounded-xl p-2.5 text-xs text-text-primary-v4 outline-none focus:border-signal"
            />
          </div>

          <button
            onClick={handleTest}
            disabled={isLoading}
            className="w-full py-2.5 rounded-btn v4-btn-primary text-xs font-semibold flex items-center justify-center gap-2 shadow-glow disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {isLoading ? 'Routing via AI Gateway...' : hasRunOnce && semanticCache ? 'Re-run (Test Semantic Cache)' : 'Route via VaultAI Gateway'}
          </button>
        </div>

        {/* Right Output Column */}
        <div className="lg:col-span-7 p-5 bg-ink-surface flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-hairline mb-4">
              <span className="text-xs font-semibold text-text-primary-v4 flex items-center gap-2">
                <Zap className="h-4 w-4 text-signal" /> Gateway Telemetry
              </span>
              <span className="text-[11px] text-text-muted-v4 font-mono">
                Requests: {requestCount}
              </span>
            </div>

            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-text-muted-v4 gap-3">
                <div className="w-6 h-6 border-2 border-signal border-t-transparent rounded-full animate-spin" />
                <p className="text-xs">Evaluating semantic cache & routing to {selectedModel.name}...</p>
              </div>
            ) : result ? (
              <div className="space-y-4">
                {/* Metric Summary */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className={`p-3 rounded-2xl border text-center ${
                    result.cacheStatus.includes('HIT')
                      ? 'bg-good/10 border-good/30 text-good'
                      : 'bg-ink-surface-2 border-hairline text-signal'
                  }`}>
                    <span className="text-[10px] text-text-muted-v4 block">Cache Status</span>
                    <span className="text-xs font-bold">{result.cacheStatus.includes('HIT') ? 'CACHE HIT' : 'ORIGIN MISS'}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-ink-surface-2 border border-hairline text-center">
                    <span className="text-[10px] text-text-muted-v4 block">Latency</span>
                    <span className={`text-base font-bold ${result.cacheStatus.includes('HIT') ? 'text-good' : 'text-signal'}`}>
                      {result.latencyMs}ms
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-ink-surface-2 border border-hairline text-center">
                    <span className="text-[10px] text-text-muted-v4 block">Inference Cost</span>
                    <span className={`text-base font-bold ${result.cacheStatus.includes('HIT') ? 'text-good' : 'text-text-primary-v4'}`}>
                      {result.cost}
                    </span>
                  </div>
                </div>

                {/* Savings Callout */}
                {result.cacheStatus.includes('HIT') && (
                  <div className="p-3 rounded-xl bg-good/10 border border-good/20 flex items-center justify-between text-xs text-good font-semibold">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4" /> 100% Cost & Latency Reduction via Semantic Match
                    </span>
                    <span className="font-mono">Saved {selectedModel.costPerK * 0.25} USD</span>
                  </div>
                )}

                {/* Response View */}
                <div>
                  <label className="text-[11px] text-text-muted-v4 block mb-1">Synthesized Response:</label>
                  <pre className="p-3 rounded-xl bg-ink border border-hairline text-xs font-mono text-green-400 overflow-x-auto leading-relaxed">
                    {result.response}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-text-muted-v4">
                <Brain className="h-10 w-10 text-signal/30 mx-auto mb-2" />
                <p className="text-xs text-text-secondary-v4 font-medium">Ready to Simulate</p>
                <p className="text-[11px] max-w-sm mx-auto mt-1">
                  Click &ldquo;Route via VaultAI Gateway&rdquo; to execute. Then click it again to see sub-2ms semantic cache retrieval!
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-hairline flex items-center justify-between text-xs">
            <span className="text-text-muted-v4">Universal Endpoint: <code className="text-signal">https://ai.vaulthost.cloud/v1</code></span>
            <a href="/portal/cloud/ai" className="text-signal hover:underline flex items-center gap-1">
              Open AI Gateway Console <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
