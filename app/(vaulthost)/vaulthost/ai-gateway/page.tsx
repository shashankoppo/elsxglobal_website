'use client';

import Link from 'next/link';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { 
  Zap, Activity, LayoutGrid, Clock, ShieldCheck, 
  BarChart4, FileJson, GitBranch, TerminalSquare, 
  CheckCircle, ArrowRight
} from 'lucide-react';
import { AIGatewayTester } from '@/components/vaulthost/interactive/AIGatewayTester';

const providers = [
  "OpenAI", "Anthropic Claude", "Google Gemini", "Mistral", "Groq", 
  "Cohere", "AWS Bedrock", "Hugging Face", "Replicate", "Perplexity", 
  "Together AI", "Fireworks AI", "DeepSeek", "Ollama (self-hosted)", "xAI Grok"
];

const features = [
  {
    title: "Semantic Caching",
    description: "Cache AI responses by meaning, not exact match. Save 40-60% on API costs and reduce latency to <10ms for repeated semantic queries.",
    icon: <Zap className="w-5 h-5 text-signal" />
  },
  {
    title: "Universal Rate Limiting",
    description: "Enforce per-user, per-route, or global rate limits across all providers. Prevent abuse and keep your API bills predictable.",
    icon: <Clock className="w-5 h-5 text-signal" />
  },
  {
    title: "Automatic Failover",
    description: "If OpenAI goes down, route traffic to Anthropic Claude or Google Gemini automatically. Maintain 99.99% uptime for your AI features.",
    icon: <GitBranch className="w-5 h-5 text-signal" />
  },
  {
    title: "Cost Analytics",
    description: "Get granular per-provider, per-model, and per-user cost breakdowns in real-time. Know exactly where your AI budget is going.",
    icon: <BarChart4 className="w-5 h-5 text-signal" />
  },
  {
    title: "Request Logging",
    description: "Full request/response payload logs with token counts, latency, and cost per request. Perfect for debugging and compliance.",
    icon: <FileJson className="w-5 h-5 text-signal" />
  },
  {
    title: "Provider Fallback",
    description: "Define priority chains for models. Example: Try GPT-4 first, fallback to Claude 3 Opus, then fallback to local Llama 3.",
    icon: <ShieldCheck className="w-5 h-5 text-signal" />
  }
];

