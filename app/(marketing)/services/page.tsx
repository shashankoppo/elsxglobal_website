'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Code, Headphones, BarChart, Lightbulb, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';

export default function ServicesPage() {
  const services = [
    {
      id: 'tech',
      title: 'ELSxTech',
      subtitle: 'Custom Software & AI Solutions',
      icon: <Code className="w-10 h-10 text-signal" />,
      description: 'Full-cycle custom software development, AI integration, and cloud engineering tailored to modern enterprise requirements.',
      features: ['Enterprise Web & Mobile Apps', 'AI/ML & Data Engineering', 'Cloud Migration & DevOps', 'Cybersecurity & Compliance'],
      link: '/services/tech'
    },
    {
      id: 'bpo',
      title: 'ELSxBPO',
      subtitle: 'Business Process Outsourcing',
      icon: <Headphones className="w-10 h-10 text-signal" />,
      description: 'Scalable, high-quality omnichannel support and back-office operations designed to enhance customer experience and reduce overhead.',
      features: ['24/7 Omnichannel Customer Support', 'Technical Helpdesk', 'Data Entry & Processing', 'Content Moderation'],
      link: '/services/bpo'
    },
    {
      id: 'kpo',
      title: 'ELSxKPO',
      subtitle: 'Knowledge Process & Analytics',
      icon: <BarChart className="w-10 h-10 text-signal" />,
      description: 'Advanced data analytics, financial research, and specialized knowledge services that turn raw data into strategic insights.',
      features: ['Market & Financial Research', 'Advanced Data Analytics', 'Risk & Compliance Management', 'Business Intelligence'],
      link: '/services/kpo'
    },
    {
      id: 'consultancy',
      title: 'ELSxConsultancy',
      subtitle: 'Digital Transformation',
      icon: <Lightbulb className="w-10 h-10 text-signal" />,
      description: 'Strategic advisory services to guide your enterprise through complex digital transformations, process optimization, and technology adoption.',
      features: ['Digital Transformation Strategy', 'IT Architecture Consulting', 'Process Automation (RPA)', 'Change Management'],
      link: '/services/consultancy'
    }
  ];

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <main className="v4-page bg-ink text-text-primary-v4">
      <PageHeroV4 
        title="Comprehensive Enterprise Solutions"
        description="End-to-end services across technology, operations, analytics, and strategy to accelerate your business growth." eyebrow="Our Services" />

      <ScrollReveal>
        <section className="v4-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 inline-block relative">
               <h2 className="v4-display text-4xl font-bold mb-2">Our Core Pillars</h2>
               <motion.div 
                 initial={{ width: 0 }} 
                 whileInView={{ width: 80 }} 
                 viewport={{ once: true }} 
                 transition={{ duration: 0.8 }} 
                 className="h-1 bg-gradient-to-r from-signal to-transparent" 
               />
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {services.map((service) => (
                <motion.div key={service.id} whileHover={{ scale: 1.02, boxShadow: '0 20px 60px rgba(20,255,200,0.06)' }}>
                  <PanelCard className="p-8 flex flex-col h-full border border-hairline hover:border-signal/50 transition-colors">
                    <div className="mb-6 bg-ink-surface-2 p-4 rounded-xl inline-flex self-start">
                      {service.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-text-primary-v4 mb-2">{service.title}</h3>
                    <h4 className="text-lg text-signal font-medium mb-4">{service.subtitle}</h4>
                    <p className="text-text-secondary-v4 mb-8 flex-grow">
                      {service.description}
                    </p>
                    
                    <div className="mb-8">
                      <h5 className="text-sm font-bold text-text-muted-v4 uppercase tracking-wider mb-4">Key Capabilities</h5>
                      <ul className="space-y-3">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-text-secondary-v4">
                            <CheckCircle2 className="w-5 h-5 text-signal shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Link href={service.link} className="v4-btn-secondary rounded-btn px-6 py-3 flex items-center justify-center gap-2 mt-auto w-full sm:w-auto self-start">
                      Explore {service.title} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </PanelCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="v4-section bg-ink-surface border-y border-hairline">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                 <h2 className="v4-display text-3xl md:text-4xl font-bold mb-4">Our Engagement Process</h2>
                 <p className="text-xl text-text-secondary-v4">A streamlined approach to transforming your business.</p>
              </div>
              <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-4 gap-8">
                 {[
                   { step: "01", title: "Discovery", desc: "We analyze your requirements and current architecture." },
                   { step: "02", title: "Strategy", desc: "Architecting a scalable solution and roadmap." },
                   { step: "03", title: "Execution", desc: "Agile implementation with transparent milestones." },
                   { step: "04", title: "Evolution", desc: "Continuous optimization and proactive support." }
                 ].map((item, i) => (
                   <motion.div key={i} variants={itemVariants} className="relative">
                      <div className="text-5xl font-bold text-ink-surface-2 mb-4 drop-shadow-sm">{item.step}</div>
                      <h3 className="text-xl font-bold text-text-primary-v4 mb-2">{item.title}</h3>
                      <p className="text-text-secondary-v4">{item.desc}</p>
                   </motion.div>
                 ))}
              </motion.div>
           </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="v4-section text-center" style={{ background: 'linear-gradient(135deg, rgba(10,18,36,0.98), rgba(6,12,24,1))' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="v4-display text-3xl md:text-4xl font-bold mb-6 text-text-primary-v4">Not sure where to start?</h2>
            <p className="text-xl text-text-secondary-v4 mb-10">
              Let our experts assess your needs and design a custom solution architecture for your enterprise.
            </p>
            <Link href="/contact" className="v4-btn-primary rounded-btn px-8 py-4 flex items-center justify-center gap-2 text-lg mx-auto w-fit">
              Schedule a Consultation <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </ScrollReveal>
    </main>
  );
}
