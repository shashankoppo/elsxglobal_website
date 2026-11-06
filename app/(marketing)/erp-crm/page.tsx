'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import { ArrowRight, Database, Users, TrendingUp, Smartphone, Factory, ShoppingBag, HeartPulse, Truck, Landmark } from 'lucide-react';

function useCountUp(end: number, duration: number = 2) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const step = end / (duration * 60);
      const timer = setInterval(() => {
        start += step;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 1000 / 60);
      return () => clearInterval(timer);
    }
  }, [isInView, end, duration]);

  return { count, ref };
}

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as any, stiffness: 300, damping: 24 } }
};

const platforms = [
  { name: 'Odoo ERP', desc: 'Comprehensive open-source ERP for full operational management.', modules: 'Manufacturing, Inventory, Accounting', time: '3-6 Months' },
  { name: 'Salesforce CRM', desc: 'The world\'s leading CRM for enterprise sales and service teams.', modules: 'Sales Cloud, Service Cloud, Marketing', time: '2-4 Months' },
  { name: 'SAP S/4HANA', desc: 'Next-generation intelligent ERP for large-scale global enterprises.', modules: 'Finance, Supply Chain, R&D', time: '6-12 Months' },
  { name: 'HubSpot', desc: 'Inbound marketing, sales, and service software that scales with you.', modules: 'Marketing Hub, Sales Hub, CMS', time: '1-3 Months' },
  { name: 'Microsoft Dynamics', desc: 'Intelligent business applications across CRM and ERP.', modules: 'Finance, Operations, Sales', time: '4-8 Months' },
  { name: 'Custom ERP', desc: 'Bespoke systems built from scratch for highly specialized workflows.', modules: 'Fully Custom Architecture', time: '6-12+ Months' }
];

const benefits = [
  { icon: <Database className="w-5 h-5" />, title: 'Single Source of Truth', desc: 'Eliminate data silos and fragmented systems.' },
  { icon: <TrendingUp className="w-5 h-5" />, title: 'Real-time Reporting', desc: 'Instant insights across all business units.' },
  { icon: <Users className="w-5 h-5" />, title: 'Automated Workflows', desc: 'Reduce manual entry and human error.' },
  { icon: <Smartphone className="w-5 h-5" />, title: 'Mobile Access', desc: 'Manage operations from anywhere securely.' }
];

const industries = [
  { name: 'Manufacturing', icon: <Factory className="w-6 h-6" /> },
  { name: 'Retail & E-commerce', icon: <ShoppingBag className="w-6 h-6" /> },
  { name: 'Healthcare', icon: <HeartPulse className="w-6 h-6" /> },
  { name: 'Logistics', icon: <Truck className="w-6 h-6" /> },
  { name: 'Finance', icon: <Landmark className="w-6 h-6" /> }
];

