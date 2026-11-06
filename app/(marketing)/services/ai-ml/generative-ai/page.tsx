'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import { MessageSquareCode, FileSearch, Bot, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function GenerativeAIPage() {
  return (
    <main className="v4-page">
      <PageHeroV4 
        eyebrow="Generative AI & LLM"
        title={<>Custom AI That Speaks <span className="text-signal">Your Business Language</span></>}
        description="We build secure, enterprise-grade Generative AI applications. From Retrieval-Augmented Generation (RAG) to custom AI agents, we help you deploy LLMs safely on your proprietary data."
      />

      <section className="v4-section bg-ink-surface">
        <div className="container mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary-v4 mb-6">What We Build</h2>
              <p className="text-text-secondary-v4 text-lg">Production-ready AI solutions that go beyond generic chatbots to automate complex knowledge work.</p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { title: 'Custom LLM Fine-Tuning', desc: 'Adapting base models to understand your specific industry jargon, tone, and complex business logic.', icon: MessageSquareCode },
              { title: 'RAG Pipelines', desc: 'Connecting LLMs to your private databases and documents for highly accurate, hallucination-free answers.', icon: FileSearch },
              { title: 'Autonomous AI Agents', desc: 'Multi-agent systems capable of reasoning, planning, and executing complex workflows independently.', icon: Bot },
              { title: 'Document AI', desc: 'Extracting structured data from unstructured PDFs, contracts, and emails at scale.', icon: Sparkles }
            ].map((service, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <PanelCard className="p-8 flex gap-6 items-start h-full">
                  <div className="p-4 bg-signal/10 rounded-xl text-signal shrink-0">
                    <service.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-text-primary-v4 mb-3">{service.title}</h3>
                    <p className="text-text-secondary-v4">{service.desc}</p>
                  </div>
                </PanelCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="v4-section">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto v4-panel p-8 md:p-12 text-center border-t-4 border-t-signal">
            <ScrollReveal>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary-v4 mb-8">Models & Tech Stack</h2>
              <p className="text-text-secondary-v4 text-lg mb-10">We are model-agnostic, selecting the right frontier or open-source model based on your privacy requirements and use case.</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
                {['GPT-4o', 'Claude 3.5', 'Gemini Pro', 'Llama 3', 'Mistral'].map((model) => (
                  <div key={model} className="bg-ink py-4 px-2 rounded-lg border border-hairline font-semibold text-text-primary-v4">
                    {model}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap justify-center gap-6 text-sm text-text-secondary-v4 text-left">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-signal"/> LangChain & LlamaIndex</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-signal"/> Pinecone, Weaviate, Qdrant</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-signal"/> Enterprise Data Security</div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="v4-section-sm bg-ink-surface text-center">
        <div className="container mx-auto px-4 md:px-8">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-text-primary-v4 mb-6">Ready to harness Generative AI?</h2>
            <div className="flex justify-center">
              <Link href="/contact" className="v4-btn-primary">
                Book an AI Discovery Workshop
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
