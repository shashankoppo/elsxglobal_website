'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import {
  Mail,
  ShieldCheck,
  Smartphone,
  Inbox,
  Clock,
  ArrowRight,
  Check,
  Sparkles,
  RefreshCw,
  HardDrive,
  Lock,
  Send,
  Users,
  Server,
  Filter,
} from 'lucide-react';

export default function EmailHostingPage() {
  const plans = [
    {
      name: 'Starter',
      price: '₹49',
      unit: '/mo per mailbox',
      storage: '5 GB NVMe Storage',
      mailboxes: '1 Mailbox included',
      popular: false,
      features: [
        '5 GB NVMe Storage per user',
        'Webmail & Mobile Sync',
        'IMAP, POP3 & SMTP Access',
        'Anti-Spam & Virus Defense',
        '25 MB Attachment Limit',
        'Free SSL / TLS Encryption',
      ],
      ctaText: 'Get Starter',
    },
    {
      name: 'Business',
      price: '₹99',
      unit: '/mo per mailbox',
      storage: '25 GB NVMe Storage',
      mailboxes: 'Up to 5 Mailboxes',
      popular: true,
      features: [
        '25 GB NVMe Storage per user',
        'Exchange ActiveSync (iOS/Android)',
        'Unlimited Aliases & Forwarders',
        'Automated Vacation Responders',
        'DKIM, SPF & DMARC DNS Records',
        '50 MB Attachment Limit',
        'Priority 24/7 Support',
      ],
      ctaText: 'Get Business',
    },
    {
      name: 'Pro',
      price: '₹199',
      unit: '/mo per mailbox',
      storage: '50 GB NVMe Storage',
      mailboxes: 'Up to 25 Mailboxes',
      popular: false,
      features: [
        '50 GB NVMe Storage per user',
        'AI-Powered Anti-Phishing Shield',
        'Shared Calendars & Address Books',
        'Advanced Catch-All Routing',
        '100 MB Attachment Limit',
        'Automated Daily Offsite Backups',
        'Audit Logs & Retention Rules',
      ],
      ctaText: 'Get Pro',
    },
    {
      name: 'Enterprise',
      price: '₹399',
      unit: '/mo per mailbox',
      storage: '100 GB NVMe Storage',
      mailboxes: 'Unlimited Mailboxes',
      popular: false,
      features: [
        '100 GB NVMe Dedicated Storage',
        'Dedicated Outbound IP Address',
        'HIPAA & GDPR Compliance Ready',
        'eDiscovery & Legal Hold Archiving',
        '99.99% Financial Uptime SLA',
        'Custom MX Gateway Configuration',
        'Dedicated Technical Account Manager',
      ],
      ctaText: 'Get Enterprise',
    },
  ];

  const features = [
    {
      title: 'Modern Webmail Client',
      description: 'Clean, lightning-fast web interface with integrated calendars, unified contacts, note-taking, and instant full-text message search.',
      icon: <Inbox className="h-5 w-5" />,
    },
    {
      title: 'Mobile Sync / ActiveSync',
      description: 'Native push synchronization across iOS Mail, Android Gmail, Outlook Mobile, and desktop clients for real-time notifications.',
      icon: <Smartphone className="h-5 w-5" />,
    },
    {
      title: 'Spam + Virus Filter',
      description: 'Multi-layer machine learning spam detection and real-time heuristics quarantine malicious phishing attachments before hitting your inbox.',
      icon: <ShieldCheck className="h-5 w-5" />,
    },
    {
      title: 'Aliases + Forwarders',
      description: 'Provision unlimited email aliases, departmental distribution forwarders (sales@, support@), and intelligent catch-all mailboxes.',
      icon: <Mail className="h-5 w-5" />,
    },
    {
      title: 'Auto-Responders',
      description: 'Configure automated out-of-office notifications, holiday status responses, and time-scheduled custom auto-reply rules per account.',
      icon: <Send className="h-5 w-5" />,
    },
    {
      title: 'DKIM / DMARC / SPF',
      description: 'One-click cryptographic authentication protocols protect your domain reputation, eliminate spoofing, and guarantee high inbox deliverability.',
      icon: <Lock className="h-5 w-5" />,
    },
  ];

  const clients = [
    { name: 'Microsoft Outlook', type: 'Desktop & Mobile' },
    { name: 'Apple Mail', type: 'macOS & iOS' },
    { name: 'Gmail App', type: 'Android & iOS' },
    { name: 'Mozilla Thunderbird', type: 'Windows & Linux' },
    { name: 'Spark Mail', type: 'Cross-platform' },
    { name: 'Native IMAP / POP3', type: 'Any RFC Client' },
  ];

  return (
    <div className="v4-page bg-ink min-h-screen">
      <PageHeroV4
        eyebrow="Email Hosting"
        title={<>Professional Email. <span className="text-signal">Your Domain.</span></>}
        description="Business email hosting with 99.9% uptime, 50 GB mailbox, spam protection, mobile sync, and webmail. Plans from ₹49/mo per mailbox."
      />

      {/* Stats Bar */}
      <div className="v4-section-sm border-y border-hairline bg-ink-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">99.9%</div>
              <div className="text-sm text-text-muted-v4">Guaranteed Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">50 GB</div>
              <div className="text-sm text-text-muted-v4">NVMe Mailbox Storage</div>
            </div>
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">5-Min</div>
              <div className="text-sm text-text-muted-v4">DNS Instant Setup</div>
            </div>
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">24/7</div>
              <div className="text-sm text-text-muted-v4">Human Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="v4-section bg-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="v4-readout text-[11px] font-semibold uppercase tracking-widest text-signal px-3 py-1 rounded-full border border-signal/30 bg-signal/5">
                Predictable Mailbox Pricing
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl v4-display text-text-primary-v4">
                Scalable Email Plans for Growing Teams
              </h2>
              <p className="mt-3 text-text-secondary-v4 max-w-2xl mx-auto text-base">
                Pay only for the mailboxes you need. Upgrade or add extra mailboxes anytime with instant provisioning.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, idx) => (
              <ScrollReveal key={plan.name} delay={idx * 0.1}>
                <div
                  className={`v4-panel p-6 rounded-2xl flex flex-col h-full relative transition-all ${
                    plan.popular
                      ? 'border-signal ring-1 ring-signal/50 bg-ink-surface'
                      : 'border-hairline bg-ink-surface/60 hover:border-hairline-2'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-6 -translate-y-1/2 bg-signal text-ink text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                      Most Popular
                    </div>
                  )}
                  <div className="mb-4">
                    <h3 className="text-xl font-medium text-text-primary-v4">{plan.name}</h3>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-text-primary-v4">{plan.price}</span>
                      <span className="text-xs text-text-muted-v4 font-mono">{plan.unit}</span>
                    </div>
                    <div className="mt-3 space-y-1 text-xs font-mono text-text-secondary-v4 border-t border-hairline pt-3">
                      <div className="text-signal font-semibold">{plan.storage}</div>
                      <div className="text-text-muted-v4">{plan.mailboxes}</div>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1 border-t border-hairline pt-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start text-xs text-text-secondary-v4">
                        <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/portal/signup"
                    className={`w-full justify-center rounded-btn py-2.5 text-sm font-medium transition-all ${
                      plan.popular ? 'v4-btn-primary' : 'v4-btn-secondary'
                    }`}
                  >
                    {plan.ctaText}
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="v4-section bg-ink-surface-2 border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="v4-display text-text-primary-v4 text-3xl sm:text-4xl mb-4">
                Enterprise Email Capabilities Out of the Box
              </h2>
              <p className="text-text-secondary-v4 max-w-2xl mx-auto text-base">
                Engineered with high-availability mail clusters, dedicated spam engines, and strict compliance security.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <ScrollReveal key={feat.title} delay={i * 0.1}>
                <PanelCard
                  title={feat.title}
                  description={feat.description}
                  icon={feat.icon}
                  className="h-full"
                />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {/* Compatible Clients */}
      <div className="v4-section bg-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className="v4-readout text-[11px] font-semibold uppercase tracking-widest text-signal px-3 py-1 rounded-full border border-signal/30 bg-signal/5">
                Universal Compatibility
              </span>
              <h2 className="mt-4 text-3xl v4-display text-text-primary-v4">
                Works With Your Favorite Email Clients
              </h2>
              <p className="mt-2 text-text-secondary-v4 max-w-xl mx-auto text-sm">
                Connect in seconds via automatic configuration profiles or standard IMAP, POP3, and Exchange ActiveSync protocols.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {clients.map((client, i) => (
              <ScrollReveal key={client.name} delay={i * 0.05}>
                <div className="v4-panel p-4 rounded-xl border border-hairline bg-ink-surface/50 text-center flex flex-col items-center justify-center hover:border-signal/50 transition-all">
                  <Mail className="h-6 w-6 text-signal mb-2" />
                  <span className="text-sm font-semibold text-text-primary-v4 leading-tight">{client.name}</span>
                  <span className="text-[11px] text-text-muted-v4 font-mono mt-1">{client.type}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {/* Free Migration Callout */}
      <div className="v4-section-sm bg-ink-surface border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="v4-panel p-8 sm:p-10 rounded-2xl border border-signal/40 bg-gradient-to-r from-ink-surface to-ink-surface-2 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-signal/10 border border-signal/30 text-signal text-xs font-semibold uppercase tracking-wider mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                Zero Downtime Guarantee
              </div>
              <h2 className="v4-display text-2xl sm:text-3xl text-text-primary-v4 mb-3">
                Free Migration from Google Workspace &amp; Office 365
              </h2>
              <p className="text-text-secondary-v4 text-sm sm:text-base leading-relaxed max-w-2xl">
                Switching email providers? Our dedicated migration engineers safely transfer all existing mailboxes, nested folders, calendars, contacts, and historical archives with zero data loss and uninterrupted sending.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <Link
                href="/vaulthost/migration"
                className="v4-btn-primary inline-flex items-center justify-center px-6 py-3 rounded-btn text-sm font-medium"
              >
                Request Free Migration <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="v4-section" style={{ background: 'linear-gradient(135deg, rgba(10,18,36,0.98), rgba(6,12,24,1))' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
          <ScrollReveal>
            <h2 className="v4-display text-white text-3xl sm:text-4xl mb-6">
              Claim Your Custom Domain Email Today
            </h2>
            <p className="text-text-secondary-v4 max-w-2xl mx-auto mb-10 text-base sm:text-lg">
              Establish trust with every email you send. Set up professional company email in 5 minutes with our instant domain DNS configuration.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/portal/signup" className="v4-btn-primary inline-flex items-center justify-center rounded-btn px-8 py-3.5 text-base font-semibold">
                Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="/vaulthost/compare" className="v4-btn-secondary inline-flex items-center justify-center rounded-btn px-8 py-3.5 text-base font-semibold">
                Compare All Plans
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
