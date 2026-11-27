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
    if (mediaQuery.matches) {
      setHasReducedMotion(true);
      setIsVisible(true);
      return;
    }

    const el = ref.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 120) {
        setIsVisible(true);
        return;
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (el) observer.unobserve(el);
        }
      },
      { threshold: 0.01, rootMargin: '120px' }
    );

    if (el) observer.observe(el);
    const safetyTimer = setTimeout(() => setIsVisible(true), 350);

    return () => {
      clearTimeout(safetyTimer);
      observer.disconnect();
    };
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
