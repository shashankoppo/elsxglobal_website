'use client';

import { useState, useEffect } from 'react';
import {
  Bot, Plus, Trash2, RefreshCw, Settings, BarChart3, Shield, Copy, Check,
  Zap, AlertTriangle, TrendingUp, DollarSign, Key, Play, Sparkles,
  CheckCircle2, Loader2, ArrowRight
} from 'lucide-react';
import { PanelCard } from '@/components/ui/panel-card';
import Link from 'next/link';

export default function AIGatewayPortalPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'playground' | 'providers' | 'routes' | 'cache' | 'analytics'>('overview');
  const [apiKey] = useState('vh_live_9f83a8b27c1094ea');
  const [copiedKey, setCopiedKey] = useState(false);
  const [testPrompt, setTestPrompt] = useState('Calculate total GST (18%) and server amortized cost for 5x Bare Metal EPYC r5 instances');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [cacheThreshold, setCacheThreshold] = useState(0.95);
  const [cachePurged, setCachePurged] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleTest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!testPrompt.trim()) return;
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/cloud/ai-gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_prompt',
          prompt: testPrompt,
          model: selectedModel,
        }),
      });
      const data = await res.json();
      setTestResult(data);
      if (data.cached) {
        showToast('success', 'Semantic Cache Hit! 0ms Origin wait & 100% cost reduction.');
      } else {
        showToast('success', `Completed in ${data.latencyMs}ms via ${data.provider}`);
      }
    } catch {
      showToast('error', 'Gateway test failed');
    } finally {
      setTesting(false);
    }
  };

  const handlePurgeCache = async () => {
    try {
      const res = await fetch('/api/cloud/ai-gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'purge_cache' }),
      });
      const data = await res.json();
      if (data.success) {
        setCachePurged(true);
        showToast('success', 'Global AI cache purged');
        setTimeout(() => setCachePurged(false), 3000);
      }
    } catch {
      showToast('error', 'Purge cache failed');
    }
  };

  return (
    <div className="v4-page space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl border text-xs font-semibold shadow-2xl flex items-center gap-2 ${
          toastMsg.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {toastMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {toastMsg.text}
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-signal font-mono">VaultHost Cloud</span>
            <span className="text-text-muted-v4 text-xs">/</span>
            <span className="text-xs text-text-primary-v4 font-medium">VaultAI Gateway</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary-v4 mt-1 flex items-center gap-2.5">
            <Bot className="h-6 w-6 text-signal" /> Universal AI Gateway
          </h1>
          <p className="text-xs text-text-secondary-v4 mt-0.5">
            Proxy, cache, rate-limit, and audit every LLM call across 15+ providers with semantic deduplication.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('playground')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-btn v4-btn-primary text-xs font-semibold shadow-glow"
        >
          <Play className="h-3.5 w-3.5" /> Open AI Sandbox
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-hairline overflow-x-auto pb-px">
        {(['overview', 'playground', 'providers', 'routes', 'cache', 'analytics'] as const).map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap capitalize ${
              activeTab === tab ? 'border-signal text-signal' : 'border-transparent text-text-muted-v4 hover:text-text-primary-v4'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-ink-surface border border-hairline font-mono text-xs space-y-2">
                <span className="text-text-muted-v4 text-[11px] block">Universal API Base URL</span>
                <div className="flex items-center justify-between bg-ink-surface-2 p-2 rounded-xl border border-hairline">
                  <code className="text-signal truncate">https://ai.vaulthost.cloud/v1</code>
                  <button
                    onClick={() => handleCopy('https://ai.vaulthost.cloud/v1')}
                    className="text-text-muted-v4 hover:text-text-primary-v4 text-xs ml-2"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-ink-surface border border-hairline font-mono text-xs space-y-2">
                <span className="text-text-muted-v4 text-[11px] block">Gateway Master Token</span>
                <div className="flex items-center justify-between bg-ink-surface-2 p-2 rounded-xl border border-hairline">
                  <code className="text-green-400 truncate">vh_live_9f83••••••••••••••••</code>
                  <button
                    onClick={() => handleCopy(apiKey)}
                    className="text-signal hover:underline text-xs ml-2 font-medium flex items-center gap-1"
                  >
                    {copiedKey ? <><Check className="h-3 w-3" /> Copied</> : 'Copy Key'}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <PanelCard className="p-4">
                <span className="text-xs text-text-muted-v4">Requests Today</span>
                <p className="text-2xl font-bold font-mono text-text-primary-v4 mt-1">4.82M</p>
                <span className="text-[11px] text-green-400 font-mono">+12% vs yesterday</span>
              </PanelCard>
              <PanelCard className="p-4">
                <span className="text-xs text-text-muted-v4">Cache Hit Rate</span>
                <p className="text-2xl font-bold font-mono text-signal mt-1">48.2%</p>
                <span className="text-[11px] text-text-muted-v4 font-mono">Semantic &amp; Exact</span>
              </PanelCard>
              <PanelCard className="p-4">
                <span className="text-xs text-text-muted-v4">Cost Saved</span>
                <p className="text-2xl font-bold font-mono text-green-400 mt-1">$482.10</p>
                <span className="text-[11px] text-text-muted-v4 font-mono">Today via Caching</span>
              </PanelCard>
              <PanelCard className="p-4">
                <span className="text-xs text-text-muted-v4">Active Routes</span>
                <p className="text-2xl font-bold font-mono text-text-primary-v4 mt-1">6</p>
                <span className="text-[11px] text-signal font-mono">Across 5 Providers</span>
              </PanelCard>
            </div>

            <div className="p-6 rounded-2xl bg-ink-surface border border-hairline">
              <h3 className="text-sm font-bold text-text-primary-v4 mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-signal" /> Quick Integration
              </h3>
              <p className="text-xs text-text-secondary-v4 mb-4">
                VaultAI Gateway is fully OpenAI-compatible. Just drop in your gateway URL and master key.
              </p>
              <div className="bg-ink-surface-2 p-4 rounded-xl border border-hairline font-mono text-xs overflow-x-auto relative">
                <button
                  onClick={() => handleCopy(`import OpenAI from 'openai';\nconst ai = new OpenAI({ \n  baseURL: 'https://ai.vaulthost.cloud/v1/openai', \n  apiKey: 'vh_live_9f83a8b27c1094ea' \n});`)}
                  className="absolute top-3 right-3 text-text-muted-v4 hover:text-text-primary-v4"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <pre className="text-text-primary-v4">
                  <span className="text-purple-400">import</span> OpenAI <span className="text-purple-400">from</span> <span className="text-green-400">&apos;openai&apos;</span>;<br/><br/>
                  <span className="text-purple-400">const</span> ai = <span className="text-purple-400">new</span> OpenAI(&#123;<br/>
                  {'  '}baseURL: <span className="text-green-400">&apos;https://ai.vaulthost.cloud/v1/openai&apos;</span>,<br/>
                  {'  '}apiKey: <span className="text-green-400">&apos;vh_live_9f83a8b27c1094ea&apos;</span><br/>
                  &#125;);
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Playground Tab */}
        {activeTab === 'playground' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-4">
              <div className="v4-panel p-5 rounded-2xl border border-hairline bg-ink-surface space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-text-primary-v4 flex items-center gap-2">
                    <Play className="w-4 h-4 text-signal" /> Live Test Prompt Runner
                  </h3>
                  <select
                    value={selectedModel}
                    onChange={e => setSelectedModel(e.target.value)}
                    className="bg-ink border border-hairline rounded-lg px-2.5 py-1 text-xs text-text-primary-v4 outline-none focus:border-signal font-mono"
                  >
                    <option value="gpt-4o">OpenAI / gpt-4o</option>
                    <option value="claude-3-5-sonnet">Anthropic / claude-3-5-sonnet</option>
                    <option value="gemini-2.0-flash">Google / gemini-2.0-flash</option>
                    <option value="llama-3.3-70b">Groq / llama-3.3-70b</option>
                  </select>
                </div>

                <form onSubmit={handleTest} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-mono text-text-muted-v4 block mb-1">PROMPT</label>
                    <textarea
                      rows={5}
                      value={testPrompt}
                      onChange={e => setTestPrompt(e.target.value)}
                      placeholder="Ask anything or simulate high-token query..."
                      className="w-full bg-ink border border-hairline rounded-xl p-3 text-xs text-text-primary-v4 outline-none focus:border-signal font-mono leading-relaxed resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-text-muted-v4">
                      Semantic cache threshold: <strong className="text-signal font-mono">{cacheThreshold}</strong>
                    </span>
                    <button
                      type="submit"
                      disabled={testing}
                      className="px-5 py-2 rounded-btn v4-btn-primary text-xs font-semibold shadow-glow flex items-center gap-2 disabled:opacity-50"
                    >
                      {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                      Send Through Gateway
                    </button>
                  </div>
                </form>
              </div>

              <div className="v4-panel p-4 rounded-xl border border-hairline bg-ink-surface text-xs text-text-secondary-v4 space-y-1">
                <span className="text-text-primary-v4 font-bold block mb-1">Testing Tip:</span>
                <p>Send the prompt once to populate edge cache (notice ~120ms latency). Then send the prompt again — or slight variations of it — to see the <strong className="text-signal">Semantic Cache trigger in 1.8ms</strong> with 100% cost reduction!</p>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="v4-panel p-5 rounded-2xl border border-hairline bg-ink-surface space-y-4 min-h-[380px] flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-hairline">
                  <h3 className="text-xs font-bold text-text-primary-v4 font-mono">GATEWAY EXECUTION TELEMETRY</h3>
                  {testResult && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      testResult.cached ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-signal/10 text-signal border border-signal/20'
                    }`}>
                      {testResult.cached ? 'SEMANTIC CACHE HIT' : 'ORIGIN DISPATCH'}
                    </span>
                  )}
                </div>

                {testing ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-2 text-text-muted-v4">
                    <Loader2 className="w-6 h-6 text-signal animate-spin" />
                    <span className="text-xs font-mono">Routing through Anycast Gateway...</span>
                  </div>
                ) : testResult ? (
                  <div className="flex-1 space-y-4 flex flex-col justify-between">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                      <div className="bg-ink p-2.5 rounded-xl border border-hairline">
                        <span className="text-[10px] text-text-muted-v4 block">Latency</span>
                        <span className="text-signal font-bold">{testResult.latencyMs}ms</span>
                      </div>
                      <div className="bg-ink p-2.5 rounded-xl border border-hairline">
                        <span className="text-[10px] text-text-muted-v4 block">Tokens Used</span>
                        <span className="text-text-primary-v4 font-bold">{testResult.tokensUsed}</span>
                      </div>
                      <div className="bg-ink p-2.5 rounded-xl border border-hairline">
                        <span className="text-[10px] text-text-muted-v4 block">Cost</span>
                        <span className="text-green-400 font-bold">${testResult.costUsd}</span>
                      </div>
                    </div>

                    <div className="bg-ink p-4 rounded-xl border border-hairline flex-1 overflow-y-auto font-mono text-xs text-text-primary-v4 whitespace-pre-wrap leading-relaxed">
                      {testResult.response}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-text-muted-v4 space-y-2">
                    <Bot className="w-8 h-8 opacity-40 text-signal" />
                    <span className="text-xs">Run a prompt on the left to see live token telemetry.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'providers' && (
          <div className="space-y-4">
            <div className="overflow-x-auto terminal-scrollbar bg-ink-surface rounded-2xl border border-hairline">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-hairline bg-ink-surface-2 text-text-muted-v4 font-mono text-[11px]">
                    <th className="py-3 px-4">Provider</th>
                    <th className="py-3 px-4">Model</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Req Today</th>
                    <th className="py-3 px-4">Avg Latency</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {[
                    { p: 'OpenAI', m: 'gpt-4o', s: 'Active', r: '2.1M', l: '823ms' },
                    { p: 'Anthropic', m: 'claude-sonnet-4', s: 'Active', r: '1.8M', l: '1102ms' },
                    { p: 'Google', m: 'gemini-2.0-flash', s: 'Active', r: '680K', l: '445ms' },
                    { p: 'Groq', m: 'llama-3.3-70b', s: 'Active', r: '210K', l: '87ms' },
                    { p: 'Mistral', m: 'mistral-large', s: 'Active', r: '30K', l: '780ms' },
                    { p: 'Ollama (local)', m: 'qwen2.5:7b', s: 'Healthy', r: '0', l: 'N/A' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-ink-surface-2/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-text-primary-v4">{row.p}</td>
                      <td className="py-3 px-4 font-mono">{row.m}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded font-bold text-green-400 bg-green-400/10 border border-green-400/20 text-[10px]">
                          {row.s}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-text-secondary-v4">{row.r}</td>
                      <td className="py-3 px-4 text-text-secondary-v4">{row.l}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1.5 rounded hover:text-signal text-text-muted-v4 transition-colors"><Settings className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'routes' && (
          <div className="space-y-4">
            <div className="overflow-x-auto terminal-scrollbar bg-ink-surface rounded-2xl border border-hairline">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-hairline bg-ink-surface-2 text-text-muted-v4 font-mono text-[11px]">
                    <th className="py-3 px-4">Route Pattern</th>
                    <th className="py-3 px-4">Target Provider</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Fallback</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {[
                    { p: '/openai/*', t: 'OpenAI', pr: '1', f: 'Anthropic', s: 'Active' },
                    { p: '/fast/*', t: 'Groq', pr: '1', f: 'Ollama', s: 'Active' },
                    { p: '/embedding/*', t: 'OpenAI', pr: '1', f: 'HuggingFace', s: 'Active' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-ink-surface-2/60 transition-colors">
                      <td className="py-3 px-4 font-mono text-signal">{row.p}</td>
                      <td className="py-3 px-4 font-semibold text-text-primary-v4">{row.t}</td>
                      <td className="py-3 px-4 text-text-muted-v4 font-mono">{row.pr}</td>
                      <td className="py-3 px-4 text-text-secondary-v4">{row.f}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded font-bold text-green-400 bg-green-400/10 border border-green-400/20 text-[10px]">
                          {row.s}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'cache' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PanelCard className="p-4 bg-ink-surface-2 border-signal/30">
                <span className="text-xs text-text-muted-v4 flex items-center gap-2"><Sparkles className="h-3 w-3 text-signal" /> Semantic Hit Rate</span>
                <p className="text-2xl font-bold font-mono text-text-primary-v4 mt-1">48.2%</p>
              </PanelCard>
              <PanelCard className="p-4 bg-ink-surface-2">
                <span className="text-xs text-text-muted-v4">Cached Responses</span>
                <p className="text-2xl font-bold font-mono text-text-primary-v4 mt-1">{cachePurged ? '0' : '4.1M'}</p>
              </PanelCard>
              <PanelCard className="p-4 bg-ink-surface-2">
                <span className="text-xs text-text-muted-v4">Saved via Cache</span>
                <p className="text-2xl font-bold font-mono text-green-400 mt-1">{cachePurged ? '$0.00' : '$482.10'}</p>
              </PanelCard>
            </div>

            <div className="p-6 rounded-2xl bg-ink-surface border border-hairline">
              <h3 className="text-sm font-bold text-text-primary-v4 mb-4">Semantic Similarity Threshold</h3>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01"
                  value={cacheThreshold}
                  onChange={(e) => setCacheThreshold(Number(e.target.value))}
                  className="w-full accent-signal"
                />
                <span className="font-mono text-signal font-bold">{cacheThreshold}</span>
              </div>
              <p className="text-xs text-text-muted-v4 mt-2">
                Requests with cosine similarity above this threshold will be served from cache without origin round-trip.
              </p>
            </div>

            <button
              onClick={handlePurgeCache}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-btn bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-semibold hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="h-4 w-4" /> Clear All Cache
            </button>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-ink-surface border border-hairline">
              <h3 className="text-sm font-bold text-text-primary-v4 mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-signal" /> 7-Day Trend
              </h3>
              <div className="font-mono text-xs overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-text-muted-v4 border-b border-hairline">
                      <th className="py-2">Date</th>
                      <th className="py-2">Requests</th>
                      <th className="py-2">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { d: 'Sep 28', r: '4.82M', c: '$42.10' },
                      { d: 'Sep 27', r: '4.31M', c: '$38.50' },
                      { d: 'Sep 26', r: '4.10M', c: '$35.20' },
                      { d: 'Sep 25', r: '4.55M', c: '$40.10' },
                      { d: 'Sep 24', r: '3.90M', c: '$32.40' },
                      { d: 'Sep 23', r: '3.20M', c: '$28.10' },
                      { d: 'Sep 22', r: '3.10M', c: '$27.50' },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-hairline/50 hover:bg-ink-surface-2/30">
                        <td className="py-2 text-text-primary-v4">{row.d}</td>
                        <td className="py-2 text-signal">{row.r}</td>
                        <td className="py-2 text-green-400">{row.c}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
