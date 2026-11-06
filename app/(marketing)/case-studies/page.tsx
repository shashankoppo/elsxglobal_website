'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, BarChart3, TrendingUp, Building2, Activity } from 'lucide-react';
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';

// Custom CountUp hook
function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing function (easeOutExpo)
      const easeOut = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      setCount(Math.floor(end * easeOut));

      if (progress < duration) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end); // ensure we hit the final number precisely
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, isInView]);

  return { count, ref };
}

// Metric Component to handle formatting and count up
const CountUpMetric = ({ metricString }: { metricString: string }) => {
  // Extract number from string (e.g., '32%', '$12M', '90%')
  const numMatch = metricString.match(/(\d+(?:\.\d+)?)/);
  const num = numMatch ? parseFloat(numMatch[1]) : 0;
  
  const { count, ref } = useCountUp(num, 2000);
  
  // Reconstruct string with count
  const formattedCount = metricString.replace(/(\d+(?:\.\d+)?)/, count.toString());

  return (
    <div ref={ref} className="text-2xl font-black text-signal mb-1">
      {formattedCount}
    </div>
  );
};

// Tilt Card Component
const TiltCard = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      whileHover={{ scale: 1.02, boxShadow: '0 20px 60px rgba(20,255,200,0.07)' }}
      transition={{ type: "spring" as any, stiffness: 300, damping: 30 }}
      className={`h-full ${className}`}
    >
      <div style={{ transform: "translateZ(30px)", height: "100%" }}>
        {children}
      </div>
    </motion.div>
  );
};

