'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import { Brain, Sparkles, ScanEye, Cpu, ArrowRight, LineChart, ShieldAlert, Bot, FileText, Search, Cog } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as any, stiffness: 300, damping: 24 } }
};

function useCountUp(end: number, duration: number = 2, delay: number = 0) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -50px 0px" });

  useEffect(() => {
    if (!isInView) return;
    let startTime: number | null = null;
    let animationFrame: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp + (delay * 1000);
      const progress = timestamp - startTime;
      if (progress < 0) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }
      const percentage = Math.min(progress / (duration * 1000), 1);
      const easeProgress = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      setCount(Math.floor(easeProgress * end));
      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, delay, isInView]);

  return { count, ref };
}

function StatItem({ stat, index }: { stat: { value: string; label: string }; index: number }) {
  const match = stat.value.match(/(\d+)(.*)/);
  const num = match ? parseInt(match[1], 10) : 0;
  const suffix = match ? match[2] : '';
  const { count, ref } = useCountUp(num, 2, index * 0.1);
  return (
    <div className="p-4" ref={ref}>
      <div className="text-3xl md:text-4xl font-bold text-signal mb-1">
        {count}{suffix}
      </div>
      <div className="text-text-secondary-v4 text-sm font-medium">{stat.label}</div>
    </div>
  );
}

const services = [
  {
    icon: <LineChart className="w-6 h-6 text-signal" />,
    title: 'Predictive Analytics',
    description: 'Leverage historical data to forecast trends, optimize operations, and preempt risks.',
  },
  {
    icon: <Sparkles className="w-6 h-6 text-signal" />,
    title: 'Generative AI & LLMs',
    description: 'Custom fine-tuned language models and RAG pipelines for enterprise knowledge synthesis.',
  },
  {
    icon: <ScanEye className="w-6 h-6 text-signal" />,
    title: 'Computer Vision',
    description: 'Advanced image and video analysis for automated inspection, security, and retail insights.',
  },
  {
    icon: <Cpu className="w-6 h-6 text-signal" />,
    title: 'AI Automation & RPA',
    description: 'Intelligent process automation to eliminate repetitive tasks and streamline workflows.',
  }
];

const useCases = [
  { title: 'Demand Forecasting', icon: <LineChart className="w-5 h-5" />, desc: 'Optimize inventory by predicting market demand with high accuracy.' },
  { title: 'Customer Churn Prediction', icon: <Brain className="w-5 h-5" />, desc: 'Identify at-risk customers early and trigger retention strategies.' },
  { title: 'Document Intelligence', icon: <FileText className="w-5 h-5" />, desc: 'Automate data extraction from unstructured enterprise documents.' },
  { title: 'Quality Inspection', icon: <Search className="w-5 h-5" />, desc: 'Vision-based automated defect detection on manufacturing lines.' },
  { title: 'Chatbots & Assistants', icon: <Bot className="w-5 h-5" />, desc: 'Context-aware conversational agents for 24/7 customer support.' },
  { title: 'Fraud Detection', icon: <ShieldAlert className="w-5 h-5" />, desc: 'Real-time anomaly detection in financial transactions.' }
];

const stages = ['Data Audit', 'Model Design', 'Training', 'Integration', 'Monitoring'];

const stats = [
  { value: '40%', label: 'Avg Cost Reduction' },
  { value: '3x', label: 'Faster Decisions' },
  { value: '95%+', label: 'Model Accuracy' },
  { value: '60+', label: 'AI Models Deployed' }
];

