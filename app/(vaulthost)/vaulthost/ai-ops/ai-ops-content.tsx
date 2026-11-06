'use client';

import { useState } from 'react';
import { BrainCircuit, Activity, Zap, Shield, BarChart3, Play, CheckCircle2 } from 'lucide-react';
import { ProductPageV4 } from '@/components/shared/v4-page-templates';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useScrollReveal } from '@/lib/animations';

const STEPS = [
  { icon: BrainCircuit, title: 'Learn', desc: 'ML model trains on your traffic patterns, cron schedules, and external signals.' },
  { icon: BarChart3, title: 'Predict', desc: 'Forecasts load 15 minutes in advance with confidence intervals.' },
  { icon: Zap, title: 'Act', desc: 'Pre-provisions CPU, RAM, and edge capacity automatically.' },
  { icon: Activity, title: 'Report', desc: 'Shows you what it did and why, with full audit trail.' },
];

function SpikeSimulator() {
  const [simulating, setSimulating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const reduced = useReducedMotion();

  const handleSimulate = () => {
    setSimulating(true);
    setShowSuccess(false);
    setTimeout(() => setShowSuccess(true), 2500);
    setTimeout(() => { setSimulating(false); setShowSuccess(false); }, 6000);
  };

  return (
    <div className="v4-panel p-6">
      <h3 className="text-base font-semibold text-text-primary-v4 mb-2">Traffic Spike Simulator</h3>
      <p className="text-sm text-text-secondary-v4 mb-4">Click to see how AI-Ops handles a sudden traffic surge.</p>
      <button
        onClick={handleSimulate}
        disabled={simulating}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-btn v4-btn-secondary text-sm font-medium disabled:opacity-50"
      >
        <Play className="h-4 w-4 text-signal" /> Simulate Traffic Spike
      </button>
      <div className="mt-4 h-32 rounded-panel border border-hairline bg-ink-surface-2 relative overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 130" preserveAspectRatio="none">
          <motion.path
            d="M0,100 L400,100"
            stroke="#2F6FED" strokeWidth="2" fill="none"
            animate={simulating && !reduced ? { d: ["M0,100 L400,100", "M0,100 L80,100 L120,90 L160,70 L200,40 L240,20 L280,30 L320,50 L400,60"] } : {}}
            transition={{ duration: 2 }}
          />
          <motion.path
            d="M0,95 L400,95"
            stroke="#3FBF7F" strokeWidth="2" fill="none" strokeDasharray="4 2"
            animate={simulating && !reduced ? { d: ["M0,95 L400,95", "M0,95 L80,95 L120,80 L160,55 L200,25 L240,10 L280,20 L320,40 L400,50"] } : {}}
            transition={{ duration: 2, delay: 0.1 }}
          />
        </svg>
        <AnimatePresence>
          {simulating && !showSuccess && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute top-3 right-3 v4-readout text-[10px] text-signal px-2 py-1 rounded-chip border border-signal/30 bg-signal/10">
              AI-OPS DETECTED PATTERN MATCH
            </motion.div>
          )}
          {showSuccess && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center">
              <span className="flex items-center gap-2 px-4 py-2 rounded-btn bg-good/10 border border-good/30 text-sm text-good font-medium">
                <CheckCircle2 className="h-4 w-4" /> 0ms of performance degradation
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-3 flex gap-4 v4-readout text-xs">
        <span className="flex items-center gap-1.5 text-text-secondary-v4"><div className="h-2 w-3 bg-signal rounded-sm" /> Traffic</span>
        <span className="flex items-center gap-1.5 text-text-secondary-v4"><div className="h-2 w-3 bg-good rounded-sm" /> AI Pre-Scaled</span>
      </div>
    </div>
  );
}

export default function AiOpsContent() {
  return (
    <ProductPageV4 data={{
      eyebrow: 'VaultHost AI-Ops', eyebrowIcon: BrainCircuit,
      title: <>Infrastructure That Thinks 15 Minutes Ahead</>,
      description: "Reactive scaling is yesterday's problem. VaultHost AI-Ops predicts load and allocates resources before your users feel anything.",
      ctaTitle: 'Enable AI-Ops', ctaHref: '/vaulthost',
      features: [
        { icon: BrainCircuit, title: 'Predictive ML Models', desc: 'Trained on your traffic patterns, cron schedules, and external signals.' },
        { icon: Zap, title: 'Pre-Provisioning', desc: 'Resources allocated 15 minutes before predicted demand spikes.' },
        { icon: Shield, title: 'Anomaly Detection', desc: 'Catches unusual traffic patterns — DDoS, viral moments, bot attacks.' },
        { icon: Activity, title: 'Cost Optimization', desc: 'Scales down automatically when traffic drops. Save 34% on average.' },
      ],
      stats: [
        { value: 15, suffix: ' min', label: 'Prediction Window' },
        { value: 34, suffix: '%', label: 'Avg Cost Reduction' },
        { value: 99.99, suffix: '%', label: 'Uptime with AI-Ops', decimals: 2 },
        { value: 0, suffix: 'ms', label: 'User-Felt Lag' },
      ],
      children: (
        <>
          <section className="v4-section-sm bg-ink-surface">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div {...useScrollReveal()} className="text-center mb-10">
                <h2 className="text-2xl v4-display text-text-primary-v4">How It Works</h2>
              </motion.div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {STEPS.map((s, i) => (
                  <motion.div key={s.title} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                    <div className="v4-panel p-6">
                      <div className="flex h-10 w-10 items-center justify-center rounded-panel border border-hairline bg-ink-surface-2 mb-4">
                        <s.icon className="h-5 w-5 text-signal" />
                      </div>
                      <p className="v4-readout text-[10px] text-text-muted-v4 uppercase tracking-widest">Step {i + 1}</p>
                      <h3 className="text-base font-semibold text-text-primary-v4 mt-1">{s.title}</h3>
                      <p className="text-sm text-text-secondary-v4 mt-2">{s.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section className="v4-section-sm">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div {...useScrollReveal()} className="text-center mb-8">
                <h2 className="text-2xl v4-display text-text-primary-v4">Try It Yourself</h2>
              </motion.div>
              <SpikeSimulator />
              <p className="mt-6 text-center v4-readout text-xs text-text-muted-v4">AI-OPS IS INCLUDED IN PROFESSIONAL AND ENTERPRISE TIERS</p>
            </div>
          </section>
        </>
      ),
    }} />
  );
}
