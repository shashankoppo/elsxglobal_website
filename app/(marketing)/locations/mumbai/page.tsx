'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import { MapPin, Phone, Users, Briefcase, Building, ArrowRight } from 'lucide-react';

export default function MumbaiOfficePage() {
  return (
    <main className="v4-page">
      <PageHeroV4
        eyebrow="Mumbai Office"
        title={<span>ELSxGlobal Mumbai — <span className="text-signal">Financial Capital Hub</span></span>}
        description="Our strategic presence in India's financial capital, driving innovation for BFSI, Fintech, and Enterprise clients."
      />

      <section className="v4-section bg-ink-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8">
          <ScrollReveal className="md:col-span-2">
            <h2 className="text-3xl font-semibold text-text-primary-v4 mb-8">Why Mumbai?</h2>
            <div className="space-y-6 text-text-secondary-v4">
              <p>Located in the heart of the BKC tech corridor, our Mumbai office is strategically positioned to serve the nation's leading financial institutions and rapid-growth fintech startups.</p>
              <p>With close proximity to the BSE, NSE, and regulatory bodies, our engineering teams possess deep domain knowledge in building compliant, high-performance financial software.</p>
            </div>
            
            <h3 className="text-xl font-medium text-text-primary-v4 mt-12 mb-6">Services Offered Here</h3>
            <div className="grid grid-cols-2 gap-4">
              {['Fintech App Development', 'BFSI Digital Transformation', 'E-commerce Platforms', 'Payment Gateway Integration', 'Cybersecurity & Compliance', 'Data Analytics'].map((service, i) => (
                <div key={i} className="flex items-center gap-2 text-text-secondary-v4">
                  <Briefcase className="w-4 h-4 text-signal shrink-0" />
                  <span>{service}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <PanelCard className="p-6 border border-hairline flex flex-col gap-6 sticky top-24">
              <h3 className="text-xl font-semibold text-text-primary-v4 border-b border-hairline pb-4">Office Details</h3>
              
              <div className="flex gap-4">
                <MapPin className="w-5 h-5 text-signal shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-text-primary-v4">Address</p>
                  <p className="text-text-secondary-v4 text-sm mt-1">Bandra Kurla Complex (BKC),<br/>Mumbai 400051, Maharashtra</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Users className="w-5 h-5 text-signal shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-text-primary-v4">Team</p>
                  <p className="text-text-secondary-v4 text-sm mt-1">45+ Engineers & Consultants</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Phone className="w-5 h-5 text-signal shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-text-primary-v4">Contact</p>
                  <p className="text-text-secondary-v4 text-sm mt-1">+91 22-XXXX-XXXX</p>
                </div>
              </div>

              <div className="pt-4 border-t border-hairline">
                <Link href="/contact?location=mumbai" className="v4-btn-primary rounded-btn w-full justify-center flex items-center gap-2">
                  Contact This Office <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </PanelCard>
          </ScrollReveal>
        </div>
      </section>
      
      <section className="v4-section-sm bg-ink-surface-2 border-t border-hairline">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
             <h3 className="text-text-secondary-v4 font-medium mb-6">Nearby Clients Served In</h3>
             <div className="flex flex-wrap justify-center gap-4">
                 {['Private Banking', 'Investment Firms', 'Retail E-commerce', 'Insurance Tech'].map((industry) => (
                     <span key={industry} className="px-4 py-2 border border-hairline rounded-full text-sm text-text-primary-v4">
                         {industry}
                     </span>
                 ))}
             </div>
         </div>
      </section>
    </main>
  );
}
