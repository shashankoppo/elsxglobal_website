'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export function ScrollReveal({ 
  children, 
  className, 
  animation = 'fade-up', 
  delay = 0 
}: { 
  children: React.ReactNode, 
  className?: string, 
  animation?: 'fade-up' | 'fade-in' | 'fade-scale' | 'slide-in-up', 
  delay?: number 
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasReducedMotion, setHasReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setHasReducedMotion(mediaQuery.matches);
    
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      }
    }, { threshold: 0.05, rootMargin: '50px' });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  if (hasReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div 
      ref={ref} 
      className={cn(className, !isVisible && 'opacity-0', isVisible && `animate-${animation}`)}
      style={isVisible && delay > 0 ? { animationDelay: `${delay}ms`, animationFillMode: 'forwards' } : undefined}
    >
      {children}
    </div>
  );
}
