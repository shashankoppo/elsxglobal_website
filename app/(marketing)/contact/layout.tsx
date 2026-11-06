import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact ELSxGlobal — Start Your Transformation Journey',
  description:
    'Get in touch with ELSxGlobal. Email contact@elsxglobal.cloud. Offices in Jabalpur, Indore, Pune, Eindhoven, Chicago. Response within 4 business hours. Book a free consultation today.',
  keywords: [
    'contact ELSxGlobal',
    'enterprise transformation consultation',
    'BPO services contact India',
    'KPO analytics inquiry',
    'VaultHost hosting signup',
    'software development company contact',
    'ESG consultancy inquiry',
    'business transformation consultation India',
    'contact EvolucentSphere',
  ],
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact ELSxGlobal — Start Your Transformation',
    description: 'Email contact@elsxglobal.cloud. Response within 4 business hours. Offices in India, Netherlands, USA.',
    type: 'website',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
