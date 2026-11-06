'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  BookOpen,
  Cpu,
  BrainCircuit,
  ShieldCheck,
  Database,
  Receipt,
  ArrowRight,
  FileText,
  Terminal,
  ExternalLink,
  Clock,
  Sparkles,
  Headphones,
  CheckCircle2,
  Layers,
  LifeBuoy,
  HelpCircle,
  FolderKanban,
  MessageSquare,
  Globe,
  Tag,
  ChevronRight,
} from 'lucide-react';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

interface KBGuide {
  slug: string;
  title: string;
  category: 'getting-started' | 'edge-compute' | 'ai-gateway' | 'security' | 'storage' | 'billing';
  categoryLabel: string;
  readTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  excerpt: string;
  tags: string[];
}

const CATEGORIES = [
  { id: 'all', label: 'All Guides', icon: FolderKanban, desc: 'Complete knowledge catalog' },
  { id: 'getting-started', label: 'Getting Started & Migration', icon: BookOpen, desc: 'Quickstarts, DNS cutover, Next.js, and Terraform' },
  { id: 'edge-compute', label: 'Edge Compute & Workers', icon: Cpu, desc: 'V8 isolates, VaultKV, D1 SQLite, and streaming APIs' },
  { id: 'ai-gateway', label: 'AI Gateway & LLMs', icon: BrainCircuit, desc: 'OpenAI proxy, semantic caching, and model failovers' },
  { id: 'security', label: 'Security & Zero Trust', icon: ShieldCheck, desc: 'WireGuard tunnels, WAF rules, and Post-Quantum TLS' },
  { id: 'storage', label: 'Storage & Databases', icon: Database, desc: 'VaultR2 S3 API, D1 SQLite, and Vectorize indexes' },
  { id: 'billing', label: 'Billing & Account', icon: Receipt, desc: 'GST invoices, budget alerts, and team RBAC permissions' },
];

const POPULAR_TAGS = ['Workers', 'DNS', 'S3 API', 'Tunnel', 'Post-Quantum', 'Billing', 'Next.js', 'D1 SQLite'];

