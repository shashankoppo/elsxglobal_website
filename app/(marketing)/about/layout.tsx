import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About ELSxGlobal — The Aethelis Vision | EvolucentSphere Pvt. Ltd.',
  description:
    'ELSxGlobal is the flagship division of EvolucentSphere Pvt. Ltd. Founded by Harsh Raj Patel & Shashank Patel. ₹120Cr valuation, 200+ experts, 100+ enterprise clients, 98% retention. Offices in Jabalpur, Indore, Pune, Eindhoven, Chicago.',
  keywords: [
    'about ELSxGlobal',
    'EvolucentSphere Pvt Ltd',
    'Harsh Raj Patel CEO',
    'Shashank Patel CTO',
    'enterprise transformation company India',
    'Aethelis Vision',
    'IT company Jabalpur',
    'technology company Madhya Pradesh',
    '₹120 crore valuation India tech',
    'enterprise transformation founders India',
  ],
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About ELSxGlobal — The Aethelis Vision',
    description: "EvolucentSphere Pvt. Ltd. — India's #1 enterprise transformation ecosystem. ₹120Cr valuation, 200+ experts.",
    type: 'website',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
