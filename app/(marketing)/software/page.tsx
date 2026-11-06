'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import { MonitorSmartphone, Code2, Cloud, Server, ArrowRight, CheckCircle2 } from 'lucide-react';

const stats = [
  { end: 500, suffix: '+', label: 'Apps Delivered' },
  { end: 99.8, suffix: '%', label: 'Uptime SLA', isFloat: true },
  { end: 12, suffix: '+', label: 'Tech Stacks' },
  { end: 48, suffix: 'hr', label: 'Sprint Cycles' }
];

const services = [
  {
    icon: <Code2 className="w-6 h-6 text-signal" />,
    title: 'Web Applications',
    description: 'Enterprise-grade web apps built for performance, security, and scalability.',
    features: ['High-performance SPAs', 'Progressive Web Apps (PWA)', 'Secure architectures'],
  },
  {
    icon: <MonitorSmartphone className="w-6 h-6 text-signal" />,
    title: 'Mobile Apps',
    description: 'Native and cross-platform mobile experiences for iOS and Android devices.',
    features: ['React Native & Flutter', 'Native iOS (Swift)', 'Native Android (Kotlin)'],
  },
  {
    icon: <Cloud className="w-6 h-6 text-signal" />,
    title: 'SaaS Platforms',
    description: 'End-to-end development of multi-tenant SaaS products and platforms.',
    features: ['Multi-tenant architecture', 'Subscription management', 'Scalable infrastructure'],
  },
  {
    icon: <Server className="w-6 h-6 text-signal" />,
    title: 'API & Microservices',
    description: 'Robust backend systems that power modern applications across all devices.',
    features: ['RESTful & GraphQL APIs', 'Microservices design', 'High-throughput systems'],
  }
];

const technologies = ['React', 'Next.js', 'Node.js', 'Python', 'Go', 'PostgreSQL', 'Redis', 'Kubernetes', 'AWS', 'GCP'];

const processSteps = [
  { step: '01', title: 'Discovery', desc: 'Requirements analysis and roadmap planning.' },
  { step: '02', title: 'Architecture', desc: 'System design and technology selection.' },
  { step: '03', title: 'Sprint Dev', desc: 'Agile development with regular milestones.' },
  { step: '04', title: 'QA', desc: 'Rigorous automated and manual testing.' },
  { step: '05', title: 'Deploy', desc: 'Seamless CI/CD deployment to production.' },
  { step: '06', title: 'Support', desc: 'Ongoing maintenance and monitoring.' },
];

function CountUp({ end, suffix = '', isFloat = false }: { end: number, suffix?: string, isFloat?: boolean }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(isFloat ? Number(start.toFixed(1)) : Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, inView, isFloat]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as any, stiffness: 300, damping: 30 } }
};

const processContainerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const processItemVariants = {
  hidden: { opacity: 0, x: -50 },
  show: { opacity: 1, x: 0, transition: { type: "spring" as any, stiffness: 300, damping: 30 } }
};

const techContainerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const techItemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function SoftwareDevelopmentPage() {
  return (
    <main className="v4-page bg-ink text-text-primary-v4 min-h-screen relative overflow-hidden">
      <div className="relative">
        <div className="absolute inset-0 pointer-events-none z-0 opacity-20">
           <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="absolute top-20 left-[15%]">
             <Code2 className="w-16 h-16 text-signal" />
           </motion.div>
           <motion.div animate={{ y: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }} className="absolute top-40 right-[15%]">
             <MonitorSmartphone className="w-20 h-20 text-signal" />
           </motion.div>
           <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 2 }} className="absolute bottom-20 left-[25%]">
             <Cloud className="w-24 h-24 text-signal" />
           </motion.div>
           <motion.div animate={{ y: [0, 25, 0] }} transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }} className="absolute top-32 right-[40%]">
             <Server className="w-12 h-12 text-signal" />
           </motion.div>
        </div>
        
        <PageHeroV4 
          eyebrow="Custom Software Development"
          title={
            <span className="v4-display relative z-10">Software Built for <span className="text-signal">Enterprise Scale</span></span>
          }
          description="We build bespoke, high-performance software solutions tailored to your unique business challenges, driving operational efficiency and accelerating growth."
        />
      </div>

      <ScrollReveal>
        <section className="v4-section-sm border-b border-hairline relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
              {stats.map((stat, i) => (
                <div key={i}>
                  <div className="text-3xl md:text-4xl font-bold text-signal mb-2">
                    <CountUp end={stat.end} suffix={stat.suffix} isFloat={stat.isFloat} />
                  </div>
                  <div className="text-text-secondary-v4 text-sm font-medium uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      <section className="v4-section relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-16 flex flex-col items-center">
            <h2 className="v4-display text-3xl md:text-4xl font-semibold mb-4">Our Core Capabilities</h2>
            <p className="text-text-secondary-v4 max-w-2xl mx-auto text-lg">Comprehensive software development services designed to meet the demands of modern enterprises.</p>
            <motion.div className="h-0.5 mt-3 rounded-full" style={{ background: 'linear-gradient(90deg, hsl(var(--signal)), hsl(var(--primary)))' }} initial={{ width: 0 }} whileInView={{ width: 80 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} />
          </div>
          
          <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="grid md:grid-cols-2 gap-6">
            {services.map((service, i) => (
              <motion.div key={i} variants={itemVariants} whileHover={{ scale: 1.02, boxShadow: '0 20px 60px rgba(20,255,200,0.07)' }} transition={{ type: "spring" as any, stiffness: 300, damping: 30 }} className="h-full">
                <PanelCard className="h-full flex flex-col justify-between p-8">
                  <div>
                    <div className="bg-ink-surface-2 p-3 rounded-lg inline-block mb-6 border border-hairline">
                      {service.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                    <p className="text-text-secondary-v4 mb-6">{service.description}</p>
                    <ul className="space-y-3 mb-8">
                      {service.features.map((feature, j) => (
                        <li key={j} className="flex items-start text-text-primary-v4">
                          <CheckCircle2 className="w-5 h-5 text-signal mr-3 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link href="/contact" className="inline-flex items-center text-signal font-medium hover:opacity-80 transition-opacity">
                    Learn more <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </PanelCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="v4-section bg-ink-surface border-y border-hairline relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-12 flex flex-col items-center">
            <h2 className="v4-display text-2xl md:text-3xl font-semibold mb-4">Enterprise Technology Stack</h2>
            <p className="text-text-secondary-v4">We leverage modern, scalable technologies to build robust software.</p>
            <motion.div className="h-0.5 mt-3 rounded-full" style={{ background: 'linear-gradient(90deg, hsl(var(--signal)), hsl(var(--primary)))' }} initial={{ width: 0 }} whileInView={{ width: 80 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} />
          </div>
          <motion.div variants={techContainerVariants} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {technologies.map((tech, i) => (
              <motion.div key={i} variants={techItemVariants} className="px-5 py-2.5 rounded-full bg-ink-surface-2 border border-hairline text-text-primary-v4 font-medium text-sm hover:border-signal/40 hover:text-signal transition-colors">
                {tech}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="v4-section relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-16 flex flex-col items-center">
            <h2 className="v4-display text-3xl md:text-4xl font-semibold mb-4">Our Development Process</h2>
            <p className="text-text-secondary-v4 max-w-2xl mx-auto text-lg">A proven methodology for delivering high-quality software on time and within budget.</p>
            <motion.div className="h-0.5 mt-3 rounded-full" style={{ background: 'linear-gradient(90deg, hsl(var(--signal)), hsl(var(--primary)))' }} initial={{ width: 0 }} whileInView={{ width: 80 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} />
          </div>
          
          <motion.div variants={processContainerVariants} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {processSteps.map((step, i) => (
              <motion.div key={i} variants={processItemVariants} className="relative border border-hairline bg-ink-surface-2 p-6 rounded-2xl h-full">
                <div className="text-5xl font-bold absolute top-3 right-4 pointer-events-none select-none" style={{ color: 'hsl(var(--signal)/0.12)' }}>
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold mb-2 mt-4 text-signal">{step.title}</h3>
                <p className="text-text-secondary-v4 text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="v4-section-sm border-t border-hairline relative z-10" style={{ background: 'linear-gradient(135deg, rgba(10,18,36,0.98), rgba(6,12,24,1))' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl flex flex-col items-center">
          <h2 className="v4-display text-3xl font-bold mb-6">Ready to build something extraordinary?</h2>
          <p className="text-text-secondary-v4 mb-8 text-lg">Partner with our expert engineering team to bring your software vision to life.</p>
          <motion.div animate={{ scale: [1, 1.05, 1], boxShadow: ['0 0 0px rgba(20,255,200,0)', '0 0 20px rgba(20,255,200,0.5)', '0 0 0px rgba(20,255,200,0)'] }} transition={{ repeat: Infinity, duration: 2 }} className="inline-block rounded-btn">
            <Link href="/contact" className="v4-btn-primary rounded-btn inline-flex items-center px-8 py-4 text-lg bg-gradient-to-r from-signal to-primary border-none">
              Start your project <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
