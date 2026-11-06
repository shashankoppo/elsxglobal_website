'use client';

import Link from 'next/link';
import { Handshake, ArrowLeft, Shield, CheckCircle2, Lock, Cpu } from 'lucide-react';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';

export default function PartnerDocsPage() {
  return (
    <div className="v4-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link
          href="/docs"
          className="inline-flex items-center gap-2 text-xs font-mono text-text-muted-v4 hover:text-signal transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Documentation Hub
        </Link>
      </div>

      <PageHeroV4
        eyebrow="Ecosystem & Partners"
        title={
          <>
            Partner & SaaS <span className="text-signal">Integration Spec</span>
          </>
        }
        description="Guidelines for SaaS vendors connecting tools to VaultHost via Model Context Protocol (MCP) using OAuth delegated authorization and zero-scraping standards."
      />

      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <PanelCard className="space-y-4">
            <h3 className="text-lg font-bold text-text-primary-v4 font-mono">
              Strict Zero-Scraping Integration Standard
            </h3>
            <p className="text-xs text-text-secondary-v4 leading-relaxed">
              VaultHost enforces a strict zero-scraping policy for third-party integrations. Rather than crawling or scraping SaaS tools, external partners package their capabilities into standard Model Context Protocol (MCP) endpoints.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-hairline font-mono text-xs">
              <div className="p-4 rounded-xl bg-ink-surface-2 border border-hairline space-y-1">
                <span className="text-signal font-bold block">1. Delegated OAuth</span>
                <p className="text-text-muted-v4">User explicitly consents and delegates token to VaultHost MCP client.</p>
              </div>
              <div className="p-4 rounded-xl bg-ink-surface-2 border border-hairline space-y-1">
                <span className="text-cyan-400 font-bold block">2. Scoped Boundaries</span>
                <p className="text-text-muted-v4">Tokens are constrained to read-only or minimal mutation scopes.</p>
              </div>
              <div className="p-4 rounded-xl bg-ink-surface-2 border border-hairline space-y-1">
                <span className="text-green-400 font-bold block">3. Signed Audit Logs</span>
                <p className="text-text-muted-v4">Every external tool execution is sealed in the cryptographic audit ledger.</p>
              </div>
            </div>
          </PanelCard>
        </div>
      </section>
    </div>
  );
}
