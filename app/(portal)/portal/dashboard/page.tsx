'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { MetricsGrid } from '@/components/portal/MetricsGrid';
import { ProvisioningTracker } from '@/components/portal/provisioning-tracker';
import { SkeletonCard } from '@/components/ui/skeleton-loaders';
import {
  Server, Power, Terminal, Zap, Calendar, Download, FileText,
  ArrowRight, Activity, Shield, Clock, Plus, Globe, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fadeUp, stagger, useScrollReveal } from '@/lib/animations';

const DEMO_DASHBOARD_SERVICES = [
  {
    id: 'svc-001',
    plan_name: 'VPS Pro EPYC (8GB)',
    domain: 'api.production.internal',
    status: 'active',
    tier: 'VPS Pro',
    ip: '103.21.244.12',
    region: 'BOM1 (Mumbai)',
    specs: { cpu: '4 vCPU EPYC', ram: '8 GB', storage: '160 GB NVMe' },
    created_at: '2026-06-01'
  },
  {
    id: 'svc-002',
    plan_name: 'VaultWorkers Edge Router',
    domain: 'gateway.vaulthost.cloud',
    status: 'active',
    tier: 'Edge Compute',
    ip: 'Anycast (300+ PoPs)',
    region: 'Global Edge',
    specs: { cpu: '30ms CPU limit', ram: '128 MB V8', storage: 'VaultKV Replicated' },
    created_at: '2026-07-15'
  },
  {
    id: 'svc-003',
    plan_name: 'VaultR2 Object Bucket',
    domain: 'assets.vaulthost.cloud',
    status: 'active',
    tier: 'Storage',
    ip: 'S3-Compatible',
    region: 'Multi-Region (APAC/EU)',
    specs: { cpu: 'Unlimited IOPS', ram: 'Zero Egress', storage: '48.6 GB / 100 GB' },
    created_at: '2026-08-01'
  }
];

const DEMO_DASHBOARD_INVOICES = [
  { id: 'INV-2026-0041', amount: 4999, status: 'paid', created_at: '2026-09-01', invoice_number: 'INV-2026-0041', hosting_orders: { plan_name: 'VPS Pro EPYC (8GB)' } },
  { id: 'INV-2026-0028', amount: 4999, status: 'paid', created_at: '2026-08-01', invoice_number: 'INV-2026-0028', hosting_orders: { plan_name: 'VPS Pro EPYC (8GB)' } },
  { id: 'INV-2026-0014', amount: 4999, status: 'paid', created_at: '2026-07-01', invoice_number: 'INV-2026-0014', hosting_orders: { plan_name: 'VPS Pro EPYC (8GB)' } },
];

const DEMO_DASHBOARD_TICKETS = [
  { id: 'TCK-1092', subject: 'Custom BGP Anycast Route setup', status: 'resolved', priority: 'medium', created_at: '2026-09-18' },
];

