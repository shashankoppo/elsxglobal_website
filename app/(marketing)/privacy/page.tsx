import { Metadata } from 'next';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How ELSxGlobal collects, uses, and protects your personal information.',
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
};

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: 'We collect information you provide directly to us — such as your name, email address, phone number, company, and billing details when you register for an account, request a consultation, or purchase a hosting plan. We also collect information automatically, including IP address, browser type, device information, and usage data through cookies and similar technologies.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'We use your information to provide and improve our services, process payments, send service notifications, respond to support requests, deliver marketing communications (with your consent), comply with legal obligations, and detect and prevent fraud or abuse of our platform.',
  },
  {
    title: '3. Information Sharing',
    body: 'We do not sell your personal information. We may share data with trusted third-party service providers — such as payment processors (Razorpay), cloud infrastructure partners, and analytics tools — strictly for operating our services. All partners are bound by confidentiality and data protection agreements.',
  },
  {
    title: '4. Data Security',
    body: 'We implement enterprise-grade security measures including SSL/TLS encryption in transit, AES-256 encryption at rest, ISO 27001-aligned controls, role-based access control, regular security audits, and DDoS protection. Despite these measures, no system is 100% secure, and we cannot guarantee absolute security.',
  },
  {
    title: '5. Cookies & Tracking',
    body: 'We use cookies for session management, authentication, preference storage, and analytics. You can control cookies through your browser settings, but disabling them may affect functionality. We use both first-party and third-party cookies (e.g., Google Analytics) with your consent.',
  },
  {
    title: '6. Your Rights',
    body: 'Under applicable data protection laws (including the DPDP Act, 2023 and GDPR where applicable), you have the right to access, correct, delete, or export your personal data, withdraw consent for processing, and object to certain types of processing. Contact privacy@elsxglobal.com to exercise these rights.',
  },
  {
    title: '7. Data Retention',
    body: 'We retain your personal information for as long as your account is active or as needed to provide services. After account closure, we retain data for a reasonable period to comply with legal obligations, resolve disputes, and enforce agreements. Transaction records are retained for 7 years per Indian tax regulations.',
  },
  {
    title: '8. Children\'s Privacy',
    body: 'Our services are not directed to individuals under 18. We do not knowingly collect personal information from children. If you believe a child has provided us with data, contact us and we will take steps to delete it.',
  },
  {
    title: '9. International Transfers',
    body: 'Your information may be transferred to and processed in countries other than India, including the United States and European Union. We ensure such transfers comply with applicable data protection laws and that adequate safeguards are in place.',
  },
  {
    title: '10. Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on this page and, where appropriate, sending an email notification. Continued use of our services constitutes acceptance of the updated policy.',
  },
  {
    title: '11. Contact Us',
    body: 'For privacy questions or requests, contact us at privacy@elsxglobal.com or +91 72475 58873. Our Data Protection Officer can be reached at EvolucentSphere Pvt. Ltd., Jabalpur, Madhya Pradesh, India.',
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHeroV4
        eyebrow="Legal"
        eyebrowIcon="shield"
        title={<>Privacy Policy</>}
        description="How we collect, use, and protect your personal information. Last updated: July 2026."
      />

      <section className="relative py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="v4-panel p-6 mb-10 flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-chip bg-signal/10 border border-signal/20">
              <Shield className="h-5 w-5 text-signal" />
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-1">Your privacy matters</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                ELSxGlobal, a division of EvolucentSphere Pvt. Ltd., is committed
                to protecting your personal data in compliance with the Digital
                Personal Data Protection Act, 2023 (India) and applicable
                international privacy laws.
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
