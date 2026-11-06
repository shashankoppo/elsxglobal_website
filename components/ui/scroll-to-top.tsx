'use client';

import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggle = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', toggle, { passive: true });
    return () => window.removeEventListener('scroll', toggle);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
      className="fixed bottom-24 right-6 z-30 flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95 isolate"
      style={{
        background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
        boxShadow: '0 4px 20px hsl(var(--primary)/0.4), 0 0 0 1px rgba(255,255,255,0.1)',
        willChange: 'transform',
      }}
    >
      <ChevronUp className="h-5 w-5 text-white relative z-10" />
      {/* Glossy sheen */}
      <span
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 55%)' }}
      />
    </button>
  );
}
