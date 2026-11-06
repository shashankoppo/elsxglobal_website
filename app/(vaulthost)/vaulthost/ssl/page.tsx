'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  ShieldCheck,
  Lock,
  Key,
  Cpu,
  Zap,
  Check,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  FileCode,
  Sliders,
  Globe,
  Sparkles,
  AlertCircle,
  Terminal,
  Server,
  Layers,
  Fingerprint,
} from 'lucide-react';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

export default function SslPage() {
  // Interactive TLS Configurator State
  const [minTlsVersion, setMinTlsVersion] = useState<'1.2' | '1.3'>('1.3');
  const [enablePqc, setEnablePqc] = useState(true);
  const [enableHsts, setEnableHsts] = useState(true);
  const [enableZeroRtt, setEnableZeroRtt] = useState(true);
  const [enableOcsp, setEnableOcsp] = useState(true);

  return (
    <div className="v4-page pb-32">
      {/* Hero Section */}
      <PageHeroV4
        eyebrow="Edge Encryption"
        eyebrowIcon="shield"
        title={
          <>
            Automated SSL/TLS. <span className="text-signal">Post-Quantum Ready.</span>
          </>
        }
        description="Zero-configuration SSL certificates automatically provisioned, renewed, and served from our 300+ edge locations. Featuring hybrid post-quantum key exchange (ML-KEM-768) and 0-RTT session resumption."
      >
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link
            href="/portal"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-btn v4-btn-primary text-sm font-medium"
          >
            Deploy Free SSL at Edge <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#specs"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-btn v4-btn-secondary text-sm font-medium"
          >
            View Cipher &amp; PQC Specs
          </a>
        </div>
      </PageHeroV4>

      {/* Metrics Strip */}
      <section className="v4-section-sm border-t border-hairline bg-ink-surface/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl border border-hairline bg-ink-surface-2/60">
              <div className="text-3xl font-bold v4-display text-signal">&lt; 0.8ms</div>
              <div className="text-xs uppercase tracking-wider text-text-muted-v4 mt-1 font-mono">0-RTT TLS Handshake</div>
            </div>
            <div className="p-4 rounded-xl border border-hairline bg-ink-surface-2/60">
              <div className="text-3xl font-bold v4-display text-text-primary-v4">ML-KEM-768</div>
              <div className="text-xs uppercase tracking-wider text-text-muted-v4 mt-1 font-mono">NIST FIPS 203 PQC</div>
            </div>
            <div className="p-4 rounded-xl border border-hairline bg-ink-surface-2/60">
              <div className="text-3xl font-bold v4-display text-emerald-400">100% Auto</div>
              <div className="text-xs uppercase tracking-wider text-text-muted-v4 mt-1 font-mono">90-Day Zero Touch Renew</div>
            </div>
            <div className="p-4 rounded-xl border border-hairline bg-ink-surface-2/60">
              <div className="text-3xl font-bold v4-display text-text-primary-v4">A+ Rating</div>
              <div className="text-xs uppercase tracking-wider text-text-muted-v4 mt-1 font-mono">Qualys SSL Labs Score</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Feature Cards */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="v4-readout text-xs px-2.5 py-1 rounded-chip border border-hairline bg-ink-surface-2 text-signal">
              Cryptographic Architecture
            </span>
            <h2 className="text-3xl font-bold v4-display mt-3 text-text-primary-v4">
              Enterprise-Grade Transport Layer Security
            </h2>
            <p className="text-sm text-text-secondary-v4 mt-3">
              Automated provisioning meets quantum-resistant key negotiation to future-proof your digital assets against evolving threats.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <PanelCard className="p-6">
              <div className="w-10 h-10 rounded-xl bg-ink-surface-2 border border-hairline flex items-center justify-center text-signal mb-4">
                <RefreshCw className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary-v4 mb-2">Automated Let's Encrypt Wildcard SSL</h3>
              <p className="text-sm text-text-secondary-v4 leading-relaxed">
                One-click issuance for apex domains and multi-level wildcards (<code className="text-signal font-mono text-xs">*.domain.com</code>). Handled automatically via BGP Anycast DNS-01 challenges without injecting web server tokens or requiring maintenance downtime.
              </p>
              <div className="mt-4 pt-4 border-t border-hairline/60 flex items-center justify-between text-xs font-mono text-text-muted-v4">
                <span>Renewal: Every 60 Days</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Automated DNS-01
                </span>
              </div>
            </PanelCard>

            <PanelCard className="p-6">
              <div className="w-10 h-10 rounded-xl bg-ink-surface-2 border border-hairline flex items-center justify-center text-signal mb-4">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary-v4 mb-2">Hybrid Post-Quantum Cryptography</h3>
              <p className="text-sm text-text-secondary-v4 leading-relaxed">
                VaultHost implements the newly finalized NIST FIPS 203 standard: hybrid ML-KEM-768 combined with classical X25519 elliptic curve key exchange. Protects today's traffic against future 'Harvest Now, Decrypt Later' quantum attacks.
              </p>
              <div className="mt-4 pt-4 border-t border-hairline/60 flex items-center justify-between text-xs font-mono text-text-muted-v4">
                <span>Algorithm: X25519 + Kyber/ML-KEM</span>
                <span className="text-signal flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" /> FIPS 203 Validated
                </span>
              </div>
            </PanelCard>

            <PanelCard className="p-6">
              <div className="w-10 h-10 rounded-xl bg-ink-surface-2 border border-hairline flex items-center justify-center text-signal mb-4">
                <Key className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary-v4 mb-2">Custom Certificate Upload &amp; HSM</h3>
              <p className="text-sm text-text-secondary-v4 leading-relaxed">
                Bring your own Extended Validation (EV) or Organization Validation (OV) certificates from DigiCert, Sectigo, or your corporate internal Certificate Authority. Keys are encrypted at rest inside FIPS 140-3 Level 3 Hardware Security Modules.
              </p>
              <div className="mt-4 pt-4 border-t border-hairline/60 flex items-center justify-between text-xs font-mono text-text-muted-v4">
                <span>Storage: FIPS 140-3 HSM</span>
                <span className="text-text-primary-v4 flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5 text-signal" /> Zero Plaintext Storage
                </span>
              </div>
            </PanelCard>

            <PanelCard className="p-6">
              <div className="w-10 h-10 rounded-xl bg-ink-surface-2 border border-hairline flex items-center justify-center text-signal mb-4">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary-v4 mb-2">Edge TLS Termination &amp; 0-RTT</h3>
              <p className="text-sm text-text-secondary-v4 leading-relaxed">
                Handshakes terminate at the nearest of our 300+ PoPs, dramatically cutting latency for visitors thousands of miles from your origin server. TLS 1.3 0-RTT session resumption eliminates round-trip handshakes for returning users.
              </p>
              <div className="mt-4 pt-4 border-t border-hairline/60 flex items-center justify-between text-xs font-mono text-text-muted-v4">
                <span>Session Tickets: Key rotation 1h</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Sub-ms TTFB
                </span>
              </div>
            </PanelCard>
          </div>
        </div>
      </section>

      {/* Interactive TLS Security Configurator */}
      <section id="specs" className="v4-section-sm bg-ink-surface/30 border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5">
              <span className="v4-readout text-xs px-2.5 py-1 rounded-chip border border-hairline bg-ink-surface-2 text-signal">
                Interactive Studio
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold v4-display mt-3 text-text-primary-v4">
                Edge TLS Policy Configurator
              </h2>
              <p className="text-sm text-text-secondary-v4 mt-2">
                Simulate how edge security policies generate production-ready edge headers and strict cipher enforcement.
              </p>

              {/* Toggles */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-hairline bg-ink-surface">
                  <div>
                    <div className="text-xs font-semibold text-text-primary-v4">Minimum TLS Version</div>
                    <div className="text-[11px] text-text-muted-v4">Disallow outdated SSL/TLS handshakes</div>
                  </div>
                  <div className="flex bg-ink-surface-2 p-0.5 rounded border border-hairline">
                    <button
                      onClick={() => setMinTlsVersion('1.2')}
                      className={`px-2.5 py-1 text-xs font-mono rounded ${
                        minTlsVersion === '1.2' ? 'bg-signal text-black font-semibold' : 'text-text-muted-v4'
                      }`}
                    >
                      1.2
                    </button>
                    <button
                      onClick={() => setMinTlsVersion('1.3')}
                      className={`px-2.5 py-1 text-xs font-mono rounded ${
                        minTlsVersion === '1.3' ? 'bg-signal text-black font-semibold' : 'text-text-muted-v4'
                      }`}
                    >
                      1.3 Only
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-hairline bg-ink-surface">
                  <div>
                    <div className="text-xs font-semibold text-text-primary-v4">Post-Quantum Key Exchange</div>
                    <div className="text-[11px] text-text-muted-v4">ML-KEM-768 hybrid quantum resistance</div>
                  </div>
                  <button
                    onClick={() => setEnablePqc(!enablePqc)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      enablePqc ? 'bg-signal' : 'bg-ink-surface-2 border border-hairline'
                    }`}
                  >
                    <div
                      className={`bg-black w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        enablePqc ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-hairline bg-ink-surface">
                  <div>
                    <div className="text-xs font-semibold text-text-primary-v4">HSTS Preload Enforcement</div>
                    <div className="text-[11px] text-text-muted-v4">Strict-Transport-Security: max-age=63072000</div>
                  </div>
                  <button
                    onClick={() => setEnableHsts(!enableHsts)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      enableHsts ? 'bg-signal' : 'bg-ink-surface-2 border border-hairline'
                    }`}
                  >
                    <div
                      className={`bg-black w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        enableHsts ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-hairline bg-ink-surface">
                  <div>
                    <div className="text-xs font-semibold text-text-primary-v4">0-RTT Early Data Resumption</div>
                    <div className="text-[11px] text-text-muted-v4">Sub-millisecond repeat connection speeds</div>
                  </div>
                  <button
                    onClick={() => setEnableZeroRtt(!enableZeroRtt)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      enableZeroRtt ? 'bg-signal' : 'bg-ink-surface-2 border border-hairline'
                    }`}
                  >
                    <div
                      className={`bg-black w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        enableZeroRtt ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-hairline bg-ink-surface">
                  <div>
                    <div className="text-xs font-semibold text-text-primary-v4">OCSP Stapling (Must-Staple)</div>
                    <div className="text-[11px] text-text-muted-v4">Bypass client CA verification round-trips</div>
                  </div>
                  <button
                    onClick={() => setEnableOcsp(!enableOcsp)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      enableOcsp ? 'bg-signal' : 'bg-ink-surface-2 border border-hairline'
                    }`}
                  >
                    <div
                      className={`bg-black w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        enableOcsp ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Generated Config Preview */}
            <div className="lg:col-span-7">
              <div className="rounded-xl border border-hairline bg-ink p-5 font-mono text-xs shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-hairline/60 text-text-muted-v4">
                  <div className="flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-signal" />
                    <span>vaulthost-edge-tls.conf</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-mono">SYNTAX VALID</span>
                </div>
                <pre className="mt-4 overflow-x-auto text-text-secondary-v4 space-y-1">
                  <span className="text-text-muted-v4"># VaultHost Edge TLS 1.3 Termination Policy</span>
                  {'\n'}
                  <span className="text-signal">ssl_protocols</span>{' '}
                  <span className="text-text-primary-v4">{minTlsVersion === '1.3' ? 'TLSv1.3' : 'TLSv1.2 TLSv1.3'};</span>
                  {'\n'}
                  <span className="text-signal">ssl_ciphers</span>{' '}
                  <span className="text-text-primary-v4">
                    {minTlsVersion === '1.3'
                      ? "'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256'"
                      : "'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:TLS_AES_128_GCM_SHA256'"}
                    ;
                  </span>
                  {'\n'}
                  <span className="text-signal">ssl_ecdh_curve</span>{' '}
                  <span className="text-text-primary-v4">
                    {enablePqc ? "'X25519MLKEM768:X25519:secp384r1'" : "'X25519:secp384r1'"}
                    ;
                  </span>
                  {'\n'}
                  <span className="text-signal">ssl_early_data</span>{' '}
                  <span className="text-text-primary-v4">{enableZeroRtt ? 'on' : 'off'};</span>
                  {'\n'}
                  <span className="text-signal">ssl_stapling</span>{' '}
                  <span className="text-text-primary-v4">{enableOcsp ? 'on' : 'off'};</span>
                  {'\n'}
                  <span className="text-signal">ssl_stapling_verify</span>{' '}
                  <span className="text-text-primary-v4">{enableOcsp ? 'on' : 'off'};</span>
                  {'\n\n'}
                  <span className="text-text-muted-v4"># HTTP Security Headers Injected at Edge</span>
                  {'\n'}
                  {enableHsts && (
                    <>
                      <span className="text-purple-400">add_header</span> Strict-Transport-Security
                      &quot;max-age=63072000; includeSubDomains; preload&quot; always;
                      {'\n'}
                    </>
                  )}
                  <span className="text-purple-400">add_header</span> X-Content-Type-Options &quot;nosniff&quot; always;
                  {'\n'}
                  <span className="text-purple-400">add_header</span> X-Frame-Options &quot;SAMEORIGIN&quot; always;
                  {'\n'}
                  <span className="text-purple-400">add_header</span> X-Edge-PQC &quot;{enablePqc ? 'ML-KEM-768-enabled' : 'disabled'}&quot;;
                </pre>
              </div>

              {/* Supported Cipher Suites Table */}
              <div className="mt-6 rounded-xl border border-hairline bg-ink-surface p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted-v4 mb-3 font-mono">
                  Active Edge Cipher Suites
                </h4>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-hairline/50">
                    <span className="text-text-primary-v4">X25519MLKEM768</span>
                    <span className="text-signal">Hybrid Post-Quantum Key Exchange</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-hairline/50">
                    <span className="text-text-primary-v4">TLS_AES_256_GCM_SHA384</span>
                    <span className="text-emerald-400">256-Bit AEAD Encryption (TLS 1.3)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-hairline/50">
                    <span className="text-text-primary-v4">TLS_CHACHA20_POLY1305_SHA256</span>
                    <span className="text-emerald-400">ARM / Mobile Optimized Stream Cipher</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-text-primary-v4">TLS_AES_128_GCM_SHA256</span>
                    <span className="text-emerald-400">Standard 128-Bit AEAD Encryption</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SSL Tier Comparison Table */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="v4-readout text-xs px-2.5 py-1 rounded-chip border border-hairline bg-ink-surface-2 text-signal">
              Plans &amp; Capabilities
            </span>
            <h2 className="text-3xl font-bold v4-display mt-3 text-text-primary-v4">
              Compare VaultSSL Editions
            </h2>
            <p className="text-sm text-text-secondary-v4 mt-3">
              From free automated encryption for personal projects to dedicated hardware security modules for Fortune 500 banks.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="py-4 px-4 font-medium text-text-secondary-v4">Feature / Specification</th>
                  <th className="py-4 px-4 font-semibold text-text-primary-v4">
                    Free Tier
                    <div className="text-xs text-text-muted-v4 font-normal mt-0.5">₹0 / month</div>
                  </th>
                  <th className="py-4 px-4 font-semibold text-signal">
                    Pro VaultSSL
                    <div className="text-xs text-text-muted-v4 font-normal mt-0.5">₹499 / month</div>
                  </th>
                  <th className="py-4 px-4 font-semibold text-purple-400">
                    Enterprise HSM
                    <div className="text-xs text-text-muted-v4 font-normal mt-0.5">Custom Contract</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline text-xs">
                <tr>
                  <td className="py-3 px-4 font-medium text-text-primary-v4">Certificate Type</td>
                  <td className="py-3 px-4 text-text-secondary-v4">Automated Let's Encrypt DV</td>
                  <td className="py-3 px-4 text-signal font-medium">DV + Multi-SAN Wildcards</td>
                  <td className="py-3 px-4 text-purple-300 font-medium">EV, OV, Custom Internal CA</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-text-primary-v4">Automated 90-Day Renewal</td>
                  <td className="py-3 px-4 text-emerald-400 flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Included</td>
                  <td className="py-3 px-4 text-emerald-400"><Check className="h-3.5 w-3.5 inline mr-1" /> Included</td>
                  <td className="py-3 px-4 text-emerald-400"><Check className="h-3.5 w-3.5 inline mr-1" /> Automated + Webhook Alerts</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-text-primary-v4">Hybrid Post-Quantum (ML-KEM-768)</td>
                  <td className="py-3 px-4 text-emerald-400 flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Included</td>
                  <td className="py-3 px-4 text-emerald-400"><Check className="h-3.5 w-3.5 inline mr-1" /> Included</td>
                  <td className="py-3 px-4 text-purple-300">Dedicated Quantum HSM</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-text-primary-v4">Custom Certificate Upload</td>
                  <td className="py-3 px-4 text-text-muted-v4">—</td>
                  <td className="py-3 px-4 text-text-primary-v4">Up to 5 Custom Certs</td>
                  <td className="py-3 px-4 text-purple-300">Unlimited BYO-Certificates</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-text-primary-v4">Dedicated Anycast IP</td>
                  <td className="py-3 px-4 text-text-muted-v4">Shared Edge Pool</td>
                  <td className="py-3 px-4 text-text-muted-v4">Shared Edge Pool</td>
                  <td className="py-3 px-4 text-purple-300">Dedicated IPv4 &amp; IPv6 Pool</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-text-primary-v4">HSTS Preloading &amp; Custom Ciphers</td>
                  <td className="py-3 px-4 text-text-secondary-v4">Standard Best Practices</td>
                  <td className="py-3 px-4 text-signal font-medium">Granular UI Controls</td>
                  <td className="py-3 px-4 text-purple-300">Full Terraform / API Policy Control</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-text-primary-v4">SLA &amp; CA Warranty</td>
                  <td className="py-3 px-4 text-text-muted-v4">Standard Community</td>
                  <td className="py-3 px-4 text-text-primary-v4">99.99% Uptime SLA</td>
                  <td className="py-3 px-4 text-purple-300">99.999% SLA + $1,750,000 CA Warranty</td>
                </tr>
              </tbody>
            </table>
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
                Zero Configuration
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold v4-display text-text-primary-v4 mt-4 mb-4">
                Secure Your Domains with Zero Configuration
              </h2>
              <p className="text-sm sm:text-base text-text-secondary-v4 mb-8 leading-relaxed">
                Add your domain to VaultHost and get instant, post-quantum protected SSL across 300+ edge locations. No manual renewals. Ever.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/portal"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-btn v4-btn-primary text-sm font-medium"
                >
                  Enable Free SSL at Edge <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-btn v4-btn-secondary text-sm font-medium"
                >
                  Enterprise Custom CA Inquiries
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
