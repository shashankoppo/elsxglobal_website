import { Metadata } from 'next';
import { createMetadata } from '@/lib/seo';
import { HostingTierPage } from '@/components/hosting/tier-page';

export const metadata: Metadata = createMetadata({
  title: 'AI Website Builder India — No Coding, Drag & Drop from Rs 99/mo | VaultHost',
  description: 'Build a professional website with AI-powered drag-and-drop builder, 100+ templates, ecommerce, and free domain. Plans starting at Rs 99/mo.',
  keywords: ['website builder India', 'AI website builder', 'drag and drop website builder', 'no code website builder', 'website builder Mumbai', 'ecommerce website builder', 'free domain website builder', 'AI powered website generator'],
  canonical: 'https://elsxglobal.com/vaulthost/website-builder/',
  breadcrumb: [
    { name: 'Home', url: 'https://elsxglobal.com/' },
    { name: 'VaultHost', url: 'https://elsxglobal.com/vaulthost/' },
    { name: 'Website Builder', url: 'https://elsxglobal.com/vaulthost/website-builder/' },
  ],
  faq: [
    { question: 'What is a website builder?', answer: 'A website builder is a visual tool that lets you create a website without coding. Drag and drop elements, choose templates, and publish instantly.' },
    { question: 'Do I need coding skills?', answer: 'No! Our builder is designed for non-technical users. The AI generator can even build a complete site from a text description.' },
    { question: 'Can I sell products online?', answer: 'Yes, the Business plan and above include ecommerce features. You can sell up to 100 products on Business, unlimited on Pro and Enterprise.' },
    { question: 'Can I use my own domain?', answer: 'Yes, every plan includes a free domain for the first year. You can also connect an existing domain.' },
  ],
  serviceSchema: {
    name: 'AI Website Builder',
    description: 'AI-powered drag-and-drop website builder with 100+ templates and ecommerce capabilities.',
    provider: 'VaultHost by ELSxGlobal',
    areaServed: 'India',
    category: 'Website Builder',
  },
});

export default function WebsiteBuilderPage() {
  return <HostingTierPage tier="website-builder" />;
}