export default function CaseStudiesPage() {
  const caseStudies = [
    {
      client: 'Global Logistics Provider',
      industry: 'Logistics',
      icon: <Building2 className="w-6 h-6" />,
      challenge: 'Manual routing processes causing high fuel costs and delivery delays across 500+ daily routes.',
      solution: 'Developed custom AI-driven routing optimization software (ELSxTech) integrating real-time traffic and weather data.',
      results: ['32% reduction in fuel costs', '45% faster delivery times', 'ROI achieved in 4 months'],
      metric: '32%',
      metricLabel: 'Cost Reduction'
    },
    {
      client: 'Leading Healthcare Network',
      industry: 'Healthcare',
      icon: <Activity className="w-6 h-6" />,
      challenge: 'Overwhelmed patient support center with long wait times and fragmented patient records.',
      solution: 'Deployed a dedicated 24/7 medical BPO team with integrated CRM systems and omnichannel support.',
      results: ['90% decrease in wait times', '98% patient satisfaction', 'Zero compliance breaches'],
      metric: '90%',
      metricLabel: 'Faster Response'
    },
    {
      client: 'Fintech Startup Unicorn',
      industry: 'Finance',
      icon: <TrendingUp className="w-6 h-6" />,
      challenge: 'Needed rapid scaling of data analytics to detect fraudulent transactions in real-time.',
      solution: 'Provided ELSxKPO data science experts to build and train advanced machine learning fraud detection models.',
      results: ['99.9% fraud detection accuracy', '$12M saved in first year', 'Real-time processing <50ms'],
      metric: '$12M',
      metricLabel: 'Saved Annually'
    },
    {
      client: 'Multinational Retailer',
      industry: 'Retail',
      icon: <BarChart3 className="w-6 h-6" />,
      challenge: 'Legacy ERP system failing under high traffic loads during peak holiday seasons.',
      solution: 'Led a full digital transformation to a cloud-native microservices architecture on AWS.',
      results: ['100% uptime during Black Friday', '3x increase in concurrent users', '50% lower infrastructure costs'],
      metric: '100%',
      metricLabel: 'Peak Uptime'
    },
    {
      client: 'SaaS Enterprise',
      industry: 'Technology',
      icon: <Activity className="w-6 h-6" />,
      challenge: 'High customer churn due to slow technical support resolution times.',
      solution: 'Established a Tier 2/3 technical helpdesk (ELSxBPO) with SLA-driven performance metrics.',
      results: ['75% faster ticket resolution', '40% reduction in churn', '24/7 global coverage achieved'],
      metric: '75%',
      metricLabel: 'Faster Resolution'
    },
    {
      client: 'Manufacturing Conglomerate',
      industry: 'Manufacturing',
      icon: <Building2 className="w-6 h-6" />,
      challenge: 'Lack of visibility into supply chain bottlenecks and inventory levels.',
      solution: 'Implemented IoT data pipeline and custom dashboard for predictive analytics (ELSxTech & KPO).',
      results: ['20% reduction in inventory holding', 'Predictive maintenance saved $2M', 'End-to-end visibility'],
      metric: '20%',
      metricLabel: 'Inventory Reduction'
    }
  ];

  const categories = ['All', 'Logistics', 'Healthcare', 'Finance', 'Retail', 'Technology', 'Manufacturing'];
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredStudies = caseStudies.filter(study => 
    activeCategory === 'All' ? true : study.industry === activeCategory
  );

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

  return (
    <main className="v4-page bg-ink text-text-primary-v4">
      <PageHeroV4 
        title="Client Success Stories"
        description="Discover how ELSxGlobal drives measurable results for enterprises across the globe." eyebrow="Case Studies" />

      <ScrollReveal>
        <section className="v4-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center mb-12">
              <h2 className="v4-display text-3xl font-bold text-text-primary-v4 text-center">Featured Work</h2>
              <motion.div 
                className="h-0.5 mt-3 rounded-full" 
                style={{ background: 'linear-gradient(90deg, hsl(var(--signal)), hsl(var(--primary)))' }} 
                initial={{ width: 0 }} 
                whileInView={{ width: 80 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.8, delay: 0.2 }} 
              />
            </div>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`relative px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                    activeCategory === cat ? 'text-ink' : 'text-text-secondary-v4 hover:text-text-primary-v4'
                  }`}
                >
                  {activeCategory === cat && (
                    <motion.div
                      layoutId="activeFilter"
                      className="absolute inset-0 bg-signal rounded-full"
                      transition={{ type: "spring" as any, stiffness: 300, damping: 30 }}
                      style={{ zIndex: -1 }}
                    />
                  )}
                  <span className="relative z-10">{cat}</span>
                </button>
              ))}
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredStudies.map((study, idx) => (
                <motion.div key={`${study.client}-${idx}`} variants={itemVariants}>
                  <TiltCard>
                    <PanelCard className="p-0 flex flex-col h-full overflow-hidden border-hairline hover:border-signal/50 transition-all bg-ink">
                      <div className="bg-ink-surface p-6 border-b border-hairline flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold text-signal uppercase tracking-wider mb-2 block">{study.industry}</span>
                          <h3 className="text-xl font-bold text-text-primary-v4">{study.client}</h3>
                        </div>
                        <div className="text-text-muted-v4">
                          {study.icon}
                        </div>
                      </div>
                      
                      <div className="p-6 flex-grow flex flex-col">
                        <div className="mb-6">
                          <h4 className="text-sm font-bold text-text-secondary-v4 mb-2">The Challenge</h4>
                          <p className="text-sm text-text-muted-v4">{study.challenge}</p>
                        </div>
                        <div className="mb-6 flex-grow">
                          <h4 className="text-sm font-bold text-text-secondary-v4 mb-2">Our Solution</h4>
                          <p className="text-sm text-text-muted-v4">{study.solution}</p>
                        </div>
                        
                        <div className="bg-signal/5 rounded-xl p-4 mt-auto">
                          <CountUpMetric metricString={study.metric} />
                          <div className="text-xs font-bold text-text-primary-v4 uppercase">{study.metricLabel}</div>
                        </div>
                      </div>
                    </PanelCard>
                  </TiltCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="v4-section bg-ink-surface-2 border-t border-hairline text-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center mb-6">
              <h2 className="v4-display text-3xl font-bold text-text-primary-v4">Become Our Next Success Story</h2>
              <motion.div 
                className="h-0.5 mt-3 rounded-full" 
                style={{ background: 'linear-gradient(90deg, hsl(var(--signal)), hsl(var(--primary)))' }} 
                initial={{ width: 0 }} 
                whileInView={{ width: 80 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.8, delay: 0.2 }} 
              />
            </div>
            <p className="text-xl text-text-secondary-v4 mb-10 max-w-3xl mx-auto">
              Let's discuss how our tailored solutions can solve your unique business challenges.
            </p>
            <Link href="/contact" className="v4-btn-primary rounded-btn px-8 py-4 inline-flex items-center gap-2 text-lg">
              Start a Conversation <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </ScrollReveal>
    </main>
  );
}


