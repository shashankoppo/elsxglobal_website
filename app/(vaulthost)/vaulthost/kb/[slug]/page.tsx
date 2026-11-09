'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { KB_ARTICLES, KBArticle } from '../kb-data';
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Tag,
  Headphones,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

export default function ArticleDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const article = KB_ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    return (
      <div className="v4-page bg-ink min-h-screen">
        <PageHeroV4
          eyebrow="Article Not Found"
          title={<>404 — Knowledge Guide <span className="text-signal">Missing</span></>}
          description="The documentation or technical guide you requested could not be located in our catalog."
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="v4-panel p-10 max-w-lg mx-auto rounded-2xl border border-hairline bg-ink-surface">
            <AlertTriangle className="h-12 w-12 text-signal mx-auto mb-4" />
            <h2 className="v4-display text-xl text-text-primary-v4 mb-3">Guide Not Found</h2>
            <p className="text-sm text-text-secondary-v4 mb-6">
              The article may have been moved, renamed, or retired. Explore our full library or contact support.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/vaulthost/kb" className="v4-btn-primary rounded-btn px-5 py-2.5 text-sm inline-flex items-center justify-center">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Knowledge Base
              </Link>
              <Link href="/contact" className="v4-btn-secondary rounded-btn px-5 py-2.5 text-sm inline-flex items-center justify-center">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Related articles (3 from same category, excluding current)
  const related = KB_ARTICLES
    .filter((a) => a.category === article.category && a.slug !== article.slug)
    .slice(0, 3);
  if (related.length < 3) {
    const extra = KB_ARTICLES.filter((a) => a.slug !== article.slug && !related.includes(a)).slice(0, 3 - related.length);
    related.push(...extra);
  }

  return (
    <div className="v4-page bg-ink min-h-screen">
      {/* Breadcrumb Nav */}
      <div className="border-b border-hairline bg-ink-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav className="flex items-center gap-2 text-xs text-text-muted-v4 font-mono overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-text-primary-v4 transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-text-muted-v4/60" />
            <Link href="/vaulthost/kb" className="hover:text-text-primary-v4 transition-colors">Knowledge Base</Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-text-muted-v4/60" />
            <span className="text-signal">{article.categoryLabel}</span>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-text-muted-v4/60" />
            <span className="text-text-secondary-v4 truncate max-w-[240px] sm:max-w-md">{article.title}</span>
          </nav>
        </div>
      </div>

      {/* Article Header Hero */}
      <section className="pt-10 pb-12 bg-ink border-b border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="v4-readout text-[11px] uppercase font-mono px-2.5 py-1 rounded border border-signal/40 bg-signal/10 text-signal font-semibold">
                {article.categoryLabel}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-text-muted-v4 font-mono">
                <Clock className="h-3.5 w-3.5 text-signal" /> {article.readTime} read
              </span>
              <span className="flex items-center gap-1.5 text-xs text-text-muted-v4 font-mono">
                <Calendar className="h-3.5 w-3.5 text-signal" /> {article.date}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-ink-surface-2 border border-hairline text-text-secondary-v4">
                Difficulty: {article.difficulty}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold v4-display text-text-primary-v4 leading-tight mb-4">
              {article.title}
            </h1>
            <p className="text-base sm:text-lg text-text-secondary-v4 leading-relaxed">
              {article.excerpt}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content & Sidebar Grid */}
      <div className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Article Content: 8 cols */}
            <article className="lg:col-span-8 space-y-8 text-text-secondary-v4 leading-relaxed">
              <div className="v4-panel p-6 sm:p-8 rounded-2xl border border-hairline bg-ink-surface/50 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-text-primary-v4 mb-3">1. Architectural Overview &amp; Context</h3>
                  <p className="text-sm sm:text-base leading-relaxed text-text-secondary-v4 mb-3">
                    Modern cloud workloads necessitate distributed reliability without introducing unnecessary operational friction. When implementing {article.title.toLowerCase()}, VaultHost orchestrates lower-level system primitives directly across 300+ global edge Points of Presence (PoPs), eliminating single-region bottlenecks and latency overheads.
                  </p>
                  <p className="text-sm sm:text-base leading-relaxed text-text-secondary-v4">
                    By abstracting manual node provisioning into deterministic, software-defined control planes, system architects achieve resilient failover capabilities. Every transaction routes through BGP Anycast mesh networks, guaranteeing predictable response execution even during upstream carrier degradation.
                  </p>
                </div>

                <div className="border-t border-hairline pt-6">
                  <h3 className="text-xl font-bold text-text-primary-v4 mb-3">2. Prerequisites &amp; System Requirements</h3>
                  <p className="text-sm sm:text-base leading-relaxed text-text-secondary-v4 mb-3">
                    Before executing configuration commands, verify that your VaultHost CLI or API authorization credentials possess least-privilege administrative tokens. Ensure your terminal has active access to the target workspace and that dependent DNS zones or compute isolate policies are initialized.
                  </p>
                  <p className="text-sm sm:text-base leading-relaxed text-text-secondary-v4">
                    For automated CI/CD pipelines, configure your repository secrets with your scoped token rather than master account keys. Review your organization quotas under the Billing &amp; IAM portal to confirm available compute units and bandwidth allocations.
                  </p>
                </div>

                <div className="border-t border-hairline pt-6">
                  <h3 className="text-xl font-bold text-text-primary-v4 mb-3">3. Step-by-Step Implementation Guide</h3>
                  <p className="text-sm sm:text-base leading-relaxed text-text-secondary-v4 mb-3">
                    To deploy the target configuration, initiate the synchronization command or apply the declarative manifest via your designated orchestration interface. The configuration payload validates schema definitions locally prior to triggering the edge distribution engine.
                  </p>
                  <p className="text-sm sm:text-base leading-relaxed text-text-secondary-v4">
                    Once staged, the VaultHost edge runtime compiles the instructions into optimized V8 isolate bindings or kernel-level routing tables. This guarantees microsecond-level cold starts and sub-millisecond execution overhead under concurrent traffic spikes.
                  </p>
                </div>

                <div className="border-t border-hairline pt-6">
                  <h3 className="text-xl font-bold text-text-primary-v4 mb-3">4. Edge Propagation &amp; Cache Synchronization</h3>
                  <p className="text-sm sm:text-base leading-relaxed text-text-secondary-v4 mb-3">
                    Updates applied to your configuration are broadcast using our distributed Gossip consensus protocol across all continental hubs within 1.2 seconds. Stale in-memory cache snapshots are purged atomically, preventing partial write states from reaching end clients.
                  </p>
                  <p className="text-sm sm:text-base leading-relaxed text-text-secondary-v4">
                    If your implementation interacts with key-value storage or relational database bindings, read-your-own-writes consistency models are preserved through localized primary replication pools, eliminating replication race conditions.
                  </p>
                </div>

                <div className="border-t border-hairline pt-6">
                  <h3 className="text-xl font-bold text-text-primary-v4 mb-3">5. Security Hardening &amp; Compliance</h3>
                  <p className="text-sm sm:text-base leading-relaxed text-text-secondary-v4 mb-3">
                    All outbound egress and ingress pipelines are encrypted with TLS 1.3 and hybrid post-quantum ML-KEM-768 key encapsulation algorithms. Automated Web Application Firewall (WAF) inspections evaluate incoming payloads against OWASP Core Rule Sets in real time.
                  </p>
                  <p className="text-sm sm:text-base leading-relaxed text-text-secondary-v4">
                    Audit log events are streamed continuously to your centralized logging sink with tamper-evident cryptographic hashes, fulfilling SOC 2 Type II, ISO 27001, and Indian Digital Personal Data Protection (DPDP) compliance benchmarks.
                  </p>
                </div>

                <div className="border-t border-hairline pt-6">
                  <h3 className="text-xl font-bold text-text-primary-v4 mb-3">6. Production Verification &amp; Telemetry</h3>
                  <p className="text-sm sm:text-base leading-relaxed text-text-secondary-v4 mb-3">
                    Validate that your deployment is operating within expected operational bounds using our real-time observability telemetry. Monitor p99 latency percentiles, HTTP status distributions, and memory utilization thresholds from the unified dashboard.
                  </p>
                  <p className="text-sm sm:text-base leading-relaxed text-text-secondary-v4">
                    In the event of unexpected upstream gateway timeouts or downstream client drops, our automated health-check probes reroute active client streams to adjacent healthy cluster nodes with zero manual intervention required.
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Tag className="h-4 w-4 text-signal mr-1" />
                <span className="text-xs font-mono text-text-muted-v4 uppercase">Tags:</span>
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-mono px-2.5 py-1 rounded bg-ink-surface border border-hairline text-text-secondary-v4"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </article>

            {/* Related Articles & Support Sidebar: 4 cols */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="v4-panel p-6 rounded-2xl border border-hairline bg-ink-surface/60">
                <h3 className="text-base font-bold text-text-primary-v4 mb-4 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-signal" /> Related {article.categoryLabel} Guides
                </h3>
                <div className="space-y-4">
                  {related.map((rel) => (
                    <Link
                      key={rel.slug}
                      href={`/vaulthost/kb/${rel.slug}`}
                      className="block p-3.5 rounded-xl border border-hairline bg-ink-surface-2/60 hover:border-signal/50 hover:bg-ink-surface-2 transition-all group"
                    >
                      <h4 className="text-xs font-semibold text-text-primary-v4 group-hover:text-signal transition-colors line-clamp-2">
                        {rel.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-text-muted-v4 font-mono">
                        <Clock className="h-3 w-3 text-signal" /> {rel.readTime}
                        <span>•</span>
                        <span>{rel.difficulty}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Need Support Panel */}
              <div className="v4-panel p-6 rounded-2xl border border-signal/40 bg-gradient-to-b from-ink-surface to-ink-surface-2 text-center">
                <div className="w-12 h-12 rounded-xl bg-signal/10 border border-signal/30 text-signal flex items-center justify-center mx-auto mb-4">
                  <Headphones className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-text-primary-v4 mb-2">Need Expert Assistance?</h3>
                <p className="text-xs text-text-secondary-v4 leading-relaxed mb-5">
                  Our cloud engineering support team is available 24/7/365 to assist with architecture reviews, migration guidance, and technical troubleshooting.
                </p>
                <Link
                  href="/contact"
                  className="v4-btn-primary w-full justify-center rounded-btn py-2.5 text-xs font-semibold inline-flex items-center"
                >
                  Contact Support <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="v4-section" style={{ background: 'linear-gradient(135deg, rgba(10,18,36,0.98), rgba(6,12,24,1))' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
          <ScrollReveal>
            <h2 className="v4-display text-white text-3xl sm:text-4xl mb-4">
              Build Faster with VaultHost Global Cloud
            </h2>
            <p className="text-text-secondary-v4 max-w-2xl mx-auto mb-8 text-base">
              Ready to deploy your workloads on India&apos;s fastest edge computing, storage, and managed hosting platform?
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/portal/signup" className="v4-btn-primary inline-flex items-center justify-center rounded-btn px-7 py-3 text-sm font-semibold">
                Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link href="/vaulthost/kb" className="v4-btn-secondary inline-flex items-center justify-center rounded-btn px-7 py-3 text-sm font-semibold">
                Explore Full Knowledge Base
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
