'use client';
import { useState } from 'react';
import { PanelCard } from '@/components/ui/panel-card';
import { CheckCircle2, AlertTriangle, Clock, Globe } from 'lucide-react';

const SERVICES = [
  { name: 'Edge Network (Global)', status: 'operational', uptime: '99.999%', incidents: 0 },
  { name: 'VaultDNS Anycast', status: 'operational', uptime: '100%', incidents: 0 },
  { name: 'VaultWorkers', status: 'operational', uptime: '99.998%', incidents: 0 },
  { name: 'VaultR2 Storage', status: 'operational', uptime: '99.999%', incidents: 0 },
  { name: 'VaultD1 Database', status: 'operational', uptime: '99.997%', incidents: 0 },
  { name: 'VaultAI Gateway', status: 'operational', uptime: '99.95%', incidents: 1 },
  { name: 'Customer Portal', status: 'operational', uptime: '99.99%', incidents: 0 },
  { name: 'Admin Dashboard', status: 'operational', uptime: '99.99%', incidents: 0 },
  { name: 'Billing API', status: 'operational', uptime: '100%', incidents: 0 },
  { name: 'Support System', status: 'operational', uptime: '99.99%', incidents: 0 },
  { name: 'DDoS Protection', status: 'operational', uptime: '100%', incidents: 0 },
  { name: 'Load Balancer API', status: 'operational', uptime: '99.998%', incidents: 0 },
];

const REGIONS = [
  { name: 'Mumbai', latency: '8ms' },
  { name: 'Bangalore', latency: '12ms' },
  { name: 'Delhi', latency: '15ms' },
  { name: 'Singapore', latency: '22ms' },
  { name: 'Dubai', latency: '28ms' },
  { name: 'Frankfurt', latency: '32ms' },
  { name: 'New York', latency: '45ms' },
  { name: 'São Paulo', latency: '58ms' },
];

export default function StatusPage() {
  const [email, setEmail] = useState('');
  const allOperational = SERVICES.every(s => s.status === 'operational');

  return (
    <div className="v4-page">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-text-primary-v4 mb-8">Platform Status</h1>
        
        {/* Status Banner */}
        <div className={`p-6 rounded-lg flex items-center gap-4 mb-12 ${allOperational ? 'bg-green-500/10 border border-green-500/30' : 'bg-amber-500/10 border border-amber-500/30'}`}>
          {allOperational ? (
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          )}
          <div>
            <div className={`text-xl font-bold ${allOperational ? 'text-green-500' : 'text-amber-500'}`}>
              {allOperational ? 'All Systems Operational' : 'Degraded Performance on Some Systems'}
            </div>
            <div className="text-sm text-text-muted-v4 mt-1">
              As of {new Date().toLocaleString()}
            </div>
          </div>
        </div>

        {/* Current Status Grid */}
        <div className="bg-ink rounded-lg border border-hairline overflow-hidden mb-12">
          <div className="grid grid-cols-12 gap-4 p-4 bg-ink-surface text-sm font-medium text-text-muted-v4 border-b border-hairline">
            <div className="col-span-6">Service</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Uptime 90d</div>
            <div className="col-span-2 text-right">Incidents</div>
          </div>
          <div className="divide-y divide-hairline">
            {SERVICES.map((service, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-ink-surface/30">
                <div className="col-span-6 text-text-primary-v4 font-medium">{service.name}</div>
                <div className="col-span-2 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${service.status === 'operational' ? 'bg-green-500' : service.status === 'degraded' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                  <span className="text-sm text-text-secondary-v4 capitalize">{service.status}</span>
                </div>
                <div className="col-span-2 text-right text-sm text-text-secondary-v4">{service.uptime}</div>
                <div className="col-span-2 text-right text-sm text-text-secondary-v4">{service.incidents}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 90-Day Uptime Visualization */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-text-primary-v4 mb-4">90-Day Uptime History</h2>
          <PanelCard className="p-6">
            <div className="flex flex-col gap-6">
              {['Edge Network (Global)', 'VaultWorkers', 'VaultAI Gateway'].map((name, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-text-primary-v4 font-medium">{name}</span>
                    <span className="text-text-muted-v4">90 days ago &mdash; Today</span>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {Array.from({ length: 90 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-2 h-6 rounded-sm ${name === 'VaultAI Gateway' && i === 75 ? 'bg-amber-500' : 'bg-green-500/70 hover:bg-green-400'}`}
                        title={name === 'VaultAI Gateway' && i === 75 ? 'Degraded performance on Sep 15' : 'No downtime'}
                      ></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </PanelCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Incident History */}
          <div>
            <h2 className="text-xl font-bold text-text-primary-v4 mb-4">Past Incidents</h2>
            <div className="space-y-4">
              <div className="p-4 border border-hairline rounded-lg bg-ink-surface">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-text-muted-v4 mt-0.5" />
                  <div>
                    <div className="text-text-primary-v4 font-medium">VaultAI Gateway Latency</div>
                    <div className="text-sm text-signal font-medium mb-1">Sep 15, 2026</div>
                    <div className="text-sm text-text-secondary-v4">Elevated latency for Anthropic provider. Resolved in 23 min.</div>
                  </div>
                </div>
              </div>
              <div className="p-4 border border-hairline rounded-lg bg-ink-surface">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-text-muted-v4 mt-0.5" />
                  <div>
                    <div className="text-text-primary-v4 font-medium">VaultR2 US-East Slowdown</div>
                    <div className="text-sm text-signal font-medium mb-1">Aug 28, 2026</div>
                    <div className="text-sm text-text-secondary-v4">Temporary upload slowdown. Resolved in 41 min.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Region Health */}
          <div>
            <h2 className="text-xl font-bold text-text-primary-v4 mb-4">Region Health</h2>
            <div className="grid grid-cols-2 gap-3">
              {REGIONS.map((region, idx) => (
                <div key={idx} className="p-3 border border-hairline rounded-lg bg-ink-surface flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-text-muted-v4" />
                    <span className="text-sm text-text-primary-v4">{region.name}</span>
                  </div>
                  <span className="text-xs font-mono text-green-400">{region.latency}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subscribe */}
        <div className="bg-ink-surface-2 border border-hairline rounded-lg p-8 text-center max-w-2xl mx-auto mt-16">
          <h2 className="text-xl font-bold text-text-primary-v4 mb-2">Get Status Updates</h2>
          <p className="text-text-secondary-v4 mb-6">Subscribe to receive notifications when incidents are created or updated.</p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-ink border border-hairline rounded-md px-4 py-2 text-text-primary-v4 focus:border-signal focus:outline-none"
            />
            <button className="v4-btn-primary py-2 px-6" onClick={() => alert('Subscribed!')}>
              Notify Me
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
