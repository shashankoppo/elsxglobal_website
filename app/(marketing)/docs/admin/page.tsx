'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, ShieldCheck, ArrowLeft, Terminal, AlertTriangle, 
  FileText, CheckCircle2, Lock, Key, Users, RefreshCw 
} from 'lucide-react';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';

export default function AdminDocsPage() {
  const sops = [
    {
      code: 'SOP-101',
      title: 'Reviewing & Authorizing Tier 3 Destructive Actions',
      severity: 'CRITICAL',
      trigger: 'An ActionIntent with Risk Tier 3 is submitted by an AI Agent or Developer.',
      steps: [
        'Navigate to /admin/approval-queue.',
        'Review the AI Reasoning Trace: verify why the model recommended this destructive action.',
        'Inspect the Before and After State Diff: ensure no unintended tables, buckets, or DNS records are affected.',
        'Verify tenant boundary: ensure resourceUri matches the requesting tenant.',
        'Perform second-factor dual authorization by entering your staff security passcode.',
        'Click "Approve & Execute" or "Reject with Feedback" if alternative mitigation is advised.',
      ],
    },
    {
      code: 'SOP-102',
      title: 'Live Action Intent Emergency Rollback & Policy Overrides',
      severity: 'HIGH',
      trigger: 'An erroneous deployment or service reconfiguration occurred.',
      steps: [
        'Open /admin/actions to view the real-time execution ledger.',
        'Locate the relevant auditLogId or intentId.',
        'To roll back a worker or configuration, submit a reverse ActionIntent with verb "rollback".',
        'If an AI Agent is behaving aberrantly, enable "Strict AI Quarantine Mode" in /admin/actions to block all autonomous mutations.',
      ],
    },
    {
      code: 'SOP-103',
      title: 'Cryptographic Audit Trail Chain Verification',
      severity: 'HIGH',
      trigger: 'Periodic compliance audit (SOC 2, ISO 27001) or suspected log tampering.',
      steps: [
        'Run the cryptographic ledger integrity check CLI: vaulthost audit verify-chain --start-log=0.',
        'The tool recalculates HMAC-SHA256 and PQC signatures recursively through the hash chain.',
        'Any mismatch indicates unauthorized log manipulation and triggers an immediate P1 security incident.',
      ],
    },
    {
      code: 'SOP-104',
      title: 'PQC Key Rotation & Hardware Node Attestation',
      severity: 'MEDIUM',
      trigger: 'Quarterly cryptographic key rotation or new edge node commissioning.',
      steps: [
        'Generate new hybrid keypairs (X25519/ML-KEM-768 and Ed25519/ML-DSA-65).',
        'Verify hardware enclave measurement via AMD SEV-SNP / Intel SGX attestation quote.',
        'Issue updated NodeAttestationReceipt signed by master root key.',
        'Broadcast public keys across global anycast edge nodes.',
      ],
    },
  ];

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
        eyebrow="Security & Operations"
        title={
          <>
            Admin & Operator <span className="text-signal">Runbooks & SOPs</span>
          </>
        }
        description="Standard Operating Procedures (SOPs), incident response runbooks, Tier 3 approval queue protocols, and emergency rollback procedures for VaultHost security staff."
      />

      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {sops.map((sop) => (
            <PanelCard key={sop.code} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-hairline pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-ink-surface-2 border border-hairline text-signal">
                    {sop.code}
                  </span>
                  <h3 className="text-base font-bold text-text-primary-v4">
                    {sop.title}
                  </h3>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
                  sop.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}>
                  {sop.severity} SEVERITY
                </span>
              </div>

              <div className="text-xs space-y-1">
                <span className="font-mono text-text-muted-v4 uppercase">Trigger Condition:</span>
                <p className="text-text-secondary-v4">{sop.trigger}</p>
              </div>

              <div className="space-y-2 pt-2">
                <span className="font-mono text-xs uppercase text-signal block">Execution Steps:</span>
                <ol className="list-decimal pl-5 space-y-1.5 text-xs text-text-secondary-v4 font-mono">
                  {sop.steps.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </PanelCard>
          ))}
        </div>
      </section>
    </div>
  );
}
