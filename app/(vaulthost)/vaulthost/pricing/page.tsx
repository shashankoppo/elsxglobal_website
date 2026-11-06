import { Metadata } from 'next';
import { createMetadata } from '@/lib/seo';
import { PricingPageClient } from './pricing-client';

export const metadata: Metadata = createMetadata({
  title: "Pricing — India's Best Enterprise Hosting Plans | VaultHost by ELSxGlobal",
  description: "India's best hosting pricing. Shared, VPS, Cloud, Dedicated, WordPress, and Reseller plans starting at Rs 299/mo. Compare with AWS and Azure — save up to 85% with VaultHost.",
  keywords: ['hosting pricing India', 'VPS pricing Mumbai', 'cloud hosting pricing', 'dedicated server pricing India', 'AWS vs VaultHost pricing', 'Azure vs VaultHost', 'cheapest VPS India', 'enterprise hosting pricing'],
  canonical: 'https://elsxglobal.com/vaulthost/pricing',
  breadcrumb: [
    { name: 'Home', url: 'https://elsxglobal.com/' },
    { name: 'VaultHost', url: 'https://elsxglobal.com/vaulthost/' },
    { name: 'Pricing', url: 'https://elsxglobal.com/vaulthost/pricing' },
  ],
  faq: [
    { question: 'How does VaultHost pricing compare to AWS and Azure?', answer: 'VaultHost includes storage, bandwidth, backups, DDoS protection, and 24/7 support in one price. AWS and Azure charge separately for each, often totaling 10-15x more for equivalent specs.' },
    { question: 'What is included in the monthly price?', answer: 'All VaultHost plans include NVMe/SSD storage, fixed bandwidth, daily backups, DDoS protection, SSL certificate, and 24/7 human support. No hidden fees.' },
    { question: 'Do you offer annual billing discounts?', answer: 'Yes. Annual billing gives you 2 months free (16.67% savings). For example, a Rs 2,999/mo VPS costs Rs 29,990/yr instead of Rs 35,988 — saving Rs 5,998 per year.' },
    { question: 'Can I upgrade my plan later?', answer: 'Yes, you can upgrade at any time. We prorate the difference and apply it immediately. No downtime during upgrades.' },
    { question: 'Is there a money-back guarantee?', answer: 'Yes, all plans come with a 30-day money-back guarantee. If you are not satisfied, we refund the full amount, no questions asked.' },
    { question: 'What payment methods do you accept?', answer: 'We accept Razorpay (credit/debit cards, net banking, wallets), UPI (Google Pay, PhonePe, Paytm), and bank transfer (NEFT/IMPS).' },
    { question: 'Do you offer custom enterprise plans?', answer: 'Yes. For high-volume or specialized requirements, contact our sales team for a custom quote tailored to your workload.' },
    { question: 'Is there a setup fee?', answer: 'No. All plans have zero setup fees. You only pay the monthly or annual plan price.' },
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
