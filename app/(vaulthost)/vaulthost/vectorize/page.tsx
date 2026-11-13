'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { 
  Database, Zap, Search, Activity, 
  Layers, Image as ImageIcon, CheckCircle, ArrowRight,
  ShieldAlert, Repeat, LayoutGrid, Check
} from 'lucide-react';
import Link from 'next/link';

const useCases = [
  {
    title: "Semantic Search",
    description: "Search by meaning and context, not just keyword matching. Enable natural language search for your documentation or product catalog.",
    icon: <Search className="w-5 h-5 text-signal" />
  },
  {
    title: "RAG Pipelines",
    description: "Build robust Retrieval-Augmented Generation workflows. Feed relevant proprietary context into LLMs to eliminate hallucinations.",
    icon: <Database className="w-5 h-5 text-signal" />
  },
  {
    title: "Recommendation Engines",
    description: "Surface similar products, related articles, or user matches based on vector similarity and high-dimensional clustering.",
    icon: <LayoutGrid className="w-5 h-5 text-signal" />
  },
  {
    title: "Anomaly Detection",
    description: "Identify outliers in high-dimensional space for fraud detection, network security monitoring, or defect recognition.",
    icon: <ShieldAlert className="w-5 h-5 text-signal" />
  },
  {
    title: "Image Search",
    description: "Use CLIP embeddings to power visual search. Let users upload an image to find visually similar items in your database.",
    icon: <ImageIcon className="w-5 h-5 text-signal" />
  },
  {
    title: "Duplicate Detection",
    description: "Automatically flag near-duplicate content, spam submissions, or plagiarized text using tight distance thresholds.",
    icon: <Repeat className="w-5 h-5 text-signal" />
  }
];

