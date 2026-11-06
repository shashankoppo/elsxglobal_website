'use client';

import { useState } from 'react';
import { Server, Cpu, Database, HardDrive, ArrowRight, Activity, Cloud } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function CloudCalculator() {
  const [vcpu, setVcpu] = useState(4);
  const [ram, setRam] = useState(8);
  const [storage, setStorage] = useState(100);

  // VaultHost Pricing (approximate monthly)
  const vhPrice = (vcpu * 150) + (ram * 100) + (storage * 10);
  
  // AWS/Azure comparison (hypothetical retail pricing without upfront commitments)
  const awsPrice = (vcpu * 450) + (ram * 320) + (storage * 25);
  const azurePrice = (vcpu * 420) + (ram * 290) + (storage * 22);

  const savingsPct = Math.round(((awsPrice - vhPrice) / awsPrice) * 100);

  return (
    <div className="liquid-glass-card rounded-3xl p-6 md:p-8 mb-16 relative overflow-hidden">
      {/* Decorative bg */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          Interactive Cloud Calculator
        </h2>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto">
          Drag the sliders to configure your ideal virtual machine. Compare our transparent pricing against industry giants.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sliders */}
        <div className="lg:col-span-7 space-y-8">
          {/* vCPU */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <label className="text-sm font-medium flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" /> Compute (vCPUs)
              </label>
              <span className="text-xl font-bold font-mono">{vcpu} <span className="text-sm text-muted-foreground font-sans font-normal">Cores</span></span>
            </div>
            <input 
              type="range" min="1" max="64" step="1" value={vcpu} 
              onChange={(e) => setVcpu(Number(e.target.value))}
              className="w-full h-2 bg-ink-surface-2 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* RAM */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <label className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" /> Memory (RAM)
              </label>
              <span className="text-xl font-bold font-mono">{ram} <span className="text-sm text-muted-foreground font-sans font-normal">GB</span></span>
            </div>
            <input 
              type="range" min="1" max="256" step="1" value={ram} 
              onChange={(e) => setRam(Number(e.target.value))}
              className="w-full h-2 bg-ink-surface-2 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Storage */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <label className="text-sm font-medium flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-primary" /> NVMe Storage
              </label>
              <span className="text-xl font-bold font-mono">{storage} <span className="text-sm text-muted-foreground font-sans font-normal">GB</span></span>
            </div>
            <input 
              type="range" min="20" max="2000" step="10" value={storage} 
              onChange={(e) => setStorage(Number(e.target.value))}
              className="w-full h-2 bg-ink-surface-2 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>

        {/* Pricing Results */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="bg-ink-surface border border-hairline rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">Estimated Monthly Cost</span>
              <span className="px-2.5 py-1 rounded-full bg-good/10 text-good text-xs font-bold border border-good/20">
                Save {savingsPct}%
              </span>
            </div>
            
            <div className="flex items-baseline gap-2 mb-6 border-b border-hairline pb-6">
              <span className="text-4xl font-bold tracking-tight">Rs {vhPrice.toLocaleString('en-IN')}</span>
              <span className="text-muted-foreground">/mo</span>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-muted-foreground"><Cloud className="h-4 w-4" /> AWS Equivalent</span>
                <span className="font-mono text-text-secondary-v4 line-through">Rs {awsPrice.toLocaleString('en-IN')}/mo</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-muted-foreground"><Cloud className="h-4 w-4" /> Azure Equivalent</span>
                <span className="font-mono text-text-secondary-v4 line-through">Rs {azurePrice.toLocaleString('en-IN')}/mo</span>
              </div>
            </div>

            <Link 
              href={`/vaulthost/checkout?plan=custom&vcpu=${vcpu}&ram=${ram}&storage=${storage}`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl v4-btn-primary font-medium"
            >
              Deploy Custom Server <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
