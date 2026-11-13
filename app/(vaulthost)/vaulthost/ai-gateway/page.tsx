'use client';

import Link from 'next/link';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { 
  Zap, Activity, LayoutGrid, Clock, ShieldCheck, 
  BarChart4, FileJson, GitBranch, TerminalSquare, 
  CheckCircle, ArrowRight, Check
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
      <section className="v4-section border-t border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="v4-display text-text-primary-v4 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-text-secondary-v4">Higher than GoDaddy. Way below AWS.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Free tier */}
            <div className="v4-panel rounded-2xl p-6 border border-hairline flex flex-col justify-between">
              <div>
                <div className="text-text-muted-v4 text-sm font-medium mb-2">FREE</div>
                <div className="text-3xl font-bold text-text-primary-v4 mb-1">₹0 <span className="text-sm font-normal text-text-muted-v4">/mo</span></div>
                <p className="text-text-secondary-v4 text-sm mb-6">Unified AI API gateway for hobbyists and developers.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 10K requests / month</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 1 Connected AI provider</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Basic request logging &amp; analytics</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Standard latency monitoring</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Community support</li>
                </ul>
              </div>
              <Link href="/vaulthost/signup" className="v4-btn-secondary rounded-btn w-full text-center block py-2.5">Start Free</Link>
            </div>
            {/* Pro tier — highlighted */}
            <div className="v4-panel rounded-2xl p-6 border-2 border-signal relative flex flex-col justify-between">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-signal text-ink text-xs font-semibold px-3 py-1 rounded-full">MOST POPULAR</div>
              <div>
                <div className="text-signal text-sm font-medium mb-2">PRO</div>
                <div className="text-3xl font-bold text-text-primary-v4 mb-1">₹999 <span className="text-sm font-normal text-text-muted-v4">/mo</span></div>
                <p className="text-text-secondary-v4 text-sm mb-6">Intelligent caching and fallback routing for AI apps.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 1M requests / month</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Unlimited AI providers</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Semantic caching (save 40-60% tokens)</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Custom rate limits &amp; budget alerts</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Automated fallback &amp; model routing</li>
                </ul>
              </div>
              <Link href="/vaulthost/checkout?plan=ai-gateway-pro" className="v4-btn-primary rounded-btn w-full text-center block py-2.5">Get Started</Link>
            </div>
            {/* Business tier */}
            <div className="v4-panel rounded-2xl p-6 border border-hairline flex flex-col justify-between">
              <div>
                <div className="text-text-muted-v4 text-sm font-medium mb-2">BUSINESS</div>
                <div className="text-3xl font-bold text-text-primary-v4 mb-1">₹3,999 <span className="text-sm font-normal text-text-muted-v4">/mo</span></div>
                <p className="text-text-secondary-v4 text-sm mb-6">Enterprise AI proxy fleet with dedicated throughput.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 10M requests / month</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Unlimited AI providers</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Dedicated low-latency proxy instances</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Enterprise RBAC &amp; audit logging</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 99.99% uptime SLA &amp; dedicated support</li>
                </ul>
              </div>
              <Link href="/vaulthost/checkout?plan=ai-gateway-business" className="v4-btn-primary rounded-btn w-full text-center block py-2.5">Get Started</Link>
            </div>
          </div>
          {/* Competitor comparison */}
          <div className="border border-hairline rounded-2xl overflow-hidden mb-12">
            <table className="w-full text-sm">
              <thead className="bg-ink-surface-2 text-text-secondary-v4">
                <tr>
                  <th className="py-3 px-4 text-left font-medium">Provider</th>
                  <th className="py-3 px-4 text-left font-medium">Pricing</th>
                  <th className="py-3 px-4 text-left font-medium">Comparison / Advantage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                <tr className="bg-signal/5">
                  <td className="py-3 px-4 font-semibold text-signal">VaultHost AI Gateway</td>
                  <td className="py-3 px-4 font-medium text-text-primary-v4">₹0 Free / ₹999 Pro / ₹3,999 Business</td>
                  <td className="py-3 px-4 text-text-secondary-v4">Semantic caching, 15+ models, drop-in OpenAI SDK URL switch, zero regional egress</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-text-primary-v4">Portkey</td>
                  <td className="py-3 px-4 text-text-secondary-v4">₹8,200/mo ($99)</td>
                  <td className="py-3 px-4 text-text-secondary-v4">High entry cost for startups and indie developers</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-text-primary-v4">Helicone</td>
                  <td className="py-3 px-4 text-text-secondary-v4">₹4,150/mo ($50)</td>
                  <td className="py-3 px-4 text-text-secondary-v4">Lower request limit before aggressive usage overages</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-text-primary-v4">AWS Bedrock Gateway</td>
                  <td className="py-3 px-4 text-text-secondary-v4">Custom enterprise quote</td>
                  <td className="py-3 px-4 text-text-secondary-v4">Requires complex IAM setup and vendor lock-in to AWS services</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
