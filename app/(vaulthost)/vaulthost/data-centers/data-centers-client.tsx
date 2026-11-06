'use client';

import { useState } from 'react';
import { MapPin, Zap, Shield, Activity, Server, Globe, Check, AlertCircle, Clock } from 'lucide-react';

interface DataCenter {
  id: string;
  city: string;
  region: string;
  country: string;
  tier: 'Tier-3' | 'Tier-4';
  latency: string;
  portSpeed: string;
  cooling: string;
  sla: string;
  status: 'operational' | 'maintenance';
  x: number;
  y: number;
  isIndia?: boolean;
}

const dataCenters: DataCenter[] = [
  { id: 'pune', city: 'Pune', region: 'Hinjewali', country: 'India', tier: 'Tier-4', latency: '<12ms', portSpeed: '10Gbps', cooling: 'N+1 Precision AC', sla: '99.99%', status: 'operational', x: 68, y: 48, isIndia: true },
  { id: 'delhi-ncr', city: 'Delhi NCR', region: 'Noida', country: 'India', tier: 'Tier-3', latency: '<15ms', portSpeed: '10Gbps', cooling: 'N+1 CRAC', sla: '99.99%', status: 'operational', x: 71, y: 38, isIndia: true },
  { id: 'mumbai', city: 'Mumbai', region: 'BKC', country: 'India', tier: 'Tier-4', latency: '<10ms', portSpeed: '40Gbps', cooling: '2N Precision', sla: '99.99%', status: 'operational', x: 65, y: 49, isIndia: true },
  { id: 'singapore', city: 'Singapore', region: 'Jurong', country: 'Singapore', tier: 'Tier-4', latency: '<45ms', portSpeed: '10Gbps', cooling: 'N+1 Precision', sla: '99.99%', status: 'operational', x: 78, y: 60 },
  { id: 'us-east', city: 'Virginia', region: 'Ashburn', country: 'USA', tier: 'Tier-3', latency: '<180ms', portSpeed: '10Gbps', cooling: 'N+1 CRAC', sla: '99.95%', status: 'operational', x: 25, y: 38 },
  { id: 'frankfurt', city: 'Frankfurt', region: 'EU Central', country: 'Germany', tier: 'Tier-4', latency: '<150ms', portSpeed: '10Gbps', cooling: 'N+1 Precision', sla: '99.99%', status: 'operational', x: 50, y: 32 },
];

export default function DataCentersClient() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="pt-8">
      <div className="container-wide px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Globe className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Global Infrastructure Network</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Data Centers Built for <span className="text-primary">India's Enterprise</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tier-3 and Tier-4 facilities across Pune, Delhi NCR, and Mumbai with 99.99% SLA, 10Gbps+ connectivity, and sub-15ms local latency.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 mb-12">
          {[
            { icon: Shield, label: '99.99% SLA', value: 'Guaranteed Uptime', color: 'text-good' },
            { icon: Zap, label: '<15ms', value: 'Local Latency in India', color: 'text-warn' },
            { icon: Activity, label: '10Gbps+', value: 'Port Speeds', color: 'text-signal' },
          ].map((s) => (
            <div key={s.label} className="liquid-glass-card rounded-2xl p-6 text-center">
              <s.icon className={`h-8 w-8 ${s.color} mx-auto mb-3`} />
              <p className="text-3xl font-bold">{s.label}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Interactive Map */}
        <div className="liquid-glass-card rounded-3xl p-6 mb-12">
          <h2 className="text-xl font-semibold mb-4">Interactive Network Map</h2>
          <div className="relative w-full aspect-[2/1] rounded-2xl bg-gradient-to-b from-background to-muted/20 overflow-hidden border border-border">
            <svg viewBox="0 0 100 50" className="w-full h-full" preserveAspectRatio="none">
              <path d="M 10,25 Q 30,15 50,25 T 90,25" fill="none" stroke="currentColor" strokeWidth="0.2" className="text-muted/20" />
              <path d="M 15,30 Q 35,20 55,30 T 85,30" fill="none" stroke="currentColor" strokeWidth="0.15" className="text-muted/10" />
            </svg>

            {dataCenters.map((dc) => (
              <div
                key={dc.id}
                className="absolute group cursor-pointer"
                style={{ left: `${dc.x}%`, top: `${dc.y}%`, transform: 'translate(-50%, -50%)' }}
                onMouseEnter={() => setHovered(dc.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <div className={`relative flex items-center justify-center`}>
                  <span className={`absolute h-6 w-6 rounded-full ${dc.isIndia ? 'bg-primary/30' : 'bg-signal/20'} animate-ping`} />
                  <span className={`relative h-3 w-3 rounded-full ${dc.isIndia ? 'bg-primary' : 'bg-signal'} ring-2 ring-background`} />
                </div>

                {hovered === dc.id && (
                  <div className="absolute z-20 left-1/2 -translate-x-1/2 -top-2 -translate-y-full w-64 liquid-glass-strong rounded-2xl p-4 shadow-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className={`h-4 w-4 ${dc.isIndia ? 'text-primary' : 'text-signal'}`} />
                      <h3 className="font-semibold text-sm">{dc.city}, {dc.country}</h3>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between"><span className="text-muted-foreground">Region</span><span className="font-medium">{dc.region}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Classification</span><span className="font-medium">{dc.tier}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Latency</span><span className="font-medium text-good">{dc.latency}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Port Speed</span><span className="font-medium">{dc.portSpeed}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Cooling</span><span className="font-medium">{dc.cooling}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">SLA</span><span className="font-medium">{dc.sla}</span></div>
                      <div className="flex justify-between items-center pt-1.5 border-t border-border">
                        <span className="text-muted-foreground">Status</span>
                        <span className="inline-flex items-center gap-1 text-good"><Check className="h-3 w-3" />Operational</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">Hover over any node to see detailed specifications. Indian nodes highlighted in primary color.</p>
        </div>

        {/* Data Center Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {dataCenters.map((dc) => (
            <div key={dc.id} className={`liquid-glass-card rounded-2xl p-6 ${dc.isIndia ? 'border-primary/30' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{dc.city}</h3>
                  <p className="text-sm text-muted-foreground">{dc.region}, {dc.country}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${dc.isIndia ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{dc.tier}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Latency</p><p className="font-medium text-good">{dc.latency}</p></div>
                <div><p className="text-xs text-muted-foreground">Port Speed</p><p className="font-medium">{dc.portSpeed}</p></div>
                <div><p className="text-xs text-muted-foreground">Cooling</p><p className="font-medium">{dc.cooling}</p></div>
                <div><p className="text-xs text-muted-foreground">SLA</p><p className="font-medium">{dc.sla}</p></div>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs text-good"><span className="h-2 w-2 rounded-full bg-good" />Operational</span>
                {dc.isIndia && <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">India Node</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Compliance */}
        <div className="liquid-glass-card rounded-3xl p-8">
          <h2 className="text-xl font-semibold mb-6">Certifications & Compliance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['ISO 27001', 'SOC 2 Type II', 'PCI DSS', 'GDPR Ready'].map((cert) => (
              <div key={cert} className="liquid-glass rounded-xl p-4 text-center">
                <Shield className="h-8 w-8 text-good mx-auto mb-2" />
                <p className="text-sm font-medium">{cert}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
