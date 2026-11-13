'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Zap, ArrowRight, Globe, Database, Shield, GitBranch, BrainCircuit, Check,
  Server, HardDrive, Lock, Network, Cpu, Layout, Boxes, Eye, Monitor,
  Mail, RefreshCw, Layers, ShieldCheck, Bot, Sparkles, Terminal, Activity,
  ArrowUpRight, BarChart3, Radio, FileText, CheckCircle2, ChevronRight, Cloud,
  Copy, Sliders, ExternalLink, Play, Search, Clock, Key,
  Workflow, MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { PanelCard } from '@/components/ui/panel-card';
import { InfrastructureSliderV4 } from '@/components/vaulthost/infrastructure-slider-v4';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase';

/* ══ REAL-TIME TICKER READOUTS ══ */
const TYPING_TEXTS = [
  '300+ Anycast Edge PoPs across 100+ countries.',
  'VaultWorkers: sub-5ms cold starts at global scale.',
  'VaultR2: Zero egress bandwidth fees forever.',
  'VaultAI Gateway: 15+ LLM providers via a single endpoint.',
  'Decoupled Intelligence: AI reasoning strictly isolated from infrastructure mutations.',
  'Post-Quantum Cryptography: ML-KEM-768 hybrid key exchange native.',
];

function TypingReadout() {
  const [textIdx, setTextIdx] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) { setDisplayText(TYPING_TEXTS[0]); return; }
    const fullText = TYPING_TEXTS[textIdx];
    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < fullText.length) {
          setDisplayText(fullText.slice(0, displayText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2400);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(fullText.slice(0, displayText.length - 1));
        } else {
          setIsDeleting(false);
          setTextIdx((prev) => (prev + 1) % TYPING_TEXTS.length);
        }
      }
    }, isDeleting ? 25 : 55);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, textIdx, reduced]);

  return (
    <div className="flex items-center gap-2 font-mono text-xs sm:text-sm text-text-secondary-v4 px-4 py-2 rounded-xl bg-ink-surface/80 border border-hairline/80 backdrop-blur-md">
      <span className="text-signal font-bold select-none">&gt;</span>
      <span className="text-text-primary-v4">{displayText}</span>
      <span className="inline-block w-2 h-4 bg-signal animate-pulse" />
    </div>
  );
}

/* ══ PLATFORM TELEMETRY STATS ══ */
const PLATFORM_STATS = [
  { value: '300+', label: 'Anycast Edge PoPs', sub: 'Autonomous BGP routing globally' },
  { value: '<5ms', label: 'Edge Cold Start', sub: 'V8 isolate execution' },
  { value: '₹0.00', label: 'Egress Fees', sub: 'Zero bandwidth tax on VaultR2' },
  { value: '12 Tbps', label: 'DDoS Scrubbing', sub: 'Always-on unmetered mitigation' },
  { value: '15+', label: 'AI Gateway Models', sub: 'Semantic caching & failover' },
  { value: '99.999%', label: 'Uptime SLA', sub: 'Enterprise post-quantum network' },
];

