'use client';

import { Check, X, Info, TrendingDown } from 'lucide-react';

interface ComparisonRow {
  label: string;
  vaulthost: string;
  aws: string;
  azure: string;
  highlight?: boolean;
}

const rows: ComparisonRow[] = [
  {
    label: 'Monthly Price',
    vaulthost: 'Rs 2,999/mo',
    aws: 'Rs 7,200/mo (~$86)',
    azure: 'Rs 6,800/mo (~$81)',
  },
  {
    label: 'vCPU Count',
    vaulthost: '4 vCPU',
    aws: '2 vCPU (t3.large)',
    azure: '2 vCPU (B2ms)',
  },
  {
    label: 'RAM',
    vaulthost: '8 GB',
    aws: '8 GB',
    azure: '8 GB',
  },
  {
    label: 'Storage',
    vaulthost: '160 GB NVMe (included)',
    aws: '+ Rs 1,200/mo (EBS GP3)',
    azure: '+ Rs 1,100/mo (Managed Disk)',
  },
  {
    label: 'Bandwidth',
    vaulthost: '4 TB included',
    aws: 'Pay per GB egress',
    azure: 'Pay per GB egress',
  },
  {
    label: 'Egress Cost (4TB)',
    vaulthost: 'Rs 0 (included)',
    aws: '~Rs 30,000/mo ($0.09/GB = $360)',
    azure: '~Rs 28,500/mo ($0.087/GB)',
  },
  {
    label: 'Daily Backups',
    vaulthost: 'Included (30-day retention)',
    aws: 'Extra Rs 800/mo (AWS Backup)',
    azure: 'Extra Rs 750/mo (Azure Backup)',
  },
  {
    label: 'DDoS Protection',
    vaulthost: 'Included (enterprise-grade)',
    aws: 'Shield Standard only; Advanced Rs 2,50,000/mo',
    azure: 'Basic only; DDoS Protection Rs 2,20,000/mo',
  },
  {
    label: 'Support SLA',
    vaulthost: '24/7 human support (included)',
    aws: 'Business Support from Rs 2,400/mo extra',
    azure: 'Standard ProDirect from Rs 2,200/mo extra',
  },
  {
    label: 'Control Panel',
    vaulthost: 'Full cPanel/WHM included',
    aws: 'None (CLI only)',
    azure: 'None (CLI only)',
  },
  {
    label: 'Total Estimated Monthly Cost',
    vaulthost: 'Rs 2,999/mo',
    aws: 'Rs 41,400/mo',
    azure: 'Rs 38,350/mo',
    highlight: true,
  },
];

export function ComparisonMatrix() {
  return (
    <div className="w-full">
      <div className="liquid-glass-card rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <TrendingDown className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">VaultHost vs AWS vs Azure</h3>
              <p className="text-sm text-muted-foreground">
                Real cost comparison for equivalent 4 vCPU / 8 GB RAM tier
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Feature
                </th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider">
                  <span className="text-primary">VaultHost VPS-2</span>
                </th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  AWS EC2 t3.large
                </th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Azure B2ms
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.label}
                  className={`border-b border-border/50 ${row.highlight ? 'bg-primary/5' : 'hover:bg-muted/10'}`}
                >
                  <td className="p-4 text-sm font-medium">{row.label}</td>
                  <td className={`p-4 text-sm ${row.highlight ? 'text-good font-bold' : 'text-foreground'}`}>
                    {row.vaulthost}
                  </td>
                  <td className={`p-4 text-sm ${row.highlight ? 'text-bad font-bold' : 'text-muted-foreground'}`}>
                    {row.aws}
                  </td>
                  <td className={`p-4 text-sm ${row.highlight ? 'text-bad font-bold' : 'text-muted-foreground'}`}>
                    {row.azure}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-border bg-muted/20">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              AWS and Azure prices shown are public list prices sourced from their respective pricing pages.
              Actual costs vary based on region, usage, and reserved instances. Source:{' '}
              <a href="https://aws.amazon.com/ec2/pricing/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                aws.amazon.com/ec2/pricing
              </a>
              ,{' '}
              <a href="https://azure.microsoft.com/en-us/pricing" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                azure.microsoft.com/en-us/pricing
              </a>
              . VaultHost prices include all features listed; AWS/Azure charge separately for storage, bandwidth, backups, and support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
