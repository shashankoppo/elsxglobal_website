'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, HeartPulse, Building, ShoppingCart, Truck, Factory, GraduationCap, Rocket, Landmark } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { motion, useInView } from 'framer-motion';

function CountUp({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const totalFrames = Math.round(duration * 60);
      const increment = end / totalFrames;
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 1000 / 60);
      return () => clearInterval(timer);
    }
  }, [end, duration, inView]);

  return <span ref={ref}>{count}</span>;
}

export default function IndustriesPage() {
  const industries = [
    {
      title: 'Healthcare & Life Sciences',
      icon: <HeartPulse className="w-8 h-8 text-signal" />,
      desc: 'HIPAA-compliant software, patient support BPO, and healthcare analytics to improve patient outcomes.',
      link: '/industries/healthcare'
    },
    {
      title: 'Financial Services & Fintech',
      icon: <Landmark className="w-8 h-8 text-signal" />,
      desc: 'Secure AI infrastructure, fraud detection KPO, and customer onboarding support for modern finance.',
      link: '/industries/finance'
    },
    {
      title: 'E-commerce & Retail',
      icon: <ShoppingCart className="w-8 h-8 text-signal" />,
      desc: 'Scalable platforms, 24/7 omnichannel support, and supply chain visibility solutions.',
      link: '/industries/ecommerce'
    },
    {
      title: 'Logistics & Supply Chain',
      icon: <Truck className="w-8 h-8 text-signal" />,
      desc: 'Route optimization AI, freight brokerage back-office support, and real-time tracking systems.',
      link: '/industries/logistics'
    },
    {
      title: 'Manufacturing',
      icon: <Factory className="w-8 h-8 text-signal" />,
      desc: 'IoT integration, predictive maintenance analytics, and ERP implementation for Industry 4.0.',
      link: '/industries/manufacturing'
    },
    {
      title: 'Real Estate & PropTech',
      icon: <Building className="w-8 h-8 text-signal" />,
      desc: 'Property management software, tenant support desks, and market research KPO.',
      link: '/industries/real-estate'
    },
    {
      title: 'Education & EdTech',
      icon: <GraduationCap className="w-8 h-8 text-signal" />,
      desc: 'E-learning platforms, student support centers, and educational data analytics.',
      link: '/industries/education'
    },
    {
      title: 'Startups & Scale-ups',
      icon: <Rocket className="w-8 h-8 text-signal" />,
      desc: 'Agile development teams, scalable customer success, and fractional technology leadership.',
      link: '/industries/startups'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <main className="v4-page bg-ink text-text-primary-v4">
      <PageHeroV4 
        title="Industries We Serve"
        description="Specialized domain expertise combined with versatile technological and operational capabilities." eyebrow="Expertise" />

      <ScrollReveal>
        <section className="v4-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="v4-display text-3xl font-bold text-text-primary-v4">Our Industries</h2>
              <motion.div className="h-0.5 mt-3 rounded-full" style={{ background: 'linear-gradient(90deg, hsl(var(--signal)), hsl(var(--primary)))' }} initial={{ width: 0 }} whileInView={{ width: 80 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} />
            </div>
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {industries.map((ind, idx) => (
                <motion.div key={idx} variants={itemVariants} whileHover={{ y: -4 }}>
                  <PanelCard className="p-6 flex flex-col h-full hover:border-signal/50 transition-colors group cursor-pointer" ><div style={{ borderTop: '2px solid hsl(var(--signal)/0.4)' }} className="absolute top-0 inset-x-0 h-1" />
                    <div className="bg-ink-surface-2 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-signal/10 transition-colors">
                      {ind.icon}
                    </div>
                    <h3 className="text-xl font-bold text-text-primary-v4 mb-3">{ind.title}</h3>
                    <p className="text-sm text-text-secondary-v4 mb-6 flex-grow">{ind.desc}</p>
                    <Link href={ind.link} className="text-sm font-semibold text-signal flex items-center gap-1 mt-auto">
                      Learn more <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </PanelCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="v4-section bg-ink-surface border-t border-hairline text-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center">
              <h2 className="v4-display text-3xl font-bold mb-2 text-text-primary-v4">Don't see your industry?</h2>
              <motion.div className="h-0.5 mt-3 mb-6 rounded-full" style={{ background: 'linear-gradient(90deg, hsl(var(--signal)), hsl(var(--primary)))' }} initial={{ width: 0 }} whileInView={{ width: 80 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} />
            </div>
            <p className="text-xl text-text-secondary-v4 mb-10 max-w-3xl mx-auto">
              Our agnostic technology and process frameworks allow us to rapidly adapt and deliver value across any sector. We have successfully served over <strong className="text-signal"><CountUp end={100} />+</strong> clients globally.
            </p>
            <Link href="/contact" className="v4-btn-primary rounded-btn px-8 py-4 inline-flex items-center gap-2 text-lg">
              Talk to an Industry Expert <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </ScrollReveal>
    </main>
  );
}


