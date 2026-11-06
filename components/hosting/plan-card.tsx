'use client';

import { HostingPlan } from '@/lib/hosting-types';
import { Check, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function HostingPlanCard({ plan }: { plan: HostingPlan }) {
  const annualPrice = plan.price_annual / 12;

  return (
    <div className={`liquid-glass-card rounded-2xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 ${plan.is_popular ? 'border-primary/40 ring-1 ring-primary/20' : ''}`}>
      {plan.is_popular && (
        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary mb-4 w-fit">
          <Star className="h-3 w-3 fill-primary" />
          Most Popular
        </div>
      )}

      <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4 min-h-[40px]">
        {plan.short_description}
      </p>

      <div className="mb-5">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">&#8377;{plan.price_monthly.toLocaleString('en-IN')}</span>
          <span className="text-sm text-muted-foreground">/mo</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          or &#8377;{annualPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}/mo billed annually
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
        {plan.cpu && (
          <div>
            <p className="text-xs text-muted-foreground">CPU</p>
            <p className="font-medium">{plan.cpu}</p>
          </div>
        )}
        {plan.ram && (
          <div>
            <p className="text-xs text-muted-foreground">RAM</p>
            <p className="font-medium">{plan.ram}</p>
          </div>
        )}
        {plan.storage && (
          <div>
            <p className="text-xs text-muted-foreground">Storage</p>
            <p className="font-medium">{plan.storage}</p>
          </div>
        )}
        {plan.bandwidth && (
          <div>
            <p className="text-xs text-muted-foreground">Bandwidth</p>
            <p className="font-medium">{plan.bandwidth}</p>
          </div>
        )}
      </div>

      <ul className="space-y-2 mb-6 flex-1">
        {plan.features.slice(0, 6).map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
        {plan.features.length > 6 && (
          <li className="text-xs text-muted-foreground/60 pl-6">
            +{plan.features.length - 6} more features
          </li>
        )}
      </ul>

      <Link
        href={`/vaulthost/checkout?plan=${plan.slug}`}
        className={`inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${plan.is_popular ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'liquid-glass-button'}`}
      >
        Get Started
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
