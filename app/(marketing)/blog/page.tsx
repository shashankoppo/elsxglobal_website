'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Search, Calendar, User } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';

function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      const easeOut = 1 - Math.pow(1 - percentage, 4);
      setCount(Math.floor(end * easeOut));
      if (progress < duration) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, isInView]);

  return { count, ref };
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
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  
  const categories = ['All', 'AI & Tech', 'Cloud', 'BPO/KPO', 'Enterprise Strategy'];

  const posts = [
    { title: 'The Future of BPO: Humans and AI Working Together', cat: 'BPO/KPO', author: 'Rahul Sharma', date: 'Oct 15, 2024' },
    { title: 'Optimizing Next.js for Enterprise Scale', cat: 'AI & Tech', author: 'Priya Desai', date: 'Oct 12, 2024' },
    { title: 'Navigating SOC 2 Compliance in 2024', cat: 'Enterprise Strategy', author: 'Michael Chen', date: 'Oct 05, 2024' },
    { title: 'Data-Driven Decision Making with KPO', cat: 'BPO/KPO', author: 'Sarah Jenkins', date: 'Sep 28, 2024' },
    { title: 'Top 5 Trends in Digital Transformation', cat: 'Enterprise Strategy', author: 'Rahul Sharma', date: 'Sep 20, 2024' },
    { title: 'Building Resilient Supply Chains with Tech', cat: 'AI & Tech', author: 'David Okafor', date: 'Sep 15, 2024' },
    { title: 'Zero Trust Architecture in Cloud Environments', cat: 'Cloud', author: 'Priya Desai', date: 'Sep 10, 2024' },
    { title: 'The ROI of Outsourced Customer Support', cat: 'BPO/KPO', author: 'Sarah Jenkins', date: 'Sep 02, 2024' },
    { title: 'Migrating Legacy Systems to Microservices', cat: 'Cloud', author: 'Michael Chen', date: 'Aug 25, 2024' }
  ];

  const filteredPosts = activeCategory === 'All' 
    ? posts 
    : posts.filter(post => post.cat === activeCategory);

  return (
    <main className="v4-page bg-ink text-text-primary-v4">
      <PageHeroV4 
        title="ELSxGlobal Blog"
        description="Insights, trends, and expert perspectives on technology, operations, and enterprise growth." eyebrow="Insights" />

      <ScrollReveal>
        <section className="v4-section pt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16 rounded-3xl overflow-hidden relative group cursor-pointer bg-ink-surface border border-hairline"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-transparent z-10" />
              <div className="absolute inset-0 bg-gradient-to-br from-signal/20 to-primary/20 opacity-50 z-0" />
              <div className="h-[400px] md:h-[500px] w-full bg-ink-surface-2 bg-cover bg-center" />
              <div className="absolute inset-0 z-20 p-8 md:p-12 flex flex-col justify-center max-w-2xl">
                <span className="text-sm font-bold text-signal uppercase tracking-wider mb-4">Featured</span>
                <h2 className="v4-display text-3xl md:text-5xl text-text-primary-v4 mb-6">The Future of BPO: Humans and AI Working Together</h2>
                <p className="text-text-secondary-v4 mb-8 text-lg">Discover how the integration of artificial intelligence is revolutionizing the Business Process Outsourcing landscape, enhancing efficiency without losing the human touch.</p>
                <div className="flex items-center gap-4 text-sm text-text-muted-v4">
                  <span className="flex items-center gap-1"><User className="w-4 h-4" /> Rahul Sharma</span>
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Oct 15, 2024</span>
                </div>
              </div>
            </motion.div>

            <div className="mb-12">
              <h2 className="v4-display text-3xl mb-1">Latest Articles</h2>
              <motion.div className="h-0.5 mt-3 rounded-full mb-8" style={{ background: 'linear-gradient(90deg, hsl(var(--signal)), hsl(var(--primary)))' }} initial={{ width: 0 }} whileInView={{ width: 80 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} />
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`relative px-4 py-2 rounded-chip text-sm font-medium transition-colors ${activeCategory === cat ? 'text-ink' : 'bg-ink-surface text-text-secondary-v4 hover:text-text-primary-v4 hover:bg-ink-surface-2 border border-hairline'}`}
                  >
                    {activeCategory === cat && (
                      <motion.div
                        layoutId="activeCategory"
                        className="absolute inset-0 bg-signal rounded-chip z-0"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{cat}</span>
                  </button>
                ))}
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted-v4" />
                <input 
                  type="text" 
                  placeholder="Search articles..." 
                  className="w-full bg-ink-surface border border-hairline rounded-btn pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-signal text-text-primary-v4"
                />
              </div>
            </div>

            {/* Grid */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredPosts.map((post, idx) => (
                <motion.div key={idx} variants={itemVariants}>
                <motion.div whileHover={{ scale: 1.02, boxShadow: '0 20px 60px rgba(20,255,200,0.07)' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="h-full">
                <PanelCard className="p-0 flex flex-col h-full hover:border-signal/50 transition-colors group cursor-pointer overflow-hidden">
                  <div className="h-48 bg-ink-surface-2 border-b border-hairline relative">
                    {/* Placeholder for image */}
                    <div className="absolute inset-0 bg-gradient-to-br from-ink-surface to-ink-surface-2 opacity-50"></div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <span className="text-xs font-bold text-signal uppercase tracking-wider mb-3">{post.cat}</span>
                    <h3 className="text-xl font-bold text-text-primary-v4 mb-4 group-hover:text-signal transition-colors">{post.title}</h3>
                    
                    <div className="mt-auto pt-6 flex items-center justify-between text-xs text-text-muted-v4 border-t border-hairline">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                    </div>
                  </div>
                </PanelCard>
                </motion.div>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            <div className="flex justify-center mt-12 gap-2">
              <button className="px-4 py-2 bg-ink-surface border border-hairline rounded-btn text-text-muted-v4 disabled:opacity-50" disabled>Previous</button>
              <button className="px-4 py-2 bg-signal text-ink rounded-btn font-medium">1</button>
              <button className="px-4 py-2 bg-ink-surface border border-hairline rounded-btn hover:bg-ink-surface-2">2</button>
              <button className="px-4 py-2 bg-ink-surface border border-hairline rounded-btn hover:bg-ink-surface-2">Next</button>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </main>
  );
}


