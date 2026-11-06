'use client';

import Link from 'next/link';
import { Building2, ArrowLeft, ShieldCheck, CheckCircle2, Zap, Scale } from 'lucide-react';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';

export default function CustomerDocsPage() {
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
        eyebrow="Enterprise Assurance"
        title={
          <>
            Enterprise & Customer <span className="text-signal">Guarantees</span>
          </>
        }
        description="Service level agreements, compliance certifications, multi-tenant security isolation, and zero-egress billing guarantees for enterprise customers."
      />

      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PanelCard className="space-y-3">
              <div className="p-3 rounded-xl bg-signal/10 border border-signal/30 text-signal w-fit">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-text-primary-v4">99.999% Edge SLA</h3>
              <p className="text-xs text-text-secondary-v4 leading-relaxed">
                VaultHost DNS and Edge Worker networks operate across 300+ anycast PoPs worldwide with contractual five-nines uptime guarantees and financial remedies.
              </p>
            </PanelCard>

            <PanelCard className="space-y-3">
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 w-fit">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-text-primary-v4">SOC 2 & ISO 27001</h3>
              <p className="text-xs text-text-secondary-v4 leading-relaxed">
                All data centers, cryptographic hardware, and cloud hypervisors are certified compliant with SOC 2 Type II, ISO 27001, and HIPAA BAA readiness.
              </p>
            </PanelCard>

            <PanelCard className="space-y-3">
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 w-fit">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-text-primary-v4">Zero-Egress Fee Guarantee</h3>
              <p className="text-xs text-text-secondary-v4 leading-relaxed">
                Storage stored in VaultR2 incurs zero outbound data transfer fees within the VaultHost network. Never pay surprise bandwidth penalties.
              </p>
            </PanelCard>
          </div>
        </div>
      </section>
    </div>
  );
}
