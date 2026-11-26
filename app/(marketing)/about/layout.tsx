import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'About ELSxGlobal — The Aethelis Vision | EvolucentSphere Pvt. Ltd.',
  description:
    'ELSxGlobal is the flagship division of EvolucentSphere Pvt. Ltd. Founded by Harsh Raj Patel & Shashank Patel. ₹120Cr valuation, 200+ experts, 100+ enterprise clients, 98% retention. Offices in Jabalpur, Indore, Pune, Eindhoven, Chicago.',
  path: '/about',
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
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
