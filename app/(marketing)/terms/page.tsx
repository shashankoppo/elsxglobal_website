import { Metadata } from 'next';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms and conditions governing your use of ELSxGlobal and VaultHost services.',
  alternates: { canonical: '/terms' },
  robots: { index: true, follow: true },
};

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing or using ELSxGlobal services, including the VaultHost hosting platform, client portal, and website, you agree to be bound by these Terms of Service. If you do not agree, you may not access or use our services. These terms apply to all visitors, users, and account holders.',
  },
  {
    title: '2. Service Description',
    body: 'ELSxGlobal provides enterprise technology services including custom software development, cloud infrastructure, hosting (VaultHost), AI solutions, ERP/CRM implementation, cybersecurity, digital marketing, and business process outsourcing. Specific service terms are outlined in individual service agreements and hosting plans.',
  },
  {
    title: '3. Account Registration',
    body: 'To access certain features, you must register for an account. You agree to provide accurate, complete, and current information, maintain the security of your credentials, and accept responsibility for all activities under your account. You must be at least 18 years old to register.',
  },
  {
    title: '4. Acceptable Use',
    body: 'You agree not to use our services for unlawful purposes, to infringe intellectual property rights, to transmit malware or malicious code, to attempt unauthorized access, to send unsolicited communications (spam), to host illegal or infringing content, or to interfere with the proper functioning of our services.',
  },
  {
    title: '5. Hosting Services (VaultHost)',
    body: 'Hosting plans are subject to resource limits, fair use policies, and acceptable content guidelines. We guarantee 99.99% uptime (excluding scheduled maintenance). Service credits are available for qualifying downtime. A 30-day money-back guarantee applies to new hosting purchases. Abuse of resources may result in suspension or termination.',
  },
  {
    title: '6. Payment & Billing',
    body: 'Fees are billed in advance on a recurring basis (monthly, semi-annual, or annual). We accept payments via Razorpay, UPI, and bank transfer. Overdue accounts may be suspended after a 7-day grace period. Refunds are processed per our refund policy. Prices may change with 30 days notice for renewals.',
  },
  {
    title: '7. Intellectual Property',
    body: 'All content, software, logos, and materials on our platform are owned by ELSxGlobal or its licensors and protected by intellectual property laws. Custom software developed for clients is transferred to the client upon full payment, unless otherwise agreed in writing.',
  },
  {
    title: '8. Confidentiality & Data',
    body: 'We treat your data as confidential and use it only to provide services. You retain all rights to your data. We do not access, monitor, or disclose your data except as required by law, to comply with legal process, or to protect our rights and property. Client data is stored in compliance with applicable data protection laws.',
  },
  {
    title: '9. Service Level Agreement',
    body: 'For VaultHost hosting, we guarantee 99.99% monthly uptime. Downtime is measured from the time a support ticket is opened until service restoration. Service credits equal 5% of monthly fee per hour of downtime, capped at 50% of monthly fee. Scheduled maintenance is excluded and performed during low-traffic windows.',
  },
  {
    title: '10. Termination',
    body: 'You may terminate your account at any time. We may suspend or terminate accounts for violations of these terms, non-payment, or illegal activity. Upon termination, your data will be retained for 30 days, then permanently deleted, except where legal retention is required. No refunds are provided for partial billing periods after the 30-day guarantee.',
  },
  {
    title: '11. Limitation of Liability',
    body: 'ELSxGlobal is not liable for indirect, incidental, special, or consequential damages, including loss of profits, data, or business interruption. Our total liability is limited to the amount paid for services in the 12 months preceding the claim. We are not liable for data loss caused by client misconfiguration or third-party actions.',
  },
  {
    title: '12. Indemnification',
    body: 'You agree to indemnify and hold harmless ELSxGlobal, its officers, directors, and employees from any claims, damages, or expenses (including legal fees) arising from your use of services, your violation of these terms, or your infringement of third-party rights.',
  },
  {
    title: '13. Governing Law',
    body: 'These terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of the courts in Jabalpur, Madhya Pradesh, India. We will attempt to resolve disputes through good-faith negotiation before legal action.',
  },
  {
    title: '14. Changes to Terms',
    body: 'We may modify these terms at any time. Material changes will be notified by email and posted on this page. Continued use after changes constitutes acceptance. If you disagree with changes, you may terminate your account before the effective date.',
  },
  {
    title: '15. Contact',
    body: 'For questions about these terms, contact legal@elsxglobal.com or +91 72475 58873. EvolucentSphere Pvt. Ltd., Jabalpur, Madhya Pradesh, India.',
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHeroV4
        eyebrow="Legal"
        eyebrowIcon="file-text"
        title={<>Terms of Service</>}
        description="The terms and conditions governing your use of our services. Last updated: July 2026."
      />

      <section className="relative py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="v4-panel p-6 mb-10 flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-chip bg-signal/10 border border-signal/20">
              <FileText className="h-5 w-5 text-signal" />
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-1">Please read carefully</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                By using ELSxGlobal or VaultHost services, you agree to these
                terms. This document outlines your rights and responsibilities
                as a user of our platform.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {SECTIONS.map((section) => (
              <div key={section.title}>
                <h2 className="text-lg font-semibold mb-2 text-text-primary-v4">{section.title}</h2>
                <p className="text-sm text-text-secondary-v4 leading-relaxed">
                  {section.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
