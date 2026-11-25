'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import {
  Server, Loader2, Power, Terminal, Globe, RefreshCw, Plus,
  HardDrive, Cpu, Activity, CheckCircle2, AlertTriangle, X,
  Copy, ExternalLink, KeyRound, Play, Square, Settings2, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { PanelCard } from '@/components/ui/panel-card';
import { ActionConfirmationModal } from '@/components/portal/ActionConfirmationModal';
import { ActionExecutionResult } from '@/lib/action-gateway/types';

interface ServiceItem {
  id: string;
  plan_name: string;
  tier?: string;
  domain?: string | null;
  hostname?: string | null;
  status: string;
  setup_status?: string | null;
  provisioning_mode?: string | null;
  ip?: string;
  ip_address?: string | null;
  ipv6_address?: string | null;
  ssh_port?: number | null;
  username?: string | null;
  password?: string | null;
  os_template?: string | null;
  web_console_url?: string | null;
  control_panel_url?: string | null;
  location?: string | null;
  specs_json?: { vcpu?: number; ram_gb?: number; disk_gb?: number } | null;
  specs?: { cpu?: string; ram?: string; storage?: string; bandwidth?: string };
  access_endpoints?: Record<string, any> | null;
  manual_setup_notes?: string | null;
  created_at: string;
  renewal_date?: string | null;
  next_renewal_at?: string | null;
  price?: number;
}

