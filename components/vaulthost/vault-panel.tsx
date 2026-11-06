'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Home, Globe, Database, Shield, Activity, GitBranch, Settings,
  Bell, ChevronRight, CheckCircle2, AlertTriangle, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'deployments' | 'autoscale' | 'security' | 'integration';

const SIDEBAR_ICONS = [Home, Globe, Database, Shield, Activity, GitBranch, Settings];

const DEPLOYMENTS = [
  { name: 'frontend-v2.14', env: 'Production', status: 'healthy', time: '11.2s', commit: 'a3f9c2e', branch: 'main' },
  { name: 'api-gateway', env: 'Production', status: 'healthy', time: '8.7s', commit: 'b7d1e4f', branch: 'main' },
  { name: 'analytics-worker', env: 'Staging', status: 'deploying', time: 'in progress', commit: 'd4e8a1c', branch: 'feature/ml-pipeline' },
  { name: 'auth-service', env: 'Production', status: 'healthy', time: '6.1s', commit: 'c2a5f9b', branch: 'main' },
];

const THREATS = [
  { time: '14:23:08', ip: '45.133.1.x', type: 'SQLi Attack', action: 'Blocked' },
  { time: '14:23:09', ip: '103.21.4.x', type: 'DDoS Flood', action: 'Mitigated' },
  { time: '14:23:10', ip: '89.44.2.x', type: 'XSS Probe', action: 'Blocked' },
  { time: '14:23:11', ip: '192.168.1.x', type: 'Port Scan', action: 'Flagged' },
  { time: '14:23:12', ip: '67.21.8.x', type: 'Brute Force', action: 'Blocked' },
];

const INTEGRATIONS = [
  { name: 'ELSxTech AI Model', status: 'connected' },
  { name: 'ELSxBPO RPA Bridge', status: 'connected' },
  { name: 'ELSxKPO Analytics', status: 'connected' },
  { name: 'ERP Sync', status: 'syncing' },
];

export function VaultPanel() {
  const [tab, setTab] = useState<Tab>('deployments');
  const reduced = useReducedMotion();

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xl">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/30">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-bad" />
          <div className="h-2.5 w-2.5 rounded-full bg-warn" />
          <div className="h-2.5 w-2.5 rounded-full bg-good" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-muted/50 border border-border text-xs text-muted-foreground font-mono">
            <Shield className="h-3 w-3 text-good" />
            vaulthost.app/dashboard
          </div>
        </div>
      </div>

      <div className="flex h-[460px]">
        {/* Sidebar */}
        <div className="hidden sm:flex flex-col items-center gap-1 w-14 border-r border-border bg-muted/20 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal/10 border border-signal/20 mb-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L15 8L8 15L1 8L8 1Z" stroke="hsl(var(--primary))" strokeWidth="1" />
            </svg>
          </div>
          {SIDEBAR_ICONS.map((Icon, i) => (
            <div
              key={i}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg transition-colors cursor-pointer',
                i === 0
                  ? 'bg-signal/15 text-signal'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="text-muted-foreground/70">Dashboard</span>
              <ChevronRight className="h-3 w-3 text-muted-foreground/70" />
              <span className="font-medium text-foreground">My Projects</span>
            </div>
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-signal to-indigo-500" />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-4 py-2 border-b border-border overflow-x-auto">
            {([
              ['deployments', 'Deployments'],
              ['autoscale', 'AI Auto-Scale'],
              ['security', 'WAF Security'],
              ['integration', 'ELSx Integration'],
            ] as [Tab, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap',
                  tab === key
                    ? 'bg-signal/15 text-signal'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-4 terminal-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={reduced ? {} : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduced ? {} : { opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {tab === 'deployments' && <DeploymentsTab />}
                {tab === 'autoscale' && <AutoScaleTab />}
                {tab === 'security' && <SecurityTab />}
                {tab === 'integration' && <IntegrationTab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeploymentsTab() {
  return (
    <div className="space-y-2">
      {DEPLOYMENTS.map((d) => (
        <div
          key={d.name}
          className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border hover:border-primary/30 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground truncate">{d.name}</span>
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded font-mono',
                d.env === 'Production' ? 'bg-signal/10 text-signal' : 'bg-warn/10 text-warn'
              )}>
                {d.env}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground font-mono">
              <span>{d.commit}</span>
              <span>·</span>
              <span>{d.branch}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {d.status === 'healthy' ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-good" />
                <span className="text-good">Healthy</span>
                <span className="text-muted-foreground">{d.time}</span>
              </>
            ) : (
              <>
                <Loader2 className="h-3.5 w-3.5 text-warn animate-spin" />
                <span className="text-warn">Deploying...</span>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function AutoScaleTab() {
  const reduced = useReducedMotion();
  return (
    <div>
      <div className="relative h-40 rounded-lg bg-muted/20 border border-border p-3 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="none">
          <motion.path
            d="M0,120 Q50,120 80,100 T160,80 T240,40 T320,60 T400,50"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            fill="none"
            initial={reduced ? {} : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2 }}
          />
          <motion.path
            d="M0,110 Q50,105 80,85 T160,60 T240,30 T320,45 T400,35"
            stroke="hsl(var(--v4-good))"
            strokeWidth="2"
            fill="none"
            strokeDasharray="4 2"
            initial={reduced ? {} : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2, delay: 0.3 }}
          />
        </svg>
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[10px]">
            <div className="h-2 w-3 bg-signal rounded-sm" />
            <span className="text-muted-foreground">Traffic</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <div className="h-2 w-3 bg-good rounded-sm" />
            <span className="text-muted-foreground">Allocated</span>
          </div>
        </div>
        <div className="absolute top-12 left-16 px-2 py-1 rounded bg-good/10 border border-good/30 text-[10px] text-good font-mono">
          AI pre-scaled 14 min early
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        {[
          ['CPU', '34%'],
          ['RAM', '61%'],
          ['Bandwidth', '2.1 TB'],
        ].map(([label, val]) => (
          <div key={label} className="flex-1 p-2 rounded-lg bg-muted/20 border border-border text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="text-sm font-semibold text-foreground">{val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecurityTab() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3 text-xs">
        <span className="text-good font-medium">Last 24h: 1,247 threats blocked</span>
        <span className="text-muted-foreground">|</span>
        <span className="text-good">0 breached</span>
      </div>
      <div className="space-y-1.5">
        {THREATS.map((t) => (
          <div
            key={t.time}
            className="grid grid-cols-[auto_1fr_auto] gap-3 items-center p-2.5 rounded-lg bg-muted/20 border border-border text-xs font-mono"
          >
            <span className="text-muted-foreground">{t.time}</span>
            <div className="min-w-0">
              <span className="text-bad">{t.type}</span>
              <span className="text-muted-foreground ml-2">{t.ip}</span>
            </div>
            <span className={cn(
              'px-2 py-0.5 rounded text-[10px] font-sans font-medium',
              t.action === 'Flagged' ? 'bg-warn/10 text-warn' : 'bg-bad/10 text-bad'
            )}>
              {t.action === 'Flagged' ? '⚠ Flagged' : '🛡 Blocked'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function IntegrationTab() {
  return (
    <div className="space-y-2">
      {INTEGRATIONS.map((item) => (
        <div
          key={item.name}
          className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border"
        >
          <span className="text-sm text-foreground">{item.name}</span>
          {item.status === 'connected' ? (
            <span className="flex items-center gap-1.5 text-xs text-good">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-warn">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Syncing...
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
