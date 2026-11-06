'use client';

import { useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Cpu, MemoryStick, Globe, Network, Database, Zap } from 'lucide-react';

interface SliderConfig {
  key: string;
  label: string;
  icon: typeof Cpu;
  min: number;
  max: number;
  step: number;
  unit: string;
  tiers: string[];
}

const SLIDERS: SliderConfig[] = [
  { key: 'compute', label: 'Compute', icon: Cpu, min: 1, max: 32, step: 1, unit: ' vCPU', tiers: ['Starter', 'Professional', 'Enterprise', 'Unlimited'] },
  { key: 'memory', label: 'Memory', icon: MemoryStick, min: 1, max: 128, step: 1, unit: 'GB', tiers: ['512MB', '8GB', '64GB', '128GB'] },
  { key: 'bandwidth', label: 'Bandwidth', icon: Globe, min: 100, max: 10000, step: 100, unit: 'GB/mo', tiers: ['100GB', '2TB', '20TB', '100TB'] },
  { key: 'edges', label: 'Edge Nodes', icon: Network, min: 1, max: 38, step: 1, unit: ' PoPs', tiers: ['3', '12', '38', '38+'] },
  { key: 'replicas', label: 'DB Replicas', icon: Database, min: 0, max: 10, step: 1, unit: '', tiers: ['0', '5', '20', 'Unlimited'] },
];

export function InfrastructureSlider() {
  const [values, setValues] = useState<Record<string, number>>({
    compute: 8,
    memory: 32,
    bandwidth: 2000,
    edges: 12,
    replicas: 3,
  });
  const reduced = useReducedMotion();

  const price = useMemo(() => {
    const base = 29;
    return Math.round(base + values.compute * 12 + values.bandwidth * 0.008 + values.edges * 4 + values.replicas * 15);
  }, [values]);

  const formatVal = (val: number, unit: string) => {
    if (unit === 'GB/mo') {
      return val >= 1000 ? `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}TB` : `${val}GB`;
    }
    return `${val}${unit}`;
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Sliders */}
      <div className="space-glass rounded-2xl p-6 space-y-5">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Zap className="h-5 w-5 text-signal" />
          Configure Your Infrastructure
        </h3>
        {SLIDERS.map((slider) => {
          const val = values[slider.key];
          const tierIdx = Math.min(
            Math.floor(((val - slider.min) / (slider.max - slider.min)) * slider.tiers.length),
            slider.tiers.length - 1
          );
          return (
            <div key={slider.key}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-muted-foreground flex items-center gap-2">
                  <slider.icon className="h-4 w-4 text-signal" />
                  {slider.label}
                </label>
                <div className="text-right">
                  <span className="text-sm font-semibold text-foreground">{formatVal(val, slider.unit)}</span>
                  <span className="ml-2 text-[10px] text-primary uppercase tracking-wider">{slider.tiers[tierIdx]}</span>
                </div>
              </div>
              <input
                type="range"
                min={slider.min}
                max={slider.max}
                step={slider.step}
                value={val}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [slider.key]: Number(e.target.value) }))
                }
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-border
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-signal
                  [&::-webkit-slider-thumb]:shadow-glow-blue [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-signal [&::-moz-range-thumb]:border-none"
                style={{
                  background: `linear-gradient(to right, hsl(var(--primary)) ${((val - slider.min) / (slider.max - slider.min)) * 100}%, hsl(var(--border)) ${((val - slider.min) / (slider.max - slider.min)) * 100}%)`,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Live preview */}
      <div className="space-glass rounded-2xl p-6 flex flex-col">
        <h3 className="text-lg font-semibold text-foreground mb-4">Your VaultHost Configuration</h3>
        <div className="space-y-2.5 flex-1">
          {SLIDERS.map((slider) => (
            <div key={slider.key} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{slider.label}</span>
              <span className="text-foreground font-medium">{formatVal(values[slider.key], slider.unit)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
            <span className="text-muted-foreground">AI-Ops</span>
            <span className="text-good flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-good" /> Included
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">WAF</span>
            <span className="text-good flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-good" /> Included
            </span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground/70 uppercase tracking-wider">Estimated Monthly Cost</p>
          <motion.p
            key={price}
            className="text-3xl font-bold text-primary"
            initial={reduced ? {} : { scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            ${price}/mo
          </motion.p>
          <button className="mt-3 w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
            Start Free Trial
          </button>
        </div>
      </div>
    </div>
  );
}
