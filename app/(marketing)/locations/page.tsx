'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, Mail, Phone, Globe } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';

export default function LocationsPage() {
  const hq = {
    city: 'Jabalpur, India',
    type: 'Global Headquarters',
    desc: 'Our founding office and primary delivery center for Technology and BPO operations.',
    address: 'IT Park, Bargi Hills, Jabalpur, MP 482003',
    services: ['Executive Leadership', 'ELSxTech Core', 'ELSxBPO Hub']
  };

  const offices = [
    { city: 'Mumbai, India', type: 'Regional Hub', address: 'Bandra Kurla Complex, Mumbai', services: ['Sales', 'Financial KPO'] },
    { city: 'Pune, India', type: 'Delivery Center', address: 'Hinjewadi IT Park, Pune', services: ['ELSxTech', 'R&D'] },
    { city: 'Bangalore, India', type: 'Tech Hub', address: 'Electronic City, Bangalore', services: ['AI/ML CoE', 'Cloud Eng'] },
    { city: 'Gurgaon, India', type: 'BPO Center', address: 'Cyber City, Gurgaon', services: ['Enterprise BPO'] },
    { city: 'Noida, India', type: 'Delivery Center', address: 'Sector 62, Noida', services: ['Tech Support', 'KPO'] },
    { city: 'Dubai, UAE', type: 'Sales & Advisory', address: 'Dubai Internet City', services: ['MENA Sales', 'Consulting'] },
    { city: 'Singapore', type: 'APAC Hub', address: 'Marina Bay Financial Centre', services: ['APAC Sales', 'Strategy'] },
    { city: 'Eindhoven, NL', type: 'European Hub', address: 'High Tech Campus', services: ['EU Operations', 'Design CoE'] },
    { city: 'Chicago, USA', type: 'Americas Hub', address: 'Willis Tower, Chicago', services: ['US Sales', 'Client Success'] }
  ];

  return (
    <main className="v4-page bg-ink text-text-primary-v4">
      <PageHeroV4 
        title="Global Presence, Local Excellence"
        description="With offices across the globe, ELSxGlobal delivers seamless 24/7 support and localized expertise." eyebrow="Our Locations" />

      <ScrollReveal>
        <section className="v4-section border-b border-hairline">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <h2 className="v4-display text-2xl font-bold mb-8 text-text-primary-v4 flex items-center gap-2">
              <Globe className="text-signal w-6 h-6" /> Headquarters
            </h2>
            <PanelCard className="p-8 border-signal/30 bg-signal/5 flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-3xl font-bold text-text-primary-v4">{hq.city}</h3>
                  <span className="bg-signal text-ink text-xs font-bold px-2 py-1 rounded-chip uppercase">{hq.type}</span>
                </div>
                <p className="text-text-secondary-v4 mb-6 max-w-2xl">{hq.desc}</p>
                
                <div className="grid sm:grid-cols-2 gap-4 text-sm text-text-secondary-v4">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-signal shrink-0" />
                    <span>{hq.address}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="w-5 h-5 text-signal shrink-0" />
                    <span>contact@elsxglobal.com</span>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-auto bg-ink p-6 rounded-xl border border-hairline min-w-[250px]">
                <h4 className="font-bold text-text-primary-v4 mb-3 border-b border-hairline pb-2">Key Operations</h4>
                <ul className="space-y-2">
                  {hq.services.map((svc, i) => (
                    <li key={i} className="text-sm text-text-secondary-v4 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-signal"></div> {svc}
                    </li>
                  ))}
                </ul>
              </div>
            </PanelCard>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="v4-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <h2 className="v4-display text-2xl font-bold mb-8 text-text-primary-v4">Global Offices</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offices.map((office, idx) => (
                <PanelCard key={idx} className="p-6 flex flex-col h-full hover:border-signal/50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-text-primary-v4">{office.city}</h3>
                    <span className="text-xs font-bold text-signal uppercase tracking-wider">{office.type}</span>
                  </div>
                  
                  <div className="flex items-start gap-2 text-sm text-text-secondary-v4 mb-6">
                    <MapPin className="w-4 h-4 text-text-muted-v4 shrink-0 mt-0.5" />
                    <span>{office.address}</span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-hairline">
                    <div className="flex flex-wrap gap-2">
                      {office.services.map((svc, i) => (
                        <span key={i} className="text-xs bg-ink-surface-2 text-text-secondary-v4 px-2 py-1 rounded-chip border border-hairline">
                          {svc}
                        </span>
                      ))}
                    </div>
                  </div>
                </PanelCard>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="v4-section bg-ink-surface border-t border-hairline text-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <h2 className="v4-display text-3xl font-bold mb-6 text-text-primary-v4">Visit Us</h2>
            <p className="text-xl text-text-secondary-v4 mb-10">
              Want to meet our team in person? Schedule a visit to one of our global delivery centers.
            </p>
            <Link href="/contact" className="v4-btn-primary rounded-btn px-8 py-4 inline-flex items-center gap-2 text-lg">
              Schedule a Meeting <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </ScrollReveal>
    </main>
  );
}


