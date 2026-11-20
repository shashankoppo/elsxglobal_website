'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Heart, Briefcase, MapPin, Laptop, Coffee, Zap, GraduationCap, Clock, Quote } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { motion } from 'framer-motion';

export default function CareersPage() {
  const [selectedDept, setSelectedDept] = React.useState('All');
  const departments = ['All', 'Engineering', 'Operations', 'KPO', 'Sales', 'Security', 'BPO'];

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

  const filteredJobs = selectedDept === 'All' ? jobs : jobs.filter((job) => job.dept === selectedDept);

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
              <h2 className="v4-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-text-primary-v4">Why ELSxGlobal?</h2>
              <motion.div className="h-0.5 mt-3 rounded-full mb-6" style={{ background: 'linear-gradient(90deg, hsl(var(--signal)), hsl(var(--primary)))' }} initial={{ width: 0 }} whileInView={{ width: 80 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} />
              <p className="text-text-secondary-v4 max-w-2xl mx-auto text-base sm:text-lg">
                We believe in empowering our people to do their best work. When you join ELSxGlobal, you are joining a culture of excellence, collaboration, and growth.
              </p>
            </div>
            
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {perks.map((perk, idx) => (
                <motion.div key={idx} variants={itemVariants} className="flex flex-col items-center text-center">
                  <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl flex items-center justify-center text-signal mb-4 border border-hairline" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)/0.15), hsl(var(--accent)/0.08))' }}>
                    {perk.icon}
                  </div>
                  <h3 className="font-bold text-text-primary-v4 mb-2 text-sm sm:text-base">{perk.title}</h3>
                  <p className="text-xs sm:text-sm text-text-secondary-v4">{perk.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="v4-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col mb-8">
              <h2 className="v4-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary-v4 mb-2">Open Positions</h2>
              <motion.div className="h-0.5 mt-3 rounded-full mb-6 w-20" style={{ background: 'linear-gradient(90deg, hsl(var(--signal)), hsl(var(--primary)))' }} initial={{ width: 0 }} whileInView={{ width: 80 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} />
              <p className="text-text-secondary-v4 text-base sm:text-lg">Find your next role.</p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap gap-2 mb-8">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-3.5 py-1.5 rounded-chip text-xs sm:text-sm font-medium transition-colors ${
                    selectedDept === dept
                      ? 'bg-signal/20 text-signal border border-signal/50'
                      : 'bg-ink-surface-2 text-text-muted-v4 hover:text-text-primary-v4 border border-hairline'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {filteredJobs.map((job, idx) => (
                <motion.div key={idx} variants={jobVariants} whileHover={{ scale: 1.02, boxShadow: '0 20px 60px rgba(20,255,200,0.07)' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="flex">
                  <PanelCard className="p-5 sm:p-6 flex flex-col justify-between gap-4 hover:border-signal/50 transition-colors group cursor-pointer w-full h-full">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-lg sm:text-xl font-bold text-text-primary-v4 group-hover:text-signal transition-colors">{job.title}</h3>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-chip bg-ink-surface-2 border border-hairline text-signal shrink-0">
                          {job.type}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-text-muted-v4 mt-3">
                        <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-signal" /> {job.dept}</span>
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-signal" /> {job.loc}</span>
                      </div>
                    </div>
                    <div className="pt-2 flex justify-end">
                      <Link href="/contact" className="v4-btn-primary rounded-btn px-4 py-2 text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 w-full sm:w-auto">
                        Apply Now <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
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
              <h2 className="v4-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-text-primary-v4">Life at ELSxGlobal</h2>
              <motion.div className="h-0.5 mt-3 rounded-full mb-6" style={{ background: 'linear-gradient(90deg, hsl(var(--signal)), hsl(var(--primary)))' }} initial={{ width: 0 }} whileInView={{ width: 80 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} />
              <p className="text-text-secondary-v4 max-w-2xl mx-auto text-base sm:text-lg">Hear from our team.</p>
            </div>
            
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.div variants={itemVariants}>
                <PanelCard className="p-6 sm:p-8 relative h-full">
                  <motion.div 
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                    className="absolute -top-4 -left-4 text-signal opacity-50"
                  >
                    <Quote className="w-8 sm:w-10 h-8 sm:h-10" />
                  </motion.div>
                  <p className="text-text-secondary-v4 italic mb-6 text-sm sm:text-base leading-relaxed">"ELSxGlobal provided me with the platform to work on bleeding-edge tech. The culture here genuinely supports continuous learning."</p>
                  <div className="font-bold text-text-primary-v4 text-sm sm:text-base">Jane Doe</div>
                  <div className="text-xs sm:text-sm text-text-muted-v4">Senior Engineer</div>
                </PanelCard>
              </motion.div>
              <motion.div variants={itemVariants}>
                <PanelCard className="p-6 sm:p-8 relative h-full">
                  <motion.div 
                    animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 1 }}
                    className="absolute -top-4 -left-4 text-signal opacity-50"
                  >
                    <Quote className="w-8 sm:w-10 h-8 sm:h-10" />
                  </motion.div>
                  <p className="text-text-secondary-v4 italic mb-6 text-sm sm:text-base leading-relaxed">"The flexibility and focus on wellness make this the best place I've ever worked. Highly recommend joining our team!"</p>
                  <div className="font-bold text-text-primary-v4 text-sm sm:text-base">John Smith</div>
                  <div className="text-xs sm:text-sm text-text-muted-v4">Operations Manager</div>
                </PanelCard>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="v4-section bg-ink-surface-2 border-t border-hairline text-center flex flex-col items-center" style={{ background: 'linear-gradient(135deg, rgba(10,18,36,0.98), rgba(6,12,24,1))' }}>
          <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-16 flex flex-col items-center">
            <h2 className="v4-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-text-primary-v4">Don't see a perfect fit?</h2>
            <motion.div className="h-0.5 mt-3 rounded-full mb-6" style={{ background: 'linear-gradient(90deg, hsl(var(--signal)), hsl(var(--primary)))' }} initial={{ width: 0 }} whileInView={{ width: 80 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} />
            <p className="text-base sm:text-lg text-text-secondary-v4 mb-8 max-w-2xl mx-auto">
              We are always looking for talented individuals. Send us your resume and we will keep you in mind for future opportunities.
            </p>
            <Link href="/contact" className="v4-btn-primary rounded-btn px-8 py-3.5 inline-flex items-center justify-center gap-2 w-full sm:w-auto text-base animate-pulse">Submit General Application <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </section>
      </ScrollReveal>
    </main>
  );
}


