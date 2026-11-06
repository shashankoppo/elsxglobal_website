'use client';

import { useState, useEffect } from 'react';
import { Quote } from 'lucide-react';
import { PanelCard } from '@/components/ui/panel-card';

const TESTIMONIALS = [
  { quote: 'ELSxGlobal replaced our 6-vendor mess with one unified transformation engine. 3-year ROI: 3.5x.', author: 'CTO, Fortune 500 Manufacturing Co.' },
  { quote: "VaultHost's AI-Ops predicted our Black Friday traffic and scaled 10 minutes early. Zero downtime.", author: 'VP Engineering, Regional E-Commerce Leader' },
  { quote: "ELSxKPO's market intelligence changed how we approach M&A. The predictive models are genuinely next-level.", author: 'Head of Strategy, Global BFSI Group' },
];

export function OutcomesCarouselClient() {
  const [testIdx, setTestIdx] = useState(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;
    
    const interval = setInterval(() => setTestIdx((prev) => (prev + 1) % TESTIMONIALS.length), 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PanelCard hover={false} className="p-8 lg:p-10 min-h-[280px] flex flex-col justify-center">
      <Quote className="h-8 w-8 text-signal/30 mb-4" />
      <div key={testIdx} className="animate-fade-in">
        <p className="text-base lg:text-lg text-text-primary-v4 leading-relaxed">"{TESTIMONIALS[testIdx].quote}"</p>
        <p className="mt-4 text-sm text-text-muted-v4">— {TESTIMONIALS[testIdx].author}</p>
      </div>
      <div className="flex gap-1.5 mt-6">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => setTestIdx(i)}
            className={i === testIdx ? 'h-1.5 w-6 rounded-chip bg-signal transition-all' : 'h-1.5 w-1.5 rounded-chip bg-hairline hover:bg-hairline-2 transition-all'}
            aria-label={`Testimonial ${i + 1}`}
          />
        ))}
      </div>
    </PanelCard>
  );
}
