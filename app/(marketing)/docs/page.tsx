'use client';

import Link from 'next/link';
import { 
  Bot, Code2, ShieldAlert, Building2, Handshake, ArrowRight, 
  Terminal, Lock, Cpu, Globe, CheckCircle2, BookOpen, Sparkles 
} from 'lucide-react';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

export default function DocsHubPage() {
  const personas = [
    {
      role: 'AI Agents & LLM Runtimes',
      href: '/docs/ai-agent',
      icon: Bot,
      color: 'text-cyan-400',
      badge: 'Machine-Readable',
      description:
        'Zero-ambiguity schemas, ActionIntent specifications, MCP tool definitions, and risk-tier taxonomies designed for autonomous reasoning engines.',
      topics: ['ActionIntent JSON Schema', 'Risk Tier Taxonomy (0-3)', 'MCP Server Spec', 'Delegation Scopes'],
    },
    {
      role: 'Developers & Platform Engineers',
      href: '/docs/developer',
      icon: Code2,
      color: 'text-signal',
      badge: 'Architecture & SDKs',
      description:
        'Architecture Decision Records (ADRs), Post-Quantum Cryptography integration, REST/JSON-RPC specs, and language SDKs.',
      topics: ['ADR-001 Decoupled Planes', 'PQC Hybrid Crypto (NIST)', 'MCP Client Connector', 'Edge Workers SDK'],
    },
    {
      role: 'Security & Staff Administrators',
      href: '/docs/admin',
      icon: ShieldAlert,
      color: 'text-red-400',
      badge: 'Runbooks & SOPs',
      description:
        'Operational procedures for managing Tier 3 Dual-Authorization Approval Queues, immutable audit verification, and emergency rollbacks.',
      topics: ['SOP-101 Tier 3 Approvals', 'Immutable Audit Verification', 'Emergency Policy Overrides', 'Node Attestation'],
    },
    {
      role: 'Enterprise Customers',
      href: '/docs/customer',
      icon: Building2,
      color: 'text-green-400',
      badge: 'Compliance & SLA',
      description:
        'SLA commitments (99.999%), SOC 2 Type II and ISO 27001 compliance, zero-egress billing guarantees, and tenant isolation.',
      topics: ['99.999% Edge SLA', 'Tenant Isolation Model', 'Zero Egress Billing', 'SOC 2 / ISO 27001'],
    },
    {
      role: 'Partners & SaaS Vendors',
      href: '/docs/partner',
      icon: Handshake,
      color: 'text-purple-400',
      badge: 'Zero-Scrape Integration',
      description:
        'Standards for integrating SaaS tools via Model Context Protocol (MCP) using delegated user OAuth tokens. Zero web-scraping policy.',
      topics: ['OAuth Delegation Flow', 'Zero-Scrape Guarantee', 'MCP Tool Packaging', 'Peering & Interconnect'],
    },
    {
      role: 'API Reference & OpenAPI 3.1',
      href: '/docs/api',
      icon: Terminal,
      color: 'text-signal',
      badge: 'Interactive Spec',
      description:
        'Complete REST & JSON-RPC API reference, downloadable OpenAPI 3.1 specification, and multi-language client code generator.',
      topics: ['OpenAPI 3.1 JSON Spec', 'REST Cloud Endpoints', 'Idempotency Replay SLA', 'Multi-Language SDK'],
    },
  ];

  return (
    <div className="v4-page">
      <PageHeroV4
        eyebrow="VaultHost System Documentation"
        title={
          <>
            Role-Segmented <span className="text-signal">Knowledge Architecture</span>
          </>
        }
        description="Comprehensive technical specifications, machine-readable schemas, architectural decisions, and operational runbooks for every platform participant."
      />

      {/* Core Principle Alert */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-12">
        <div className="p-6 rounded-2xl bg-ink-surface border border-hairline flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-signal/10 border border-signal/30 text-signal shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary-v4">
                Core Architectural Guarantee: Decoupled Intelligence
              </h3>
              <p className="text-xs text-text-muted-v4 mt-1 max-w-3xl leading-relaxed">
                VaultHost strictly isolates AI reasoning planes from the execution plane. AI models synthesize structured ActionIntents but never directly touch databases, hypervisors, or operating systems. All state changes pass through the Action Gateway.
              </p>
            </div>
          </div>
          <Link
            href="/docs/developer#adr-001"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-ink-surface-2 hover:bg-ink-surface-2/80 text-text-secondary-v4 border border-hairline whitespace-nowrap transition-colors"
          >
            Read ADR-001 <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Persona Hub Grid */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="v4-display text-3xl font-bold text-text-primary-v4">
              Select Your Operational Persona
            </h2>
            <p className="text-sm text-text-secondary-v4">
              Documentation tailored precisely to your authorization context, tooling, and system plane.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personas.map((persona) => {
              const Icon = persona.icon;
              return (
                <PanelCard key={persona.role} className="flex flex-col justify-between group hover:border-signal/40 transition-colors">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl bg-ink-surface-2 border border-hairline ${persona.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-ink-surface-2 border border-hairline text-text-muted-v4">
                        {persona.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-text-primary-v4 mb-1">
                        {persona.role}
                      </h3>
                      <p className="text-xs text-text-secondary-v4 leading-relaxed">
                        {persona.description}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-hairline">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted-v4 block">
                        Included Topics:
                      </span>
                      {persona.topics.map((t) => (
                        <div key={t} className="flex items-center gap-2 text-xs text-text-muted-v4 font-mono">
                          <span className="w-1 h-1 rounded-full bg-signal" />
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    <Link
                      href={persona.href}
                      className="w-full inline-flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold bg-ink-surface-2 group-hover:bg-signal group-hover:text-black border border-hairline transition-all"
                    >
                      <span>Explore Documentation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </PanelCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Docs as Code Section */}
      <section className="v4-section-sm border-t border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 rounded-2xl bg-ink-surface border border-hairline flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-ink-surface-2 border border-hairline text-signal shrink-0">
                <Code2 className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-text-primary-v4">
                  Docs as Code Infrastructure
                </h3>
                <p className="text-sm text-text-muted-v4 max-w-2xl leading-relaxed">
                  All VaultHost documentation lives directly in our repository under the <code>/docs/</code> directory. We maintain Architecture Decision Records (ADRs), Runbooks, and auto-generated API references alongside our source code.
                </p>
                <div className="flex gap-4 text-xs font-mono text-text-secondary-v4 mt-3">
                  <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5"/> /docs/adr</span>
                  <span className="flex items-center gap-1"><Terminal className="w-3.5 h-3.5"/> /docs/runbooks</span>
                  <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5"/> /docs/api</span>
                </div>
              </div>
            </div>
            <a
              href="https://github.com/elsxglobal/vaulthost"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold bg-ink-surface-2 text-text-secondary-v4 border border-hairline hover:bg-signal hover:text-black transition-all shrink-0"
            >
              View Repository <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Interactive MCP Discovery Callout */}
      <section className="v4-section-sm border-t border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 rounded-2xl border border-hairline relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(10,18,36,0.98), rgba(6,12,24,1))' }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-4 h-4" />
                  Live Machine-Readable Protocol Endpoint
                </span>
                <h3 className="text-2xl font-bold text-white">
                  Model Context Protocol (MCP) Server Live
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed font-mono">
                  Autonomous agents can query <code>POST /api/action-gateway/mcp</code> using JSON-RPC 2.0 with <code>tools/list</code> to dynamically discover all cloud capabilities with embedded <code>@risk_tier</code> metadata.
                </p>
              </div>

              <Link
                href="/docs/ai-agent"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold bg-signal text-black hover:opacity-95 transition-opacity shrink-0"
              >
                Inspect Agent Protocol Spec <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
