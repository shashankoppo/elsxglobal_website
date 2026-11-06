'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Activity, Server, FileText, GitPullRequest, Clock, Bell } from 'lucide-react';

export default function MonitoringPage() {
  return (
    <div className="min-h-screen bg-[#060C18] text-slate-300 pb-24">
      <PageHeroV4 
        eyebrow="VaultMonitor"
        title={<>Full-Stack Observability. <span className="text-signal">One Dashboard.</span></>}
        description="Monitor your entire infrastructure — servers, containers, apps, APIs, and databases — with metrics, logs, traces, and alerts. OpenTelemetry native. Grafana-compatible."
      />

      {/* Stats */}
      <section className="py-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Metric Resolution', value: '15s' },
              { label: 'Data Retention (Pro)', value: '1 Year' },
              { label: 'Integrations', value: '50+' },
              { label: 'Alerting', value: 'PagerDuty + Slack' },
            ].map((stat, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="text-3xl font-light text-white mb-2">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-4 v4-display">Complete Visibility</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">Track performance, find bottlenecks, and resolve issues before they affect your users.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PanelCard
              title="Infrastructure Metrics"
              description="Monitor CPU, RAM, disk I/O, and network traffic for every server and container in real-time."
              icon={<Activity className="w-5 h-5 text-signal" />}
            />
            <PanelCard
              title="APM"
              description="Track response times, error rates, and throughput for specific application endpoints."
              icon={<Server className="w-5 h-5 text-signal" />}
            />
            <PanelCard
              title="Log Aggregation"
              description="Centralize and index structured logs from all your services with blazing-fast full-text search."
              icon={<FileText className="w-5 h-5 text-signal" />}
            />
            <PanelCard
              title="Distributed Tracing"
              description="Follow requests across microservices. OpenTelemetry native and Jaeger-compatible."
              icon={<GitPullRequest className="w-5 h-5 text-signal" />}
            />
            <PanelCard
              title="Uptime Monitoring"
              description="Check your endpoints every 30 seconds from 10 global locations to ensure availability."
              icon={<Clock className="w-5 h-5 text-signal" />}
            />
            <PanelCard
              title="Intelligent Alerting"
              description="Configure threshold, anomaly, and composite alerts that route to Slack, PagerDuty, or email."
              icon={<Bell className="w-5 h-5 text-signal" />}
            />
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-24 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-light text-white mb-12 text-center v4-display">Works With Your Stack</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              'Prometheus', 'Grafana', 'OpenTelemetry', 'Datadog Agent', 
              'Nginx', 'Apache', 'PostgreSQL', 'MySQL', 
              'Redis', 'MongoDB', 'Kubernetes', 'Docker', 
              'Node.js', 'Python', 'Go', '.NET'
            ].map((integration, i) => (
              <div key={i} className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors">
                {integration}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-4 v4-display">Scalable Pricing</h2>
            <p className="text-lg text-slate-400">Predictable costs as your infrastructure grows.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl text-white mb-2">Free</h3>
              <div className="text-3xl font-light text-white mb-6">₹0<span className="text-lg text-slate-400">/mo</span></div>
              <ul className="space-y-3 text-slate-300">
                <li>5 Hosts</li>
                <li>10 Uptime Checks</li>
                <li>24h Data Retention</li>
              </ul>
            </div>
            
            <div className="p-8 rounded-2xl bg-[#0A1224] border border-signal/30 relative">
              <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 bg-signal text-[#060C18] text-xs font-medium rounded-full">Most Popular</div>
              <h3 className="text-xl text-white mb-2">Pro</h3>
              <div className="text-3xl font-light text-white mb-6">₹499<span className="text-lg text-slate-400">/mo</span></div>
              <ul className="space-y-3 text-slate-300">
                <li>50 Hosts</li>
                <li>Unlimited Uptime Checks</li>
                <li>1 Year Data Retention</li>
                <li>APM Included</li>
              </ul>
            </div>
            
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl text-white mb-2">Business</h3>
              <div className="text-3xl font-light text-white mb-6">₹1,999<span className="text-lg text-slate-400">/mo</span></div>
              <ul className="space-y-3 text-slate-300">
                <li>Unlimited Hosts</li>
                <li>Custom Metrics limits</li>
                <li>SAML SSO & Custom Roles</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="rounded-3xl p-12 text-center border border-white/10"
            style={{ background: 'linear-gradient(135deg, rgba(10,18,36,0.98), rgba(6,12,24,1))' }}
          >
            <h2 className="text-3xl md:text-4xl font-light text-white mb-6 v4-display">Gain complete visibility.</h2>
            <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">Start monitoring your infrastructure in less than 5 minutes.</p>
            <Link 
              href="/portal" 
              className="inline-flex items-center justify-center h-12 px-8 rounded-lg bg-white text-[#060C18] font-medium hover:bg-slate-200 transition-colors"
            >
              Start monitoring →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