const GUIDES: KBGuide[] = [
  // Getting Started & Migration
  {
    slug: 'deploy-nextjs-vaultpages',
    title: 'Deploying your first Next.js app to VaultPages with Edge SSR',
    category: 'getting-started',
    categoryLabel: 'Getting Started',
    readTime: '5 min',
    difficulty: 'Beginner',
    excerpt: 'Step-by-step deployment of Next.js 14/15 App Router applications onto VaultPages edge network with zero cold-starts.',
    tags: ['Next.js', 'VaultPages', 'Edge', 'SSR'],
  },
  {
    slug: 'migrate-s3-to-vaultr2',
    title: 'Migrating from AWS S3 to VaultR2 with zero downtime and zero egress',
    category: 'getting-started',
    categoryLabel: 'Migration',
    readTime: '8 min',
    difficulty: 'Intermediate',
    excerpt: 'Automate bucket migration using the VaultR2 Super Slurp engine without pausing client writes or paying egress penalties.',
    tags: ['S3 API', 'Storage', 'Migration', 'AWS'],
  },
  {
    slug: 'transfer-dns-godaddy',
    title: 'Transferring DNS from GoDaddy to VaultDNS Anycast with 100% uptime',
    category: 'getting-started',
    categoryLabel: 'DNS & Domains',
    readTime: '6 min',
    difficulty: 'Beginner',
    excerpt: 'Safely clone zone records, pre-warm edge resolvers, and switch authoritative nameservers without dropping customer requests.',
    tags: ['DNS', 'Nameservers', 'Anycast', 'Domains'],
  },
  {
    slug: 'terraform-provider-quickstart',
    title: 'Automating cloud provisioning with VaultHost Terraform Provider',
    category: 'getting-started',
    categoryLabel: 'DevOps & IaC',
    readTime: '10 min',
    difficulty: 'Intermediate',
    excerpt: 'Define your entire edge compute, DNS, and storage infrastructure as code using certified HashiCorp Terraform modules.',
    tags: ['Terraform', 'IaC', 'DevOps', 'Automation'],
  },
  {
    slug: 'custom-domain-ssl-setup',
    title: 'Quickstart: Configuring custom apex domains and automated Let\'s Encrypt SSL',
    category: 'getting-started',
    categoryLabel: 'Getting Started',
    readTime: '4 min',
    difficulty: 'Beginner',
    excerpt: 'Map your root domain and wildcards to VaultHost edge nodes with automated BGP Anycast DNS-01 certificate issuance.',
    tags: ['SSL', 'DNS', 'Custom Domain', 'HTTPS'],
  },

  // Edge Compute & Workers
  {
    slug: 'writing-v8-isolate-workers',
    title: 'Writing high-throughput V8 isolate functions in TypeScript',
    category: 'edge-compute',
    categoryLabel: 'Edge Compute',
    readTime: '7 min',
    difficulty: 'Intermediate',
    excerpt: 'Harness millisecond cold-start V8 isolates for API routing, edge middleware, and real-time request transformations.',
    tags: ['Workers', 'TypeScript', 'V8', 'Serverless'],
  },
  {
    slug: 'vaultkv-session-cache',
    title: 'Using VaultKV for sub-millisecond global session caching',
    category: 'edge-compute',
    categoryLabel: 'Edge Compute',
    readTime: '6 min',
    difficulty: 'Intermediate',
    excerpt: 'Read and write distributed key-value pairs stored directly across our 300+ edge PoPs with consistent replication.',
    tags: ['VaultKV', 'Caching', 'Workers', 'Redis'],
  },
  {
    slug: 'binding-vaultd1-sqlite',
    title: 'Binding VaultD1 distributed SQLite to a Worker for transactional data',
    category: 'edge-compute',
    categoryLabel: 'Edge Compute',
    readTime: '9 min',
    difficulty: 'Advanced',
    excerpt: 'Execute ACID transactions on edge SQLite with automated read replicas and primary leader replication across regions.',
    tags: ['D1 SQLite', 'Database', 'SQL', 'Workers'],
  },
  {
    slug: 'streaming-web-streams-api',
    title: 'Handling streaming HTTP responses with Web Streams API at the edge',
    category: 'edge-compute',
    categoryLabel: 'Edge Compute',
    readTime: '8 min',
    difficulty: 'Intermediate',
    excerpt: 'Transform and proxy large file downloads or real-time LLM chat completions with zero memory buffer exhaustion.',
    tags: ['Streaming', 'Workers', 'HTTP', 'Performance'],
  },
  {
    slug: 'edge-cron-triggers',
    title: 'Deploying scheduled Cron Triggers and background queues at the edge',
    category: 'edge-compute',
    categoryLabel: 'Edge Compute',
    readTime: '5 min',
    difficulty: 'Beginner',
    excerpt: 'Run cron jobs and asynchronous queue workers on schedule without provisioning continuous virtual server instances.',
    tags: ['Cron', 'Queues', 'Workers', 'Automation'],
  },

  // AI Gateway & LLMs
  {
    slug: 'universal-openai-anthropic-proxy',
    title: 'Setting up universal OpenAI and Anthropic proxy with unified telemetry',
    category: 'ai-gateway',
    categoryLabel: 'AI Gateway',
    readTime: '6 min',
    difficulty: 'Intermediate',
    excerpt: 'Route requests to OpenAI, Anthropic, Mistral, and Google Gemini through a single unified endpoint with token telemetry.',
    tags: ['AI Gateway', 'OpenAI', 'Anthropic', 'LLMs'],
  },
  {
    slug: 'semantic-caching-vectorize',
    title: 'Configuring semantic caching with VaultVectorize to cut LLM costs 80%',
    category: 'ai-gateway',
    categoryLabel: 'AI Gateway',
    readTime: '9 min',
    difficulty: 'Advanced',
    excerpt: 'Cache similar semantic embeddings at edge PoPs so duplicate prompt queries return in under 15ms at zero LLM token cost.',
    tags: ['Vectorize', 'Caching', 'AI Gateway', 'Embeddings'],
  },
  {
    slug: 'model-fallback-chains',
    title: 'Configuring model fallback chains: Claude 3.5 Sonnet to GPT-4o failover',
    category: 'ai-gateway',
    categoryLabel: 'AI Gateway',
    readTime: '7 min',
    difficulty: 'Intermediate',
    excerpt: 'Ensure 100% LLM API uptime with automatic client retries and instant fallback to secondary AI providers during rate limits.',
    tags: ['AI Gateway', 'Resilience', 'Failover', 'LLMs'],
  },
  {
    slug: 'api-key-rate-limiting-budgets',
    title: 'Rate-limiting and budget caps per consumer API key in AI Gateway',
    category: 'ai-gateway',
    categoryLabel: 'AI Gateway',
    readTime: '5 min',
    difficulty: 'Beginner',
    excerpt: 'Prevent runaway LLM billing by setting hard dollar limits, hourly request throttles, and automated Slack webhook alerts.',
    tags: ['Rate Limiting', 'Budgets', 'AI Gateway', 'Security'],
  },
  {
    slug: 'streaming-llm-evals',
    title: 'Logging and inspecting real-time token latency and prompt completion telemetry',
    category: 'ai-gateway',
    categoryLabel: 'AI Gateway',
    readTime: '6 min',
    difficulty: 'Intermediate',
    excerpt: 'Track Time-To-First-Token (TTFT), tokens-per-second, and total prompt expense in our real-time observability dashboard.',
    tags: ['Telemetry', 'Observability', 'AI Gateway', 'Metrics'],
  },

  // Security & Zero Trust
  {
    slug: 'vaulttunnel-wireguard-setup',
    title: 'Setting up VaultTunnel with WireGuard for private serverless ingress',
    category: 'security',
    categoryLabel: 'Zero Trust',
    readTime: '8 min',
    difficulty: 'Intermediate',
    excerpt: 'Expose private on-premise servers and home labs securely to the internet without opening inbound firewall ports or NAT holes.',
    tags: ['Tunnel', 'WireGuard', 'Zero Trust', 'Security'],
  },
  {
    slug: 'waf-rules-wordpress-nextjs',
    title: 'Configuring WAF rules and OWASP Core Rule Set for WordPress and Next.js',
    category: 'security',
    categoryLabel: 'Edge Security',
    readTime: '7 min',
    difficulty: 'Intermediate',
    excerpt: 'Shield web applications against SQL injection, cross-site scripting (XSS), and zero-day CVE exploits with managed rule sets.',
    tags: ['WAF', 'Security', 'OWASP', 'WordPress'],
  },
  {
    slug: 'totp-step-up-auth',
    title: 'Enabling TOTP step-up authentication and FIDO2 WebAuthn security keys',
    category: 'security',
    categoryLabel: 'Account Security',
    readTime: '5 min',
    difficulty: 'Beginner',
    excerpt: 'Mandate hardware security keys (YubiKey) and authenticator apps for production deployments and billing modifications.',
    tags: ['Security', '2FA', 'TOTP', 'WebAuthn'],
  },
  {
    slug: 'post-quantum-tls-edge',
    title: 'Deploying Post-Quantum TLS (NIST FIPS 203 ML-KEM-768) at the edge',
    category: 'security',
    categoryLabel: 'Cryptography',
    readTime: '10 min',
    difficulty: 'Advanced',
    excerpt: 'Enable next-generation hybrid post-quantum key encapsulation to protect sensitive banking and corporate data from future quantum decryption.',
    tags: ['Post-Quantum', 'PQC', 'TLS 1.3', 'Cryptography'],
  },
  {
    slug: 'mitigating-layer7-ddos',
    title: 'Mitigating Layer 7 HTTP flood attacks using dynamic rate-limiting rules',
    category: 'security',
    categoryLabel: 'DDoS Defense',
    readTime: '7 min',
    difficulty: 'Intermediate',
    excerpt: 'Protect expensive API endpoints and login routes by blocking malicious botnets using behavioral client fingerprinting.',
    tags: ['DDoS', 'Rate Limiting', 'WAF', 'Bots'],
  },

  // Storage & Databases
  {
    slug: 'aws-sdk-vaultr2-s3-client',
    title: 'Using AWS SDK (S3Client) with VaultR2 S3-compatible object storage',
    category: 'storage',
    categoryLabel: 'Object Storage',
    readTime: '5 min',
    difficulty: 'Beginner',
    excerpt: 'Configure @aws-sdk/client-s3 in Node.js, Python boto3, or Go AWS SDK to seamlessly read and write files to VaultR2 buckets.',
    tags: ['S3 API', 'VaultR2', 'Storage', 'AWS'],
  },
  {
    slug: 'drizzle-orm-vaultd1-migrations',
    title: 'Running Drizzle ORM migrations and queries on VaultD1 distributed SQLite',
    category: 'storage',
    categoryLabel: 'SQL Databases',
    readTime: '8 min',
    difficulty: 'Intermediate',
    excerpt: 'Generate type-safe SQL schemas, execute batch transactions, and run atomic migrations on VaultD1 edge databases.',
    tags: ['D1 SQLite', 'Drizzle ORM', 'SQL', 'TypeScript'],
  },
  {
    slug: 'vector-search-vaultvectorize',
    title: 'Vector search with VaultVectorize and OpenAI text-embedding-3-small',
    category: 'storage',
    categoryLabel: 'Vector DB',
    readTime: '9 min',
    difficulty: 'Advanced',
    excerpt: 'Build lightning-fast Retrieval-Augmented Generation (RAG) pipelines with approximate nearest neighbor (ANN) vector indexing.',
    tags: ['Vectorize', 'AI', 'Embeddings', 'RAG'],
  },
  {
    slug: 'r2-object-lifecycle-tiering',
    title: 'Setting up automated object lifecycle policies, expiration, and tiering',
    category: 'storage',
    categoryLabel: 'Storage',
    readTime: '6 min',
    difficulty: 'Beginner',
    excerpt: 'Automatically purge stale staging uploads, delete old log files after 90 days, or transition files to archival storage.',
    tags: ['VaultR2', 'Storage', 'Lifecycle', 'S3 API'],
  },
  {
    slug: 'presigned-urls-client-uploads',
    title: 'Configuring Presigned URLs for direct secure client browser uploads',
    category: 'storage',
    categoryLabel: 'Storage',
    readTime: '7 min',
    difficulty: 'Intermediate',
    excerpt: 'Generate cryptographically signed temporary upload URLs so mobile and browser users can upload directly to R2 without hitting your server.',
    tags: ['S3 API', 'Presigned URLs', 'Storage', 'Security'],
  },

  // Billing & Account
  {
    slug: 'gst-invoices-indian-enterprises',
    title: 'Understanding GST invoices, B2B tax credits, and HSN compliance',
    category: 'billing',
    categoryLabel: 'Tax & Compliance',
    readTime: '4 min',
    difficulty: 'Beginner',
    excerpt: 'Enter your 15-digit GSTIN on the portal to receive automated monthly GST tax invoices with Input Tax Credit (ITC) eligibility.',
    tags: ['Billing', 'GST', 'Tax', 'Invoices'],
  },
  {
    slug: 'budget-alerts-threshold-webhooks',
    title: 'Setting up real-time budget alerts and automated threshold webhooks',
    category: 'billing',
    categoryLabel: 'FinOps',
    readTime: '5 min',
    difficulty: 'Beginner',
    excerpt: 'Configure tiered spending notifications at 50%, 80%, and 100% of your monthly cloud budget with webhook triggers.',
    tags: ['Billing', 'Budgets', 'Webhooks', 'Alerts'],
  },
  {
    slug: 'api-keys-team-rbac-roles',
    title: 'Managing granular API tokens and team RBAC permissions',
    category: 'billing',
    categoryLabel: 'Account & IAM',
    readTime: '6 min',
    difficulty: 'Intermediate',
    excerpt: 'Invite developers, billing managers, and auditors with least-privilege role-based access control and scoped API tokens.',
    tags: ['RBAC', 'IAM', 'Security', 'Billing'],
  },
  {
    slug: 'upi-cards-netbanking-payments',
    title: 'Configuring automatic billing with UPI Autopay, Net Banking, and corporate cards',
    category: 'billing',
    categoryLabel: 'Payments',
    readTime: '4 min',
    difficulty: 'Beginner',
    excerpt: 'Support recurring recurring subscriptions via UPI Mandates, Visa/Mastercard/RuPay corporate credit cards, and NEFT/RTGS.',
    tags: ['Payments', 'UPI', 'Billing', 'Cards'],
  },
  {
    slug: 'enterprise-sla-volume-contracts',
    title: 'Requesting enterprise custom SLAs, MSAs, and high-volume discounts',
    category: 'billing',
    categoryLabel: 'Enterprise Agreements',
    readTime: '5 min',
    difficulty: 'Intermediate',
    excerpt: 'Unlock tailored 99.999% uptime agreements, Master Services Agreements (MSAs), and dedicated account managers.',
    tags: ['Enterprise', 'SLA', 'Billing', 'Contracts'],
  },
];

