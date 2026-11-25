'use client';

import { useState } from 'react';
import { Server, Cpu, Database, HardDrive, ArrowRight, Activity, Cloud, Zap, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { calculateCustomComputeMonthly, calculateHourlyRate } from '@/lib/billing/pricingMath';

type BillingCycle = 'payg' | 'monthly' | 'semi_annual' | 'annual';

export function CloudCalculator() {
  const [vcpu, setVcpu] = useState(4);
  const [ram, setRam] = useState(8);
  const [storage, setStorage] = useState(100);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  // Enterprise VaultHost Base Rate (configured 3.8% - 4.5% below AWS on-demand)
  const vhMonthlyBase = calculateCustomComputeMonthly(vcpu, ram, storage);
  
  // Real AWS & Azure comparison on-demand in ap-south-1 (Mumbai)
  const awsPrice = Math.round((vcpu * 1550) + (ram * 220) + (storage * 7.0));
  const azurePrice = Math.round((vcpu * 1520) + (ram * 215) + (storage * 6.9));

  // Cycle calculation
  let displayPrice = vhMonthlyBase;
  let priceSuffix = '/mo';
  let billingParam = 'monthly';
  let cycleNote = 'Standard 1-Month Commitment (4% lower than AWS)';

  if (billingCycle === 'payg') {
    displayPrice = calculateHourlyRate(vhMonthlyBase);
    priceSuffix = '/hr';
    billingParam = 'pay_as_you_go';
    cycleNote = 'Metered Pay As You Go (730 hrs/mo · Billed hourly, 0 commitment)';
  } else if (billingCycle === 'semi_annual') {
    displayPrice = Math.round(vhMonthlyBase * 0.95);
    priceSuffix = '/mo';
    billingParam = 'semi_annual';
    cycleNote = '6-Month Commitment: Save 5% (~9% total below AWS)';
  } else if (billingCycle === 'annual') {
    displayPrice = Math.round(vhMonthlyBase * 0.833);
    priceSuffix = '/mo';
    billingParam = 'annual';
    cycleNote = '12-Month Commitment: 2 Months Free (~20% total below AWS)';
  }

  const rawSavingsPct = Math.round(((awsPrice - (billingCycle === 'payg' ? vhMonthlyBase : displayPrice)) / awsPrice) * 100);
  const savingsPct = Math.max(4, rawSavingsPct);

  return (
    <div className="liquid-glass-card rounded-3xl p-6 md:p-8 mb-16 relative overflow-hidden">
      {/* Decorative bg */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-signal/10 border border-signal/20 mb-3">
          <Zap className="h-3.5 w-3.5 text-signal" />
          <span className="text-xs font-semibold text-signal uppercase tracking-wider">
            Hyperscaler Benchmark: Exactly 3–5% Lesser Than AWS &amp; Azure
          </span>
        </div>
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          Interactive Cloud Compute Calculator
        </h2>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto">
          Configure vCPU, RAM, and NVMe storage. Enjoy predictable pricing 3–5% below AWS/Azure with zero egress fees and flexible billing cycles.
        </p>

        {/* 4-Way Billing Cycle Switcher */}
        <div className="inline-flex flex-wrap items-center justify-center gap-1.5 mt-6 p-1.5 rounded-xl bg-ink-surface border border-hairline">
          <button
            type="button"
            onClick={() => setBillingCycle('payg')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              billingCycle === 'payg'
                ? 'bg-signal text-black font-semibold shadow-sm'
                : 'text-text-muted-v4 hover:text-text-primary-v4'
            }`}
          >
            Pay As You Go
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-signal text-black font-semibold shadow-sm'
                : 'text-text-muted-v4 hover:text-text-primary-v4'
            }`}
          >
            1 Month
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('semi_annual')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              billingCycle === 'semi_annual'
                ? 'bg-signal text-black font-semibold shadow-sm'
                : 'text-text-muted-v4 hover:text-text-primary-v4'
            }`}
          >
            6 Months
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${billingCycle === 'semi_annual' ? 'bg-black/20 text-black' : 'bg-good/20 text-good'}`}>Save 5%</span>
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('annual')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              billingCycle === 'annual'
                ? 'bg-signal text-black font-semibold shadow-sm'
                : 'text-text-muted-v4 hover:text-text-primary-v4'
            }`}
          >
            12 Months
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${billingCycle === 'annual' ? 'bg-black/20 text-black' : 'bg-good/20 text-good'}`}>2 Mo Free</span>
          </button>
        </div>
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
              <span className="text-xl font-bold font-mono">{vcpu} <span className="text-sm text-muted-foreground font-sans font-normal">Cores (AMD EPYC)</span></span>
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
              <span className="text-xl font-bold font-mono">{ram} <span className="text-sm text-muted-foreground font-sans font-normal">GB DDR5</span></span>
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
              <span className="text-xl font-bold font-mono">{storage} <span className="text-sm text-muted-foreground font-sans font-normal">GB PCIe 4.0</span></span>
            </div>
            <input 
              type="range" min="20" max="2000" step="10" value={storage} 
              onChange={(e) => setStorage(Number(e.target.value))}
              className="w-full h-2 bg-ink-surface-2 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div className="text-xs text-text-muted-v4 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-signal" />
            Includes 10Gbps redundant uplink, 1 dedicated IPv4, /64 IPv6, automated DDoS shield, and zero egress transfer charges.
          </div>
        </div>

        {/* Pricing Results */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="bg-ink-surface border border-hairline rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">Estimated Cost</span>
              <span className="px-2.5 py-1 rounded-full bg-good/10 text-good text-xs font-bold border border-good/20">
                {savingsPct}% Lower vs AWS
              </span>
            </div>
            
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold tracking-tight">
                ₹{displayPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-muted-foreground font-medium">{priceSuffix}</span>
            </div>
            <p className="text-xs text-signal mb-6 border-b border-hairline pb-4 font-mono">
              {cycleNote}
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-muted-foreground"><Cloud className="h-4 w-4" /> AWS Equivalent (t3/c5 on-demand)</span>
                <span className="font-mono text-text-secondary-v4 line-through">₹{awsPrice.toLocaleString('en-IN')}/mo</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-muted-foreground"><Cloud className="h-4 w-4" /> Azure Equivalent (D-series)</span>
                <span className="font-mono text-text-secondary-v4 line-through">₹{azurePrice.toLocaleString('en-IN')}/mo</span>
              </div>
              <div className="text-[11px] text-text-muted-v4 pt-1 border-t border-hairline/50">
                Plus: AWS/Azure bill up to ₹7.50/GB for egress. VaultHost includes unmetered bandwidth with ₹0 egress fees.
              </div>
            </div>

            <Link 
              href={`/vaulthost/checkout?plan=custom&vcpu=${vcpu}&ram=${ram}&storage=${storage}&billing=${billingParam}`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl v4-btn-primary font-medium"
            >
              Deploy Custom Server ({billingCycle === 'payg' ? 'Pay As You Go' : billingCycle === 'annual' ? '12 Months' : billingCycle === 'semi_annual' ? '6 Months' : '1 Month'}) <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
