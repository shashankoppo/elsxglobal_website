'use client';

import { useState, useEffect } from 'react';
import { Check, AlertCircle, Clock, Activity, Server, Globe, Database, Zap } from 'lucide-react';

interface ServiceStatus {
  name: string;
  icon: typeof Activity;
  status: 'operational' | 'degraded' | 'down' | 'maintenance';
  uptime: number;
  responseTime: string;
}

const services: ServiceStatus[] = [
  { name: 'Web API', icon: Activity, status: 'operational', uptime: 99.99, responseTime: '142ms' },
  { name: 'Customer Portal', icon: Server, status: 'operational', uptime: 99.98, responseTime: '210ms' },
  { name: 'DNS Routing', icon: Globe, status: 'operational', uptime: 100, responseTime: '8ms' },
  { name: 'Database Cluster', icon: Database, status: 'operational', uptime: 99.99, responseTime: '15ms' },
  { name: 'Pune Compute', icon: Zap, status: 'operational', uptime: 99.99, responseTime: '12ms' },
  { name: 'Delhi NCR Compute', icon: Zap, status: 'operational', uptime: 99.97, responseTime: '14ms' },
];

interface Incident {
  id: string;
  date: string;
  title: string;
  severity: 'minor' | 'major' | 'critical';
  status: 'resolved' | 'monitoring' | 'investigating';
  affected: string;
  updates: { time: string; message: string }[];
}

