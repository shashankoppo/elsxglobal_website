'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

export type LeadIntent = 'consultation' | 'proposal' | 'discovery' | 'contact' | 'resources' | 'lead-magnet' | 'newsletter' | 'download' | 'demo';

type LeadState = {
  open: boolean;
  intent: LeadIntent;
  openLead: (intent?: LeadIntent) => void;
  closeLead: () => void;
};

const LeadContext = createContext<LeadState | null>(null);

export function LeadProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [intent, setIntent] = useState<LeadIntent>('consultation');

  const openLead = useCallback((next: LeadIntent = 'consultation') => {
    setIntent(next);
    setOpen(true);
  }, []);

  const closeLead = useCallback(() => setOpen(false), []);

  return (
    <LeadContext.Provider value={{ open, intent, openLead, closeLead }}>
      {children}
    </LeadContext.Provider>
  );
}

export function useLead() {
  const ctx = useContext(LeadContext);
  if (!ctx) throw new Error('useLead must be used within LeadProvider');
  return ctx;
}
