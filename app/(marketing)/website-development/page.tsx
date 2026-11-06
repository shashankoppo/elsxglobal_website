'use client';

import { motion, useInView } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import { Globe, ShoppingCart, Layers, BarChart3, ArrowRight, CheckCircle2, Zap, Star } from 'lucide-react';

function useCountUp(end: number, duration: number = 2) {
  const [count, setCount] = useState(0);
  const nodeRef = useRef<HTMLDivElement>(null);
  const inView = useInView(nodeRef, { once: true, amount: 0.5 });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const increment = end / (duration * 60);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.ceil(start));
        }
      }, 1000 / 60);
      return () => clearInterval(timer);
    }
  }, [end, duration, inView]);

  return { count, nodeRef };
}

function AnimatedStat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { count, nodeRef } = useCountUp(value);
  return (
    <div ref={nodeRef} className="flex flex-col items-center p-6 text-center">
      <div className="text-4xl font-bold text-signal mb-2">
        {count}
        {suffix}
      </div>
      <div className="text-text-secondary-v4 font-medium">{label}</div>
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function WebsiteDevelopmentPage() {
  const services = [
    { icon: <Globe className="w-6 h-6 text-signal" />, title: 'Corporate Websites', desc: 'Authoritative, fast-loading corporate presence that establishes trust.' },
    { icon: <ShoppingCart className="w-6 h-6 text-signal" />, title: 'E-commerce Platforms', desc: 'High-conversion headless commerce using Shopify or WooCommerce architectures.' },
    { icon: <Layers className="w-6 h-6 text-signal" />, title: 'Landing Pages & CRO', desc: 'Data-driven landing pages optimized for maximum conversion rate.' },
    { icon: <BarChart3 className="w-6 h-6 text-signal" />, title: 'CMS & Content', desc: 'Scalable content management systems tailored to your workflows.' }
  ];

  return (
    <div className="v4-page bg-ink text-text-primary-v4 min-h-screen">
      <PageHeroV4
        eyebrow="Website Development"
        title={<>Websites That Convert, <span className="text-signal">Scale, and Impress</span></>}
        description="From corporate powerhouses to high-converting e-commerce stores — we build websites that perform, load fast, and turn visitors into customers."
      />

      <section className="v4-section pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <AnimatedStat value={340} suffix="%" label="Average Conversion Lift" />
            <AnimatedStat value={99} suffix="%" label="Uptime Guarantee" />
            <AnimatedStat value={50} suffix="+" label="Industry Awards" />
            <AnimatedStat value={100} suffix="M+" label="Revenue Generated" />
          </div>
        </div>
      </section>

      <section className="v4-section bg-ink-surface border-y border-hairline py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 flex flex-col items-center">
            <h2 className="v4-display text-3xl md:text-4xl font-semibold mb-4">Our Core Services</h2>
            <p className="text-text-secondary-v4 max-w-2xl text-lg">Delivering tailored web solutions that meet specific vertical requirements and exceed benchmarks.</p>
            <motion.div className="h-0.5 mt-3 rounded-full" style={{ background: 'linear-gradient(90deg, hsl(var(--signal)), hsl(var(--primary)))' }} initial={{ width: 0 }} whileInView={{ width: 80 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} />
          </div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {services.map((service, i) => (
              <motion.div key={i} variants={itemVariants}>
                <motion.div 
                  whileHover={{ scale: 1.02, boxShadow: '0 20px 60px rgba(20,255,200,0.07)' }} 
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="h-full"
                >
                  <PanelCard className="h-full p-8 flex flex-col border border-hairline bg-ink">
                    <div className="mb-6 bg-ink-surface-2 p-3 rounded-lg border border-hairline self-start">
                      {service.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                    <p className="text-text-secondary-v4">{service.desc}</p>
                  </PanelCard>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="v4-section py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 flex flex-col items-center">
            <h2 className="v4-display text-3xl md:text-4xl font-semibold mb-4">Powered by Best-in-Class Platforms</h2>
            <p className="text-text-secondary-v4 max-w-2xl text-lg">We use the most robust technologies to build fast, scalable, and reliable digital products.</p>
            <motion.div className="h-0.5 mt-3 rounded-full" style={{ background: 'linear-gradient(90deg, hsl(var(--signal)), hsl(var(--primary)))' }} initial={{ width: 0 }} whileInView={{ width: 80 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} />
          </div>
          
          <ScrollReveal>
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
              {['Next.js', 'React', 'TypeScript', 'Webflow', 'Shopify', 'WordPress', 'Strapi', 'Vercel'].map((tech, i) => (
                <div key={i} className="px-6 py-3 rounded-xl bg-ink-surface border border-hairline text-text-primary-v4 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-signal" />
                  {tech}
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="v4-section-sm border-t border-hairline bg-gradient-to-b from-ink to-ink-surface py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="v4-display text-3xl font-bold mb-4">Is your current website underperforming?</h2>
          <p className="text-text-secondary-v4 mb-8 text-lg max-w-2xl mx-auto">Let our experts analyze your architecture, performance, and conversion funnels.</p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
            <Link href="/contact" className="v4-btn-primary rounded-btn inline-flex items-center justify-center px-8 py-4 text-lg bg-signal text-ink font-semibold">
              Get a free website audit <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
