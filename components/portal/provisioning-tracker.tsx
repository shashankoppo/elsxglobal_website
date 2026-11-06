'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, Shield, Globe, Terminal, CheckCircle2, Loader2 } from 'lucide-react';

const PROVISIONING_STEPS = [
  { id: 'allocate', icon: Globe, label: 'Allocating IPv4/IPv6 Addresses', duration: 3000 },
  { id: 'firewall', icon: Shield, label: 'Configuring Edge Firewall', duration: 2500 },
  { id: 'boot', icon: Server, label: 'Booting Hypervisor & OS', duration: 4000 },
  { id: 'network', icon: Terminal, label: 'Propagating DNS Records', duration: 2000 },
];

export function ProvisioningTracker({ onComplete }: { onComplete?: () => void }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (completed) return;

    const currentStep = PROVISIONING_STEPS[currentStepIndex];
    if (!currentStep) {
      setCompleted(true);
      if (onComplete) onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStepIndex(prev => prev + 1);
    }, currentStep.duration);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStepIndex, completed]);

  return (
    <div className="v4-panel p-8 rounded-2xl max-w-md mx-auto relative overflow-hidden bg-ink-surface-2 border border-hairline shadow-2xl">
      {/* Background glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-signal/20 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-ink-surface border border-hairline mb-4 shadow-inner">
            {completed ? (
              <CheckCircle2 className="h-8 w-8 text-good animate-in zoom-in duration-300" />
            ) : (
              <Server className="h-8 w-8 text-primary animate-pulse" />
            )}
          </div>
          <h3 className="text-xl font-bold text-text-primary-v4">
            {completed ? 'Server Deployed' : 'Deploying Infrastructure'}
          </h3>
          <p className="text-sm text-text-muted-v4 mt-2">
            {completed ? 'Your instance is online and ready.' : 'Please wait while we provision your resources.'}
          </p>
        </div>

        <div className="space-y-6">
          {PROVISIONING_STEPS.map((step, index) => {
            const isCompleted = index < currentStepIndex || completed;
            const isCurrent = index === currentStepIndex && !completed;
            const isPending = index > currentStepIndex;

            return (
              <div key={step.id} className="relative flex items-center gap-4">
                {/* Connecting line */}
                {index < PROVISIONING_STEPS.length - 1 && (
                  <div className={`absolute left-[15px] top-8 bottom-[-24px] w-[2px] rounded-full transition-colors duration-500 ${isCompleted ? 'bg-primary' : 'bg-hairline'}`} />
                )}
                
                <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center bg-ink-surface transition-colors duration-500 shrink-0 ${isCompleted ? 'border-primary' : isCurrent ? 'border-signal' : 'border-hairline'}`}>
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : isCurrent ? (
                    <Loader2 className="h-4 w-4 text-signal animate-spin" />
                  ) : (
                    <step.icon className="h-4 w-4 text-text-muted-v4" />
                  )}
                </div>

                <div className="flex-1">
                  <p className={`text-sm font-medium transition-colors duration-500 ${isCompleted || isCurrent ? 'text-text-primary-v4' : 'text-text-muted-v4'}`}>
                    {step.label}
                  </p>
                  <AnimatePresence>
                    {isCurrent && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="h-1 w-full bg-hairline rounded-full mt-2 overflow-hidden">
                          <motion.div
                            className="h-full bg-signal rounded-full"
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: step.duration / 1000, ease: 'linear' }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