/* ══ 6 COMPREHENSIVE PRODUCT PILLARS (Top 0.5% Cloud Platform) ══ */
const PRODUCT_CATEGORIES = [
  {
    id: 'compute',
    name: 'Compute & Serverless',
    icon: Cpu,
    tagline: 'V8 isolates, serverless containers, Jamstack SSR, and distributed functions',
    products: [
      {
        title: 'VaultWorkers',
        desc: 'Execute JavaScript, TypeScript, Python & Rust at 300+ global edge locations. Sub-5ms cold starts.',
        href: '/vaulthost/workers',
        icon: Zap,
        badge: 'Edge V8',
      },
      {
        title: 'Serverless Functions',
        desc: 'Event-driven compute with automated micro-scaling, zero idle costs, and 15-minute execution limits.',
        href: '/vaulthost/serverless',
        icon: Cloud,
        badge: 'Zero-Ops',
      },
      {
        title: 'VaultContainers (K8s)',
        desc: 'Fully managed Kubernetes with GPU node pools, auto-scaling 0→1000 pods, and private container registry.',
        href: '/vaulthost/containers',
        icon: Boxes,
        badge: 'Managed K8s',
      },
      {
        title: 'VaultPages',
        desc: 'Git-connected Jamstack & SSR deployments with preview URLs per pull request and global caching.',
        href: '/vaulthost/pages',
        icon: Layout,
        badge: 'Next.js & SSR',
      },
      {
        title: 'VPS & Cloud VMs',
        desc: 'Dedicated vCPU and NVMe storage with full root access, snapshot backups, and custom ISOs in Mumbai & global.',
        href: '/vaulthost/vps',
        icon: Monitor,
        badge: 'KVM Slices',
      },
      {
        title: 'VaultCron',
        desc: 'Declarative cron triggers that execute Workers on precision schedules without dedicated cron servers.',
        href: '/vaulthost/workers',
        icon: Clock,
        badge: 'Scheduled',
      },
    ],
  },
  {
    id: 'storage',
    name: 'Storage & Databases',
    icon: HardDrive,
    tagline: 'Distributed SQLite, S3-compatible storage, key-value, and vector DB',
    products: [
      {
        title: 'VaultR2 Object Storage',
        desc: 'S3-compatible object storage with ZERO egress fees. Store petabytes without surprise bandwidth invoices.',
        href: '/vaulthost/storage',
        icon: HardDrive,
        badge: 'Zero Egress',
      },
      {
        title: 'VaultKV Store',
        desc: 'Globally replicated key-value storage. Read anywhere in under 10ms with automatic edge caching.',
        href: '/vaulthost/kv',
        icon: Database,
        badge: '<10ms Reads',
      },
      {
        title: 'VaultD1 Edge SQL',
        desc: 'Serverless SQLite at the edge. Write once, query from every continent. Drizzle & Prisma native.',
        href: '/vaulthost/database',
        icon: Database,
        badge: 'Edge SQLite',
      },
      {
        title: 'VaultVectorize',
        desc: 'High-dimensional vector database for semantic search, RAG pipelines, and AI recommendation engines.',
        href: '/vaulthost/vectorize',
        icon: BrainCircuit,
        badge: 'AI Vectors',
      },
      {
        title: 'VaultQueues',
        desc: 'Durable message queuing with exactly-once delivery, dead-letter queues, and Workers consumption.',
        href: '/vaulthost/queues',
        icon: Layers,
        badge: 'Durable Queue',
      },
      {
        title: 'Managed Databases',
        desc: 'Automated clustering for PostgreSQL, MySQL, Redis, and MongoDB with point-in-time recovery.',
        href: '/vaulthost/managed-databases',
        icon: Server,
        badge: '99.999% HA',
      },
    ],
  },
  {
    id: 'network',
    name: 'Network & Routing',
    icon: Network,
    tagline: 'Global Anycast DNS, CDN, smart load balancing, and secure ingress',
    products: [
      {
        title: 'VaultDNS',
        desc: 'Authoritative Anycast DNS with <11ms resolution time, 100% uptime SLA, DNSSEC, and GeoDNS routing.',
        href: '/vaulthost/dns',
        icon: Network,
        badge: '11ms Anycast',
      },
      {
        title: 'Global Edge CDN',
        desc: 'Content delivery across 300+ PoPs with HTTP/3, QUIC, tiered cache, and Brotli compression.',
        href: '/vaulthost/edge',
        icon: Globe,
        badge: 'HTTP/3 & QUIC',
      },
      {
        title: 'VaultLoadBalancer',
        desc: 'Intelligent traffic steering with active health-check failover, geo-steering, and session persistence.',
        href: '/vaulthost/load-balancer',
        icon: RefreshCw,
        badge: 'Active Steering',
      },
      {
        title: 'VaultTunnel (Zero-Port)',
        desc: 'Expose private local services, databases, or k8s clusters to the edge without opening firewall ports.',
        href: '/vaulthost/tunnel',
        icon: Lock,
        badge: 'cloudflared Compatible',
      },
      {
        title: 'VaultDomains',
        desc: 'Register and manage 400+ TLDs (.com, .in, .io) with free WHOIS privacy and automated DNSSEC.',
        href: '/vaulthost/domains',
        icon: Globe,
        badge: 'Free WHOIS',
      },
      {
        title: 'SSL/TLS Automated Certs',
        desc: 'Automated Let’s Encrypt wildcard certificates, custom cert upload, and 0-RTT TLS session resumption.',
        href: '/vaulthost/ssl',
        icon: Key,
        badge: 'Auto-Renew',
      },
    ],
  },
  {
    id: 'security',
    name: 'Security & Zero Trust',
    icon: Shield,
    tagline: 'Unmetered DDoS mitigation, WAF, bot defense, and identity access proxy',
    products: [
      {
        title: 'DDoS Protection',
        desc: 'Always-on unmetered mitigation against L3/L4/L7 floods. 12 Tbps scrubbing capacity absorbs any attack.',
        href: '/vaulthost/ddos',
        icon: ShieldCheck,
        badge: 'Always-On Free',
      },
      {
        title: 'Cloud WAF',
        desc: 'Managed rulesets for OWASP Top 10, zero-day CVE patches in <6 hours, and custom regex expressions.',
        href: '/vaulthost/security',
        icon: Shield,
        badge: 'OWASP Top 10',
      },
      {
        title: 'Bot Management',
        desc: 'ML-based behavioral fingerprinting, JavaScript challenge, and credential stuffing defense.',
        href: '/vaulthost/bot-management',
        icon: Eye,
        badge: 'ML Detection',
      },
      {
        title: 'Zero Trust Access',
        desc: 'Replace corporate VPNs. Identity-aware access proxy with SSO, MFA, and device posture checks.',
        href: '/vaulthost/zero-trust',
        icon: Lock,
        badge: 'No VPN Needed',
      },
      {
        title: 'Post-Quantum Encryption',
        desc: 'Hybrid post-quantum key encapsulation (ML-KEM-768 + X25519) and digital signatures (ML-DSA-65).',
        href: '/docs/developer',
        icon: Key,
        badge: 'PQC Ready',
      },
      {
        title: 'Action Gateway Security',
        desc: 'Cryptographic execution plane that prevents AI agents or scripts from executing unverified infrastructure mutations.',
        href: '/docs/ai-agent',
        icon: ShieldCheck,
        badge: 'Decoupled Intel',
      },
    ],
  },
  {
    id: 'ai',
    name: 'AI & Autonomous Agents',
    icon: Bot,
    tagline: 'Universal AI gateway, serverless inference, and multi-agent execution safety',
    products: [
      {
        title: 'VaultAI Gateway',
        desc: 'Route across 15+ AI providers (OpenAI, Claude, Gemini, Groq, DeepSeek). Cut costs up to 60% with semantic caching.',
        href: '/vaulthost/ai-gateway',
        icon: Bot,
        badge: '15+ Providers',
      },
      {
        title: 'VaultInference (Edge AI)',
        desc: 'Run Llama 3.3, Whisper, and SDXL models serverlessly at edge PoPs. Pay strictly per generated token.',
        href: '/vaulthost/inference',
        icon: Cpu,
        badge: 'Serverless GPUs',
      },
      {
        title: 'VaultAI Pipelines',
        desc: 'Visual workflow canvas for document ETL, multi-agent chains, content summarization, and vector ingestion.',
        href: '/vaulthost/ai-pipelines',
        icon: GitBranch,
        badge: 'No-Code Canvas',
      },
      {
        title: 'VaultAIOps',
        desc: 'AI-assisted cloud management. Autonomous agents query metrics, propose changes, and execute via Action Gateway.',
        href: '/vaulthost/ai-ops',
        icon: BrainCircuit,
        badge: 'Safe Agent Exec',
      },
      {
        title: 'MCP Server Ecosystem',
        desc: 'Anthropic Model Context Protocol server exposing VaultHost tools to Claude Desktop, Cursor, and Windsurf.',
        href: '/docs/ai-agent',
        icon: Terminal,
        badge: 'JSON-RPC 2.0',
      },
      {
        title: 'Semantic Cache Layer',
        desc: 'High-speed edge cache that recognizes semantically identical questions and answers in <2ms at zero token cost.',
        href: '/vaulthost/ai-gateway',
        icon: Sparkles,
        badge: '<2ms Hit',
      },
    ],
  },
  {
    id: 'developer',
    name: 'Developer Platform & Media',
    icon: Terminal,
    tagline: 'Video streaming, image transforms, analytics, and CI/CD pipelines',
    products: [
      {
        title: 'VaultStream (Video)',
        desc: 'Global video ingestion, automated HLS/DASH adaptive bitrate transcoding, and responsive player SDK.',
        href: '/vaulthost/stream',
        icon: Monitor,
        badge: 'HLS Transcode',
      },
      {
        title: 'VaultImages',
        desc: 'On-the-fly image resizing, smart AI cropping, and WebP/AVIF compression straight from the edge CDN.',
        href: '/vaulthost/images',
        icon: Eye,
        badge: 'WebP & AVIF',
      },
      {
        title: 'VaultAnalytics',
        desc: 'Privacy-first, cookieless web analytics with Core Web Vitals monitoring and zero consent banners needed.',
        href: '/vaulthost/analytics',
        icon: BarChart3,
        badge: 'Cookieless',
      },
      {
        title: 'Custom Email Routing',
        desc: 'Receive @yourdomain emails and forward to any inbox or parse incoming emails programmatically with Workers.',
        href: '/vaulthost/email-routing',
        icon: Mail,
        badge: 'Serverless Mail',
      },
      {
        title: 'VaultMonitor (Observability)',
        desc: 'Full-stack infrastructure APM, log streaming, distributed tracing, and OpenTelemetry instrumentation.',
        href: '/vaulthost/monitoring',
        icon: Activity,
        badge: 'OpenTelemetry',
      },
      {
        title: 'CI/CD Pipelines',
        desc: 'Automated test, build, and deploy cycles triggered by Git push. 60-second delivery to production.',
        href: '/vaulthost/ci-cd',
        icon: RefreshCw,
        badge: 'Git-to-Edge',
      },
    ],
  },
  {
    id: 'saas',
    name: 'Open-Source SaaS Platform',
    icon: Layers,
    tagline: 'Enterprise-grade managed open-source alternatives for Indian data sovereignty',
    products: [
      {
        title: 'VaultBase (Managed Supabase)',
        desc: 'Postgres 16, Auth, Realtime, Storage, and Edge Functions on Indian Tier-IV data centers.',
        href: '/vaulthost/managed-supabase',
        icon: Database,
        badge: 'Supabase PaaS',
      },
      {
        title: 'VaultGit',
        desc: 'Self-hosted Git with CI/CD Actions, code review, issues, and container registry. Code stays in India.',
        href: '/vaulthost/vaultgit',
        icon: GitBranch,
        badge: 'Gitea Git',
      },
      {
        title: 'VaultAutomation',
        desc: 'Managed n8n workflow canvas. Connect 400+ apps visually without code or Zapier price penalties.',
        href: '/vaulthost/vaultautomation',
        icon: Workflow,
        badge: 'Managed n8n',
      },
      {
        title: 'VaultAnalytics',
        desc: 'Cookieless web analytics (Plausible) and SQL business intelligence dashboards (Metabase) unified.',
        href: '/vaulthost/vaultanalytics',
        icon: BarChart3,
        badge: 'Plausible + Metabase',
      },
      {
        title: 'VaultChat',
        desc: 'Enterprise messaging built on Mattermost. Slack-compatible channels and threads with Indian data residency.',
        href: '/vaulthost/vaultchat',
        icon: MessageSquare,
        badge: 'Mattermost Chat',
      },
    ],
  },
];

