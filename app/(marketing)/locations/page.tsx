import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/metadata';
import LocationsPageClient from './locations-client';

export const metadata: Metadata = buildMetadata({
  title: 'Global Offices & Delivery Centers — India, UAE, Singapore, Europe & USA',
  description:
    'ELSxGlobal operates 24/7 enterprise delivery centers and offices across Jabalpur HQ, Mumbai, Pune, Bangalore, Gurgaon, Noida, Dubai, Singapore, Eindhoven, and Chicago.',
  path: '/locations',
  keywords: [
    'ELSxGlobal offices',
    'ELSxGlobal Jabalpur HQ',
    'IT delivery centers India',
    'global consulting offices',
    'Mumbai Bangalore Pune software offices',
  ],
});

export default function LocationsPage() {
  return <LocationsPageClient />;
}
