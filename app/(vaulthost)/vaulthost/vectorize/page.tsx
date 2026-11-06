'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { 
  Database, Zap, Search, Activity, 
  Layers, Image as ImageIcon, CheckCircle, ArrowRight,
  ShieldAlert, Repeat, LayoutGrid
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

      {/* Tech Specs Table */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="v4-display text-text-primary-v4 mb-4">Compare Plans</h2>
            </div>
          </ScrollReveal>

          <div className="max-w-5xl mx-auto overflow-hidden rounded-xl border border-hairline bg-ink">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-ink-surface border-b border-hairline">
                  <th className="py-5 px-6 text-sm font-semibold text-text-primary-v4">Feature</th>
                  <th className="py-5 px-6 text-sm font-semibold text-text-primary-v4">Free</th>
                  <th className="py-5 px-6 text-sm font-semibold text-signal">Pro (₹1,499/mo)</th>
                  <th className="py-5 px-6 text-sm font-semibold text-text-primary-v4">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                <tr className="hover:bg-ink-surface/50 transition-colors">
                  <td className="py-4 px-6 text-text-secondary-v4">Max Vectors per Index</td>
                  <td className="py-4 px-6 text-text-primary-v4">100,000</td>
                  <td className="py-4 px-6 text-signal font-medium">10,000,000</td>
                  <td className="py-4 px-6 text-text-primary-v4">Custom</td>
                </tr>
                <tr className="hover:bg-ink-surface/50 transition-colors">
                  <td className="py-4 px-6 text-text-secondary-v4">Query Dimensions</td>
                  <td className="py-4 px-6 text-text-primary-v4">Up to 1536</td>
                  <td className="py-4 px-6 text-text-primary-v4">Up to 1536</td>
                  <td className="py-4 px-6 text-text-primary-v4">Up to 3072</td>
                </tr>
                <tr className="hover:bg-ink-surface/50 transition-colors">
                  <td className="py-4 px-6 text-text-secondary-v4">Supported Distances</td>
                  <td className="py-4 px-6 text-text-primary-v4">Cosine, Dot</td>
                  <td className="py-4 px-6 text-text-primary-v4">Cosine, Dot, Euclidean</td>
                  <td className="py-4 px-6 text-text-primary-v4">All + Custom Metrics</td>
                </tr>
                <tr className="hover:bg-ink-surface/50 transition-colors">
                  <td className="py-4 px-6 text-text-secondary-v4">Metadata Filtering</td>
                  <td className="py-4 px-6 text-text-primary-v4"><CheckCircle className="w-5 h-5 text-text-muted-v4" /></td>
                  <td className="py-4 px-6 text-text-primary-v4"><CheckCircle className="w-5 h-5 text-signal" /></td>
                  <td className="py-4 px-6 text-text-primary-v4"><CheckCircle className="w-5 h-5 text-signal" /></td>
                </tr>
                <tr className="hover:bg-ink-surface/50 transition-colors">
                  <td className="py-4 px-6 text-text-secondary-v4">Namespace Isolation</td>
                  <td className="py-4 px-6 text-text-muted-v4">-</td>
                  <td className="py-4 px-6 text-text-primary-v4"><CheckCircle className="w-5 h-5 text-signal" /></td>
                  <td className="py-4 px-6 text-text-primary-v4"><CheckCircle className="w-5 h-5 text-signal" /></td>
                </tr>
              </tbody>
            </table>
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
              <h2 className="v4-display text-text-primary-v4 mb-6 relative z-10">Ready to build your RAG system?</h2>
              <p className="text-xl text-text-secondary-v4 mb-10 max-w-2xl mx-auto relative z-10">
                Start indexing your data in seconds. Fast, durable, and built entirely for the modern AI stack.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                <Link href="/portal" className="v4-btn-primary rounded-btn group">
                  Start building RAG 
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/docs/vectorize" className="v4-btn-secondary rounded-btn">
                  API Docs
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
