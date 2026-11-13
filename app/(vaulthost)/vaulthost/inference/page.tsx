'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { 
  Zap, Cpu, Layers, Activity, 
  Workflow, Database, Image as ImageIcon, 
  MessageSquare, Settings, CheckCircle, ArrowRight, Check 
} from 'lucide-react';
import Link from 'next/link';

const modelCategories = [
  {
    category: "LLMs & Text Generation",
    icon: <MessageSquare className="w-5 h-5 text-signal" />,
    models: ["Llama 3 70B", "Llama 3 8B", "Mistral 7B", "Phi-3 Mini", "Gemma 7B", "Qwen2"]
  },
  {
    category: "Image Generation",
    icon: <ImageIcon className="w-5 h-5 text-signal" />,
    models: ["Stable Diffusion XL", "Flux 1.1", "DALL-E 3 (via gateway)"]
  },
  {
    category: "Speech & Audio",
    icon: <Activity className="w-5 h-5 text-signal" />,
    models: ["Whisper Large v3", "Distil-Whisper"]
  },
  {
    category: "Embeddings",
    icon: <Layers className="w-5 h-5 text-signal" />,
    models: ["BGE-M3", "E5-Large", "nomic-embed-text"]
  },
  {
    category: "Code & Logic",
    icon: <Settings className="w-5 h-5 text-signal" />,
    models: ["DeepSeek Coder", "StarCoder2", "CodeLlama"]
  }
];

const features = [
  {
    title: "Streaming Responses",
    description: "Built-in support for Server-Sent Events (SSE). Stream tokens directly to your users as they are generated for a lightning-fast UX.",
    icon: <Zap className="w-5 h-5 text-signal" />
  },
  {
    title: "Batch Inference",
    description: "Submit thousands of prompts via async jobs. Process large datasets offline at a fraction of the cost of real-time inference.",
    icon: <Layers className="w-5 h-5 text-signal" />
  },
  {
    title: "Fine-Tuning (LoRA)",
    description: "Bring your own custom LoRA adapters. Dynamically load fine-tuned weights at inference time without provisioning dedicated hardware.",
    icon: <Settings className="w-5 h-5 text-signal" />
  },
  {
    title: "Custom Models",
    description: "Upload your own GGUF or Safetensors files. We distribute your weights to our edge GPUs, making them available behind a scalable API.",
    icon: <Database className="w-5 h-5 text-signal" />
  }
];

