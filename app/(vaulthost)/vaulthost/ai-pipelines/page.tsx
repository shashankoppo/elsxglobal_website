'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { 
  GitMerge, Workflow, Eye, Clock, 
  FileText, Rss, Headphones, Image as ImageIcon, 
  Database, ShieldAlert, ArrowRight, Zap, CheckCircle
} from 'lucide-react';
import Link from 'next/link';

const templates = [
  {
    title: "Document Intelligence",
    description: "PDF upload → extract text → chunk → embed → store in VaultVectorize → query-ready.",
    icon: <FileText className="w-5 h-5 text-signal" />
  },
  {
    title: "Content Generation",
    description: "RSS feed → summarize with LLM → post to CMS → notify Slack channel.",
    icon: <Rss className="w-5 h-5 text-signal" />
  },
  {
    title: "Customer Support Automaton",
    description: "Email/ticket → classify intent → generate draft reply → human review → send.",
    icon: <Headphones className="w-5 h-5 text-signal" />
  },
  {
    title: "Image Processing Pipeline",
    description: "Upload → resize → caption with AI → embed → store in R2 + KV metadata.",
    icon: <ImageIcon className="w-5 h-5 text-signal" />
  },
  {
    title: "Data Enrichment",
    description: "CSV upload → for each row, enrich via LLM → validate → export to Database.",
    icon: <Database className="w-5 h-5 text-signal" />
  },
  {
    title: "Monitoring & Alerts",
    description: "Log stream → anomaly detection (AI) → alert PagerDuty if confidence > 0.9.",
    icon: <ShieldAlert className="w-5 h-5 text-signal" />
  }
];

const nodes = [
  {
    category: "Triggers",
    items: ["Webhook Receive", "Cron Schedule", "API Endpoint", "S3 Upload Event"]
  },
  {
    category: "AI Operations",
    items: ["LLM Prompt", "Image Generation", "Generate Embeddings", "Text Classification", "Speech-to-Text"]
  },
  {
    category: "Storage",
    items: ["Write Object (R2)", "Set KV", "D1 SQL Query", "VaultVectorize Upsert"]
  },
  {
    category: "Transformers",
    items: ["Parse JSON", "Run Custom Code", "Filter Data", "Split / Loop"]
  },
  {
    category: "Outputs",
    items: ["HTTP Request", "Send Email", "Slack Message", "DB Write"]
  }
];

export default function AIPipelinesPage() {
  return (
    <div className="v4-page">
      <PageHeroV4
        eyebrow="VaultAI Pipelines"
        title={<>Build AI Workflows. <span className="text-signal">No Code Required.</span></>}
        description="Visually connect data sources, AI models, storage, and APIs into powerful automation pipelines. Process documents, generate content, classify data, and trigger actions — all on autopilot."
      />

      {/* Stats */}
      <section className="v4-section-sm border-b border-hairline bg-ink-surface-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-semibold text-text-primary-v4 mb-1">Drag & Drop</div>
              <div className="text-sm text-text-muted-v4">Visual Builder</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-text-primary-v4 mb-1">50+</div>
              <div className="text-sm text-text-muted-v4">Pre-built Nodes</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-text-primary-v4 mb-1">Any Trigger</div>
              <div className="text-sm text-text-muted-v4">Webhook / Cron / API</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-text-primary-v4 mb-1">Real-time</div>
              <div className="text-sm text-text-muted-v4">Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pipeline Templates */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="v4-display text-text-primary-v4 mb-4">Start from Pre-built Templates</h2>
              <p className="text-text-secondary-v4 text-lg">Don't reinvent the wheel. Deploy common AI patterns in one click.</p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template, i) => (
              <ScrollReveal key={template.title} delay={i * 0.1}>
                <PanelCard className="h-full bg-ink border-hairline p-6 group hover:border-signal transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-ink-surface-2 border border-hairline flex items-center justify-center mb-5 group-hover:bg-signal/10 group-hover:border-signal/50 transition-colors">
                    {template.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary-v4 mb-3">{template.title}</h3>
                  <p className="text-text-secondary-v4 text-sm font-mono leading-relaxed bg-ink-surface-2 p-3 rounded-lg border border-hairline">
                    {template.description}
                  </p>
                </PanelCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Node Library */}
      <section className="v4-section bg-ink-surface-2 border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="v4-display text-text-primary-v4 mb-4">The Ultimate Node Library</h2>
              <p className="text-text-secondary-v4 text-lg">Connect anything to anything with over 50 native integrations.</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {nodes.map((nodeCat, i) => (
              <ScrollReveal key={nodeCat.category} delay={i * 0.1}>
                <div className="bg-ink rounded-xl border border-hairline p-5 h-full">
                  <h4 className="text-text-primary-v4 font-semibold mb-4 pb-2 border-b border-hairline">{nodeCat.category}</h4>
                  <ul className="space-y-3">
                    {nodeCat.items.map(item => (
                      <li key={item} className="text-sm text-text-secondary-v4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-signal"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="v4-display text-text-primary-v4 mb-4">Pricing</h2>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PanelCard className="p-8 bg-ink-surface-2 border-hairline flex flex-col">
              <h3 className="text-2xl font-semibold text-text-primary-v4 mb-2">Free</h3>
              <div className="text-4xl font-bold text-text-primary-v4 mb-8">₹0<span className="text-lg text-text-muted-v4 font-normal">/mo</span></div>
              <ul className="space-y-4 text-sm text-text-secondary-v4 mb-8 flex-1">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-signal" /> 3 Pipelines</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-signal" /> 1,000 Runs / month</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-signal" /> Standard Nodes</li>
              </ul>
              <Link href="/portal" className="v4-btn-secondary w-full justify-center">Start Building</Link>
            </PanelCard>
            
            <PanelCard className="p-8 bg-ink border-signal flex flex-col relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-signal text-ink px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Pro</div>
              <h3 className="text-2xl font-semibold text-text-primary-v4 mb-2">Pro</h3>
              <div className="text-4xl font-bold text-text-primary-v4 mb-8">₹1,999<span className="text-lg text-text-muted-v4 font-normal">/mo</span></div>
              <ul className="space-y-4 text-sm text-text-secondary-v4 mb-8 flex-1">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-signal" /> Unlimited Pipelines</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-signal" /> 100,000 Runs / month</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-signal" /> Premium AI Nodes</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-signal" /> Priority Execution</li>
              </ul>
              <Link href="/portal" className="v4-btn-primary w-full justify-center">Upgrade</Link>
            </PanelCard>

            <PanelCard className="p-8 bg-ink-surface-2 border-hairline flex flex-col">
              <h3 className="text-2xl font-semibold text-text-primary-v4 mb-2">Enterprise</h3>
              <div className="text-4xl font-bold text-text-primary-v4 mb-8">Custom</div>
              <ul className="space-y-4 text-sm text-text-secondary-v4 mb-8 flex-1">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-signal" /> Unlimited Runs</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-signal" /> Custom Private Nodes</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-signal" /> VPC Peering</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-signal" /> SSO & Audit Logs</li>
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
              <h2 className="v4-display text-text-primary-v4 mb-6 relative z-10">Automate your AI logic</h2>
              <p className="text-xl text-text-secondary-v4 mb-10 max-w-2xl mx-auto relative z-10">
                Stop writing boilerplate integration code. Build your entire data pipeline visually in minutes instead of weeks.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                <Link href="/portal" className="v4-btn-primary rounded-btn group">
                  Build your first pipeline
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