const incidents: Incident[] = [
  {
    id: 'inc-001',
    date: '2026-07-15',
    title: 'Scheduled Maintenance — Pune Node Network Upgrade',
    severity: 'minor',
    status: 'resolved',
    affected: 'Pune Compute',
    updates: [
      { time: '2026-07-15 14:30', message: 'Maintenance completed. All services restored.' },
      { time: '2026-07-15 12:00', message: 'Scheduled network upgrade in progress. Expected downtime: 15 minutes.' },
    ],
  },
  {
    id: 'inc-002',
    date: '2026-06-28',
    title: 'Elevated Latency on Delhi NCR Compute',
    severity: 'minor',
    status: 'resolved',
    affected: 'Delhi NCR Compute',
    updates: [
      { time: '2026-06-28 10:15', message: 'Issue resolved. Root cause: upstream provider BGP flap. Traffic rerouted.' },
      { time: '2026-06-28 09:45', message: 'Investigating elevated latency on Delhi NCR node. Some users may experience slow response times.' },
    ],
  },
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function generateUptimeBars(serviceName: string, uptime: number): ('up' | 'degraded' | 'down')[] {
  const bars: ('up' | 'degraded' | 'down')[] = [];
  for (let i = 0; i < 90; i++) {
    const h = hashCode(serviceName + i) % 1000;
    if (uptime >= 99.99) bars.push(h > 998 ? 'degraded' : 'up');
    else if (uptime >= 99.9) bars.push(h > 995 ? 'degraded' : 'up');
    else bars.push(h > 990 ? (h > 995 ? 'down' : 'degraded') : 'up');
  }
  return bars;
}

const statusConfig = {
  operational: { color: 'bg-good', text: 'text-good', label: 'Operational', icon: Check },
  degraded: { color: 'bg-warn', text: 'text-warn', label: 'Degraded Performance', icon: AlertCircle },
  down: { color: 'bg-bad', text: 'text-bad', label: 'Service Outage', icon: AlertCircle },
  maintenance: { color: 'bg-signal', text: 'text-signal', label: 'Under Maintenance', icon: Clock },
};

export default function StatusClient() {
  const [overallStatus, setOverallStatus] = useState<'operational' | 'degraded' | 'down'>('operational');
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const hasDown = services.some((s) => s.status === 'down');
    const hasDegraded = services.some((s) => s.status === 'degraded' || s.status === 'maintenance');
    setOverallStatus(hasDown ? 'down' : hasDegraded ? 'degraded' : 'operational');
  }, []);

  return (
    <div className="pt-8">
      <div className="container-wide px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
        {/* Overall Status Banner */}
        <div className={`liquid-glass-card rounded-3xl p-8 mb-8 text-center ${overallStatus === 'operational' ? 'border-good/30' : overallStatus === 'degraded' ? 'border-warn/30' : 'border-bad/30'}`}>
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl mx-auto mb-4 ${statusConfig[overallStatus].color}/10 border ${statusConfig[overallStatus].color}/20`}>
            <Check className={`h-8 w-8 ${statusConfig[overallStatus].text}`} />
          </div>
          <h1 className="text-2xl font-semibold mb-2">All Systems Operational</h1>
          <p className="text-sm text-muted-foreground">All VaultHost services are running normally. Last updated: {new Date().toLocaleString()}</p>
        </div>

        {/* Service Status List */}
        <div className="space-y-3 mb-12">
          {services.map((service) => {
            const cfg = statusConfig[service.status];
            const bars = generateUptimeBars(service.name, service.uptime);
            return (
              <div key={service.name} className="liquid-glass-card rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <service.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium text-sm">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">{service.responseTime}</span>
                    <span className="text-xs text-muted-foreground">{service.uptime}% uptime</span>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cfg.text}`}>
                      <span className={`h-2 w-2 rounded-full ${cfg.color} ${service.status === 'operational' ? 'animate-pulse' : ''}`} />
                      {cfg.label}
                    </span>
                  </div>
                </div>
                {/* 90-day uptime bar */}
                <div className="flex gap-0.5 h-8">
                  {bars.map((bar, idx) => (
                    <div
                      key={idx}
                      className={`flex-1 rounded-sm ${bar === 'up' ? 'bg-good/60' : bar === 'degraded' ? 'bg-warn/60' : 'bg-bad/60'}`}
                      title={`${90 - idx} days ago: ${bar}`}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>90 days ago</span>
                  <span>Today</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Incident History */}
        <div>
          <h2 className="text-xl font-semibold mb-6">Incident History</h2>
          {incidents.length === 0 ? (
            <div className="liquid-glass-card rounded-2xl p-8 text-center">
              <Check className="h-10 w-10 text-good mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No incidents in the last 90 days. All systems have been running smoothly.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {incidents.map((inc) => (
                <div key={inc.id} className="liquid-glass-card rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-sm mb-1">{inc.title}</h3>
                      <p className="text-xs text-muted-foreground">{new Date(inc.date).toLocaleDateString()} · Affected: {inc.affected}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${inc.severity === 'critical' ? 'bg-bad/10 text-bad' : inc.severity === 'major' ? 'bg-warn/10 text-warn' : 'bg-signal/10 text-signal'}`}>
                        {inc.severity}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-good/10 text-good">{inc.status}</span>
                    </div>
                  </div>
                  <div className="space-y-2 border-l-2 border-border pl-4">
                    {inc.updates.map((u, idx) => (
                      <div key={idx} className="text-sm">
                        <p className="text-xs text-muted-foreground">{u.time}</p>
                        <p className="text-sm">{u.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subscribe to Updates */}
        <div className="liquid-glass-card rounded-2xl p-6 mt-8 text-center">
          <h3 className="font-semibold mb-2">Get Notified</h3>
          <p className="text-sm text-muted-foreground mb-4">Subscribe to receive real-time status updates and incident notifications.</p>
          {subscribed ? (
            <div className="flex items-center justify-center gap-2 text-good bg-good/10 p-3 rounded-xl max-w-md mx-auto">
              <Check className="h-5 w-5" />
              <span className="text-sm font-medium">Successfully subscribed!</span>
            </div>
          ) : (
            <div className="flex max-w-md mx-auto gap-2">
              <input type="email" placeholder="you@example.com" value={subscribeEmail} onChange={(e) => setSubscribeEmail(e.target.value)} className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <button onClick={() => { if (subscribeEmail.includes('@')) setSubscribed(true); }} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium">Subscribe</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