export default function KnowledgeBasePage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGuides = useMemo(() => {
    return GUIDES.filter((guide) => {
      const matchesCategory = activeCategory === 'all' || guide.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesQuery =
        guide.title.toLowerCase().includes(q) ||
        guide.excerpt.toLowerCase().includes(q) ||
        guide.tags.some((t) => t.toLowerCase().includes(q)) ||
        guide.categoryLabel.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="v4-page pb-32">
      {/* Hero Section */}
      <PageHeroV4
        eyebrow="Knowledge Base"
        eyebrowIcon="file-text"
        title={
          <>
            Documentation, Guides, and <span className="text-signal">Tutorials</span>
          </>
        }
        description="Step-by-step documentation, architecture blueprints, CLI manuals, and API references to help you build, deploy, and scale on VaultHost."
      >
        {/* Interactive Search Bar & Popular Tags */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted-v4" />
            <input
              type="text"
              placeholder="Search 30+ guides (e.g. Next.js, S3 API, WireGuard, GST)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 text-sm sm:text-base rounded-xl bg-ink-surface border border-hairline text-text-primary-v4 placeholder:text-text-muted-v4 focus:outline-none focus:border-signal shadow-lg"
            />
          </div>

          {/* Quick Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
            <span className="text-text-muted-v4 font-mono text-[11px] uppercase mr-1">Popular:</span>
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="px-2.5 py-1 rounded-chip border border-hairline bg-ink-surface-2 text-text-secondary-v4 hover:text-signal hover:border-signal transition-colors font-mono text-[11px]"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </PageHeroV4>

      {/* 6 Knowledge Category Cards */}
      <section className="v4-section-sm border-t border-hairline bg-ink-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
              const count = GUIDES.filter((g) => g.category === cat.id).length;
              const isSelected = activeCategory === cat.id;

              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setSearchQuery('');
                  }}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-signal bg-ink-surface shadow-md ring-1 ring-signal/50'
                      : 'border-hairline bg-ink-surface/50 hover:border-hairline-2 hover:bg-ink-surface'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-ink-surface-2 border border-hairline flex items-center justify-center text-signal shrink-0">
                      <cat.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-text-primary-v4 truncate">{cat.label}</h3>
                        <span className="text-[11px] font-mono text-text-muted-v4">{count} guides</span>
                      </div>
                      <p className="text-xs text-text-secondary-v4 mt-1 leading-relaxed">{cat.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Catalog Section */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-hairline pb-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-btn text-xs font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'v4-btn-primary text-text-primary-v4'
                    : 'bg-ink-surface-2 border border-hairline text-text-secondary-v4 hover:text-text-primary-v4 hover:border-hairline-2'
                }`}
              >
                {cat.label} {cat.id === 'all' ? `(${GUIDES.length})` : ''}
              </button>
            ))}
          </div>

          {/* Guide Cards Grid */}
          <div className="grid md:grid-cols-2 gap-5">
            {filteredGuides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/vaulthost/kb/${guide.slug}`}
                className="group rounded-2xl border border-hairline bg-ink-surface/50 p-6 hover:border-signal/50 hover:bg-ink-surface transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="v4-readout text-[10px] uppercase font-mono px-2 py-0.5 rounded border border-hairline bg-ink-surface-2 text-signal">
                      {guide.categoryLabel}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-text-muted-v4 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {guide.readTime}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          guide.difficulty === 'Beginner'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : guide.difficulty === 'Intermediate'
                            ? 'bg-sky-500/10 text-sky-400'
                            : 'bg-purple-500/10 text-purple-400'
                        }`}
                      >
                        {guide.difficulty}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-text-primary-v4 group-hover:text-signal transition-colors leading-snug">
                    {guide.title}
                  </h3>
                  <p className="text-xs text-text-secondary-v4 mt-2 leading-relaxed">
                    {guide.excerpt}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-hairline/60 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {guide.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-mono text-text-muted-v4">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-signal font-medium inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Read Guide <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {filteredGuides.length === 0 && (
            <div className="text-center py-16 border border-hairline rounded-2xl bg-ink-surface">
              <HelpCircle className="h-10 w-10 text-text-muted-v4 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-text-primary-v4">No tutorials match your search query</h3>
              <p className="text-sm text-text-muted-v4 mt-1">
                Try searching for general keywords like &quot;Workers&quot;, &quot;S3&quot;, or &quot;DNS&quot;.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="mt-4 px-4 py-2 rounded-btn bg-ink-surface-2 border border-hairline text-xs text-signal hover:bg-ink-surface"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Support Escalation Card */}
      <section className="v4-section-sm bg-ink-surface/40 border-t border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-hairline bg-ink-surface p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-signal/10 border border-signal/30 flex items-center justify-center text-signal shrink-0">
                <Headphones className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary-v4">Can&apos;t find what you need?</h3>
                <p className="text-xs sm:text-sm text-text-secondary-v4 mt-1">
                  Our 24/7 cloud architects and system engineers are available to review architecture blueprints, debug DNS issues, and assist migrations.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/portal/support"
                className="px-5 py-2.5 rounded-btn v4-btn-primary text-xs font-medium inline-flex items-center gap-2"
              >
                Open Priority Ticket <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/contact"
                className="px-5 py-2.5 rounded-btn v4-btn-secondary text-xs font-medium"
              >
                Live Chat NOC
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Premium CTA */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-3xl border border-hairline p-8 sm:p-12 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(10,18,36,0.98), rgba(6,12,24,1))' }}
          >
            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="v4-readout text-xs px-2.5 py-1 rounded-chip border border-hairline bg-ink-surface-2 text-signal">
                Start Deploying
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold v4-display text-text-primary-v4 mt-4 mb-4">
                Ready to Build on VaultHost?
              </h2>
              <p className="text-sm sm:text-base text-text-secondary-v4 mb-8 leading-relaxed">
                Put these guides into practice. Launch edge workers, spin up NVMe servers, and store distributed data across 300+ PoPs in seconds.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/portal/signup"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-btn v4-btn-primary text-sm font-medium"
                >
                  Create Free Account <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/vaulthost/vps"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-btn v4-btn-secondary text-sm font-medium"
                >
                  Explore VPS &amp; Compute
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