/* ══ CLOUDFLARE / AWS COMPARISON MATRIX ══ */
const COMPARISONS = [
  {
    feature: 'Egress Bandwidth Pricing',
    vaulthost: '₹0.00 / FREE on VaultR2',
    cloudflare: 'Free on R2 only',
    aws: 'Up to $0.09/GB (massive bill shock)',
    highlight: true,
  },
  {
    feature: 'Edge Workers Free Tier',
    vaulthost: '100,000 req/day + D1 & KV free',
    cloudflare: '100,000 req/day',
    aws: 'No edge free tier (Lambda charges immediately)',
    highlight: false,
  },
  {
    feature: 'AI Gateway (15+ Providers)',
    vaulthost: 'Built-in + Semantic Caching',
    cloudflare: 'Basic caching only',
    aws: 'Bedrock only (complex IAM & lock-in)',
    highlight: true,
  },
  {
    feature: 'Decoupled Intelligence Safety',
    vaulthost: 'Cryptographic Action Gateway & HMAC Ledger',
    cloudflare: 'None (no agent safety plane)',
    aws: 'Complex AWS IAM with high hallucination risk',
    highlight: true,
  },
  {
    feature: 'DDoS Mitigation',
    vaulthost: 'Always-On Unmetered L3/L4/L7 Free',
    cloudflare: 'Included',
    aws: 'Shield Advanced ($3,000/mo base fee)',
    highlight: false,
  },
  {
    feature: 'Zero Trust Access',
    vaulthost: '1-click Tunnel + Built-in SSO',
    cloudflare: 'Complex dashboard configuration',
    aws: 'AWS Client VPN ($0.15/hr per connection)',
    highlight: false,
  },
  {
    feature: 'India Data Residency & INR',
    vaulthost: 'Native Mumbai/BLR DCs + GST Invoicing',
    cloudflare: 'Billed in USD with FX fees',
    aws: 'USD billing + complex currency conversion',
    highlight: true,
  },
  {
    feature: 'Developer Pro Flat Tier',
    vaulthost: '₹999/mo (Predictable, no overages)',
    cloudflare: '$20/mo (₹1,670+ with hidden limits)',
    aws: 'Completely unpredictable bill surprises',
    highlight: false,
  },
];