export default function AISolutionsPage() {
  return (
    <main className="v4-page bg-ink text-text-primary-v4 min-h-screen relative overflow-hidden">
      {/* Animated neural network SVG line pattern in background */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="neural-net" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="2" fill="currentColor" className="text-signal" />
              <circle cx="80" cy="60" r="3" fill="currentColor" className="text-primary" />
              <circle cx="50" cy="90" r="2" fill="currentColor" className="text-signal" />
              <path d="M20,20 L80,60 L50,90 Z" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-primary opacity-50" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#neural-net)" />
        </svg>
      </div>

      <div className="relative z-10">
        <PageHeroV4 
          eyebrow="AI & Machine Learning"
          title={
            <span className="v4-display">Intelligence That Drives <span className="text-signal">Business Outcomes</span></span>
          }
          description="Transform your proprietary data into a strategic asset. We build secure, scalable AI solutions that solve complex enterprise challenges."
        />

        <ScrollReveal>
          <section className="v4-section-sm border-b border-hairline bg-ink-surface-2">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {stats.map((stat, i) => (
                  <StatItem key={i} stat={stat} index={i} />
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 flex flex-col items-center">
            <h2 className="v4-display text-3xl md:text-4xl font-semibold mb-4">Core AI Capabilities</h2>
            <motion.div className="h-0.5 mt-3 rounded-full" style={{ background: 'linear-gradient(90deg, hsl(var(--signal)), hsl(var(--primary)))' }} initial={{ width: 0 }} whileInView={{ width: 80 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} />
            <p className="text-text-secondary-v4 max-w-2xl mx-auto text-lg mt-6">Applied artificial intelligence tailored to enterprise security and scale requirements.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {services.map((service, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <PanelCard className="h-full p-8 border border-hairline hover:border-signal/30 transition-all">
                  <div className="flex items-center mb-4">
                    <div className="bg-ink-surface p-3 rounded-lg mr-4 border border-hairline">
                      {service.icon}
                    </div>
                    <h3 className="text-xl font-semibold">{service.title}</h3>
                  </div>
                  <p className="text-text-secondary-v4 text-lg">{service.description}</p>
                </PanelCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="v4-section bg-ink-surface border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 flex flex-col items-center">
            <h2 className="v4-display text-3xl md:text-4xl font-semibold mb-4">High-Impact Use Cases</h2>
            <motion.div className="h-0.5 mt-3 rounded-full" style={{ background: 'linear-gradient(90deg, hsl(var(--signal)), hsl(var(--primary)))' }} initial={{ width: 0 }} whileInView={{ width: 80 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} />
            <p className="text-text-secondary-v4 max-w-2xl mx-auto text-lg mt-6">Practical applications of AI delivering measurable ROI.</p>
          </div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {useCases.map((uc, i) => (
              <motion.div key={i} variants={itemVariants}>
                <motion.div whileHover={{ scale: 1.02, boxShadow: '0 20px 60px rgba(20,255,200,0.07)' }} transition={{ type: "spring" as any, stiffness: 300, damping: 30 }} className="h-full">
                  <PanelCard className="p-6 rounded-2xl border border-hairline h-full flex flex-col bg-ink">
                    <div className="text-signal mb-4">{uc.icon}</div>
                    <h3 className="text-lg font-semibold mb-2">{uc.title}</h3>
                    <p className="text-text-secondary-v4 text-sm">{uc.desc}</p>
                  </PanelCard>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <h2 className="v4-display text-2xl md:text-3xl font-semibold mb-4">Implementation Methodology</h2>
          <motion.div className="h-0.5 mt-3 mb-12 rounded-full" style={{ background: 'linear-gradient(90deg, hsl(var(--signal)), hsl(var(--primary)))' }} initial={{ width: 0 }} whileInView={{ width: 80 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} />
          
          <div className="flex flex-col md:flex-row items-center justify-between relative w-full">
            <motion.div 
              className="hidden md:block absolute top-6 left-0 h-px bg-signal/50 -z-10 origin-left" 
              initial={{ scaleX: 0 }} 
              whileInView={{ scaleX: 1 }} 
              viewport={{ once: true }} 
              transition={{ duration: 1, ease: "easeInOut" }}
              style={{ width: '100%' }}
            />
            {stages.map((stage, i) => (
              <motion.div 
                key={i} 
                className="flex flex-col items-center mb-8 md:mb-0 bg-ink px-4 relative z-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.5 }}
              >
                <div className="w-12 h-12 rounded-full bg-ink-surface-2 border-2 border-signal flex items-center justify-center font-bold text-signal mb-3 shadow-[0_0_15px_rgba(var(--color-signal),0.2)]">
                  {i + 1}
                </div>
                <span className="font-medium text-sm text-text-primary-v4 whitespace-nowrap">{stage}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="v4-section-sm border-t border-hairline relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-signal/10 via-primary/5 to-signal/10 opacity-50 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 flex flex-col items-center">
          <h2 className="v4-display text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-signal to-primary">Ready to accelerate with AI?</h2>
          <p className="text-text-secondary-v4 mb-8 text-lg max-w-2xl">Discover how custom AI solutions can optimize your operations and uncover new opportunities.</p>
          <Link href="/contact" className="v4-btn-primary rounded-btn inline-flex items-center px-8 py-4 text-lg shadow-[0_0_30px_rgba(var(--color-signal),0.4)] hover:shadow-[0_0_40px_rgba(var(--color-signal),0.6)] transition-shadow">
            Book an AI assessment <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
      </div>
    </main>
  );
}