export default function InferencePage() {
  return (
    <div className="v4-page">
      <PageHeroV4
        eyebrow="VaultAI Inference"
        title={<>Run Any AI Model. <span className="text-signal">Serverlessly.</span></>}
        description="Deploy LLMs, image generation, speech, and embedding models without managing GPU servers. Pay per token/inference. Available in every edge region."
      />

      {/* Stats Bar */}
      <section className="v4-section-sm border-b border-hairline bg-ink-surface-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-semibold text-text-primary-v4 mb-1">30ms</div>
              <div className="text-sm text-text-muted-v4">Avg Latency</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-text-primary-v4 mb-1">50+</div>
              <div className="text-sm text-text-muted-v4">Models Available</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-text-primary-v4 mb-1">H100/A100</div>
              <div className="text-sm text-text-muted-v4">GPU Accelerated</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-text-primary-v4 mb-1">Scale-to-0</div>
              <div className="text-sm text-text-muted-v4">Pay-per-token</div>
            </div>
          </div>
        </div>
      </section>

      {/* Model Catalog */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="v4-display text-text-primary-v4 mb-4">The Best Open Models, Instantly Available</h2>
              <p className="text-text-secondary-v4 text-lg">No infrastructure setup required. Just call the API.</p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modelCategories.map((cat, i) => (
              <ScrollReveal key={cat.category} delay={i * 0.1}>
                <PanelCard className="h-full bg-ink border-hairline p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-ink-surface-2 border border-hairline flex items-center justify-center">
                      {cat.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary-v4">{cat.category}</h3>
                  </div>
                  <ul className="space-y-3">
                    {cat.models.map((model) => (
                      <li key={model} className="flex items-center gap-2 text-text-secondary-v4 text-sm">
                        <CheckCircle className="w-4 h-4 text-signal/70" />
                        {model}
                      </li>
                    ))}
                  </ul>
                </PanelCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="v4-section bg-ink-surface-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="v4-display text-text-primary-v4 text-center mb-16">Platform Capabilities</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <ScrollReveal key={feature.title} delay={i * 0.1}>
                <PanelCard className="h-full bg-ink p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-ink-surface-2 border border-hairline flex items-center justify-center flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-text-primary-v4 mb-2">{feature.title}</h3>
                      <p className="text-text-secondary-v4 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </PanelCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Code Sample */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="v4-display text-text-primary-v4 mb-6">OpenAI-Compatible API</h2>
                <p className="text-text-secondary-v4 text-lg mb-6">
                  VaultInference natively supports the OpenAI Chat Completions API format. You can seamlessly swap OpenAI models for Open Source alternatives like Llama 3 or Mistral without changing your app logic.
                </p>
                <Link href="/docs/inference" className="v4-btn-secondary inline-flex">
                  View API Reference <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
              <div className="bg-[#0D1117] border border-hairline rounded-xl p-6 overflow-x-auto shadow-2xl">
                <div className="flex gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                </div>
                <pre className="text-sm font-mono text-gray-300">
                  <code dangerouslySetInnerHTML={{ __html: `const res = await fetch('https://ai.vaulthost.cloud/inference/llama-3-70b', {\n  method: 'POST',\n  headers: {\n    'Authorization': 'Bearer vh_...', \n    'Content-Type': 'application/json'\n  },\n  body: JSON.stringify({\n    messages: [\n      { role: "system", content: "You are a helpful assistant." },\n      { role: "user", content: "Write a python script..." }\n    ],\n    stream: true\n  })\n});` }} />
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
                <p className="text-text-secondary-v4 text-sm mb-6">Test top open-weight models with a daily free token allowance.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 100K tokens / day free</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Llama 3 8B &amp; Whisper v3 access</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> OpenAI-compatible endpoint</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Streaming responses</li>
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
                <p className="text-text-secondary-v4 text-sm mb-6">Production inference with 50M tokens included + pay-as-you-go.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 50M tokens included / month</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Llama 3 70B &amp; Mixtral access</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Rock bottom overage: ₹0.08/1M (8B)</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 50 concurrent streams</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Priority GPU queue</li>
                </ul>
              </div>
              <Link href="/vaulthost/checkout?plan=inference-pro" className="v4-btn-primary rounded-btn w-full text-center block py-2.5">Get Started</Link>
            </div>
            {/* Business tier */}
            <div className="v4-panel rounded-2xl p-6 border border-hairline flex flex-col justify-between">
              <div>
                <div className="text-text-muted-v4 text-sm font-medium mb-2">BUSINESS</div>
                <div className="text-3xl font-bold text-text-primary-v4 mb-1">₹3,999 <span className="text-sm font-normal text-text-muted-v4">/mo</span></div>
                <p className="text-text-secondary-v4 text-sm mb-6">Dedicated GPU clusters with guaranteed tokens/sec throughput.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 250M tokens included / month</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Unlimited concurrent streams</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Custom weights &amp; LoRA fine-tunes</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Sub-20ms TTFT in India</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 99.95% inference SLA guarantee</li>
                </ul>
              </div>
              <Link href="/vaulthost/checkout?plan=inference-business" className="v4-btn-primary rounded-btn w-full text-center block py-2.5">Get Started</Link>
            </div>
          </div>

          {/* Per-token table */}
          <div className="mb-12">
            <h3 className="text-xl font-medium text-text-primary-v4 text-center mb-6">Per-Token Model Rates</h3>
            <div className="max-w-4xl mx-auto overflow-hidden rounded-xl border border-hairline bg-ink">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-ink-surface border-b border-hairline">
                    <th className="py-3 px-5 font-medium text-text-secondary-v4 uppercase tracking-wider">Model</th>
                    <th className="py-3 px-5 font-medium text-text-secondary-v4 uppercase tracking-wider">Type</th>
                    <th className="py-3 px-5 font-medium text-text-secondary-v4 uppercase tracking-wider">VaultHost Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  <tr className="hover:bg-ink-surface/50 transition-colors">
                    <td className="py-3.5 px-5 text-text-primary-v4 font-medium">Llama 3 8B (Meta)</td>
                    <td className="py-3.5 px-5 text-text-muted-v4">Text / LLM</td>
                    <td className="py-3.5 px-5 text-signal font-semibold">₹0.08 <span className="text-text-muted-v4 font-normal">/ 1M tokens</span></td>
                  </tr>
                  <tr className="hover:bg-ink-surface/50 transition-colors">
                    <td className="py-3.5 px-5 text-text-primary-v4 font-medium">Llama 3 70B (Meta)</td>
                    <td className="py-3.5 px-5 text-text-muted-v4">Text / LLM</td>
                    <td className="py-3.5 px-5 text-signal font-semibold">₹0.60 <span className="text-text-muted-v4 font-normal">/ 1M tokens</span></td>
                  </tr>
                  <tr className="hover:bg-ink-surface/50 transition-colors">
                    <td className="py-3.5 px-5 text-text-primary-v4 font-medium">GPT-4o (Proxy via Gateway)</td>
                    <td className="py-3.5 px-5 text-text-muted-v4">Proprietary LLM</td>
                    <td className="py-3.5 px-5 text-text-primary-v4">₹8.00 <span className="text-text-muted-v4 font-normal">/ 1M tokens</span></td>
                  </tr>
                  <tr className="hover:bg-ink-surface/50 transition-colors">
                    <td className="py-3.5 px-5 text-text-primary-v4 font-medium">Mixtral 8x7B MoE</td>
                    <td className="py-3.5 px-5 text-text-muted-v4">Text / LLM</td>
                    <td className="py-3.5 px-5 text-text-primary-v4">₹0.24 <span className="text-text-muted-v4 font-normal">/ 1M tokens</span></td>
                  </tr>
                  <tr className="hover:bg-ink-surface/50 transition-colors">
                    <td className="py-3.5 px-5 text-text-primary-v4 font-medium">Stable Diffusion XL</td>
                    <td className="py-3.5 px-5 text-text-muted-v4">Image Gen</td>
                    <td className="py-3.5 px-5 text-text-primary-v4">₹0.80 <span className="text-text-muted-v4 font-normal">/ image</span></td>
                  </tr>
                  <tr className="hover:bg-ink-surface/50 transition-colors">
                    <td className="py-3.5 px-5 text-text-primary-v4 font-medium">Whisper Large v3</td>
                    <td className="py-3.5 px-5 text-text-muted-v4">Speech-to-Text</td>
                    <td className="py-3.5 px-5 text-text-primary-v4">₹0.005 <span className="text-text-muted-v4 font-normal">/ min audio</span></td>
                  </tr>
                  <tr className="hover:bg-ink-surface/50 transition-colors">
                    <td className="py-3.5 px-5 text-text-primary-v4 font-medium">nomic-embed-text</td>
                    <td className="py-3.5 px-5 text-text-muted-v4">Embeddings</td>
                    <td className="py-3.5 px-5 text-text-primary-v4">₹0.02 <span className="text-text-muted-v4 font-normal">/ 1M tokens</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Competitor comparison */}
          <div className="border border-hairline rounded-2xl overflow-hidden mb-12">
            <table className="w-full text-sm">
              <thead className="bg-ink-surface-2 text-text-secondary-v4">
                <tr>
                  <th className="py-3 px-4 text-left font-medium">Provider</th>
                  <th className="py-3 px-4 text-left font-medium">Token Pricing</th>
                  <th className="py-3 px-4 text-left font-medium">Comparison / Advantage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                <tr className="bg-signal/5">
                  <td className="py-3 px-4 font-semibold text-signal">VaultHost Inference</td>
                  <td className="py-3 px-4 font-medium text-text-primary-v4">₹0.08 / 1M (8B) · ₹0.60 / 1M (70B) · ₹8 / 1M (GPT-4o)</td>
                  <td className="py-3 px-4 text-text-secondary-v4">Zero cold starts, local India edge servers (&lt;20ms TTFT), true pay-per-token</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-text-primary-v4">AWS Bedrock</td>
                  <td className="py-3 px-4 text-text-secondary-v4">₹2.20 - ₹25 / 1M tokens</td>
                  <td className="py-3 px-4 text-text-secondary-v4">Higher minimum billings, unpredictable on-demand pricing surges</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-text-primary-v4">Azure OpenAI</td>
                  <td className="py-3 px-4 text-text-secondary-v4">₹12.50 - ₹50 / 1M tokens</td>
                  <td className="py-3 px-4 text-text-secondary-v4">Proprietary model vendor lock-in with strict geographic availability</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-text-primary-v4">Together AI</td>
                  <td className="py-3 px-4 text-text-secondary-v4">₹1.50 - ₹7 / 1M tokens</td>
                  <td className="py-3 px-4 text-text-secondary-v4">US-hosted endpoints introduce 200ms+ network latency to India apps</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
