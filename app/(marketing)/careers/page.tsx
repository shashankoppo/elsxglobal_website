'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Heart, Briefcase, MapPin, Laptop, Coffee, Zap, GraduationCap, Clock, Quote } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { motion } from 'framer-motion';

export default function CareersPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const jobVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  const jobs = [
    { title: 'Senior Next.js Developer', dept: 'Engineering', loc: 'Jabalpur / Remote', type: 'Full-time' },
    { title: 'AI Solutions Architect', dept: 'Engineering', loc: 'Eindhoven, NL', type: 'Full-time' },
    { title: 'BPO Operations Manager', dept: 'Operations', loc: 'Mumbai, IN', type: 'Full-time' },
    { title: 'Data Science Lead', dept: 'KPO', loc: 'Chicago, USA', type: 'Full-time' },
    { title: 'Enterprise Sales Exec', dept: 'Sales', loc: 'Dubai, UAE', type: 'Full-time' },
    { title: 'Cybersecurity Analyst', dept: 'Security', loc: 'Remote', type: 'Full-time' },
    { title: 'Customer Success Specialist', dept: 'BPO', loc: 'Pune, IN', type: 'Full-time' },
    { title: 'Cloud Infrastructure Engineer', dept: 'Engineering', loc: 'Bangalore, IN', type: 'Full-time' }
  ];

  const perks = [
    { icon: <Laptop className="w-6 h-6" />, title: 'Hybrid/Remote Work', desc: 'Flexible work models designed for work-life harmony.' },
    { icon: <Heart className="w-6 h-6" />, title: 'Health & Wellness', desc: 'Comprehensive medical insurance and wellness programs.' },
    { icon: <GraduationCap className="w-6 h-6" />, title: 'Continuous Learning', desc: 'L&D budget, certifications, and upskilling opportunities.' },
    { icon: <Coffee className="w-6 h-6" />, title: 'Modern Workspaces', desc: 'State-of-the-art global offices with top-tier amenities.' },
    { icon: <Zap className="w-6 h-6" />, title: 'Performance Bonuses', desc: 'Competitive compensation with rewarding bonus structures.' }
  ];

  return (
    <main className="v4-page bg-ink text-text-primary-v4">
      <PageHeroV4 
        title="Build the Future with Us"
        description="Join our global team of 200+ innovators solving complex enterprise challenges." eyebrow="Careers" />

      <ScrollReveal>
        <section className="v4-section bg-ink-surface border-y border-hairline">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 flex flex-col items-center">
              <h2 className="v4-display text-3xl font-bold mb-4 text-text-primary-v4">Why ELSxGlobal?</h2>
              <motion.div className="h-0.5 mt-3 rounded-full mb-6" style={{ background: 'linear-gradient(90deg, hsl(var(--signal)), hsl(var(--primary)))' }} initial={{ width: 0 }} whileInView={{ width: 80 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} />
              <p className="text-text-secondary-v4 max-w-2xl mx-auto">
                We believe in empowering our people to do their best work. When you join ELSxGlobal, you are joining a culture of excellence, collaboration, and growth.
              </p>
            </div>
            
            <motion.div 
              className="grid md:grid-cols-3 lg:grid-cols-5 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {perks.map((perk, idx) => (
                <motion.div key={idx} variants={itemVariants} className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-signal mb-4 border border-hairline" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)/0.15), hsl(var(--accent)/0.08))' }}>
                    {perk.icon}
                  </div>
                  <h3 className="font-bold text-text-primary-v4 mb-2">{perk.title}</h3>
                  <p className="text-sm text-text-secondary-v4">{perk.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="v4-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col mb-10">
              <h2 className="v4-display text-3xl font-bold text-text-primary-v4 mb-2">Open Positions</h2>
              <motion.div className="h-0.5 mt-3 rounded-full mb-6 w-20" style={{ background: 'linear-gradient(90deg, hsl(var(--signal)), hsl(var(--primary)))' }} initial={{ width: 0 }} whileInView={{ width: 80 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} />
              <p className="text-text-secondary-v4">Find your next role.</p>
            </div>

            <motion.div 
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {jobs.map((job, idx) => (
                <motion.div key={idx} variants={jobVariants} whileHover={{ scale: 1.02, boxShadow: '0 20px 60px rgba(20,255,200,0.07)' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                  <PanelCard className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-signal/50 transition-colors group cursor-pointer">
                    <div>
                      <h3 className="text-xl font-bold text-text-primary-v4 group-hover:text-signal transition-colors mb-2">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted-v4">
                        <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {job.dept}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.loc}</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {job.type}</span>
                      </div>
                    </div>
                    <Link href="/contact" className="v4-btn-primary rounded-btn px-5 py-2 whitespace-nowrap text-sm shrink-0">Apply →</Link>
                  </PanelCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="v4-section bg-ink-surface-2 border-y border-hairline">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-16">
              <h2 className="v4-display text-3xl font-bold mb-4 text-text-primary-v4">Life at ELSxGlobal</h2>
              <motion.div className="h-0.5 mt-3 rounded-full mb-6" style={{ background: 'linear-gradient(90deg, hsl(var(--signal)), hsl(var(--primary)))' }} initial={{ width: 0 }} whileInView={{ width: 80 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} />
              <p className="text-text-secondary-v4 max-w-2xl mx-auto">Hear from our team.</p>
            </div>
            
            <motion.div className="grid md:grid-cols-2 gap-8" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.div variants={itemVariants}>
                <PanelCard className="p-8 relative">
                  <motion.div 
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                    className="absolute -top-4 -left-4 text-signal opacity-50"
                  >
                    <Quote className="w-10 h-10" />
                  </motion.div>
                  <p className="text-text-secondary-v4 italic mb-6">"ELSxGlobal provided me with the platform to work on bleeding-edge tech. The culture here genuinely supports continuous learning."</p>
                  <div className="font-bold text-text-primary-v4">Jane Doe</div>
                  <div className="text-sm text-text-muted-v4">Senior Engineer</div>
                </PanelCard>
              </motion.div>
              <motion.div variants={itemVariants}>
                <PanelCard className="p-8 relative">
                  <motion.div 
                    animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 1 }}
                    className="absolute -top-4 -left-4 text-signal opacity-50"
                  >
                    <Quote className="w-10 h-10" />
                  </motion.div>
                  <p className="text-text-secondary-v4 italic mb-6">"The flexibility and focus on wellness make this the best place I've ever worked. Highly recommend joining our team!"</p>
                  <div className="font-bold text-text-primary-v4">John Smith</div>
                  <div className="text-sm text-text-muted-v4">Operations Manager</div>
                </PanelCard>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="v4-section bg-ink-surface-2 border-t border-hairline text-center flex flex-col items-center" style={{ background: 'linear-gradient(135deg, rgba(10,18,36,0.98), rgba(6,12,24,1))' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <h2 className="v4-display text-3xl font-bold mb-4 text-text-primary-v4">Don't see a perfect fit?</h2>
            <motion.div className="h-0.5 mt-3 rounded-full mb-6" style={{ background: 'linear-gradient(90deg, hsl(var(--signal)), hsl(var(--primary)))' }} initial={{ width: 0 }} whileInView={{ width: 80 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} />
            <p className="text-lg text-text-secondary-v4 mb-8">
              We are always looking for talented individuals. Send us your resume and we will keep you in mind for future opportunities.
            </p>
            <Link href="/contact" className="v4-btn-primary rounded-btn px-8 py-3 inline-flex items-center gap-2 animate-pulse">Submit General Application <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </section>
      </ScrollReveal>
    </main>
  );
}


