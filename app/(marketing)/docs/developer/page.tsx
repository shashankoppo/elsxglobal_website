'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Code2, ArrowLeft, Terminal, ShieldCheck, Key, Cpu, 
  Layers, Check, Copy, BookOpen, GitBranch, Lock, ExternalLink 
} from 'lucide-react';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';

export default function DeveloperDocsPage() {
  const [activeTab, setActiveTab] = useState<'adr' | 'pqc' | 'mcp_client' | 'sdk'>('adr');
  const [copied, setCopied] = useState(false);

  const adrs = [
    {
      id: 'adr-001',
      title: 'ADR-001: Decoupling of Reasoning Plane from Execution Plane',
      status: 'ACCEPTED',
      date: '2026-09-26',
      context:
        'Large Language Models and autonomous reasoning agents are non-deterministic and susceptible to prompt injection, hallucination, or adversarial payload generation. Directly granting LLMs database credentials, shell access, or raw API keys presents catastrophic security risks.',
      decision:
        'We enforce strict architectural decoupling into three isolated planes: 1. Reasoning Plane (LLMs outputting only schema-validated ActionIntents), 2. Execution Plane (Action Gateway enforcing validation, tenant boundaries, blast radius, and risk tiers), and 3. Infrastructure Plane (internal microservices). No AI agent ever connects directly to infrastructure.',
      consequences:
        'Guaranteed zero unauthorized mutations. Autonomous workflows can be safely enabled. Step-up authentication and human staff approval queues prevent destructive operational accidents.',
    },
    {
      id: 'adr-002',
      title: 'ADR-002: Dual Post-Quantum Cryptography (PQC) Hybrid Mode',
      status: 'ACCEPTED',
      date: '2026-09-26',
      context:
        'Quantum computing advancements threaten classical public-key cryptography (RSA, ECC, Diffie-Hellman). Transitioning purely to experimental PQC algorithms introduces algorithmic regression risk.',
      decision:
        'Adopt NIST FIPS 203 (ML-KEM-768) and FIPS 204 (ML-DSA-65) in dual hybrid mode alongside classical X25519 and Ed25519. Key exchange derives shared secrets via HKDF-SHA256 from both classical and post-quantum keys. Digital signatures require both Ed25519 and ML-DSA-65 validity.',
      consequences:
        'Resilient against Store-Now-Decrypt-Later (SNDL) attacks. Full backwards compatibility with classical cryptographic hardware.',
    },
    {
      id: 'adr-003',
      title: 'ADR-003: Model Context Protocol (MCP) as Exclusive External Integration Standard',
      status: 'ACCEPTED',
      date: '2026-09-26',
      context:
        'Integrating third-party SaaS services (GitHub, Slack, Datadog, Stripe) often leads to brittle web scraping or ad-hoc custom API integrations that violate terms of service.',
      decision:
        'VaultHost mandates Model Context Protocol (MCP) for all external integrations. Zero scraping is permitted. VaultHost acts as an MCP Client connecting strictly via delegated OAuth tokens, and acts as an MCP Server exposing scoped cloud tools with embedded @risk_tier metadata.',
      consequences:
        'Deterministic, permissioned interactions. User-granted delegation tokens ensure strict accountability and auditability.',
    },
    {
      id: 'adr-004',
      title: 'ADR-004: Tamper-Evident Chained Audit Trail with HMAC-SHA256 & Merkle Proofs',
      status: 'ACCEPTED',
      date: '2026-09-26',
      context:
        'Cloud infrastructure audits require mathematical proof that historical logs have not been manipulated or truncated following security incidents.',
      decision:
        'Every Action Gateway operation emits an audit entry cryptographically hashed and linked to the previous entry signature via HMAC-SHA256 and PQC signatures, creating an append-only verifiable ledger.',
      consequences:
        'Meets SOC 2 Type II, ISO 27001, and FedRAMP high compliance standards. Instant mathematical detection of log tampering.',
    },
  ];

  const sdkTsCode = `import { VaultHostClient } from '@vaulthost/sdk';

const client = new VaultHostClient({
  apiKey: process.env.VAULTHOST_API_KEY,
  tenantId: 'tenant_enterprise_01',
});

// Deploy an edge worker through Action Gateway
const result = await client.compute.deployWorker({
  workerName: 'payment-webhook-router',
  environment: 'production',
  scriptCode: 'export default { async fetch(req) { return Response.json({ ok: true }); } }',
});

if (result.status === 'require_step_up_auth') {
  console.log('Action requires 2FA challenge:', result.stepUpChallenge.challengeId);
  // Prompt user for TOTP code...
}`;

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
        eyebrow="Engineering Architecture"
        title={
          <>
            Developer & <span className="text-signal">Systems Architecture</span>
          </>
        }
        description="Architecture Decision Records (ADRs), Post-Quantum Cryptography engine specifications, Model Context Protocol (MCP) clients, and SDK quickstarts."
      />

      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-hairline pb-4 font-mono text-xs">
            <button
              onClick={() => setActiveTab('adr')}
              className={`px-4 py-2 rounded-xl transition-colors ${
                activeTab === 'adr'
                  ? 'bg-signal text-black font-semibold'
                  : 'bg-ink-surface text-text-secondary-v4 hover:text-text-primary-v4'
              }`}
            >
              Architecture Decision Records (ADRs)
            </button>
            <button
              onClick={() => setActiveTab('pqc')}
              className={`px-4 py-2 rounded-xl transition-colors ${
                activeTab === 'pqc'
                  ? 'bg-signal text-black font-semibold'
                  : 'bg-ink-surface text-text-secondary-v4 hover:text-text-primary-v4'
              }`}
            >
              PQC Hybrid Cryptography
            </button>
            <button
              onClick={() => setActiveTab('mcp_client')}
              className={`px-4 py-2 rounded-xl transition-colors ${
                activeTab === 'mcp_client'
                  ? 'bg-signal text-black font-semibold'
                  : 'bg-ink-surface text-text-secondary-v4 hover:text-text-primary-v4'
              }`}
            >
              MCP Client & Zero-Scrape
            </button>
            <button
              onClick={() => setActiveTab('sdk')}
              className={`px-4 py-2 rounded-xl transition-colors ${
                activeTab === 'sdk'
                  ? 'bg-signal text-black font-semibold'
                  : 'bg-ink-surface text-text-secondary-v4 hover:text-text-primary-v4'
              }`}
            >
              TypeScript SDK Quickstart
            </button>
          </div>

          {/* TAB 1: ADRs */}
          {activeTab === 'adr' && (
            <div className="space-y-6">
              {adrs.map((adr) => (
                <div key={adr.id} id={adr.id}>
                  <PanelCard className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-hairline pb-3">
                    <h3 className="text-lg font-bold text-text-primary-v4 font-mono">
                      {adr.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-green-500/10 border border-green-500/30 text-green-400 font-semibold">
                        {adr.status}
                      </span>
                      <span className="text-xs font-mono text-text-muted-v4">{adr.date}</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs leading-relaxed">
                    <div>
                      <span className="font-mono text-text-muted-v4 uppercase tracking-wider block mb-1">
                        Context & Problem Statement:
                      </span>
                      <p className="text-text-secondary-v4">{adr.context}</p>
                    </div>

                    <div>
                      <span className="font-mono text-signal uppercase tracking-wider block mb-1">
                        Architectural Decision:
                      </span>
                      <p className="text-text-primary-v4 bg-ink-surface-2 p-3 rounded-xl border border-hairline font-mono">
                        {adr.decision}
                      </p>
                    </div>

                    <div>
                      <span className="font-mono text-text-muted-v4 uppercase tracking-wider block mb-1">
                        Consequences & Guarantees:
                      </span>
                      <p className="text-text-secondary-v4">{adr.consequences}</p>
                    </div>
                  </div>
                </PanelCard>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: PQC */}
          {activeTab === 'pqc' && (
            <PanelCard className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-text-primary-v4 flex items-center gap-2 font-mono">
                  <Lock className="w-5 h-5 text-signal" />
                  NIST FIPS 203 & 204 Hybrid Cryptography Architecture
                </h3>
                <p className="text-xs text-text-secondary-v4 leading-relaxed">
                  VaultHost incorporates quantum-resistant algorithms into transport, node attestation, and data-at-rest encryption.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 rounded-xl bg-ink-surface-2 border border-hairline space-y-2">
                  <span className="text-signal uppercase font-bold block">Key Encapsulation (KEM)</span>
                  <div className="text-text-primary-v4 font-semibold">X25519 + ML-KEM-768</div>
                  <p className="text-text-muted-v4">
                    Combines elliptic curve Diffie-Hellman with lattice-based Module Learning with Errors. Shared secret is derived using HKDF-SHA256 from both ciphertexts.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-ink-surface-2 border border-hairline space-y-2">
                  <span className="text-cyan-400 uppercase font-bold block">Digital Signatures (DSA)</span>
                  <div className="text-text-primary-v4 font-semibold">Ed25519 + ML-DSA-65</div>
                  <p className="text-text-muted-v4">
                    Dual signature standard ensuring that all node attestations, audit ledger links, and worker bundles are signed by both Edwards curve and lattice signatures.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-ink-surface border border-hairline space-y-2">
                <span className="text-xs font-mono uppercase text-text-muted-v4">Node Hardware Attestation</span>
                <p className="text-xs text-text-secondary-v4 font-mono">
                  All edge hypervisors generate signed <code>NodeAttestationReceipt</code> payloads verifying hardware enclave integrity (AMD SEV-SNP / Intel SGX / Nitro Enclaves) with ephemeral PQC public keys.
                </p>
              </div>
            </PanelCard>
          )}

          {/* TAB 3: MCP Client */}
          {activeTab === 'mcp_client' && (
            <PanelCard className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-text-primary-v4 flex items-center gap-2 font-mono">
                  <Layers className="w-5 h-5 text-signal" />
                  VaultHost MCP Client: Delegated OAuth Architecture
                </h3>
                <p className="text-xs text-text-secondary-v4 leading-relaxed">
                  VaultHost does NOT scrape external websites. External SaaS integrations are conducted strictly through Model Context Protocol (MCP) servers using delegated OAuth 2.0 access tokens.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-ink-surface-2 border border-hairline space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-text-muted-v4 border-b border-hairline pb-2">
                  <span>Zero-Scraping Integration Flow</span>
                  <span className="text-green-400">RFC-Compliant</span>
                </div>
                <ol className="list-decimal pl-4 space-y-2 text-text-secondary-v4">
                  <li>User initiates connection in Portal: grants OAuth consent to third-party SaaS (e.g. GitHub, Datadog).</li>
                  <li>VaultHost stores encrypted delegation token with explicitly restricted scopes.</li>
                  <li>When an AI agent or automated pipeline requires external context, it requests the MCP Client.</li>
                  <li>MCP Client verifies granted OAuth scopes, invokes external JSON-RPC tool, and signs an audit log entry.</li>
                </ol>
              </div>
            </PanelCard>
          )}

          {/* TAB 4: SDK Quickstart */}
          {activeTab === 'sdk' && (
            <PanelCard className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-text-primary-v4 font-mono">
                  TypeScript SDK Integration
                </h3>
                <span className="text-xs font-mono text-text-muted-v4">npm i @vaulthost/sdk</span>
              </div>
              <pre className="p-4 rounded-xl bg-ink-surface-2 border border-hairline text-xs font-mono text-green-300 overflow-x-auto leading-relaxed">
                {sdkTsCode}
              </pre>
              <div className="pt-2 flex justify-end">
                <Link
                  href="/docs/api"
                  className="v4-btn-primary px-4 py-2.5 rounded-xl text-xs font-mono font-semibold inline-flex items-center gap-2"
                >
                  Interactive API Reference &amp; OpenAPI 3.1 <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </PanelCard>
          )}
        </div>
      </section>
    </div>
  );
}