export default function AIGatewayPage() {
  return (
    <div className="v4-page">
      <PageHeroV4
        eyebrow="VaultAI Gateway"
        title={<>One API. Every <span className="text-signal">AI Provider.</span></>}
        description="Proxy, cache, rate-limit, and monitor all your AI API calls through a single unified gateway. Cut AI costs by up to 60% with semantic caching. Never hit a rate limit again."
      />

      {/* Stats Bar */}
      <section className="v4-section-sm border-b border-hairline bg-ink-surface-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-semibold text-text-primary-v4 mb-1">60%</div>
              <div className="text-sm text-text-muted-v4">Avg Cost Reduction</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-text-primary-v4 mb-1">&lt;2ms</div>
              <div className="text-sm text-text-muted-v4">Proxy Overhead</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-text-primary-v4 mb-1">15+</div>
              <div className="text-sm text-text-muted-v4">AI Providers</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-text-primary-v4 mb-1">Real-time</div>
              <div className="text-sm text-text-muted-v4">Cost Tracking</div>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Providers Grid */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="v4-display text-text-primary-v4 mb-4">Supported Providers</h2>
              <p className="text-text-secondary-v4 text-lg">Connect to the world's best models with a single unified format.</p>
            </div>
          </ScrollReveal>
          <div className="flex flex-wrap justify-center gap-3">
            {providers.map((provider, i) => (
              <ScrollReveal key={provider} delay={i * 0.05}>
                <div className="px-4 py-2 rounded-full border border-hairline bg-ink-surface text-text-secondary-v4 text-sm font-medium hover:text-signal hover:border-signal transition-colors cursor-default">
                  {provider}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Live Interactive Gateway Sandbox */}
      <section className="v4-section-sm bg-ink-surface border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-10">
              <span className="v4-readout text-[11px] font-semibold uppercase tracking-widest text-signal px-3 py-1 rounded-full border border-signal/30 bg-signal/5">
                Live Simulator
              </span>
              <h2 className="mt-3 text-3xl v4-display text-text-primary-v4">Test Multi-Model Routing &amp; Semantic Caching</h2>
              <p className="mt-2 text-text-secondary-v4 max-w-xl mx-auto text-sm">
                Route requests to OpenAI, Claude, Gemini, or Groq. Toggle semantic caching to watch latency collapse to sub-2ms.
              </p>
            </div>
          </ScrollReveal>
          <AIGatewayTester />
        </div>
      </section>

      {/* Features Grid */}
      <section className="v4-section bg-ink-surface-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="v4-display text-text-primary-v4 text-center mb-16">Everything you need to scale AI</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <ScrollReveal key={feature.title} delay={i * 0.1}>
                <PanelCard className="h-full bg-ink">
                  <div className="p-6">
                    <div className="w-10 h-10 rounded-lg bg-ink-surface-2 border border-hairline flex items-center justify-center mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary-v4 mb-3">{feature.title}</h3>
                    <p className="text-text-secondary-v4 leading-relaxed">{feature.description}</p>
                  </div>
                </PanelCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="v4-display text-text-primary-v4 text-center mb-16">How it works</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal delay={0.1}>
              <div className="text-center relative">
                <div className="w-12 h-12 mx-auto bg-ink-surface-2 border border-signal text-signal rounded-full flex items-center justify-center font-bold text-lg mb-6 z-10 relative">1</div>
                <h4 className="text-lg font-medium text-text-primary-v4 mb-2">Change your Base URL</h4>
                <p className="text-text-muted-v4 text-sm">Point your app to <code className="text-signal bg-ink-surface px-1 rounded">https://ai.vaulthost.cloud/v1</code> instead of the provider's URL.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="text-center relative">
                <div className="w-12 h-12 mx-auto bg-ink-surface-2 border border-signal text-signal rounded-full flex items-center justify-center font-bold text-lg mb-6 z-10 relative">2</div>
                <h4 className="text-lg font-medium text-text-primary-v4 mb-2">Add API Keys</h4>
                <p className="text-text-muted-v4 text-sm">Input your provider API keys securely into the VaultHost dashboard.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <div className="text-center relative">
                <div className="w-12 h-12 mx-auto bg-ink-surface-2 border border-signal text-signal rounded-full flex items-center justify-center font-bold text-lg mb-6 z-10 relative">3</div>
                <h4 className="text-lg font-medium text-text-primary-v4 mb-2">Instant Superpowers</h4>
                <p className="text-text-muted-v4 text-sm">All requests are now instantly cached, logged, and rate-limited automatically.</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Code Sample */}
      <section className="v4-section bg-ink-surface-2 border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="v4-display text-text-primary-v4 mb-6">Drop-in Replacement</h2>
                <p className="text-text-secondary-v4 text-lg mb-6">
                  VaultAI Gateway uses the standard OpenAI API format. You don't need to learn a new SDK or rewrite your application logic. Just change two lines of code.
                </p>
                <ul className="space-y-4 text-text-secondary-v4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-signal flex-shrink-0 mt-0.5" />
                    <span>Works with OpenAI SDKs (Node, Python, Go)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-signal flex-shrink-0 mt-0.5" />
                    <span>Compatible with LangChain & LlamaIndex</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-signal flex-shrink-0 mt-0.5" />
                    <span>Supports Streaming Responses natively</span>
                  </li>
                </ul>
              </div>
              <div className="bg-[#0D1117] border border-hairline rounded-xl p-6 overflow-x-auto shadow-2xl">
                <div className="flex gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                </div>
                <pre className="text-sm font-mono text-gray-300">
                  <code dangerouslySetInnerHTML={{ __html: `import OpenAI from "openai";\n\nconst openai = new OpenAI({\n  <span class="text-green-400">baseURL: "https://ai.vaulthost.cloud/v1/openai",</span>\n  <span class="text-green-400">apiKey: "vh_gw_your_vault_key",</span>\n});\n\nconst completion = await openai.chat.completions.create({\n  model: "gpt-4-turbo",\n  messages: [{ role: "user", content: "Hello Gateway!" }],\n});` }} />
                </pre>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Pricing */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="v4-display text-text-primary-v4 mb-4">Simple, transparent pricing</h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PanelCard className="p-8 bg-ink-surface-2 border-hairline flex flex-col">
              <h3 className="text-2xl font-semibold text-text-primary-v4 mb-2">Free</h3>
              <div className="text-text-muted-v4 mb-6">Great for side projects</div>
              <div className="text-4xl font-bold text-text-primary-v4 mb-8">₹0<span className="text-lg text-text-muted-v4 font-normal">/mo</span></div>
              <ul className="space-y-4 text-sm text-text-secondary-v4 mb-8 flex-1">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-signal" /> 10K requests / month</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-signal" /> 1 AI Provider</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-signal" /> Basic Request Logging</li>
              </ul>
              <Link href="/portal" className="v4-btn-secondary w-full justify-center">Get Started</Link>
            </PanelCard>
            
            <PanelCard className="p-8 bg-ink border-signal relative flex flex-col">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-signal text-ink px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Most Popular</div>
              <h3 className="text-2xl font-semibold text-text-primary-v4 mb-2">Pro</h3>
              <div className="text-text-muted-v4 mb-6">For production applications</div>
              <div className="text-4xl font-bold text-text-primary-v4 mb-8">₹999<span className="text-lg text-text-muted-v4 font-normal">/mo</span></div>
              <ul className="space-y-4 text-sm text-text-secondary-v4 mb-8 flex-1">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-signal" /> 500K requests / month</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-signal" /> Unlimited AI Providers</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-signal" /> Semantic Caching</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-signal" /> Custom Rate Limits</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-signal" /> Fallback & Routing Rules</li>
              </ul>
              <Link href="/portal" className="v4-btn-primary w-full justify-center">Upgrade to Pro</Link>
            </PanelCard>

            <PanelCard className="p-8 bg-ink-surface-2 border-hairline flex flex-col">
              <h3 className="text-2xl font-semibold text-text-primary-v4 mb-2">Enterprise</h3>
              <div className="text-text-muted-v4 mb-6">For massive scale</div>
              <div className="text-4xl font-bold text-text-primary-v4 mb-8">Custom</div>
              <ul className="space-y-4 text-sm text-text-secondary-v4 mb-8 flex-1">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-signal" /> Unlimited requests</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-signal" /> Dedicated Proxy Instances</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-signal" /> Custom SLA (99.99%)</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-signal" /> Enterprise SSO & RBAC</li>
              </ul>
              <Link href="/contact" className="v4-btn-secondary w-full justify-center">Contact Sales</Link>
            </PanelCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div 
              className="rounded-[2rem] p-12 md:p-20 text-center border border-hairline/50 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(10,18,36,0.98), rgba(6,12,24,1))' }}
            >
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-signal/10 via-transparent to-transparent pointer-events-none" />
              <h2 className="v4-display text-text-primary-v4 mb-6 relative z-10">Stop overpaying for AI APIs</h2>
              <p className="text-xl text-text-secondary-v4 mb-10 max-w-2xl mx-auto relative z-10">
                Join thousands of developers using VaultAI Gateway to scale their AI features with confidence, reliability, and cost-efficiency.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                <Link href="/portal" className="v4-btn-primary rounded-btn group">
                  Connect your first AI provider 
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/docs/ai-gateway" className="v4-btn-secondary rounded-btn">
                  Read the Docs
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
