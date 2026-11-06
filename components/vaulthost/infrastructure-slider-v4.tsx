'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Cpu, MemoryStick, Globe, Network, Database, Zap } from 'lucide-react';
import { SystemsReadout } from '@/components/ui/systems-readout';
import { createClient } from '@/lib/supabase';

const READOUT_LINES = [
  'CONFIGURING INFRASTRUCTURE   ·   DRAG SLIDERS TO ADJUST   ·   PRICE UPDATES IN REAL-TIME',
  'AI-OPS: INCLUDED   ·   WAF: INCLUDED   ·   EDGE DEPLOYMENT: INCLUDED   ·   TLS 1.3: ENABLED',
];

interface SliderConfig {
  key: string;
  label: string;
  icon: typeof Cpu;
  min: number;
  max: number;
  step: number;
  unit: string;
}

const SLIDERS: SliderConfig[] = [
  { key: 'compute', label: 'Compute', icon: Cpu, min: 1, max: 32, step: 1, unit: ' vCPU' },
  { key: 'memory', label: 'Memory', icon: MemoryStick, min: 1, max: 128, step: 1, unit: 'GB' },
  { key: 'bandwidth', label: 'Bandwidth', icon: Globe, min: 100, max: 10000, step: 100, unit: 'GB/mo' },
  { key: 'edges', label: 'Edge Nodes', icon: Network, min: 1, max: 38, step: 1, unit: ' PoPs' },
  { key: 'replicas', label: 'DB Replicas', icon: Database, min: 0, max: 10, step: 1, unit: '' },
];

function formatVal(val: number, unit: string) {
  if (unit === 'GB/mo') return val >= 1000 ? `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}TB` : `${val}GB`;
  return `${val}${unit}`;
}

export function InfrastructureSliderV4() {
  const [values, setValues] = useState<Record<string, number>>({
    compute: 8, memory: 32, bandwidth: 2000, edges: 12, replicas: 3,
  });
  const [baseFee, setBaseFee] = useState(499); // Fallback
  const reduced = useReducedMotion();

  useEffect(() => {
    const fetchBase = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('hosting_plans').select('price_monthly').eq('tier', 'vps').eq('is_active', true).order('price_monthly', { ascending: true }).limit(1).single();
      
      if (error) {
        console.error('Failed to fetch plans:', error);
        return;
      }

      if (data && data.price_monthly) {
        setBaseFee(data.price_monthly);
      }
    };
    fetchBase();
  }, []);

  const price = useMemo(() => {
    // Dynamic calculation synced with base fee
    const computeCost = values.compute * (baseFee * 0.7); // Scaled to base fee
    const memoryCost = values.memory * (baseFee * 0.25);
    const bandwidthCost = values.bandwidth * 6;
    const edgesCost = values.edges * 500;
    const replicasCost = values.replicas * 1200;
    return Math.round(baseFee + computeCost + memoryCost + bandwidthCost + edgesCost + replicasCost);
  }, [values, baseFee]);

  const checkoutUrl = `/vaulthost/checkout?plan=custom&compute=${values.compute}&memory=${values.memory}&bandwidth=${values.bandwidth}&edges=${values.edges}&replicas=${values.replicas}`;

  return (
    <div className="v4-panel overflow-hidden">
      <SystemsReadout lines={READOUT_LINES} className="rounded-none" />

      <div className="grid lg:grid-cols-2 gap-0">
        {/* Sliders */}
        <div className="p-6 space-y-5 border-r border-hairline">
          <h3 className="text-base font-semibold text-text-primary-v4 flex items-center gap-2">
            <Zap className="h-4 w-4 text-signal" />
            Configure Your Infrastructure
          </h3>
          {SLIDERS.map((slider) => {
            const val = values[slider.key];
            const pct = ((val - slider.min) / (slider.max - slider.min)) * 100;
            return (
              <div key={slider.key}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-text-secondary-v4 flex items-center gap-2">
                    <slider.icon className="h-4 w-4 text-signal" />
                    {slider.label}
                  </label>
                  <span className="v4-readout-primary text-sm">{formatVal(val, slider.unit)}</span>
                </div>
                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  value={val}
                  onChange={(e) => setValues((prev) => ({ ...prev, [slider.key]: Number(e.target.value) }))}
                  className="w-full h-1 rounded-full appearance-none cursor-pointer bg-hairline
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-signal [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-signal [&::-moz-range-thumb]:border-none"
                  style={{ background: `linear-gradient(to right, hsl(var(--v4-signal)) ${pct}%, hsl(var(--v4-hairline)) ${pct}%)` }}
                />
              </div>
            );
          })}
        </div>

        {/* Live preview */}
        <div className="p-6 flex flex-col bg-ink-surface">
          <h3 className="text-base font-semibold text-text-primary-v4 mb-4">Your VaultHost Configuration</h3>
          <div className="space-y-2.5 flex-1">
            {SLIDERS.map((slider) => (
              <div key={slider.key} className="flex items-center justify-between text-sm v4-hr first:border-t-0 pt-2.5 first:pt-0">
                <span className="text-text-secondary-v4">{slider.label}</span>
                <span className="v4-readout-primary">{formatVal(values[slider.key], slider.unit)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-sm v4-hr pt-2.5">
              <span className="text-text-secondary-v4">AI-Ops</span>
              <span className="text-good flex items-center gap-1.5"><span className="v4-live-dot" />Included</span>
            </div>
            <div className="flex items-center justify-between text-sm v4-hr pt-2.5">
              <span className="text-text-secondary-v4">WAF</span>
              <span className="text-good flex items-center gap-1.5"><span className="v4-live-dot" />Included</span>
            </div>
          </div>
          <div className="mt-4 pt-4 v4-hr">
            <p className="v4-readout text-[10px] text-text-muted-v4 uppercase tracking-widest">Estimated Monthly Cost</p>
            <motion.p
              key={price}
              className="v4-readout-primary text-3xl font-medium"
              initial={reduced ? {} : { opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              ₹{price.toLocaleString('en-IN')}/mo
            </motion.p>
            <Link href={checkoutUrl} className="mt-3 w-full py-3 rounded-btn v4-btn-primary text-sm font-medium inline-flex items-center justify-center">
              Deploy Infrastructure Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
