'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Globe, Users, Target, Shield, Award, MapPin } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';

function useCountUp(target: number, duration = 2000, decimals = 0) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(parseFloat(start.toFixed(decimals)));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration, decimals]);
  return { count, ref };
}

export default function AboutPage() {
  const teamCount = useCountUp(200);
  const clientsCount = useCountUp(100);
  const officesCount = useCountUp(10);
  const awardsCount = useCountUp(5);

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
    show: { opacity: 1, y: 0 }
  };

  return (
    <main className="v4-page bg-ink text-text-primary-v4">
      <PageHeroV4 
        title="Pioneering Global Innovation Since 2019"
        description="ELSxGlobal is a premier technology and outsourcing partner dedicated to empowering enterprises worldwide through cutting-edge solutions, deep expertise, and a commitment to excellence." eyebrow="Our Story" />

      <ScrollReveal>
        <section className="v4-section bg-ink-surface border-y border-hairline">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }}>
                <motion.h2 variants={itemVariants} className="v4-display text-3xl md:text-4xl font-bold mb-6 text-text-primary-v4">The EvolucentSphere Journey</motion.h2>
                <motion.p variants={itemVariants} className="text-text-secondary-v4 mb-6 leading-relaxed">
                  Founded in 2019 in Jabalpur, India, EvolucentSphere began with a vision to bridge the gap between emerging technologies and practical enterprise application. What started as a focused technology consultancy has grown into ELSxGlobal — a multinational powerhouse delivering comprehensive Tech, BPO, KPO, and Consulting services.
                </motion.p>
                <motion.p variants={itemVariants} className="text-text-secondary-v4 mb-6 leading-relaxed">
                  Today, we operate on a global scale with a diverse team of over 200 passionate professionals. We partner with more than 100 enterprise clients across industries, helping them navigate complex digital transformations, optimize operations, and achieve unprecedented growth.
                </motion.p>
                <motion.div variants={itemVariants} className="flex items-center gap-4 text-signal font-semibold">
                  <Shield className="w-5 h-5" />
                  <span>ISO 27001 & SOC 2 Type II Certified</span>
                </motion.div>
              </motion.div>
              <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-2 gap-4">
                <motion.div variants={itemVariants} whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(20,255,200,0.06)' }}>
                  <PanelCard className="p-6 flex flex-col items-center justify-center text-center overflow-hidden relative h-full">
                    <div className="absolute top-0 inset-x-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--signal)/0.6), transparent)' }} />
                    <Users className="w-10 h-10 text-signal mb-4" />
                    <div className="text-3xl font-bold text-text-primary-v4 mb-1">
                      <span ref={teamCount.ref}>{teamCount.count}</span>+
                    </div>
                    <div className="text-sm text-text-muted-v4">Team Members</div>
                  </PanelCard>
                </motion.div>
                <motion.div variants={itemVariants} whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(20,255,200,0.06)' }}>
                  <PanelCard className="p-6 flex flex-col items-center justify-center text-center overflow-hidden relative h-full">
                    <div className="absolute top-0 inset-x-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--signal)/0.6), transparent)' }} />
                    <Globe className="w-10 h-10 text-signal mb-4" />
                    <div className="text-3xl font-bold text-text-primary-v4 mb-1">
                      <span ref={clientsCount.ref}>{clientsCount.count}</span>+
                    </div>
                    <div className="text-sm text-text-muted-v4">Enterprise Clients</div>
                  </PanelCard>
                </motion.div>
                <motion.div variants={itemVariants} whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(20,255,200,0.06)' }}>
                  <PanelCard className="p-6 flex flex-col items-center justify-center text-center overflow-hidden relative h-full">
                    <div className="absolute top-0 inset-x-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--signal)/0.6), transparent)' }} />
                    <MapPin className="w-10 h-10 text-signal mb-4" />
                    <div className="text-3xl font-bold text-text-primary-v4 mb-1">
                      <span ref={officesCount.ref}>{officesCount.count}</span>+
                    </div>
                    <div className="text-sm text-text-muted-v4">Global Offices</div>
                  </PanelCard>
                </motion.div>
                <motion.div variants={itemVariants} whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(20,255,200,0.06)' }}>
                  <PanelCard className="p-6 flex flex-col items-center justify-center text-center overflow-hidden relative h-full">
                    <div className="absolute top-0 inset-x-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--signal)/0.6), transparent)' }} />
                    <Award className="w-10 h-10 text-signal mb-4" />
                    <div className="text-3xl font-bold text-text-primary-v4 mb-1">
                      <span ref={awardsCount.ref}>{awardsCount.count}</span>+
                    </div>
                    <div className="text-sm text-text-muted-v4">Industry Awards</div>
                  </PanelCard>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="v4-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <h2 className="v4-display text-3xl md:text-4xl font-bold mb-4 text-text-primary-v4">Our Mission & Values</h2>
              <p className="text-xl text-text-secondary-v4 max-w-3xl mx-auto">
                To engineer elegant solutions to complex problems, fostering an environment of continuous learning and uncompromising quality.
              </p>
            </motion.div>
            <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-3 gap-8">
              <motion.div variants={itemVariants}>
                <PanelCard className="p-8 h-full">
                  <Target className="w-8 h-8 text-signal mb-6" />
                  <h3 className="text-xl font-bold mb-3 text-text-primary-v4">Excellence Delivered</h3>
                  <p className="text-text-secondary-v4">We set the highest standards for our work, ensuring every solution we deploy is robust, scalable, and tailored to exceed expectations.</p>
                </PanelCard>
              </motion.div>
              <motion.div variants={itemVariants}>
                <PanelCard className="p-8 h-full">
                  <Users className="w-8 h-8 text-signal mb-6" />
                  <h3 className="text-xl font-bold mb-3 text-text-primary-v4">Collaborative Partnership</h3>
                  <p className="text-text-secondary-v4">We operate as an extension of your team. Our success is fundamentally tied to the long-term success and growth of our clients.</p>
                </PanelCard>
              </motion.div>
              <motion.div variants={itemVariants}>
                <PanelCard className="p-8 h-full">
                  <Globe className="w-8 h-8 text-signal mb-6" />
                  <h3 className="text-xl font-bold mb-3 text-text-primary-v4">Global Perspective</h3>
                  <p className="text-text-secondary-v4">With presence in Jabalpur, Mumbai, Eindhoven, and Chicago, we bring diverse insights and 24/7 capability to every engagement.</p>
                </PanelCard>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="v4-section border-t border-hairline text-center" style={{ background: 'linear-gradient(135deg, rgba(10,18,36,0.98), rgba(6,12,24,1))' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="v4-display text-3xl md:text-4xl font-bold mb-6 text-text-primary-v4">Ready to Transform Your Business?</h2>
            <p className="text-xl text-text-secondary-v4 mb-10">
              Join the 100+ enterprises that trust ELSxGlobal to drive their digital and operational excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="v4-btn-primary rounded-btn px-8 py-4 flex items-center justify-center gap-2 text-lg">
                Get in Touch <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/services" className="v4-btn-secondary rounded-btn px-8 py-4 flex items-center justify-center gap-2 text-lg">
                Explore Our Services
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </main>
  );
}