function StatsSection() {
  const { count: clients, ref: clientsRef } = useCountUp(150, 2);
  const { count: years, ref: yearsRef } = useCountUp(10, 2);
  const { count: roi, ref: roiRef } = useCountUp(300, 2);

  return (
    <section className="v4-section border-t border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div ref={clientsRef}>
            <div className="v4-display text-5xl text-signal font-bold mb-2">{clients}+</div>
            <div className="text-text-secondary-v4">Enterprise Deployments</div>
          </div>
          <div ref={yearsRef}>
            <div className="v4-display text-5xl text-signal font-bold mb-2">{years}+</div>
            <div className="text-text-secondary-v4">Years of Experience</div>
          </div>
          <div ref={roiRef}>
            <div className="v4-display text-5xl text-signal font-bold mb-2">{roi}%</div>
            <div className="text-text-secondary-v4">Average ROI Increase</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ERPCrmPage() {
  return (
    <main className="v4-page bg-ink text-text-primary-v4 min-h-screen">
      <PageHeroV4 
        eyebrow="ERP & CRM"
        title={
          <span className="v4-display">Unify Operations. <span className="text-signal">Eliminate Silos.</span></span>
        }
        description="End-to-end implementation and customization of enterprise resource planning and customer relationship management systems."
      />

      <section className="v4-section pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 flex flex-col items-center">
            <h2 className="v4-display text-3xl md:text-4xl font-semibold mb-4">Supported Platforms</h2>
            <motion.div className="h-0.5 mt-3 mb-6 rounded-full" style={{ background: 'linear-gradient(90deg, hsl(var(--signal)), hsl(var(--primary)))' }} initial={{ width: 0 }} whileInView={{ width: 80 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} />
            <p className="text-text-secondary-v4 max-w-2xl mx-auto text-lg">Expert deployment of industry-leading enterprise software platforms.</p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {platforms.map((platform, i) => (
              <motion.div key={i} variants={itemVariants} className="h-full">
                <motion.div className="h-full" whileHover={{ scale: 1.02, boxShadow: '0 20px 60px rgba(20,255,200,0.07)' }} transition={{ type: "spring" as any, stiffness: 300, damping: 30 }}>
                  <PanelCard className="h-full p-6 border border-hairline flex flex-col hover:border-signal/40 transition-colors">
                    <h3 className="text-xl font-bold mb-2 text-signal">{platform.name}</h3>
                    <p className="text-text-secondary-v4 text-sm mb-6 flex-grow">{platform.desc}</p>
                    
                    <div className="bg-ink-surface p-4 rounded-lg border border-hairline text-sm">
                      <div className="mb-2">
                        <span className="text-text-muted-v4 font-medium block text-xs uppercase mb-1">Key Modules</span>
                        <span className="text-text-primary-v4">{platform.modules}</span>
                      </div>
                      <div>
                        <span className="text-text-muted-v4 font-medium block text-xs uppercase mb-1">Avg Timeline</span>
                        <span className="text-text-primary-v4">{platform.time}</span>
                      </div>
                    </div>
                  </PanelCard>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <StatsSection />

      <section className="v4-section bg-ink-surface border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="v4-display text-3xl md:text-4xl font-semibold mb-6">Transform Your Operations</h2>
              <motion.div className="h-0.5 mt-3 mb-6 rounded-full" style={{ background: 'linear-gradient(90deg, hsl(var(--signal)), hsl(var(--primary)))' }} initial={{ width: 0 }} whileInView={{ width: 80 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} />
              <p className="text-text-secondary-v4 text-lg mb-8">
                A successful implementation goes beyond software installation. We focus on business process reengineering, user adoption, and strategic alignment to ensure maximum ROI.
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                {benefits.map((benefit, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-signal">{benefit.icon}</div>
                      <h4 className="font-semibold">{benefit.title}</h4>
                    </div>
                    <p className="text-text-secondary-v4 text-sm">{benefit.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-ink p-8 rounded-2xl border border-hairline">
              <h3 className="text-xl font-semibold mb-6 text-center">Industries We Serve</h3>
              <div className="flex flex-col gap-4">
                {industries.map((ind, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-ink-surface-2 border border-hairline">
                    <div className="text-text-muted-v4">{ind.icon}</div>
                    <span className="font-medium">{ind.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="v4-section-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h2 className="v4-display text-3xl font-bold mb-4">Planning a digital transformation?</h2>
          <motion.div className="h-0.5 mt-3 mb-8 rounded-full" style={{ background: 'linear-gradient(90deg, hsl(var(--signal)), hsl(var(--primary)))' }} initial={{ width: 0 }} whileInView={{ width: 80 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} />
          <p className="text-text-secondary-v4 mb-8 text-lg max-w-3xl">Discover which ERP or CRM system aligns best with your operational complexity and growth goals.</p>
          <Link href="/contact" className="v4-btn-primary rounded-btn inline-flex items-center px-8 py-4 text-lg">
            Get an ERP readiness assessment <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </main>
  );
}