export default function VectorizePage() {
  return (
    <div className="v4-page">
      <PageHeroV4
        eyebrow="VaultVectorize"
        title={<>Vector Database Built for <span className="text-signal">Production AI.</span></>}
        description="Store, index, and query high-dimensional vectors at scale. Power semantic search, RAG pipelines, recommendation engines, and anomaly detection with sub-millisecond query latency."
      />

      {/* Stats Bar */}
      <section className="v4-section-sm border-b border-hairline bg-ink-surface-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-semibold text-text-primary-v4 mb-1">&lt;5ms</div>
              <div className="text-sm text-text-muted-v4">Query Latency</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-text-primary-v4 mb-1">1536</div>
              <div className="text-sm text-text-muted-v4">Dimensions Supported</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-text-primary-v4 mb-1">HNSW</div>
              <div className="text-sm text-text-muted-v4">Algorithmic Indexing</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-text-primary-v4 mb-1">100M+</div>
              <div className="text-sm text-text-muted-v4">Vectors Per Index</div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="v4-display text-text-primary-v4 text-center mb-16">Unlock the Power of Vector Math</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase, i) => (
              <ScrollReveal key={useCase.title} delay={i * 0.1}>
                <PanelCard className="h-full bg-ink-surface-2 border-hairline p-6 hover:border-signal/50 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-ink border border-hairline flex items-center justify-center mb-5">
                    {useCase.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary-v4 mb-3">{useCase.title}</h3>
                  <p className="text-text-secondary-v4 text-sm leading-relaxed">{useCase.description}</p>
                </PanelCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture & Code */}
      <section className="v4-section bg-ink-surface-2 border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="v4-display text-text-primary-v4 mb-6">Seamless integration into your stack</h2>
                <p className="text-text-secondary-v4 text-lg mb-8">
                  VaultVectorize integrates perfectly with VaultInference embeddings or any external embedding model. Perform metadata filtering alongside vector searches for hyper-accurate results.
                </p>
                
                <div className="p-6 bg-ink border border-hairline rounded-xl font-mono text-sm text-text-secondary-v4 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-signal bg-signal/10 px-2 py-1 rounded">1</span>
                    <span className="text-text-primary-v4">App receives query text</span>
                  </div>
                  <div className="h-4 border-l border-hairline ml-3"></div>
                  <div className="flex items-center gap-3">
                    <span className="text-signal bg-signal/10 px-2 py-1 rounded">2</span>
                    <span className="text-text-primary-v4">Embed via VaultInference</span>
                  </div>
                  <div className="h-4 border-l border-hairline ml-3"></div>
                  <div className="flex items-center gap-3">
                    <span className="text-signal bg-signal/10 px-2 py-1 rounded">3</span>
                    <span className="text-text-primary-v4">Query VaultVectorize (topK: 5)</span>
                  </div>
                  <div className="h-4 border-l border-hairline ml-3"></div>
                  <div className="flex items-center gap-3">
                    <span className="text-signal bg-signal/10 px-2 py-1 rounded">4</span>
                    <span className="text-text-primary-v4">LLM Generation with retrieved context</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0D1117] border border-hairline rounded-xl p-6 overflow-x-auto shadow-2xl">
                <div className="flex gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                </div>
                <pre className="text-sm font-mono text-gray-300">
                  <code dangerouslySetInnerHTML={{ __html: `// 1. Insert Vectors\nawait vectorize.upsert([\n  {\n    id: 'doc-1',\n    values: [0.1, -0.2, 0.5, ...],\n    metadata: { author: 'Alice', type: 'blog' }\n  }\n]);\n\n// 2. Query with Metadata Filter\nconst matches = await vectorize.query({\n  vector: queryEmbedding,\n  topK: 5,\n  filter: { type: { $eq: 'blog' } }\n});\n\nconsole.log(matches);` }} />
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
                <p className="text-text-secondary-v4 text-sm mb-6">Semantic vector index for developer prototypes and testing.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 100K indexed vectors</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Up to 1536 dimensions</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Cosine &amp; Dot product metrics</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 50ms p95 search latency</li>
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
                <div className="text-3xl font-bold text-text-primary-v4 mb-1">₹1,499 <span className="text-sm font-normal text-text-muted-v4">/mo</span></div>
                <p className="text-text-secondary-v4 text-sm mb-6">Fast vector search for production RAG and AI search workflows.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 10M indexed vectors</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Up to 3072 dimensions</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Metadata filtering &amp; namespaces</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Sub-15ms p95 search latency</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Priority email support</li>
                </ul>
              </div>
              <Link href="/vaulthost/checkout?plan=vectorize-pro" className="v4-btn-primary rounded-btn w-full text-center block py-2.5">Get Started</Link>
            </div>
            {/* Business tier */}
            <div className="v4-panel rounded-2xl p-6 border border-hairline flex flex-col justify-between">
              <div>
                <div className="text-text-muted-v4 text-sm font-medium mb-2">BUSINESS</div>
                <div className="text-3xl font-bold text-text-primary-v4 mb-1">₹3,999 <span className="text-sm font-normal text-text-muted-v4">/mo</span></div>
                <p className="text-text-secondary-v4 text-sm mb-6">100M vector cluster with dedicated memory &amp; hybrid search.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 100M indexed vectors</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Dedicated vector memory instances</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Real-time live indexing &amp; updates</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Hybrid lexical + semantic search</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 99.99% search SLA &amp; dedicated support</li>
                </ul>
              </div>
              <Link href="/vaulthost/checkout?plan=vectorize-business" className="v4-btn-primary rounded-btn w-full text-center block py-2.5">Get Started</Link>
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
                  <td className="py-3 px-4 font-semibold text-signal">VaultHost Vectorize</td>
                  <td className="py-3 px-4 font-medium text-text-primary-v4">₹0 Free / ₹1,499 Pro / ₹3,999 Business</td>
                  <td className="py-3 px-4 text-text-secondary-v4">Sub-15ms vector search, 1536/3072 dims, hybrid search, India low latency</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-text-primary-v4">Pinecone</td>
                  <td className="py-3 px-4 text-text-secondary-v4">₹5,800/mo ($70) starter</td>
                  <td className="py-3 px-4 text-text-secondary-v4">Expensive entry baseline with no true free tier for production apps</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-text-primary-v4">Weaviate Cloud</td>
                  <td className="py-3 px-4 text-text-secondary-v4">₹4,150/mo ($50)</td>
                  <td className="py-3 px-4 text-text-secondary-v4">High memory usage multipliers as indexed documents scale</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-text-primary-v4">Qdrant Cloud</td>
                  <td className="py-3 px-4 text-text-secondary-v4">₹3,300/mo ($40)</td>
                  <td className="py-3 px-4 text-text-secondary-v4">Cluster management overhead and cross-continental egress billing</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
