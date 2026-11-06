'use client';

import { Shield, Zap, Network, Database, BrainCircuit, Lock, Eye, Fingerprint, Server, Check, ArrowRight } from 'lucide-react';
import { ProductPageV4 } from '@/components/shared/v4-page-templates';
import { ThreatMapV4 } from '@/components/vaulthost/threat-map-v4';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';

const SECURITY_LAYERS = [
  { icon: Eye, title: 'Layer 3-4: Network', desc: 'Volumetric DDoS absorption at the edge. 10Tbps+ capacity across all PoPs.', color: 'text-signal' },
  { icon: Shield, title: 'Layer 7: Application', desc: 'OWASP Top 10 protection, custom WAF rules, request inspection in <2ms.', color: 'text-signal-dim' },
  { icon: Fingerprint, title: 'Identity & Access', desc: 'Zero-trust authentication, mTLS between services, per-request authorization.', color: 'text-good' },
  { icon: Lock, title: 'Data Encryption', desc: 'AES-256 at rest, TLS 1.3 in transit, key rotation, and HSM-backed storage.', color: 'text-warn' },
  { icon: BrainCircuit, title: 'AI Threat Detection', desc: 'Behavioral analysis, anomaly detection, and auto-quarantine of malicious files.', color: 'text-signal-dim' },
  { icon: Server, title: 'Runtime Protection', desc: 'Container isolation, seccomp profiles, and kernel-level hardening.', color: 'text-good' },
];

const COMPLIANCE = [
  { name: 'SOC 2 Type II', desc: 'Audited annually' },
  { name: 'ISO 27001', desc: 'Certified' },
  { name: 'GDPR', desc: 'EU compliant' },
  { name: 'HIPAA', desc: 'Ready configs' },
  { name: 'PCI DSS', desc: 'Level 1' },
  { name: 'FedRAMP', desc: 'In progress' },
];

export default function SecurityPage() {
  return (
    <ProductPageV4 data={{
      eyebrow: 'VaultHost Security', eyebrowIcon: Shield,
      title: <>AI-Powered Defense at Every Layer</>,
      description: 'Every packet inspected. Every threat neutralized. Zero assumptions about trust.',
      ctaTitle: 'Secure Your Infrastructure', ctaHref: '/vaulthost',
      features: [
        { icon: Shield, title: 'Zero-Trust WAF', desc: 'Layer 7 inspection, OWASP Top 10 protection, custom rule engine.' },
        { icon: Zap, title: 'DDoS Mitigation', desc: '10Tbps+ absorption capacity, anycast scrubbing, BGP blackholing.' },
        { icon: BrainCircuit, title: 'AI Malware Remediation', desc: 'File scanning, behavior analysis, auto-quarantine, rollback.' },
        { icon: Network, title: 'Bot Management', desc: 'Intent-based bot scoring, CAPTCHA orchestration, rate limiting.' },
        { icon: Shield, title: 'TLS 1.3 Everywhere', desc: 'Forced HTTPS, HSTS preloading, certificate auto-renewal.' },
        { icon: Database, title: 'Compliance', desc: 'SOC 2 Type II, ISO 27001, GDPR, HIPAA-ready configurations.' },
      ],
      stats: [
        { value: 1.2, suffix: 'B+', label: 'Threats Blocked/mo', decimals: 1 },
        { value: 99.97, suffix: '%', label: 'Block Rate', decimals: 2 },
        { value: 2, suffix: 'ms', label: 'Analysis Latency' },
        { value: 0, suffix: '', label: 'Breaches (YTD)' },
      ],
      children: (
        <>
          {/* Live threat map */}
          <section className="v4-section-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollReveal className="text-center mb-8">
                <h2 className="text-2xl v4-display text-text-primary-v4">Live Threat Map</h2>
                <p className="mt-3 text-text-secondary-v4">See threats being blocked in real-time across our global network.</p>
              </ScrollReveal>
              <ThreatMapV4 />
            </div>
          </section>

          {/* Security layers */}
          <section className="v4-section-sm bg-ink-surface">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollReveal className="text-center mb-10">
                <h2 className="text-2xl v4-display text-text-primary-v4">Defense in Depth</h2>
                <p className="mt-3 text-text-secondary-v4">Six layers of security, from network to runtime.</p>
              </ScrollReveal>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SECURITY_LAYERS.map((layer, i) => (
                  <ScrollReveal key={layer.title} animation="fade-up" delay={i * 100}>
                    <div className="v4-panel p-6 h-full">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-chip border border-hairline bg-ink-surface-2">
                          <layer.icon className={`h-5 w-5 ${layer.color}`} />
                        </div>
                        <h3 className="text-sm font-semibold text-text-primary-v4">{layer.title}</h3>
                      </div>
                      <p className="text-sm text-text-secondary-v4 leading-relaxed">{layer.desc}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          {/* Threat stats band */}
          <section className="py-10 border-y border-hairline bg-ink-surface/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { value: '1.2B+', label: 'Threats Blocked Monthly' },
                  { value: '99.97%', label: 'Block Rate' },
                  { value: '<2ms', label: 'Threat Analysis Latency' },
                  { value: '0', label: 'Successful Breaches (YTD)' },
                ].map((s, i) => (
                  <ScrollReveal key={s.label} animation="fade-up" delay={i * 80} className="text-center">
                    <p className="v4-readout-primary text-3xl font-bold">{s.value}</p>
                    <p className="mt-1 text-xs text-text-muted-v4 uppercase tracking-wider">{s.label}</p>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          {/* Compliance grid */}
          <section className="v4-section-sm">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollReveal className="text-center mb-10">
                <h2 className="text-2xl v4-display text-text-primary-v4">Compliance & Certifications</h2>
                <p className="mt-3 text-text-secondary-v4">Built to meet the most stringent regulatory requirements.</p>
              </ScrollReveal>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {COMPLIANCE.map((cert, i) => (
                  <ScrollReveal key={cert.name} animation="fade-up" delay={i * 80}>
                    <div className="v4-panel p-5 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-chip bg-good/10 border border-good/20 shrink-0">
                        <Check className="h-5 w-5 text-good" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary-v4">{cert.name}</p>
                        <p className="text-xs text-text-muted-v4">{cert.desc}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="v4-section-sm bg-ink-surface">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <ScrollReveal className="v4-panel p-8">
                <Shield className="h-10 w-10 text-signal mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-text-primary-v4 mb-2">Security shouldn\'t be an add-on</h2>
                <p className="text-sm text-text-secondary-v4 mb-6">Every VaultHost plan includes zero-trust security by default. No extra cost, no extra configuration.</p>
                <Link href="/vaulthost/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-btn v4-btn-primary text-sm">
                  Explore Plans <ArrowRight className="h-4 w-4" />
                </Link>
              </ScrollReveal>
            </div>
          </section>
        </>
      ),
    }} />
  );
}
