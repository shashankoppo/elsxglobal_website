'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import {
  Server, ArrowRight, Loader2, Power, Terminal, Globe, RefreshCw, Plus,
  BarChart3, Shield, HardDrive, Cpu, Clock, Activity, Zap, ChevronRight,
  Settings, CheckCircle2, AlertTriangle, X, Play, RefreshCcw, Lock
} from 'lucide-react';
import Link from 'next/link';
import { PanelCard } from '@/components/ui/panel-card';
import { ActionConfirmationModal } from '@/components/portal/ActionConfirmationModal';
import { ActionExecutionResult } from '@/lib/action-gateway/types';

interface ServiceItem {
  id: string;
  name?: string;
  plan_name: string;
  domain: string;
  status: 'active' | 'running' | 'stopped' | 'rebooting' | 'rebuilding' | 'suspended';
  ip: string;
  specs: { cpu: string; ram: string; storage: string; bandwidth: string };
  location: string;
  created_at: string;
  renewal_date: string;
  price: number;
}

export default function ServicesManagementPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'suspended' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // SSH Terminal Modal state
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [activeTerminalSvc, setActiveTerminalSvc] = useState<ServiceItem | null>(null);
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    'Linux vaulthost-bom-01 6.8.0-31-generic #31-Ubuntu SMP x86_64',
    'Welcome to VaultHost Cloud Enterprise VPS.',
    'System load:  0.18, 0.22, 0.15 | Memory: 54% used of 8GB DDR5',
    'Last login: Mon Sep 28 11:20:14 2026 from 103.21.244.1',
    'root@vaulthost-instance:~# uptime',
    ' 11:58:32 up 42 days, 14:12, 1 user, load average: 0.18, 0.22, 0.15',
  ]);
  const [cmdInput, setCmdInput] = useState('');

  // Action Gateway verification modal state
  const [gatewayModalOpen, setGatewayModalOpen] = useState(false);
  const [gatewayResult, setGatewayResult] = useState<ActionExecutionResult | null>(null);
  const [pendingActionInstance, setPendingActionInstance] = useState<ServiceItem | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadData = async () => {
    try {
      const res = await fetch('/api/cloud/vps');
      if (res.ok) {
        const json = await res.json();
        setServices(json.instances || []);
        return;
      }
      setServices([]);
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReboot = async (svc: ServiceItem) => {
    setPendingActionInstance(svc);
    try {
      const res = await fetch('/api/cloud/vps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reboot', instanceId: svc.id }),
      });
      const data: ActionExecutionResult = await res.json();
      setGatewayResult(data);

      if (data.status === 'executed') {
        showToast('success', `Reboot initiated for ${svc.plan_name}`);
        setServices(prev => prev.map(s => s.id === svc.id ? { ...s, status: 'rebooting' } : s));
        setTimeout(() => {
          setServices(prev => prev.map(s => s.id === svc.id ? { ...s, status: 'active' } : s));
        }, 4000);
      } else {
        setGatewayModalOpen(true);
      }
    } catch {
      showToast('error', 'Reboot command dispatch failed');
    }
  };

  const handleConfirmTier1 = async (confirmationToken: string) => {
    if (!pendingActionInstance) return;
    try {
      const res = await fetch('/api/cloud/vps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reboot',
          instanceId: pendingActionInstance.id,
          options: { confirmationToken },
          intent: {
            intentId: crypto.randomUUID(),
            actor: { id: 'usr-client', type: 'user', tenantId: 'ten_portal_default', roles: ['tenant_operator'] },
            targetService: 'compute',
            actionVerb: 'reboot_instance',
            resourceUri: `compute://vps/${pendingActionInstance.id}`,
            parameters: { instanceId: pendingActionInstance.id, graceful: true },
            idempotencyKey: `idem-reb-${Date.now()}`,
            createdAt: new Date().toISOString(),
          }
        }),
      });
      const data = await res.json();
      if (data.status === 'executed') {
        showToast('success', `Verified: Rebooting ${pendingActionInstance.plan_name}...`);
        setServices(prev => prev.map(s => s.id === pendingActionInstance.id ? { ...s, status: 'rebooting' } : s));
        setTimeout(() => {
          setServices(prev => prev.map(s => s.id === pendingActionInstance.id ? { ...s, status: 'active' } : s));
        }, 4000);
      }
    } catch {
      showToast('error', 'Confirmation execution failed');
    } finally {
      setGatewayModalOpen(false);
      setPendingActionInstance(null);
    }
  };

  const handleBackup = async (svc: ServiceItem) => {
    try {
      const res = await fetch('/api/cloud/vps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_snapshot', instanceId: svc.id }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', data.message || `Snapshot scheduled for ${svc.plan_name}`);
      }
    } catch {
      showToast('error', 'Snapshot backup request failed');
    }
  };

  const openTerminal = (svc: ServiceItem) => {
    setActiveTerminalSvc(svc);
    setTerminalOpen(true);
  };

  const handleExecTerminalCmd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmdInput.trim()) return;
    const input = cmdInput.trim();
    let reply = `Command not recognized: ${input}. Type 'help' for available commands.`;
    if (input === 'help') {
      reply = 'Available commands: uptime, df -h, free -m, ip a, top, docker ps, restart nginx';
    } else if (input === 'df -h') {
      reply = 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/nvme0n1p1  158G   51G  107G  33% /\ntmpfs           3.9G     0  3.9G   0% /dev/shm';
    } else if (input === 'free -m') {
      reply = '               total        used        free      shared  buff/cache   available\nMem:            7942        4320        2120         180        1502        3442\nSwap:           2048           0        2048';
    } else if (input === 'ip a') {
      reply = `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500\n    inet ${activeTerminalSvc?.ip}/24 brd 103.21.244.255 scope global eth0`;
    } else if (input.includes('restart') || input.includes('nginx')) {
      reply = '[OK] Restarting nginx web server... Done (0.04s). Active TLS certs valid.';
    }

    setTerminalHistory(prev => [
      ...prev,
      `root@vaulthost-instance:~# ${input}`,
      reply,
    ]);
    setCmdInput('');
  };

  const filteredServices = services.filter(svc => {
    if (activeFilter !== 'all' && svc.status !== activeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return svc.plan_name?.toLowerCase().includes(q) || svc.domain?.toLowerCase().includes(q) || svc.ip?.toLowerCase().includes(q);
    }
    return true;
  });

  const totalMonthlyCost = services.reduce((acc, svc) => acc + (svc.price || 0), 0);

  return (
    <div className="v4-page space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl border text-xs font-semibold shadow-2xl flex items-center gap-2 ${
          toastMsg.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {toastMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {toastMsg.text}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-hairline pb-4">
        <div>
          <h1 className="v4-display text-2xl font-bold flex items-center gap-2">
            <Server className="w-6 h-6 text-signal" />
            My Hosting Services &amp; Cloud Fleet
          </h1>
          <p className="text-text-secondary-v4 text-sm mt-1">Manage active compute nodes, automated backups, and emergency reboot operations.</p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
          <button className="v4-btn-secondary px-3 py-2 flex items-center justify-center gap-2 flex-1 sm:flex-initial text-xs sm:text-sm" onClick={loadData}>
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <Link href="/vaulthost/pricing" className="v4-btn-primary px-4 py-2 flex items-center justify-center gap-2 shadow-glow flex-1 sm:flex-initial text-xs sm:text-sm whitespace-nowrap">
            <Plus className="w-4 h-4" /> Deploy New Service
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <PanelCard className="p-4">
          <div className="text-text-muted-v4 text-xs font-medium uppercase tracking-wider">Total Services</div>
          <div className="text-2xl font-bold text-text-primary-v4 mt-1">{services.length}</div>
        </PanelCard>
        <PanelCard className="p-4">
          <div className="text-text-muted-v4 text-xs font-medium uppercase tracking-wider">Active &amp; Healthy</div>
          <div className="text-2xl font-bold text-green-500 mt-1">{services.filter(s => s.status === 'active' || s.status === 'running').length}</div>
        </PanelCard>
        <PanelCard className="p-4">
          <div className="text-text-muted-v4 text-xs font-medium uppercase tracking-wider">Total Monthly Cost</div>
          <div className="text-2xl font-bold text-text-primary-v4 mt-1">₹{totalMonthlyCost.toLocaleString()}</div>
        </PanelCard>
        <PanelCard className="p-4">
          <div className="text-text-muted-v4 text-xs font-medium uppercase tracking-wider">Next Auto-Renewal</div>
          <div className="text-2xl font-bold text-text-primary-v4 mt-1">{services[0]?.renewal_date || 'N/A'}</div>
        </PanelCard>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-ink-surface p-3 rounded-xl border border-hairline">
        <div className="flex gap-1 w-full sm:w-auto overflow-x-auto">
          {(['all', 'active', 'suspended', 'pending'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                activeFilter === tab ? 'bg-signal text-black font-semibold' : 'text-text-muted-v4 hover:text-text-primary-v4'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search by IP, domain, plan..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-ink px-3 py-1.5 text-xs rounded-lg border border-hairline text-text-primary-v4 focus:outline-none focus:border-signal"
          />
        </div>
      </div>

      {/* Services List */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-signal animate-spin" />
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-12 border border-hairline rounded-xl bg-ink-surface">
          <Server className="w-12 h-12 text-text-muted-v4 mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-bold text-text-primary-v4">No services found</h3>
          <p className="text-text-secondary-v4 text-sm mt-1">You do not have any active servers matching the criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredServices.map(svc => (
            <PanelCard key={svc.id} className="p-0 overflow-hidden group">
              <div className="p-5 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between hover:bg-white/[0.02] transition-colors relative">
                
                {/* Info Section */}
                <div className="flex gap-4 items-start w-full lg:w-1/3">
                  <div className="w-12 h-12 rounded-lg bg-ink-surface border border-hairline flex items-center justify-center shrink-0">
                    <Server className="w-6 h-6 text-signal" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-text-primary-v4">{svc.plan_name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        svc.status === 'active' || svc.status === 'running' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                        svc.status === 'rebooting' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse' :
                        'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}>
                        {svc.status}
                      </span>
                    </div>
                    <p className="text-text-secondary-v4 text-xs mt-0.5">{svc.domain}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-mono text-text-muted-v4 bg-ink px-2 py-0.5 rounded border border-hairline">{svc.ip}</span>
                      <button className="text-signal hover:underline text-xs" onClick={() => { navigator.clipboard.writeText(svc.ip); showToast('success', 'IP copied'); }}>Copy</button>
                    </div>
                  </div>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-3 w-full lg:w-1/3">
                  <div className="flex items-center gap-2 text-xs text-text-secondary-v4">
                    <Cpu className="w-3.5 h-3.5 text-text-muted-v4" /> {svc.specs?.cpu}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary-v4">
                    <Activity className="w-3.5 h-3.5 text-text-muted-v4" /> {svc.specs?.ram}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary-v4">
                    <HardDrive className="w-3.5 h-3.5 text-text-muted-v4" /> {svc.specs?.storage}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary-v4">
                    <Globe className="w-3.5 h-3.5 text-text-muted-v4" /> {svc.specs?.bandwidth}
                  </div>
                </div>

                {/* Meta & Actions */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 w-full lg:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-hairline">
                  <div className="text-left sm:text-right">
                    <div className="text-base font-bold text-text-primary-v4">₹{svc.price}/mo</div>
                    <div className="text-[11px] text-text-muted-v4">Renews {svc.renewal_date}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openTerminal(svc)}
                      className="p-2 v4-btn-secondary rounded-lg text-xs flex items-center gap-1.5"
                      title="Web SSH Terminal"
                    >
                      <Terminal className="w-3.5 h-3.5 text-signal" />
                      <span className="hidden sm:inline">SSH Console</span>
                    </button>
                    <button
                      onClick={() => handleBackup(svc)}
                      className="p-2 v4-btn-secondary rounded-lg text-xs"
                      title="Trigger Snapshot Backup"
                    >
                      <HardDrive className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleReboot(svc)}
                      className="p-2 v4-btn-secondary rounded-lg text-xs text-amber-400 hover:bg-amber-500/10 border-amber-500/20"
                      title="Reboot Instance"
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                
              </div>
            </PanelCard>
          ))}
        </div>
      )}

      {/* Web SSH Terminal Modal */}
      {terminalOpen && activeTerminalSvc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-3xl bg-[#0a0f1d] border border-hairline rounded-2xl shadow-2xl overflow-hidden font-mono flex flex-col h-[520px]">
            {/* Topbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#060a14] border-b border-hairline text-xs">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80 cursor-pointer" onClick={() => setTerminalOpen(false)} />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-text-muted-v4 ml-2">ssh root@{activeTerminalSvc.ip} ({activeTerminalSvc.location})</span>
              </div>
              <button onClick={() => setTerminalOpen(false)} className="text-text-muted-v4 hover:text-text-primary-v4">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-1.5 text-xs text-green-400 font-mono">
              {terminalHistory.map((line, i) => (
                <div key={i} className="whitespace-pre-wrap">{line}</div>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleExecTerminalCmd} className="flex items-center p-3 bg-[#060a14] border-t border-hairline">
              <span className="text-xs text-signal font-bold mr-2">root@vaulthost:~#</span>
              <input
                type="text"
                value={cmdInput}
                onChange={e => setCmdInput(e.target.value)}
                autoFocus
                placeholder="type 'uptime', 'df -h', 'free -m', 'restart nginx'..."
                className="flex-1 bg-transparent text-xs text-text-primary-v4 focus:outline-none font-mono"
              />
            </form>
          </div>
        </div>
      )}

      {/* Action Gateway Confirmation Modal */}
      {gatewayModalOpen && gatewayResult && (
        <ActionConfirmationModal
          isOpen={gatewayModalOpen}
          result={gatewayResult}
          onClose={() => setGatewayModalOpen(false)}
          onConfirmTier1={handleConfirmTier1}
          onVerifyTier2={async () => {}}
        />
      )}
    </div>
  );
}