export default function ServicesManagementPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'stopped' | 'setup'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Direct Access modal (replaces static canned terminal with real SSH/Console/SFTP credentials)
  const [accessSvc, setAccessSvc] = useState<ServiceItem | null>(null);

  // Manual / BYO Dedicated Server registration modal
  const [byoOpen, setByoOpen] = useState(false);
  const [byoSubmitting, setByoSubmitting] = useState(false);
  const [byoForm, setByoForm] = useState({
    plan_name: 'Dedicated Bare Metal / BYO Node',
    hostname: '',
    ip_address: '',
    ipv6_address: '',
    ssh_port: '22',
    username: 'root',
    os_template: 'ubuntu-22.04',
    ssh_public_key: '',
    web_console_url: '',
    control_panel_url: '',
    vcpu: '8',
    ram_gb: '16',
    disk_gb: '250',
    location: 'Mumbai (ap-west-in)',
    manual_setup_notes: '',
  });

  // Action Gateway verification modal state
  const [gatewayModalOpen, setGatewayModalOpen] = useState(false);
  const [gatewayResult, setGatewayResult] = useState<ActionExecutionResult | null>(null);
  const [pendingActionInstance, setPendingActionInstance] = useState<{ svc: ServiceItem; verb: 'start' | 'stop' | 'reboot' | 'snapshot' } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      let dbServices: ServiceItem[] = [];
      if (user) {
        const { data } = await supabase
          .from('hosting_services')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (data) dbServices = data as ServiceItem[];
      }

      // Enrich with /api/cloud/vps live state where available
      try {
        const res = await fetch('/api/cloud/vps');
        if (res.ok) {
          const json = await res.json();
          const vpsList: any[] = json.instances || [];
          const mapById = new Map<string, ServiceItem>();
          for (const s of dbServices) mapById.set(s.id, s);
          for (const v of vpsList) {
            const existing = mapById.get(v.id);
            if (existing) {
              mapById.set(v.id, {
                ...existing,
                ip: existing.ip_address || v.ip,
                specs: v.specs,
                price: v.price ?? existing.price,
              });
            } else {
              mapById.set(v.id, v);
            }
          }
          setServices(Array.from(mapById.values()));
          return;
        }
      } catch {
        // Use direct DB records cleanly
      }

      setServices(dbServices);
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const dispatchPowerOrSnapshot = async (svc: ServiceItem, verb: 'start' | 'stop' | 'reboot' | 'snapshot') => {
    setPendingActionInstance({ svc, verb });
    try {
      const isCompute = !svc.provisioning_mode || svc.provisioning_mode === 'automated';
      if (isCompute && (svc.tier === 'vps' || svc.tier === 'cloud' || svc.tier === 'dedicated')) {
        const res = await fetch('/api/cloud/vps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: verb,
            instanceId: svc.id,
            serviceId: svc.id,
            snapshotName: verb === 'snapshot' ? `snap_${Date.now()}` : undefined,
          }),
        });
        const data = await res.json();
        if (data.status === 'pending_confirmation' || data.status === 'quarantined') {
          setGatewayResult(data);
          setGatewayModalOpen(true);
          return;
        }
        if (res.ok) {
          showToast('success', `${verb.toUpperCase()} executed on ${svc.plan_name}`);
          loadData();
          return;
        }
      }

      // Direct portal server-action fallback (works for manual/BYO & all hosting plans)
      const res = await fetch('/api/portal/server-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId: svc.id, action: verb }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Action failed');
      showToast('success', json.message || `${verb} applied cleanly.`);
      loadData();
    } catch (e: any) {
      showToast('error', e?.message || `Failed to run ${verb}`);
    }
  };

  const handleConfirmTier1 = async (confirmationToken: string) => {
    if (!pendingActionInstance) return;
    const { svc, verb } = pendingActionInstance;
    try {
      const res = await fetch('/api/cloud/vps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: verb,
          instanceId: svc.id,
          serviceId: svc.id,
          options: { confirmationToken },
          intent: {
            intentId: crypto.randomUUID(),
            actor: { id: 'usr-client', type: 'user', tenantId: 'ten_portal_default', roles: ['tenant_operator'] },
            targetService: 'compute',
            actionVerb: `${verb}_instance`,
            resourceUri: `compute://vps/${svc.id}`,
            parameters: { instanceId: svc.id },
            idempotencyKey: `idem-${verb}-${Date.now()}`,
            createdAt: new Date().toISOString(),
          },
        }),
      });
      const data = await res.json();
      if (data.status === 'executed' || res.ok) {
        showToast('success', `Verified: ${verb} triggered for ${svc.plan_name}`);
        loadData();
      }
    } catch {
      showToast('error', 'Action confirmation failed');
    } finally {
      setGatewayModalOpen(false);
      setPendingActionInstance(null);
    }
  };

  const handleRegisterManualServer = async (e: React.FormEvent) => {
    e.preventDefault();
    setByoSubmitting(true);
    try {
      const res = await fetch('/api/portal/server-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register_manual_server',
          ...byoForm,
          ssh_port: parseInt(byoForm.ssh_port, 10) || 22,
          vcpu: parseInt(byoForm.vcpu, 10) || 4,
          ram_gb: parseInt(byoForm.ram_gb, 10) || 8,
          disk_gb: parseInt(byoForm.disk_gb, 10) || 160,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register server');
      showToast('success', 'Manual dedicated server registered!');
      setByoOpen(false);
      setByoForm({
        plan_name: 'Dedicated Bare Metal / BYO Node',
        hostname: '',
        ip_address: '',
        ipv6_address: '',
        ssh_port: '22',
        username: 'root',
        os_template: 'ubuntu-22.04',
        ssh_public_key: '',
        web_console_url: '',
        control_panel_url: '',
        vcpu: '8',
        ram_gb: '16',
        disk_gb: '250',
        location: 'Mumbai (ap-west-in)',
        manual_setup_notes: '',
      });
      loadData();
    } catch (err: any) {
      showToast('error', err.message || 'Could not register manual server');
    } finally {
      setByoSubmitting(false);
    }
  };

  const copyText = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    showToast('success', `${label} copied to clipboard`);
  };

  const filteredServices = services.filter((svc) => {
    const ip = svc.ip_address || svc.ip || '';
    const host = svc.hostname || svc.domain || '';
    const matchesSearch =
      !searchQuery ||
      svc.plan_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      host.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeFilter === 'active') return svc.status === 'active' || svc.status === 'running';
    if (activeFilter === 'stopped') return svc.status === 'stopped' || svc.status === 'suspended';
    if (activeFilter === 'setup') return svc.setup_status === 'awaiting_setup' || svc.status === 'pending_provisioning';
    return true;
  });

  const activeCount = services.filter((s) => s.status === 'active' || s.status === 'running').length;
  const setupNeededCount = services.filter((s) => s.setup_status === 'awaiting_setup' || !s.ip_address && !s.ip).length;

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl border text-xs font-semibold shadow-2xl flex items-center gap-2 ${
          toastMsg.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {toastMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {toastMsg.text}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-hairline pb-4">
        <div>
          <h1 className="v4-display text-2xl font-bold flex items-center gap-2">
            <Server className="w-6 h-6 text-signal" />
            Dedicated Systems &amp; Hosting Fleet
          </h1>
          <p className="text-text-secondary-v4 text-sm mt-1">
            Direct SSH/SFTP access, Web Console, Cloud-Init bootstrap, firewall rules, and manual BYO nodes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            className="v4-btn-secondary px-3 py-2 flex items-center justify-center gap-2 text-xs sm:text-sm"
            onClick={loadData}
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            className="v4-btn-secondary px-3.5 py-2 flex items-center justify-center gap-2 text-xs sm:text-sm border-signal/30 text-signal"
            onClick={() => setByoOpen(true)}
          >
            <Settings2 className="w-4 h-4" /> Connect Manual / BYO Server
          </button>
          <Link
            href="/vaulthost/pricing"
            className="v4-btn-primary px-4 py-2 flex items-center justify-center gap-2 shadow-glow text-xs sm:text-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Deploy New Server
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <PanelCard className="p-4">
          <div className="text-text-muted-v4 text-xs font-medium uppercase tracking-wider">Total Instances</div>
          <div className="text-2xl font-bold text-text-primary-v4 mt-1">{services.length}</div>
        </PanelCard>
        <PanelCard className="p-4">
          <div className="text-text-muted-v4 text-xs font-medium uppercase tracking-wider">Running &amp; Reachable</div>
          <div className="text-2xl font-bold text-green-500 mt-1">{activeCount}</div>
        </PanelCard>
        <PanelCard className="p-4">
          <div className="text-text-muted-v4 text-xs font-medium uppercase tracking-wider">Awaiting / Manual Setup</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{setupNeededCount}</div>
        </PanelCard>
        <PanelCard className="p-4">
          <div className="text-text-muted-v4 text-xs font-medium uppercase tracking-wider">SSH Key / Firewall Ready</div>
          <div className="text-2xl font-bold text-signal mt-1">
            {services.filter((s) => Boolean(s.ip_address || s.ip)).length}
          </div>
        </PanelCard>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-ink-surface p-3 rounded-xl border border-hairline">
        <div className="flex gap-1 w-full sm:w-auto overflow-x-auto">
          {([
            { id: 'all', label: 'All' },
            { id: 'active', label: 'Active' },
            { id: 'stopped', label: 'Stopped' },
            { id: 'setup', label: 'Awaiting Setup' },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeFilter === tab.id ? 'bg-signal text-black font-semibold' : 'text-text-muted-v4 hover:text-text-primary-v4'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search hostname, IPv4, plan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-ink px-3 py-1.5 text-xs rounded-lg border border-hairline text-text-primary-v4 focus:outline-none focus:border-signal"
          />
        </div>
      </div>

      {/* Service Fleet Cards */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-signal animate-spin" />
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-12 border border-hairline rounded-xl bg-ink-surface">
          <Server className="w-12 h-12 text-text-muted-v4 mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-bold text-text-primary-v4">No dedicated systems found</h3>
          <p className="text-text-secondary-v4 text-sm mt-1 mb-5">
            Deploy a new server or connect an existing bare-metal / manual server.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => setByoOpen(true)} className="v4-btn-secondary px-4 py-2 text-xs">
              Connect Manual / BYO Server
            </button>
            <Link href="/vaulthost/pricing" className="v4-btn-primary px-4 py-2 text-xs">
              Deploy Managed Server
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredServices.map((svc) => {
            const ip = svc.ip_address || svc.ip || '';
            const port = svc.ssh_port || 22;
            const user = svc.username || 'root';
            const sshCmd = ip ? `ssh ${user}@${ip}${port !== 22 ? ` -p ${port}` : ''}` : '';
            const vcpuLabel = svc.specs_json?.vcpu ? `${svc.specs_json.vcpu} vCPU` : svc.specs?.cpu || 'Managed CPU';
            const ramLabel = svc.specs_json?.ram_gb ? `${svc.specs_json.ram_gb} GB RAM` : svc.specs?.ram || 'NVMe Tier';
            const diskLabel = svc.specs_json?.disk_gb ? `${svc.specs_json.disk_gb} GB NVMe` : svc.specs?.storage || 'Dedicated Disk';
            const hostLabel = svc.hostname || svc.domain || 'Unassigned hostname';
            const renewStr = svc.next_renewal_at || svc.renewal_date;

            return (
              <PanelCard key={svc.id} className="p-0 overflow-hidden">
                <div className="p-5 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between hover:bg-white/[0.02] transition-colors">
                  {/* Left: Identity & IP */}
                  <div className="flex gap-4 items-start w-full lg:w-[38%]">
                    <div className="w-12 h-12 rounded-lg bg-ink-surface border border-hairline flex items-center justify-center shrink-0">
                      <Server className="w-6 h-6 text-signal" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/portal/service/${svc.id}`}
                          className="text-base font-bold text-text-primary-v4 hover:text-signal transition-colors truncate"
                        >
                          {svc.plan_name}
                        </Link>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          svc.status === 'active' || svc.status === 'running'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : svc.status === 'stopped' || svc.status === 'suspended'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {svc.status}
                        </span>
                        {svc.provisioning_mode === 'manual' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-signal/10 text-signal border border-signal/20">
                            Manual / BYO
                          </span>
                        )}
                      </div>
                      <p className="text-text-secondary-v4 text-xs mt-0.5 truncate font-mono">{hostLabel}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {ip ? (
                          <>
                            <span className="text-xs font-mono text-text-primary-v4 bg-ink px-2 py-0.5 rounded border border-hairline">
                              {ip}:{port}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyText(sshCmd, 'SSH command')}
                              className="inline-flex items-center gap-1 text-[11px] text-signal hover:underline"
                            >
                              <Copy className="w-3 h-3" /> Copy SSH
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-amber-400 font-mono">
                            Awaiting IP assignment — click Manage to configure manually
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Center: Specs */}
                  <div className="grid grid-cols-2 gap-3 w-full lg:w-[30%]">
                    <div className="flex items-center gap-2 text-xs text-text-secondary-v4">
                      <Cpu className="w-3.5 h-3.5 text-signal shrink-0" /> {vcpuLabel}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-secondary-v4">
                      <Activity className="w-3.5 h-3.5 text-signal shrink-0" /> {ramLabel}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-secondary-v4">
                      <HardDrive className="w-3.5 h-3.5 text-signal shrink-0" /> {diskLabel}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-secondary-v4 truncate">
                      <Globe className="w-3.5 h-3.5 text-signal shrink-0" /> {svc.os_template || svc.location || 'Linux'}
                    </div>
                  </div>

                  {/* Right: Real Access & Controls */}
                  <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-hairline">
                    {renewStr && (
                      <div className="text-[11px] text-text-muted-v4 mr-2">
                        Renews {new Date(renewStr).toLocaleDateString('en-IN')}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setAccessSvc(svc)}
                      className="px-3 py-1.5 v4-btn-secondary rounded-lg text-xs flex items-center gap-1.5"
                      title="Direct SSH, SFTP & Console Details"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-signal" />
                      <span>Credentials</span>
                    </button>
                    {svc.web_console_url && (
                      <a
                        href={svc.web_console_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 v4-btn-secondary rounded-lg text-xs flex items-center gap-1.5"
                      >
                        <Terminal className="w-3.5 h-3.5 text-signal" />
                        <span>Console</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        dispatchPowerOrSnapshot(svc, svc.status === 'stopped' ? 'start' : 'reboot')
                      }
                      className="p-2 v4-btn-secondary rounded-lg text-xs text-amber-400 hover:bg-amber-500/10"
                      title={svc.status === 'stopped' ? 'Power On' : 'Reboot Server'}
                    >
                      {svc.status === 'stopped' ? <Play className="w-3.5 h-3.5 text-green-400" /> : <Power className="w-3.5 h-3.5" />}
                    </button>
                    {svc.status !== 'stopped' && (
                      <button
                        type="button"
                        onClick={() => dispatchPowerOrSnapshot(svc, 'stop')}
                        className="p-2 v4-btn-secondary rounded-lg text-xs text-red-400 hover:bg-red-500/10"
                        title="Stop Instance"
                      >
                        <Square className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <Link
                      href={`/portal/service/${svc.id}`}
                      className="px-3.5 py-1.5 v4-btn-primary rounded-lg text-xs font-semibold"
                    >
                      Manage System
                    </Link>
                  </div>
                </div>
              </PanelCard>
            );
          })}
        </div>
      )}

      {/* Direct Access Credentials & Endpoint Modal */}
      {accessSvc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl bg-[#0a0f1d] border border-hairline rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 bg-[#060a14] border-b border-hairline">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-signal" />
                <div>
                  <h3 className="text-sm font-bold text-text-primary-v4">{accessSvc.plan_name} — Direct Access</h3>
                  <p className="text-[11px] text-text-muted-v4 font-mono">{accessSvc.hostname || accessSvc.domain || accessSvc.id}</p>
                </div>
              </div>
              <button onClick={() => setAccessSvc(null)} className="text-text-muted-v4 hover:text-text-primary-v4">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-ink border border-hairline">
                  <div className="text-text-muted-v4 uppercase text-[10px]">IPv4 Address</div>
                  <div className="font-mono text-sm text-text-primary-v4 mt-1 flex items-center justify-between">
                    <span>{accessSvc.ip_address || accessSvc.ip || 'Pending'}</span>
                    {(accessSvc.ip_address || accessSvc.ip) && (
                      <button onClick={() => copyText((accessSvc.ip_address || accessSvc.ip)!, 'IPv4')} className="text-signal">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-ink border border-hairline">
                  <div className="text-text-muted-v4 uppercase text-[10px]">Username &amp; SSH Port</div>
                  <div className="font-mono text-sm text-text-primary-v4 mt-1">
                    {accessSvc.username || 'root'} : {accessSvc.ssh_port || 22}
                  </div>
                </div>
              </div>

              {(accessSvc.ip_address || accessSvc.ip) && (
                <div className="p-3 rounded-xl bg-ink border border-hairline">
                  <div className="text-text-muted-v4 uppercase text-[10px] mb-1">SSH Connect Command</div>
                  <div className="flex items-center justify-between gap-2 font-mono text-green-400">
                    <span className="truncate">
                      ssh {accessSvc.username || 'root'}@{accessSvc.ip_address || accessSvc.ip}
                      {(accessSvc.ssh_port || 22) !== 22 ? ` -p ${accessSvc.ssh_port}` : ''}
                    </span>
                    <button
                      onClick={() =>
                        copyText(
                          `ssh ${accessSvc.username || 'root'}@${accessSvc.ip_address || accessSvc.ip}${
                            (accessSvc.ssh_port || 22) !== 22 ? ` -p ${accessSvc.ssh_port}` : ''
                          }`,
                          'SSH command'
                        )
                      }
                      className="text-signal shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {accessSvc.password && (
                <div className="p-3 rounded-xl bg-ink border border-hairline flex items-center justify-between">
                  <div>
                    <div className="text-text-muted-v4 uppercase text-[10px]">Initial / Current Password</div>
                    <div className="font-mono text-sm text-text-primary-v4 mt-0.5">{accessSvc.password}</div>
                  </div>
                  <button onClick={() => copyText(accessSvc.password!, 'Password')} className="text-signal">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              )}

              {accessSvc.manual_setup_notes && (
                <div className="p-3 rounded-xl bg-ink-surface-2 border border-hairline text-text-secondary-v4">
                  <div className="text-[10px] uppercase text-text-muted-v4 mb-1">Setup Notes</div>
                  <p className="whitespace-pre-wrap">{accessSvc.manual_setup_notes}</p>
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                {accessSvc.control_panel_url && (
                  <a
                    href={accessSvc.control_panel_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="v4-btn-secondary px-3 py-2 text-xs inline-flex items-center gap-1.5"
                  >
                    Open Control Panel <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {accessSvc.web_console_url && (
                  <a
                    href={accessSvc.web_console_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="v4-btn-secondary px-3 py-2 text-xs inline-flex items-center gap-1.5"
                  >
                    Launch Web Console <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <Link
                  href={`/portal/service/${accessSvc.id}`}
                  className="v4-btn-primary px-4 py-2 text-xs font-semibold"
                >
                  Open Full System Controls
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connect / Register Manual Server (BYO) Modal */}
      {byoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#0a0f1d] border border-hairline rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 bg-[#060a14] border-b border-hairline">
              <div>
                <h3 className="text-base font-bold text-text-primary-v4">Connect Manual / BYO Dedicated Server</h3>
                <p className="text-xs text-text-muted-v4">Register any bare-metal, colocation, or external node for unified access &amp; Cloud-Init management.</p>
              </div>
              <button onClick={() => setByoOpen(false)} className="text-text-muted-v4 hover:text-text-primary-v4">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRegisterManualServer} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-muted-v4 mb-1">Display Name / Label *</label>
                  <input
                    required
                    value={byoForm.plan_name}
                    onChange={(e) => setByoForm({ ...byoForm, plan_name: e.target.value })}
                    className="w-full bg-ink px-3 py-2 rounded-lg border border-hairline text-text-primary-v4"
                  />
                </div>
                <div>
                  <label className="block text-text-muted-v4 mb-1">Hostname / Domain *</label>
                  <input
                    required
                    placeholder="node1.yourdomain.com"
                    value={byoForm.hostname}
                    onChange={(e) => setByoForm({ ...byoForm, hostname: e.target.value })}
                    className="w-full bg-ink px-3 py-2 rounded-lg border border-hairline text-text-primary-v4 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-text-muted-v4 mb-1">Public IPv4 *</label>
                  <input
                    required
                    placeholder="203.0.113.10"
                    value={byoForm.ip_address}
                    onChange={(e) => setByoForm({ ...byoForm, ip_address: e.target.value })}
                    className="w-full bg-ink px-3 py-2 rounded-lg border border-hairline text-text-primary-v4 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-text-muted-v4 mb-1">SSH User</label>
                    <input
                      value={byoForm.username}
                      onChange={(e) => setByoForm({ ...byoForm, username: e.target.value })}
                      className="w-full bg-ink px-3 py-2 rounded-lg border border-hairline text-text-primary-v4 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-text-muted-v4 mb-1">SSH Port</label>
                    <input
                      type="number"
                      value={byoForm.ssh_port}
                      onChange={(e) => setByoForm({ ...byoForm, ssh_port: e.target.value })}
                      className="w-full bg-ink px-3 py-2 rounded-lg border border-hairline text-text-primary-v4 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-text-muted-v4 mb-1">OS Template</label>
                  <select
                    value={byoForm.os_template}
                    onChange={(e) => setByoForm({ ...byoForm, os_template: e.target.value })}
                    className="w-full bg-ink px-3 py-2 rounded-lg border border-hairline text-text-primary-v4"
                  >
                    <option value="ubuntu-22.04">Ubuntu 22.04 LTS</option>
                    <option value="ubuntu-24.04">Ubuntu 24.04 LTS</option>
                    <option value="debian-12">Debian 12 Bookworm</option>
                    <option value="almalinux-9">AlmaLinux 9</option>
                    <option value="rocky-linux-9">Rocky Linux 9</option>
                    <option value="custom">Custom / Bare-Metal Linux</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-text-muted-v4 mb-1">vCPU</label>
                    <input
                      type="number"
                      value={byoForm.vcpu}
                      onChange={(e) => setByoForm({ ...byoForm, vcpu: e.target.value })}
                      className="w-full bg-ink px-3 py-2 rounded-lg border border-hairline text-text-primary-v4 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-text-muted-v4 mb-1">RAM (GB)</label>
                    <input
                      type="number"
                      value={byoForm.ram_gb}
                      onChange={(e) => setByoForm({ ...byoForm, ram_gb: e.target.value })}
                      className="w-full bg-ink px-3 py-2 rounded-lg border border-hairline text-text-primary-v4 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-text-muted-v4 mb-1">Disk (GB)</label>
                    <input
                      type="number"
                      value={byoForm.disk_gb}
                      onChange={(e) => setByoForm({ ...byoForm, disk_gb: e.target.value })}
                      className="w-full bg-ink px-3 py-2 rounded-lg border border-hairline text-text-primary-v4 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-text-muted-v4 mb-1">Web Console / IPMI URL (optional)</label>
                  <input
                    placeholder="https://ipmi.example.com:8006"
                    value={byoForm.web_console_url}
                    onChange={(e) => setByoForm({ ...byoForm, web_console_url: e.target.value })}
                    className="w-full bg-ink px-3 py-2 rounded-lg border border-hairline text-text-primary-v4 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-text-muted-v4 mb-1">Control Panel URL (optional)</label>
                  <input
                    placeholder="https://panel.example.com:8083"
                    value={byoForm.control_panel_url}
                    onChange={(e) => setByoForm({ ...byoForm, control_panel_url: e.target.value })}
                    className="w-full bg-ink px-3 py-2 rounded-lg border border-hairline text-text-primary-v4 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-text-muted-v4 mb-1">SSH Public Key (ssh-ed25519 / ssh-rsa)</label>
                <textarea
                  rows={2}
                  placeholder="ssh-ed25519 AAAA..."
                  value={byoForm.ssh_public_key}
                  onChange={(e) => setByoForm({ ...byoForm, ssh_public_key: e.target.value })}
                  className="w-full bg-ink px-3 py-2 rounded-lg border border-hairline text-text-primary-v4 font-mono"
                />
              </div>

              <div>
                <label className="block text-text-muted-v4 mb-1">Manual Setup Notes / Runbook</label>
                <textarea
                  rows={2}
                  placeholder="Optional custom port mappings, VPN gateway, or hardware notes..."
                  value={byoForm.manual_setup_notes}
                  onChange={(e) => setByoForm({ ...byoForm, manual_setup_notes: e.target.value })}
                  className="w-full bg-ink px-3 py-2 rounded-lg border border-hairline text-text-primary-v4"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setByoOpen(false)} className="v4-btn-secondary px-4 py-2 text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={byoSubmitting} className="v4-btn-primary px-5 py-2 text-xs font-semibold flex items-center gap-1.5">
                  {byoSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  Register Dedicated Node
                </button>
              </div>
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