export default function PortalDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        setServices([]);
        setInvoices([]);
        setTickets([]);
        setLoading(false);
        return;
      }
      setUser({ id: authData.user.id, email: authData.user.email || '' });

      let s, inv, t;
      try {
        [s, inv, t] = await Promise.all([
          supabase.from('hosting_services').select('*').eq('user_id', authData.user.id).order('created_at', { ascending: false }).limit(20),
          supabase.from('hosting_invoices').select('*, hosting_orders(*)').eq('user_id', authData.user.id).order('created_at', { ascending: false }).limit(5),
          supabase.from('support_tickets').select('*').eq('user_id', authData.user.id).order('created_at', { ascending: false }).limit(5),
        ]);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        s = { data: [] };
        inv = { data: [] };
        t = { data: [] };
      }
      setServices(s.data || []);
      setInvoices(inv.data || []);
      setTickets(t.data || []);
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-muted/40" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  const activeServices = services.filter((s) => s.status === 'active').length;
  const pendingServices = services.filter((s) => s.status === 'pending_provisioning' || s.status === 'pending');
  const openTickets = tickets.filter((t) => t.status === 'open' || t.status === 'pending').length;

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={stagger} 
      className="space-y-8"
    >
      {/* Header with Glassmorphism */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl sm:rounded-3xl v4-panel p-5 sm:p-8 border-signal/20 bg-gradient-to-br from-ink-surface to-background/50">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <Shield className="w-64 h-64 text-signal" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-good animate-pulse" />
              <span className="text-xs font-semibold text-good uppercase tracking-wider">System Operational</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight v4-display text-text-primary-v4 mb-2">
              Welcome back, <span className="text-signal">{user?.email?.split('@')[0] || 'User'}</span>
            </h1>
            <p className="text-sm sm:text-base text-text-secondary-v4 max-w-xl">
              Your infrastructure is running smoothly. Manage your active services, view analytics, and scale resources instantly.
            </p>
          </div>
          <Link href="/vaulthost" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-btn v4-btn-primary text-sm whitespace-nowrap group w-full sm:w-auto">
            <Plus className="h-4 w-4" /> Deploy Server
            <ArrowRight className="h-4 w-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
          </Link>
        </div>
      </motion.div>

      {/* Provisioning Tracker for pending services */}
      {pendingServices.length > 0 && (
        <motion.div variants={fadeUp} className="mb-8">
          <ProvisioningTracker onComplete={() => {
            // In a real app, this would refresh the data from the DB.
            // For now, we'll just update state.
            setServices((prev) => prev.map((service) => ({ ...service, status: service.status === 'pending_provisioning' ? 'active' : service.status })));
          }} />
        </motion.div>
      )}

      {/* Premium Stat Cards */}
      <motion.div variants={fadeUp} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Services', value: activeServices, icon: Server, color: 'text-signal', glow: 'shadow-[0_0_20px_rgba(0,255,204,0.1)]' },
          { label: 'Total Invoices', value: invoices.length, icon: Activity, color: 'text-blue-400', glow: 'shadow-[0_0_20px_rgba(96,165,250,0.1)]' },
          { label: 'Open Tickets', value: openTickets, icon: Clock, color: 'text-warn', glow: 'shadow-[0_0_20px_rgba(251,191,36,0.1)]' },
          { label: 'Plan Tier', value: services[0]?.tier || 'N/A', icon: Shield, color: 'text-purple-400', glow: 'shadow-[0_0_20px_rgba(192,132,252,0.1)]' },
        ].map((stat, i) => (
          <div key={stat.label} className={`relative overflow-hidden liquid-glass-card rounded-2xl p-6 border-hairline hover:border-hairline-2 transition-all ${stat.glow}`}>
            <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
              <stat.icon className="h-24 w-24" />
            </div>
            <stat.icon className={`h-6 w-6 ${stat.color} mb-4`} />
            <p className="text-4xl font-bold capitalize v4-display tracking-tight text-text-primary-v4 mb-1">{stat.value}</p>
            <p className="text-sm text-text-muted-v4 uppercase tracking-wider font-semibold">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Live Metrics */}
      <motion.div variants={fadeUp}>
        <MetricsGrid />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp}>
        <h2 className="text-lg font-semibold text-text-primary-v4 mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-signal" /> Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: 'reboot', label: 'Reboot Server', icon: Power, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
            { id: 'ssh', label: 'Access SSH Console', icon: Terminal, color: 'text-signal', bg: 'bg-signal/10 border-signal/20' },
            { id: 'install', label: '1-Click App Install', icon: Globe, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
            { id: 'backup', label: 'Backup & Restore', icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          ].map((action) => (
            <Link
              key={action.id}
              href={services.length === 1 ? `/portal/service/${services[0].id}?action=${action.id}` : `/portal/service`}
              className="group liquid-glass-card rounded-2xl p-5 text-left hover:border-signal/30 transition-all flex flex-col hover:-translate-y-1"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.bg} border mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon className={`h-6 w-6 ${action.color}`} />
              </div>
              <p className="text-sm font-semibold text-text-primary-v4 group-hover:text-signal transition-colors">{action.label}</p>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Services + Recent Orders */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div variants={fadeUp} className="v4-panel p-6 border-hairline">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-hairline">
            <h2 className="text-lg font-semibold text-text-primary-v4 flex items-center gap-2">
              <Server className="h-5 w-5 text-signal" /> Your Services
            </h2>
            <Link href="/portal/service" className="text-sm text-signal hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {services.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-xl bg-ink-surface/50 border border-dashed border-hairline">
              <Server className="h-12 w-12 text-text-muted-v4 mx-auto mb-4" />
              <p className="text-text-secondary-v4 mb-4">No active services running in this region.</p>
              <Link href="/vaulthost" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-btn v4-btn-primary text-sm font-medium">
                Deploy Server <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {services.slice(0, 5).map((s) => (
                <Link key={s.id} href={`/portal/service/${s.id}`} className="group flex items-center justify-between text-sm hover:bg-ink-surface p-3 rounded-xl border border-transparent hover:border-hairline transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center border border-hairline shadow-sm">
                      <Globe className="h-5 w-5 text-text-secondary-v4 group-hover:text-signal transition-colors" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary-v4">{s.plan_name || s.name || 'Hosting Plan'}</p>
                      <p className="text-xs text-text-muted-v4">{s.domain || 'Unconfigured Domain'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      s.status === 'active' ? 'bg-good/10 text-good border border-good/20' 
                      : s.status === 'failed' ? 'bg-error/10 text-error border border-error/20'
                      : s.status === 'suspended' ? 'bg-warn/10 text-warn border border-warn/20' 
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {s.status === 'pending_provisioning' ? 'Setting Up...' : s.status}
                    </span>
                    <ArrowRight className="h-4 w-4 text-text-muted-v4 opacity-0 group-hover:opacity-100 group-hover:text-signal transition-all -ml-2 group-hover:ml-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div variants={fadeUp} className="v4-panel p-6 border-hairline">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-hairline">
            <h2 className="text-lg font-semibold text-text-primary-v4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-400" /> Recent Transactions
            </h2>
            <Link href="/portal/invoice" className="text-sm text-signal hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {invoices.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-xl bg-ink-surface/50 border border-dashed border-hairline">
              <Activity className="h-12 w-12 text-text-muted-v4 mx-auto mb-4" />
              <p className="text-text-secondary-v4 mb-4">No billing history found.</p>
              <Link href="/vaulthost/pricing" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-btn v4-btn-secondary text-sm font-medium">
                Browse Plans
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between text-sm hover:bg-ink-surface p-3 rounded-xl border border-transparent hover:border-hairline transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center border border-hairline">
                      <CheckCircle2 className={`h-5 w-5 ${inv.status === 'paid' ? 'text-good' : 'text-warn'}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary-v4">{inv.hosting_orders?.plan_name || inv.invoice_number || 'Service Order'}</p>
                      <p className="text-xs text-text-muted-v4">{new Date(inv.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs px-3 py-1 font-medium rounded-full ${
                      inv.status === 'paid' ? 'bg-good/10 text-good border border-good/20' 
                      : inv.status === 'pending' ? 'bg-warn/10 text-warn border border-warn/20' 
                      : 'bg-muted text-muted-foreground border border-border'
                    }`}>
                      {inv.status}
                    </span>
                    <Link href={`/portal/invoice/${inv.id}`} className="text-text-muted-v4 hover:text-signal transition-colors p-2 bg-ink-surface border border-hairline rounded-lg" title="View Invoice">
                      <FileText className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