/* ══ REGIONAL PING SIMULATOR DATA ══ */
const REGIONS = [
  { code: 'BOM', city: 'Mumbai', ping: '3.4ms', status: 'Operational', colo: 'IN-WEST-1' },
  { code: 'SIN', city: 'Singapore', ping: '11.2ms', status: 'Operational', colo: 'AP-SE-1' },
  { code: 'FRA', city: 'Frankfurt', ping: '18.6ms', status: 'Operational', colo: 'EU-CENTRAL-1' },
  { code: 'SJC', city: 'San Jose', ping: '24.1ms', status: 'Operational', colo: 'US-WEST-1' },
  { code: 'NRT', city: 'Tokyo', ping: '14.8ms', status: 'Operational', colo: 'AP-NE-1' },
  { code: 'LHR', city: 'London', ping: '17.3ms', status: 'Operational', colo: 'EU-WEST-1' },
  { code: 'DXB', city: 'Dubai', ping: '7.9ms', status: 'Operational', colo: 'ME-CENTRAL-1' },
];

export default function VaultHostHomeContent() {
  const [activeCategory, setActiveCategory] = useState('compute');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCockpitTab, setActiveCockpitTab] = useState<'anycast' | 'ai' | 'calculator' | 'tunnel'>('anycast');
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]);
  const [copiedCmd, setCopiedCmd] = useState(false);

  // AI Simulator state
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [cacheHit, setCacheHit] = useState(true);

  // Egress Calculator state
  const [calcStorage, setCalcStorage] = useState(1000); // GB
  const [calcEgress, setCalcEgress] = useState(5); // TB

  const awsCost = useMemo(() => {
    // AWS S3 storage ~$0.023/GB + Egress $0.09/GB ($90/TB)
    const storageCost = calcStorage * 0.023;
    const egressCost = calcEgress * 90;
    return Math.round(storageCost + egressCost);
  }, [calcStorage, calcEgress]);

  const vaultHostCost = useMemo(() => {
    // VaultR2 storage ~$0.015/GB (Rs 1.25/GB) + ZERO EGRESS
    const storageCost = calcStorage * 0.015;
    return Math.max(0, Math.round(storageCost));
  }, [calcStorage]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return PRODUCT_CATEGORIES;
    const q = searchQuery.toLowerCase();
    return PRODUCT_CATEGORIES.map((cat) => ({
      ...cat,
      products: cat.products.filter(
        (p) => p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.badge.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.products.length > 0);
  }, [searchQuery]);

  const currentCategoryData =
    filteredCategories.find((c) => c.id === activeCategory) || filteredCategories[0] || PRODUCT_CATEGORIES[0];

  return (
    <div className="v4-page pb-32">
      {/* ═══════════════════════════════════════════════════════════════════════
          1. HERO SECTION (Planet-Grade High-Tech Cockpit)
          ═══════════════════════════════════════════════════════════════════════ */}
      <section
        className="relative pt-8 pb-20 overflow-hidden border-b border-hairline"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.14) 0%, rgba(10, 18, 36, 0) 70%), linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 48px 48px, 48px 48px',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Announcement Bar */}
          <div className="flex justify-center mb-8">
            <Link
              href="/vaulthost/workers"
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-signal/30 bg-signal/10 hover:bg-signal/15 transition-all text-xs text-text-primary-v4 group"
            >
              <span className="flex h-2 w-2 rounded-full bg-signal animate-ping" />
              <span className="font-semibold text-signal uppercase tracking-wider text-[11px]">VaultHost 4.0</span>
              <span className="text-hairline-2">|</span>
              <span className="text-text-secondary-v4">Anycast Edge + Decoupled Intelligence Live</span>
              <ArrowRight className="h-3.5 w-3.5 text-signal transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Main Headline */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl v4-display text-text-primary-v4 tracking-tight leading-[1.08]">
              Cloudflare Speed. AWS Scale.{' '}
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-signal via-cyan-300 to-emerald-400">
                Zero Egress Taxes.
              </span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-text-secondary-v4 max-w-2xl mx-auto leading-relaxed">
              Planetary edge infrastructure engineered for high-performance applications.
              Execute serverless V8 isolates across 300+ Anycast PoPs in under 5ms, store petabytes with ₹0 bandwidth taxes, and route 15+ AI models through an unshakeable execution plane.
            </p>

            {/* CTAs and Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/portal/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-btn v4-btn-primary text-sm font-semibold shadow-glow hover:shadow-lg transition-all"
              >
                Start for Free (100K req/day) <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#products"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-btn v4-btn-secondary text-sm font-medium border border-hairline hover:border-signal/40 transition-colors"
              >
                Explore 32 Cloud Services
              </a>
              <Link
                href="/vaulthost/compare"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-btn border border-hairline bg-ink-surface text-sm text-text-secondary-v4 hover:text-signal transition-colors"
              >
                Compare vs AWS &amp; Cloudflare
              </Link>
            </div>

            {/* Trust highlights */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-5 text-xs text-text-muted-v4 font-medium">
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-good" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-good" /> 99.999% SLA Guarantee</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-good" /> Sub-5ms Global Response</span>
            </div>

            {/* CLI Fast-Track Command */}
            <div className="mt-6 inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-ink-surface-2/90 border border-hairline font-mono text-xs text-text-secondary-v4 max-w-xl mx-auto shadow-md">
              <span className="text-signal select-none font-bold">$</span>
              <code className="text-good font-semibold">curl -fsSL https://get.vaulthost.cloud | sh</code>
              <button
                onClick={() => copyToClipboard('curl -fsSL https://get.vaulthost.cloud | sh')}
                className="ml-auto flex items-center gap-1 text-[11px] text-text-muted-v4 hover:text-signal transition-colors px-2 py-0.5 rounded bg-ink border border-hairline"
                title="Copy command"
              >
                {copiedCmd ? <Check className="h-3 w-3 text-good" /> : <Copy className="h-3 w-3" />}
                <span className="hidden sm:inline">{copiedCmd ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Typing Readout ticker */}
            <div className="mt-5 flex justify-center">
              <TypingReadout />
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              HERO INTERACTIVE COCKPIT (Anycast & AI Fleet Simulator)
              ═══════════════════════════════════════════════════════════════════ */}
          <div className="mt-14 max-w-5xl mx-auto rounded-3xl border border-signal/30 bg-ink-surface shadow-2xl overflow-hidden backdrop-blur-xl">
            {/* Cockpit Window Header */}
            <div className="flex flex-wrap items-center justify-between px-5 py-3.5 border-b border-hairline bg-ink-surface-2/70 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
                <span className="ml-2 font-mono font-semibold text-text-primary-v4">
                  {'vaulthost-fleet-cockpit // v4.2-live'}
                </span>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 mt-2 sm:mt-0 font-medium">
                {[
                  { id: 'anycast', label: '1. Anycast Edge Router', icon: Globe },
                  { id: 'ai', label: '2. AI Gateway Cache', icon: Bot },
                  { id: 'calculator', label: '3. Zero Egress vs AWS', icon: Sliders },
                  { id: 'tunnel', label: '4. Zero-Port Tunnel', icon: Lock },
                ].map((tab) => {
                  const active = activeCockpitTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveCockpitTab(tab.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        active
                          ? 'bg-signal/20 text-signal border border-signal/40 font-semibold'
                          : 'text-text-muted-v4 hover:text-text-primary-v4'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cockpit Tab Content */}
            <div className="p-6 sm:p-8">
              {/* TAB 1: ANYCAST EDGE ROUTER */}
              {activeCockpitTab === 'anycast' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary-v4 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-signal" />
                      Select Ingress Region to Test Sub-5ms Anycast Routing
                    </h3>
                    <p className="text-xs text-text-muted-v4 mt-0.5">
                      Requests hit the nearest of 300+ BGP Anycast edge PoPs with automatic DDoS scrubbing and instant V8 execution.
                    </p>
                  </div>

                  {/* Region Selectors */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {REGIONS.map((reg) => {
                      const selected = selectedRegion.code === reg.code;
                      return (
                        <button
                          key={reg.code}
                          onClick={() => setSelectedRegion(reg)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            selected
                              ? 'bg-signal/15 border-signal text-signal shadow-sm ring-1 ring-signal'
                              : 'bg-ink-surface-2 border-hairline text-text-secondary-v4 hover:border-hairline-2'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="font-bold">{reg.code}</span>
                            <span className="flex h-1.5 w-1.5 rounded-full bg-good" />
                          </div>
                          <div className="text-xs font-semibold text-text-primary-v4 mt-1">{reg.city}</div>
                          <div className="text-[10px] font-mono text-signal mt-0.5">{reg.ping}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Simulated Execution Trace */}
                  <div className="rounded-2xl border border-hairline bg-ink p-4 font-mono text-xs space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-text-muted-v4 pb-2 border-b border-hairline">
                      <span>TRACE ID: vh_tr_{selectedRegion.code.toLowerCase()}_98f2b1a</span>
                      <span className="text-good flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Handshake Verified
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-4 gap-2 text-[11px]">
                      <div className="p-2.5 rounded-lg bg-ink-surface-2 border border-hairline">
                        <span className="text-text-muted-v4 block text-[10px]">1. ANYCAST BGP</span>
                        <span className="text-signal font-semibold">{selectedRegion.colo}</span>
                        <span className="text-text-muted-v4 block text-[10px]">0.4ms route</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-ink-surface-2 border border-hairline">
                        <span className="text-text-muted-v4 block text-[10px]">2. WAF &amp; DDOS</span>
                        <span className="text-green-400 font-semibold">12 Tbps Scrubbed</span>
                        <span className="text-text-muted-v4 block text-[10px]">0.8ms threat check</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-ink-surface-2 border border-hairline">
                        <span className="text-text-muted-v4 block text-[10px]">3. V8 ISOLATE</span>
                        <span className="text-signal font-semibold">Cold Start &lt;2ms</span>
                        <span className="text-text-muted-v4 block text-[10px]">Edge compute active</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-ink-surface-2 border border-hairline">
                        <span className="text-text-muted-v4 block text-[10px]">4. TOTAL RTT</span>
                        <span className="text-good font-bold text-sm">{selectedRegion.ping}</span>
                        <span className="text-text-muted-v4 block text-[10px]">User to response</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AI GATEWAY & SEMANTIC CACHING */}
              {activeCockpitTab === 'ai' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary-v4 flex items-center gap-2">
                        <Bot className="h-4 w-4 text-signal" />
                        Universal AI Gateway with Semantic Caching
                      </h3>
                      <p className="text-xs text-text-muted-v4 mt-0.5">
                        Proxy requests to OpenAI, Anthropic, Gemini, DeepSeek, or Groq through one endpoint.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted-v4">Cache Mode:</span>
                      <button
                        onClick={() => setCacheHit(!cacheHit)}
                        className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-colors ${
                          cacheHit ? 'bg-good/20 text-good border border-good/40' : 'bg-warn/20 text-warn border border-warn/40'
                        }`}
                      >
                        {cacheHit ? 'CACHE HIT (100% Free)' : 'CACHE MISS (Direct Route)'}
                      </button>
                    </div>
                  </div>

                  {/* Model Selector */}
                  <div className="flex flex-wrap gap-2">
                    {['gpt-4o', 'claude-3-5-sonnet', 'gemini-2-flash', 'deepseek-v3', 'llama-3-3-70b'].map((m) => (
                      <button
                        key={m}
                        onClick={() => setSelectedModel(m)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                          selectedModel === m
                            ? 'bg-signal/20 text-signal border border-signal font-semibold'
                            : 'bg-ink-surface-2 border border-hairline text-text-secondary-v4'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  {/* Live Simulation Visualizer */}
                  <div className="grid sm:grid-cols-3 gap-3 font-mono text-xs">
                    <div className="p-4 rounded-xl bg-ink border border-hairline">
                      <span className="text-text-muted-v4 text-[10px] block">ROUTED PROVIDER</span>
                      <span className="text-text-primary-v4 font-bold text-sm">{selectedModel}</span>
                      <span className="text-signal text-[11px] block mt-1">Universal Base URL active</span>
                    </div>
                    <div className="p-4 rounded-xl bg-ink border border-hairline">
                      <span className="text-text-muted-v4 text-[10px] block">INFERENCE LATENCY</span>
                      <span className={`font-bold text-sm ${cacheHit ? 'text-good' : 'text-signal'}`}>
                        {cacheHit ? '1.8ms (Cache)' : '420ms (Provider API)'}
                      </span>
                      <span className="text-text-muted-v4 text-[11px] block mt-1">
                        {cacheHit ? 'Instant vector match' : 'Full GPU computation'}
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-ink border border-hairline">
                      <span className="text-text-muted-v4 text-[10px] block">REQUEST COST</span>
                      <span className={`font-bold text-sm ${cacheHit ? 'text-good' : 'text-text-primary-v4'}`}>
                        {cacheHit ? '$0.00 (Saved 100%)' : '$0.015 (Standard)'}
                      </span>
                      <span className="text-text-muted-v4 text-[11px] block mt-1">
                        {cacheHit ? 'Zero tokens consumed' : 'Billable token tier'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ZERO EGRESS CALCULATOR */}
              {activeCockpitTab === 'calculator' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary-v4 flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-signal" />
                      VaultR2 Zero-Egress Calculator vs. AWS S3
                    </h3>
                    <p className="text-xs text-text-muted-v4 mt-0.5">
                      AWS charges up to $0.09/GB just to download your own data. VaultHost charges ₹0 egress forever.
                    </p>
                  </div>

                  {/* Sliders */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-text-secondary-v4">Stored Objects:</span>
                        <span className="text-signal font-bold">{calcStorage} GB ({calcStorage >= 1000 ? (calcStorage/1000).toFixed(1)+'TB' : calcStorage+'GB'})</span>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="20000"
                        step="100"
                        value={calcStorage}
                        onChange={(e) => setCalcStorage(Number(e.target.value))}
                        className="w-full accent-signal"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-text-secondary-v4">Monthly Egress Bandwidth:</span>
                        <span className="text-signal font-bold">{calcEgress} TB/month</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        step="1"
                        value={calcEgress}
                        onChange={(e) => setCalcEgress(Number(e.target.value))}
                        className="w-full accent-signal"
                      />
                    </div>
                  </div>

                  {/* Bill Comparison Card */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5">
                      <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">AWS S3 Projected Bill</span>
                      <div className="text-3xl font-extrabold font-mono text-red-400 mt-2">${awsCost} / mo</div>
                      <p className="text-xs text-text-muted-v4 mt-1">Includes ${calcEgress * 90}/mo in egress bandwidth penalty fees alone.</p>
                    </div>

                    <div className="p-4 rounded-xl border border-good/40 bg-good/5">
                      <span className="text-xs font-bold text-good uppercase tracking-wider block">VaultR2 Storage Bill</span>
                      <div className="text-3xl font-extrabold font-mono text-good mt-2">${vaultHostCost} / mo</div>
                      <p className="text-xs text-text-muted-v4 mt-1">Zero egress fees. You save ${(awsCost - vaultHostCost).toLocaleString()}/mo (95%+ savings)!</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: ZERO-PORT TUNNEL */}
              {activeCockpitTab === 'tunnel' && (
                <div className="space-y-4 font-mono text-xs">
                  <div>
                    <h3 className="text-sm font-semibold font-sans text-text-primary-v4 flex items-center gap-2">
                      <Lock className="h-4 w-4 text-signal" />
                      VaultTunnel — Expose Localhost with WireGuard Encryption
                    </h3>
                    <p className="text-xs font-sans text-text-muted-v4 mt-0.5">
                      No port forwarding. No public IPs. Compatible with standard cloudflared tunnel CLI syntax.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-ink border border-hairline p-4 space-y-2 text-text-secondary-v4">
                    <p className="text-text-muted-v4 text-[11px]">{'// 1. Run local tunnel to your port 3000'}</p>
                    <p className="text-green-400">$ vaulthost tunnel run --url http://localhost:3000 my-app</p>
                    <div className="pt-2 text-[11px] space-y-1 text-text-muted-v4 border-t border-hairline/60">
                      <p className="text-signal">[INFO] Establishing WireGuard tunnel to BOM (Mumbai Edge)...</p>
                      <p className="text-good">[CONNECTED] Tunnel active: https://my-app.vaulthost.site</p>
                      <p className="text-text-secondary-v4">[SECURITY] TLS 1.3 + ML-KEM-768 Handshake Confirmed • Zero Inbound Open Ports</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          2. PLANETARY TELEMETRY STRIP (Edge Live Metrics)
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-8 border-b border-hairline bg-ink-surface/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            {PLATFORM_STATS.map((stat) => (
              <div key={stat.label} className="p-3 rounded-2xl bg-ink-surface-2/40 border border-hairline/60">
                <p className="text-2xl sm:text-3xl font-extrabold v4-display text-signal font-mono">{stat.value}</p>
                <p className="text-xs font-semibold text-text-primary-v4 uppercase tracking-wider mt-1">{stat.label}</p>
                <p className="text-[10px] text-text-muted-v4 mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          3. COMPREHENSIVE PRODUCT SUITE MATRIX (32 Production Products)
          ═══════════════════════════════════════════════════════════════════════ */}
      <section id="products" className="v4-section bg-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="v4-readout text-[11px] font-semibold uppercase tracking-widest text-signal px-3 py-1 rounded-full border border-signal/30 bg-signal/10 inline-block mb-3">
              Full Cloud Ecosystem
            </span>
            <h2 className="text-3xl sm:text-5xl v4-display text-text-primary-v4">
              Everything Cloudflare &amp; AWS Offer — <span className="text-signal">Unified.</span>
            </h2>
            <p className="mt-4 text-base text-text-secondary-v4 leading-relaxed">
              Explore 32 production-grade cloud primitives engineered for low latency, zero egress taxes, and AI-native safety.
            </p>

            {/* Product Quick-Search Bar */}
            <div className="mt-6 max-w-md mx-auto relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted-v4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any service (e.g. DNS, Workers, AI, Storage, K8s)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-hairline bg-ink-surface text-sm text-text-primary-v4 placeholder:text-text-muted-v4 focus:outline-none focus:border-signal transition-colors shadow-sm"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {filteredCategories.map((cat) => {
              const active = activeCategory === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 border ${
                    active
                      ? 'bg-signal/20 text-signal border-signal/50 shadow-sm font-semibold'
                      : 'bg-ink-surface border-hairline text-text-secondary-v4 hover:text-text-primary-v4 hover:border-hairline-2'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-signal' : 'text-text-muted-v4'}`} />
                  {cat.name}
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-ink-surface-2 text-text-muted-v4">
                    {cat.products.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Category Subhead */}
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-hairline">
            <div>
              <h3 className="text-lg font-bold text-text-primary-v4 flex items-center gap-2">
                <currentCategoryData.icon className="h-5 w-5 text-signal" />
                {currentCategoryData.name}
              </h3>
              <p className="text-xs text-text-muted-v4 mt-0.5">{currentCategoryData.tagline}</p>
            </div>
            <span className="text-xs font-mono text-signal bg-signal/10 px-2.5 py-1 rounded-full border border-signal/20">
              {currentCategoryData.products.length} Services Live
            </span>
          </div>

          {/* Product Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentCategoryData.products.map((p) => {
              const Icon = p.icon;
              return (
                <Link key={p.title} href={p.href} className="group block h-full">
                  <PanelCard className="p-6 h-full flex flex-col justify-between border-hairline hover:border-signal/50 transition-all duration-200 group-hover:-translate-y-1">
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-hairline bg-ink-surface-2 group-hover:bg-signal/15 group-hover:text-signal group-hover:border-signal/30 transition-all">
                          <Icon className="h-5 w-5 text-signal" />
                        </div>
                        <span className="v4-readout text-[10px] px-2.5 py-1 rounded-full border border-hairline bg-ink-surface-2 text-text-muted-v4 group-hover:border-signal/30 group-hover:text-signal transition-colors font-mono">
                          {p.badge}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-text-primary-v4 group-hover:text-signal transition-colors flex items-center gap-1.5">
                        {p.title}
                        <ArrowUpRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-signal" />
                      </h4>
                      <p className="mt-2 text-xs sm:text-sm text-text-secondary-v4 leading-relaxed">{p.desc}</p>
                    </div>
                    <div className="mt-5 pt-3 border-t border-hairline/60 flex items-center justify-between text-xs text-signal font-semibold">
                      <span>Explore service</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </PanelCard>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          4. DECOUPLED INTELLIGENCE ARCHITECTURAL BLUEPRINT
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="v4-section-sm bg-ink-surface border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="v4-readout text-[11px] font-semibold uppercase tracking-widest text-signal px-3 py-1 rounded-full border border-signal/30 bg-signal/10 inline-block mb-3">
              Core Architectural Invariant
            </span>
            <h2 className="text-3xl sm:text-4xl v4-display text-text-primary-v4">
              Decoupled Intelligence: AI Agents Never Touch Raw Infra
            </h2>
            <p className="mt-3 text-text-secondary-v4 text-sm sm:text-base leading-relaxed">
              Every other cloud allows AI models direct terminal or DB access, courting catastrophic hallucination outages.
              VaultHost enforces a strictly separated 3-Plane security architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Plane 1 */}
            <PanelCard className="p-6 border-hairline relative">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-signal mb-3">
                <BrainCircuit className="h-4 w-4" /> PLANE 1: REASONING PLANE
              </div>
              <h3 className="text-lg font-bold text-text-primary-v4 mb-2">Autonomous AI Models</h3>
              <p className="text-xs text-text-secondary-v4 leading-relaxed mb-4">
                Claude, GPT-4, Gemini, or open-weight models query metrics, analyze logs, and formulate ActionIntents.
                They operate as zero-privilege entities.
              </p>
              <div className="p-3 rounded-xl bg-ink font-mono text-[11px] text-green-400 border border-hairline">
                <code>ActionIntent: DeployWorker &#123; env: prod &#125;</code>
              </div>
            </PanelCard>

            {/* Plane 2 */}
            <PanelCard className="p-6 border-signal/40 bg-signal/5 relative ring-1 ring-signal/30">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-signal mb-3">
                <ShieldCheck className="h-4 w-4" /> PLANE 2: ACTION GATEWAY
              </div>
              <h3 className="text-lg font-bold text-text-primary-v4 mb-2">Deterministic Execution Plane</h3>
              <p className="text-xs text-text-secondary-v4 leading-relaxed mb-4">
                Validates tenant boundary, classifies Risk Tiers (0-3), demands TOTP step-up authentication,
                and commits signed entries to an immutable HMAC-SHA256 chained audit ledger.
              </p>
              <div className="p-3 rounded-xl bg-ink font-mono text-[11px] text-signal border border-hairline">
                <code>RiskTier: Tier 2 (Require 2FA Challenge)</code>
              </div>
            </PanelCard>

            {/* Plane 3 */}
            <PanelCard className="p-6 border-hairline relative">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-signal mb-3">
                <Server className="h-4 w-4" /> PLANE 3: INFRASTRUCTURE PLANE
              </div>
              <h3 className="text-lg font-bold text-text-primary-v4 mb-2">Physical Edge Fleet</h3>
              <p className="text-xs text-text-secondary-v4 leading-relaxed mb-4">
                Anycast edge nodes, V8 isolate runtimes, K8s GPU clusters, and NVMe storage execute strictly
                authorized, verified, and audited changes with instant rollback capability.
              </p>
              <div className="p-3 rounded-xl bg-ink font-mono text-[11px] text-text-muted-v4 border border-hairline">
                <code>Status: Deployed (300+ PoPs in 24s)</code>
              </div>
            </PanelCard>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/docs/ai-agent"
              className="inline-flex items-center gap-2 text-sm text-signal hover:underline font-semibold"
            >
              Read full Action Gateway Protocol &amp; Risk Taxonomy specification <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          5. TECHNICAL COMPARISON: VAULTHOST VS. CLOUDFLARE VS. AWS
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl v4-display text-text-primary-v4">
              Why Modern Teams Choose <span className="text-signal">VaultHost</span>
            </h2>
            <p className="mt-3 text-text-secondary-v4 text-sm sm:text-base">
              Predictable pricing, zero egress fees, built-in AI gateway, and post-quantum encryption.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-hairline bg-ink-surface shadow-lg">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-hairline bg-ink-surface-2 text-text-muted-v4 v4-readout text-[11px] uppercase tracking-wider">
                  <th className="py-4 px-6">Capability / Metric</th>
                  <th className="py-4 px-6 text-signal font-bold bg-signal/10">VaultHost Cloud</th>
                  <th className="py-4 px-6">Cloudflare</th>
                  <th className="py-4 px-6">AWS / Hyperscalers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {COMPARISONS.map((row) => (
                  <tr key={row.feature} className="hover:bg-ink-surface-2/40 transition-colors">
                    <td className="py-4 px-6 font-semibold text-text-primary-v4">{row.feature}</td>
                    <td className="py-4 px-6 font-semibold text-signal bg-signal/5 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-good" />
                      {row.vaulthost}
                    </td>
                    <td className="py-4 px-6 text-text-secondary-v4">{row.cloudflare}</td>
                    <td className="py-4 px-6 text-text-muted-v4">{row.aws}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/vaulthost/compare"
              className="inline-flex items-center gap-2 text-sm text-signal hover:underline font-semibold"
            >
              See detailed technical comparison matrix with feature-by-feature breakdown <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          6. CONFIGURE YOUR CUSTOM INFRASTRUCTURE SLIDER
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="v4-section-sm bg-ink-surface/50 border-t border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <h2 className="text-3xl v4-display text-text-primary-v4">Real-Time Infrastructure Calculator</h2>
            <p className="mt-3 text-text-secondary-v4 text-sm">
              Drag the sliders to estimate custom computing power, bandwidth, and edge nodes. No hidden add-ons.
            </p>
          </div>
          <InfrastructureSliderV4 />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          7. GLOBAL REGIONAL HEALTH & LOWEST-LATENCY RADAR
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="v4-section-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl v4-display text-text-primary-v4 flex items-center gap-2.5">
                <Activity className="h-5 w-5 text-signal" /> Global Edge Fleet Health
              </h2>
              <p className="text-xs text-text-muted-v4 mt-1">
                Real-time Anycast BGP latency pings across our tier-1 points of presence.
              </p>
            </div>
            <Link
              href="/vaulthost/status"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-signal hover:underline"
            >
              View Detailed System Status <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 font-mono text-xs">
            {REGIONS.map((r) => (
              <div key={r.code} className="p-3.5 rounded-2xl bg-ink-surface border border-hairline space-y-1">
                <div className="flex items-center justify-between text-text-muted-v4 text-[10px]">
                  <span>{r.code}</span>
                  <span className="flex h-2 w-2 rounded-full bg-good" />
                </div>
                <div className="font-sans font-bold text-text-primary-v4 text-sm">{r.city}</div>
                <div className="text-signal text-xs font-semibold">{r.ping}</div>
                <div className="text-[10px] text-text-muted-v4">{r.status}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          8. HIGH-CONVERSION ENTERPRISE CALL TO ACTION
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="v4-section-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="p-10 sm:p-12 text-center rounded-3xl border border-signal/40 shadow-2xl relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(14,24,48,0.98), rgba(8,14,28,1))' }}
          >
            <div
              className="absolute top-0 inset-x-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--v4-signal)), transparent)' }}
            />
            <span className="v4-readout text-[11px] font-semibold uppercase tracking-widest text-signal px-3.5 py-1 rounded-full border border-signal/30 bg-signal/15 inline-block mb-4">
              Get Started in 60 Seconds
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl v4-display text-text-primary-v4 tracking-tight">
              Ready to Escape the Hyperscaler Tax?
            </h2>
            <p className="mt-4 text-text-secondary-v4 max-w-xl mx-auto leading-relaxed text-sm sm:text-base">
              The always-free tier includes 100,000 Workers requests/day, 10GB VaultR2 storage,
              unmetered DDoS protection, and full access to VaultAI Gateway.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3.5 justify-center">
              <Link
                href="/portal/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-btn v4-btn-primary text-sm font-semibold shadow-glow"
              >
                Deploy Free in 60 Seconds <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-btn v4-btn-secondary text-sm font-medium"
              >
                Talk to Solutions Architect
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-text-muted-v4 font-medium">
              {['No credit card required', '100% SLA Guarantee', 'Sub-5ms global response', 'Cancel anytime'].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-good" /> {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
