'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Download, FileText, Mail, PlayCircle } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';

export default function ResourcesPage() {
  const whitepapers = [
    { title: 'AI Transformation Guide 2025', type: 'Whitepaper', desc: 'A comprehensive roadmap for integrating generative AI into enterprise workflows.' },
    { title: 'Cloud Migration Playbook', type: 'Playbook', desc: 'Best practices for zero-downtime migrations to AWS, Azure, and GCP.' },
    { title: 'ERP Selection Framework', type: 'Guide', desc: 'How to evaluate and select the right ERP system for your industry.' },
    { title: 'Cybersecurity Checklist', type: 'Checklist', desc: 'Essential security protocols for remote and hybrid workforces.' }
  ];

  const blogPosts = [
    { title: 'The Future of BPO: Humans and AI Working Together', category: 'Operations', date: 'Oct 15, 2024' },
    { title: 'Optimizing Next.js for Enterprise Scale', category: 'Technology', date: 'Oct 12, 2024' },
    { title: 'Navigating SOC 2 Compliance in 2024', category: 'Security', date: 'Oct 05, 2024' },
    { title: 'Data-Driven Decision Making with KPO', category: 'Analytics', date: 'Sep 28, 2024' },
    { title: 'Top 5 Trends in Digital Transformation', category: 'Consulting', date: 'Sep 20, 2024' },
    { title: 'Building Resilient Supply Chains with Tech', category: 'Logistics', date: 'Sep 15, 2024' }
  ];

  return (
    <main className="v4-page bg-ink text-text-primary-v4">
      <PageHeroV4 
        title="Knowledge & Insights"
        description="Explore our library of research, guides, and articles to stay ahead in the digital landscape." eyebrow="Resources Hub" />

      <ScrollReveal>
        <section className="v4-section bg-ink-surface border-y border-hairline">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="v4-display text-3xl font-bold text-text-primary-v4 mb-2">Featured Guides & Whitepapers</h2>
                <p className="text-text-secondary-v4">In-depth research and actionable playbooks.</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {whitepapers.map((item, idx) => (
                <PanelCard key={idx} className="p-6 flex flex-col h-full hover:border-signal/50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-signal" />
                    <span className="text-xs font-bold uppercase tracking-wider text-text-muted-v4">{item.type}</span>
                  </div>
                  <h3 className="text-lg font-bold text-text-primary-v4 mb-3 group-hover:text-signal transition-colors">{item.title}</h3>
                  <p className="text-sm text-text-secondary-v4 mb-6 flex-grow">{item.desc}</p>
                  <div className="flex items-center gap-2 text-signal text-sm font-semibold mt-auto">
                    <Download className="w-4 h-4" /> Download PDF
                  </div>
                </PanelCard>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="v4-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="v4-display text-3xl font-bold text-text-primary-v4 mb-2">Latest Insights</h2>
                <p className="text-text-secondary-v4">Perspectives from our experts.</p>
              </div>
              <Link href="/blog" className="text-signal hover:underline flex items-center gap-2 font-medium">
                View all articles <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post, idx) => (
                <PanelCard key={idx} className="p-6 hover:border-signal/50 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-signal bg-signal/10 px-2 py-1 rounded-chip">
                      {post.category}
                    </span>
                    <span className="text-xs text-text-muted-v4">{post.date}</span>
                  </div>
                  <h3 className="text-xl font-bold text-text-primary-v4 mb-3 group-hover:text-signal transition-colors">{post.title}</h3>
                  <Link href={`/blog/${idx}`} className="text-sm font-semibold text-text-secondary-v4 flex items-center gap-1 group-hover:text-signal">
                    Read article <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -ml-2 group-hover:ml-0" />
                  </Link>
                </PanelCard>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="v4-section bg-ink-surface-2 border-t border-hairline">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
            <div className="bg-ink p-10 rounded-2xl border border-hairline shadow-2xl">
              <Mail className="w-12 h-12 text-signal mx-auto mb-6" />
              <h2 className="v4-display text-3xl font-bold mb-4 text-text-primary-v4">Subscribe to our Newsletter</h2>
              <p className="text-text-secondary-v4 mb-8">
                Get the latest enterprise technology trends, BPO insights, and company news delivered directly to your inbox.
              </p>
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Enter your work email" 
                  className="flex-grow bg-ink-surface border border-hairline text-text-primary-v4 rounded-btn px-4 py-3 focus:outline-none focus:border-signal"
                />
                <button type="button" className="v4-btn-primary rounded-btn px-6 py-3 whitespace-nowrap">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </main>
  );
}


