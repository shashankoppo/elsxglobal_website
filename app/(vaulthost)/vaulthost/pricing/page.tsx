import { Metadata } from 'next';
import { createMetadata } from '@/lib/seo';
import { PricingPageClient } from './pricing-client';

export const metadata: Metadata = createMetadata({
  title: "Pricing — India's Enterprise Cloud & Hosting Plans | VaultHost by ELSxGlobal",
  description: "Enterprise cloud & hosting pricing with transparent INR billing and zero egress fees. Shared from ₹790/mo, VPS from ₹1,480/mo, PAYG hourly & 1/6/12-month billing.",
  keywords: ['hosting pricing India', 'VPS pricing Mumbai', 'cloud hosting pricing', 'dedicated server pricing India', 'enterprise cloud India', 'enterprise hosting pricing', 'zero egress cloud India'],
  canonical: 'https://elsxglobal.com/vaulthost/pricing',
  breadcrumb: [
    { name: 'Home', url: 'https://elsxglobal.com/' },
    { name: 'VaultHost', url: 'https://elsxglobal.com/vaulthost/' },
    { name: 'Pricing', url: 'https://elsxglobal.com/vaulthost/pricing' },
  ],
  faq: [
    { question: 'How is VaultHost pricing structured?', answer: 'VaultHost offers transparent, predictable INR pricing with bundled NVMe storage, DDoS mitigation, Indian data center PoPs, and zero outbound egress fees.' },
    { question: 'What is included in the monthly price?', answer: 'All VaultHost plans include NVMe/SSD storage, generous unmetered/high-cap bandwidth, DDoS protection, SSL certificate, and 24/7 engineering support. No surprise egress bills.' },
    { question: 'What billing cycles do you support?', answer: 'Choose Pay As You Go (hourly metered at monthly/730), 1 Month, 6 Months (5% off), or 12 Months (~16.7% off / 2 months free).' },
    { question: 'Can I upgrade my plan later?', answer: 'Yes, you can upgrade at any time. We prorate the difference and apply it immediately with minimal or zero downtime.' },
    { question: 'Is there a money-back guarantee?', answer: 'Yes, eligible plans come with a 30-day money-back guarantee.' },
    { question: 'What payment methods do you accept?', answer: 'We accept Razorpay (credit/debit cards, net banking, wallets), UPI (Google Pay, PhonePe, Paytm), wallet credits, and bank transfer (NEFT/IMPS).' },
    { question: 'Do you offer custom enterprise plans?', answer: 'Yes. Configure custom vCPU/RAM/NVMe in real time or contact our sales team for dedicated bare-metal clusters.' },
    { question: 'Is there a setup fee?', answer: 'No. All standard plans have zero setup fees.' },
  ],
  serviceSchema: {
    name: 'VaultHost Hosting Plans',
    description: 'Enterprise hosting plans with transparent pricing — shared, VPS, cloud, dedicated, WordPress, and reseller hosting.',
    provider: 'VaultHost by ELSxGlobal',
    areaServed: 'India',
    category: 'Web Hosting',
  },
});

export default function PricingPage() {
  return <PricingPageClient />;
}
