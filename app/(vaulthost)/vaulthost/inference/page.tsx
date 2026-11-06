'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { 
  Zap, Cpu, Layers, Activity, 
  Workflow, Database, Image as ImageIcon, 
  MessageSquare, Settings, CheckCircle, ArrowRight 
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

      {/* Pricing Table */}
      <section className="v4-section bg-ink-surface-2 border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="v4-display text-text-primary-v4 mb-4">Usage-based Pricing</h2>
              <p className="text-text-secondary-v4 text-lg">No minimums. No monthly subscriptions. Just pay for what you use.</p>
            </div>
          </ScrollReveal>
          
          <div className="max-w-4xl mx-auto overflow-hidden rounded-xl border border-hairline bg-ink">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-ink-surface border-b border-hairline">
                  <th className="py-4 px-6 text-sm font-medium text-text-secondary-v4 uppercase tracking-wider">Model</th>
                  <th className="py-4 px-6 text-sm font-medium text-text-secondary-v4 uppercase tracking-wider">Type</th>
                  <th className="py-4 px-6 text-sm font-medium text-text-secondary-v4 uppercase tracking-wider">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                <tr className="hover:bg-ink-surface/50 transition-colors">
                  <td className="py-4 px-6 text-text-primary-v4 font-medium">Llama 3 8B (Meta)</td>
                  <td className="py-4 px-6 text-text-muted-v4">Text / LLM</td>
                  <td className="py-4 px-6 text-text-primary-v4">₹0.05 <span className="text-text-muted-v4 text-sm">/ 1M tokens</span></td>
                </tr>
                <tr className="hover:bg-ink-surface/50 transition-colors">
                  <td className="py-4 px-6 text-text-primary-v4 font-medium">Llama 3 70B (Meta)</td>
                  <td className="py-4 px-6 text-text-muted-v4">Text / LLM</td>
                  <td className="py-4 px-6 text-text-primary-v4">₹0.50 <span className="text-text-muted-v4 text-sm">/ 1M tokens</span></td>
                </tr>
                <tr className="hover:bg-ink-surface/50 transition-colors">
                  <td className="py-4 px-6 text-text-primary-v4 font-medium">Stable Diffusion XL</td>
                  <td className="py-4 px-6 text-text-muted-v4">Image Gen</td>
                  <td className="py-4 px-6 text-text-primary-v4">₹1.00 <span className="text-text-muted-v4 text-sm">/ image (1024x1024)</span></td>
                </tr>
                <tr className="hover:bg-ink-surface/50 transition-colors">
                  <td className="py-4 px-6 text-text-primary-v4 font-medium">Whisper Large v3</td>
                  <td className="py-4 px-6 text-text-muted-v4">Speech-to-Text</td>
                  <td className="py-4 px-6 text-text-primary-v4">₹0.006 <span className="text-text-muted-v4 text-sm">/ min audio</span></td>
                </tr>
                <tr className="hover:bg-ink-surface/50 transition-colors">
                  <td className="py-4 px-6 text-text-primary-v4 font-medium">nomic-embed-text</td>
                  <td className="py-4 px-6 text-text-muted-v4">Embeddings</td>
                  <td className="py-4 px-6 text-text-primary-v4">₹0.01 <span className="text-text-muted-v4 text-sm">/ 1M tokens</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div 
              className="rounded-[2rem] p-12 md:p-20 text-center border border-hairline/50 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(10,18,36,0.98), rgba(6,12,24,1))' }}
            >
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-signal/10 via-transparent to-transparent pointer-events-none" />
              <h2 className="v4-display text-text-primary-v4 mb-6 relative z-10">Start Inferencing Today</h2>
              <p className="text-xl text-text-secondary-v4 mb-10 max-w-2xl mx-auto relative z-10">
                Unlock top-tier open source AI models with zero cold starts, infinite scaling, and industry-leading latency.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                <Link href="/portal" className="v4-btn-primary rounded-btn group">
                  Run your first inference free
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/docs/inference/models" className="v4-btn-secondary rounded-btn">
                  Browse Models
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
