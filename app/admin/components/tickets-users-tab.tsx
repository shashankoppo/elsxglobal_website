'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminFetch, createClient } from './admin-fetch';
import {
  Loader2, Server, RefreshCw, Edit3, Pause, Play, Save, LifeBuoy,
  Search, Check, X as XIcon, ChevronDown, ChevronRight, MessageSquare, Send,
  Users, Plus, RotateCw, Camera, Zap, KeyRound,
} from 'lucide-react';

// ─── SERVICES ────────────────────────────────────────────────
const DEFAULT_MANUAL_FORM = {
  user_email: '',
  order_id: '',
  plan_name: 'Dedicated Metal EPYC-1',
  tier: 'dedicated',
  domain: '',
  hostname: '',
  ip_address: '',
  ipv6_address: '',
  ssh_port: 22,
  username: 'root',
  password: '',
  ssh_public_key: '',
  web_console_url: '',
  control_panel_url: '',
  os_template: 'ubuntu-24.04',
  location: 'Mumbai (IN-West)',
  vcpu: 8,
  ram_gb: 32,
  disk_gb: 500,
  access_endpoints_json: '{}',
  manual_setup_notes: '',
  renewal_days: 30,
};

export function ServicesTab({ showToast, onRefresh }: { showToast: (t: 'success' | 'error', m: string) => void; onRefresh: () => void }) {
  const [services, setServices] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [creatingManual, setCreatingManual] = useState(false);
  const [manualForm, setManualForm] = useState(DEFAULT_MANUAL_FORM);

  const fetchServices = useCallback(async () => {
    const res = await adminFetch('list-services');
    if (res.ok) { const data = await res.json(); setServices(data.data || []); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
    let out = '';
    for (let i = 0; i < 18; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  };

  const updateService = async (serviceId: string, updates: Record<string, unknown>) => {
    setActionLoading(serviceId);
    const res = await adminFetch('update-service', { serviceId, ...updates });
    if (res.ok) { showToast('success', 'Service updated'); fetchServices(); onRefresh(); }
    else showToast('error', 'Update failed');
    setActionLoading(null);
  };

  const handleServicePower = async (serviceId: string, command: 'start' | 'stop' | 'restart' | 'snapshot' | 'suspend') => {
    setActionLoading(`${command}-${serviceId}`);
    const res = await adminFetch('admin-service-power', { serviceId, command });
    if (res.ok) { showToast('success', `Command "${command}" executed`); fetchServices(); onRefresh(); }
    else {
      const err = await res.json().catch(() => ({}));
      showToast('error', err.error || `Failed to run ${command}`);
    }
    setActionLoading(null);
  };

  const handleTriggerProvision = async (serviceId: string) => {
    setActionLoading(`prov-${serviceId}`);
    const res = await adminFetch('trigger-provision', { serviceId });
    if (res.ok) { showToast('success', 'Auto-provisioning triggered'); fetchServices(); onRefresh(); }
    else {
      const err = await res.json().catch(() => ({}));
      showToast('error', err.error || 'Auto-provisioning failed');
    }
    setActionLoading(null);
  };

  const handleCreateManualService = async () => {
    if (!manualForm.plan_name.trim()) {
      showToast('error', 'Plan name is required');
      return;
    }
    let parsedEndpoints: Record<string, string> = {};
    try {
      if (manualForm.access_endpoints_json.trim()) {
        parsedEndpoints = JSON.parse(manualForm.access_endpoints_json);
      }
    } catch {
      showToast('error', 'Access Endpoints must be valid JSON (e.g. {"IPMI":"https://..."})');
      return;
    }

    setCreatingManual(true);
    const res = await adminFetch('create-manual-service', {
      ...manualForm,
      ssh_port: Number(manualForm.ssh_port) || 22,
      vcpu: Number(manualForm.vcpu) || 4,
      ram_gb: Number(manualForm.ram_gb) || 8,
      disk_gb: Number(manualForm.disk_gb) || 160,
      renewal_days: Number(manualForm.renewal_days) || 30,
      access_endpoints: parsedEndpoints,
    });
    if (res.ok) {
      showToast('success', 'Manual service provisioned & assigned');
      setShowManualModal(false);
      setManualForm(DEFAULT_MANUAL_FORM);
      fetchServices();
      onRefresh();
    } else {
      const err = await res.json().catch(() => ({}));
      showToast('error', err.error || 'Failed to create manual service');
    }
    setCreatingManual(false);
  };

  const saveServiceEdit = async () => {
    if (!editingService) return;
    setSaving(true);
    await updateService(editingService.id as string, {
      status: editingService.status,
      renewal_date: editingService.renewal_date,
      hostname: editingService.hostname,
      ip_address: editingService.ip_address,
      ipv6_address: editingService.ipv6_address,
      os_template: editingService.os_template,
      provisioning_mode: editingService.provisioning_mode,
      setup_status: editingService.setup_status,
      control_panel_url: editingService.control_panel_url,
      username: editingService.username,
      password: editingService.password,
      ssh_port: editingService.ssh_port,
      web_console_url: editingService.web_console_url,
      manual_setup_notes: editingService.manual_setup_notes,
    });
    setEditingService(null);
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  const svcStatusColors: Record<string, string> = {
    active: 'text-green-600 bg-green-500/10', suspended: 'text-red-600 bg-red-500/10',
    provisioning: 'text-blue-600 bg-blue-500/10', cancelled: 'text-muted-foreground bg-muted/20',
    stopped: 'text-amber-600 bg-amber-500/10', terminated: 'text-muted-foreground bg-muted/20',
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/50">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Compute &amp; Dedicated Instances</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Manage automated &amp; manually provisioned servers, SSH credentials, power state, and access endpoints</p>
        </div>
        {!editingService && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowManualModal(!showManualModal);
                if (!showManualModal && !manualForm.password) {
                  setManualForm((prev) => ({ ...prev, password: generateStrongPassword() }));
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-[12px] font-medium transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Provision Manual Server / Service
            </button>
            <button onClick={fetchServices} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted hover:bg-muted/80 text-[13px] font-medium transition-colors">
              <RefreshCw className="h-3.5 w-3.5" />Refresh
            </button>
          </div>
        )}
      </div>

      {showManualModal && !editingService && (
        <div className="rounded-lg bg-background border border-primary/40 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between p-4 border-b border-border/50 bg-primary/5">
            <div>
              <h3 className="text-[14px] font-semibold text-foreground">Provision Manual Dedicated Server / Service</h3>
              <p className="text-[12px] text-muted-foreground">Directly assign hardware, IPv4/IPv6, SSH credentials, IPMI/Web Console URLs, and Cloud-Init metadata to a customer</p>
            </div>
            <button onClick={() => setShowManualModal(false)} className="px-3 py-1 rounded-md bg-muted text-muted-foreground hover:text-foreground text-[12px] font-medium">
              Cancel
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Customer Email</label>
                <input type="email" value={manualForm.user_email} onChange={(e) => setManualForm({ ...manualForm, user_email: e.target.value })} placeholder="customer@company.com" className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[13px]" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Order ID (Optional)</label>
                <input type="text" value={manualForm.order_id} onChange={(e) => setManualForm({ ...manualForm, order_id: e.target.value })} placeholder="UUID to mark active" className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[13px] font-mono" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Service Tier</label>
                <select value={manualForm.tier} onChange={(e) => setManualForm({ ...manualForm, tier: e.target.value })} className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[13px]">
                  <option value="dedicated">Dedicated Bare Metal</option>
                  <option value="vps">Cloud VPS (KVM)</option>
                  <option value="shared">Managed Hosting / HestiaCP</option>
                  <option value="wordpress">Managed WordPress</option>
                  <option value="gaming">Gaming / Pterodactyl</option>
                  <option value="custom">Custom Infrastructure</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Plan Name *</label>
                <input type="text" value={manualForm.plan_name} onChange={(e) => setManualForm({ ...manualForm, plan_name: e.target.value })} className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[13px]" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Hostname (FQDN)</label>
                <input type="text" value={manualForm.hostname} onChange={(e) => setManualForm({ ...manualForm, hostname: e.target.value })} placeholder="node-in-01.vaulthost.cloud" className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[13px] font-mono" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Primary Domain</label>
                <input type="text" value={manualForm.domain} onChange={(e) => setManualForm({ ...manualForm, domain: e.target.value })} placeholder="app.clientdomain.com" className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[13px] font-mono" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">IPv4 Address</label>
                <input type="text" value={manualForm.ip_address} onChange={(e) => setManualForm({ ...manualForm, ip_address: e.target.value })} placeholder="103.x.x.x" className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[13px] font-mono" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">IPv6 Address</label>
                <input type="text" value={manualForm.ipv6_address} onChange={(e) => setManualForm({ ...manualForm, ipv6_address: e.target.value })} placeholder="2401:4900::/64" className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[13px] font-mono" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">OS Template</label>
                <select value={manualForm.os_template} onChange={(e) => setManualForm({ ...manualForm, os_template: e.target.value })} className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[13px]">
                  <option value="ubuntu-24.04">Ubuntu 24.04 LTS</option>
                  <option value="ubuntu-22.04">Ubuntu 22.04 LTS</option>
                  <option value="debian-12">Debian 12 Bookworm</option>
                  <option value="rocky-linux-9">Rocky Linux 9</option>
                  <option value="almalinux-9">AlmaLinux 9</option>
                  <option value="windows-server-2022">Windows Server 2022</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Username</label>
                <input type="text" value={manualForm.username} onChange={(e) => setManualForm({ ...manualForm, username: e.target.value })} className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[13px] font-mono" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Root / Admin Password</label>
                <div className="flex gap-1.5">
                  <input type="text" value={manualForm.password} onChange={(e) => setManualForm({ ...manualForm, password: e.target.value })} className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[13px] font-mono" />
                  <button type="button" onClick={() => setManualForm({ ...manualForm, password: generateStrongPassword() })} className="px-2.5 py-1.5 rounded-md bg-muted hover:bg-muted/80 text-[11px] font-medium shrink-0" title="Generate Password">
                    <KeyRound className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">SSH</label>
                  <input type="number" value={manualForm.ssh_port} onChange={(e) => setManualForm({ ...manualForm, ssh_port: parseInt(e.target.value) || 22 })} className="w-full bg-background border border-border rounded-md px-2 py-1.5 text-[12px] font-mono" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">vCPU</label>
                  <input type="number" value={manualForm.vcpu} onChange={(e) => setManualForm({ ...manualForm, vcpu: parseInt(e.target.value) || 1 })} className="w-full bg-background border border-border rounded-md px-2 py-1.5 text-[12px] font-mono" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">RAM GB</label>
                  <input type="number" value={manualForm.ram_gb} onChange={(e) => setManualForm({ ...manualForm, ram_gb: parseInt(e.target.value) || 1 })} className="w-full bg-background border border-border rounded-md px-2 py-1.5 text-[12px] font-mono" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Disk GB</label>
                  <input type="number" value={manualForm.disk_gb} onChange={(e) => setManualForm({ ...manualForm, disk_gb: parseInt(e.target.value) || 20 })} className="w-full bg-background border border-border rounded-md px-2 py-1.5 text-[12px] font-mono" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Web Console / IPMI / noVNC URL</label>
                <input type="text" value={manualForm.web_console_url} onChange={(e) => setManualForm({ ...manualForm, web_console_url: e.target.value })} placeholder="https://console.vaulthost.cloud/..." className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[13px]" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Control Panel URL</label>
                <input type="text" value={manualForm.control_panel_url} onChange={(e) => setManualForm({ ...manualForm, control_panel_url: e.target.value })} placeholder="https://panel.vaulthost.cloud:8083" className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[13px]" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Datacenter Location</label>
                <input type="text" value={manualForm.location} onChange={(e) => setManualForm({ ...manualForm, location: e.target.value })} className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[13px]" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">SSH Public Key (Optional)</label>
                <textarea rows={2} value={manualForm.ssh_public_key} onChange={(e) => setManualForm({ ...manualForm, ssh_public_key: e.target.value })} placeholder="ssh-ed25519 AAAA..." className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[12px] font-mono" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Custom Access Endpoints JSON (IPMI, Grafana, SFTP)</label>
                <textarea rows={2} value={manualForm.access_endpoints_json} onChange={(e) => setManualForm({ ...manualForm, access_endpoints_json: e.target.value })} placeholder='{"IPMI":"https://10.0.0.10","SFTP":"sftp://root@103.x.x.x"}' className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[12px] font-mono" />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Manual Provisioning &amp; Handover Notes</label>
              <textarea rows={2} value={manualForm.manual_setup_notes} onChange={(e) => setManualForm({ ...manualForm, manual_setup_notes: e.target.value })} placeholder="Rack U14, VLAN 40, IPMI isolated on management subnet..." className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[12px]" />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
              <button onClick={() => setShowManualModal(false)} className="px-4 py-1.5 rounded-md bg-muted text-muted-foreground text-[12px] font-medium">Cancel</button>
              <button onClick={handleCreateManualService} disabled={creatingManual} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 disabled:opacity-50">
                {creatingManual ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Create &amp; Assign Instance
              </button>
            </div>
          </div>
        </div>
      )}

      {editingService ? (
        <div className="rounded-lg bg-background border border-border shadow-sm animate-fade-in">
          <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/10">
            <h3 className="text-[14px] font-semibold text-foreground">Edit Instance Configuration</h3>
            <button onClick={() => setEditingService(null)} className="px-3 py-1.5 rounded-md bg-muted text-muted-foreground hover:text-foreground text-[12px] font-medium transition-colors">
              &larr; Back
            </button>
          </div>
          <div className="p-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Status</label>
                <select value={(editingService.status as string) || 'active'} onChange={(e) => setEditingService({ ...editingService, status: e.target.value })} className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all">
                  <option value="active">Active</option><option value="suspended">Suspended</option><option value="provisioning">Provisioning</option><option value="stopped">Stopped</option><option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Provisioning Mode</label>
                <select value={(editingService.provisioning_mode as string) || 'automated'} onChange={(e) => setEditingService({ ...editingService, provisioning_mode: e.target.value })} className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[13px]">
                  <option value="automated">Automated</option><option value="manual">Manual</option><option value="byo">BYO / External</option><option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Setup Status</label>
                <select value={(editingService.setup_status as string) || 'ready'} onChange={(e) => setEditingService({ ...editingService, setup_status: e.target.value })} className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[13px]">
                  <option value="ready">Ready</option><option value="pending_manual">Pending Manual Setup</option><option value="configuring">Configuring</option><option value="awaiting_ip">Awaiting IP Allocation</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Renewal Date</label>
                <input type="date" value={editingService.renewal_date ? new Date(editingService.renewal_date as string).toISOString().slice(0, 10) : ''} onChange={(e) => setEditingService({ ...editingService, renewal_date: new Date(e.target.value).toISOString() })} className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Hostname (FQDN)</label>
                <input type="text" value={(editingService.hostname as string) || ''} onChange={(e) => setEditingService({ ...editingService, hostname: e.target.value })} className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[13px] font-mono focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">OS Template</label>
                <input type="text" value={(editingService.os_template as string) || ''} onChange={(e) => setEditingService({ ...editingService, os_template: e.target.value })} placeholder="ubuntu-24.04" className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[13px] font-mono" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">IPv4 Address</label>
                <input type="text" value={(editingService.ip_address as string) || ''} onChange={(e) => setEditingService({ ...editingService, ip_address: e.target.value })} className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[13px] font-mono focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">IPv6 Address</label>
                <input type="text" value={(editingService.ipv6_address as string) || ''} onChange={(e) => setEditingService({ ...editingService, ipv6_address: e.target.value })} className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[13px] font-mono" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Control Panel URL</label>
                <input type="text" value={(editingService.control_panel_url as string) || ''} onChange={(e) => setEditingService({ ...editingService, control_panel_url: e.target.value })} className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border/50">
              <h4 className="text-[12px] font-semibold text-foreground mb-3 uppercase tracking-wider">Connection Credentials &amp; Notes</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Username</label>
                  <input type="text" value={(editingService.username as string) || ''} onChange={(e) => setEditingService({ ...editingService, username: e.target.value })} className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[13px] font-mono focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" placeholder="root" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Password</label>
                  <input type="text" value={(editingService.password as string) || ''} onChange={(e) => setEditingService({ ...editingService, password: e.target.value })} className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[13px] font-mono focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">SSH/RDP Port</label>
                  <input type="number" value={(editingService.ssh_port as number) || ''} onChange={(e) => setEditingService({ ...editingService, ssh_port: parseInt(e.target.value) || 22 })} className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[13px] font-mono focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" placeholder="22" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Web Console URL</label>
                  <input type="text" value={(editingService.web_console_url as string) || ''} onChange={(e) => setEditingService({ ...editingService, web_console_url: e.target.value })} className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" placeholder="https://guac.elsxglobal.com/..." />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Manual Setup / Operations Notes</label>
                  <textarea rows={2} value={(editingService.manual_setup_notes as string) || ''} onChange={(e) => setEditingService({ ...editingService, manual_setup_notes: e.target.value })} className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[12px]" />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border/50 flex justify-end">
              <button onClick={saveServiceEdit} disabled={saving} className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors min-w-[120px]">
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Save Changes
              </button>
            </div>
          </div>
        </div>
      ) : services.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/50 p-12 text-center bg-muted/5"><Server className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" /><p className="text-[13px] text-muted-foreground">No instances provisioned yet. Click &quot;Provision Manual Server / Service&quot; above or approve an order.</p></div>
      ) : (
        <div className="rounded-lg bg-background border border-border shadow-sm overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20 text-[10px] text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-2 font-medium">Instance</th>
                  <th className="px-4 py-2 font-medium">Network &amp; Mode</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Renewal</th>
                  <th className="px-4 py-2 font-medium text-right">Created</th>
                  <th className="px-4 py-2 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[12px]">
                {services.map((service) => {
                  const id = service.id as string;
                  const mode = (service.provisioning_mode as string) || 'automated';
                  return (
                    <tr key={id} className="border-b border-border/30 hover:bg-muted/10 transition-colors last:border-0">
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-foreground">{service.plan_name as string}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          {(service.hostname as string) || (service.domain as string) || 'No hostname'}
                        </p>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
                        <div>{(service.ip_address as string) || 'Unassigned IP'}</div>
                        <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-muted text-[9px] uppercase tracking-wider font-sans">
                          {mode}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${svcStatusColors[service.status as string] || svcStatusColors.active}`}>
                          {service.status as string}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {service.renewal_date ? new Date(service.renewal_date as string).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground whitespace-nowrap">
                        {new Date(service.created_at as string).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => setEditingService(service)} className="p-1 rounded bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Configure &amp; Edit Credentials">
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleServicePower(id, 'start')} disabled={actionLoading === `start-${id}`} className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 transition-colors" title="Start / Power On">
                            {actionLoading === `start-${id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                          </button>
                          <button onClick={() => handleServicePower(id, 'restart')} disabled={actionLoading === `restart-${id}`} className="p-1 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 transition-colors" title="Reboot Instance">
                            {actionLoading === `restart-${id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCw className="h-3.5 w-3.5" />}
                          </button>
                          <button onClick={() => handleServicePower(id, 'snapshot')} disabled={actionLoading === `snapshot-${id}`} className="p-1 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 transition-colors" title="Create Snapshot">
                            {actionLoading === `snapshot-${id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                          </button>
                          <button onClick={() => handleTriggerProvision(id)} disabled={actionLoading === `prov-${id}`} className="p-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 transition-colors" title="Trigger Auto-Provisioning">
                            {actionLoading === `prov-${id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                          </button>
                          <div className="inline-flex items-center border-l border-border/50 pl-1 ml-1">
                            {service.status === 'active' ? (
                              <button onClick={() => handleServicePower(id, 'suspend')} disabled={actionLoading === `suspend-${id}`} className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-600 transition-colors" title="Suspend">
                                {actionLoading === `suspend-${id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Pause className="h-3.5 w-3.5" />}
                              </button>
                            ) : (
                              <button onClick={() => updateService(id, { status: 'active' })} disabled={actionLoading === id} className="p-1 rounded bg-green-500/10 hover:bg-green-500/20 text-green-600 transition-colors" title="Mark Active">
                                {actionLoading === id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── USERS ───────────────────────────────────────────────────
export function UsersTab({ users: initialUsers }: { users: Record<string, unknown>[] }) {
  const [usersList, setUsersList] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => { setUsersList(initialUsers); }, [initialUsers]);

  const handleToggleSuspend = async (user: Record<string, any>) => {
    setActionLoading(user.user_id as string);
    const supabase = createClient();
    const newStatus = !user.is_suspended;
    await supabase.from('users').update({ is_suspended: newStatus }).eq('id', user.user_id);
    setUsersList(prev => prev.map(u => u.user_id === user.user_id ? { ...u, is_suspended: newStatus } : u));
    setActionLoading(null);
  };

  const handlePasswordReset = async (email: string, userId: string) => {
    setActionLoading(`reset-${userId}`);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email);
    alert('Password reset email sent to ' + email);
    setActionLoading(null);
  };

  const filteredUsers = usersList.filter(u => !searchQuery || (u.email as string)?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Identity & Access</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Manage customer accounts, suspension, and credentials</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Filter by email..." className="w-full pl-8 pr-3 py-1.5 rounded-md bg-background border border-border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" />
        </div>
      </div>
      
      {filteredUsers.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/50 p-12 text-center bg-muted/5"><Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" /><p className="text-[13px] text-muted-foreground">No registered users with orders yet.</p></div>
      ) : (
        <div className="rounded-lg bg-background border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20 text-[10px] text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-2 font-medium">User</th>
                  <th className="px-4 py-2 font-medium">Activity</th>
                  <th className="px-4 py-2 font-medium text-right">Usage</th>
                  <th className="px-4 py-2 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[12px]">
                {filteredUsers.map((user, i) => (
                  <tr key={(user.user_id as string) || i} className="border-b border-border/30 hover:bg-muted/10 transition-colors last:border-0">
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-foreground">{(user.email as string) || '—'}</p>
                      <p className="text-[11px] text-muted-foreground">{user.email_confirmed_at ? 'Verified' : 'Unverified'} {user.is_suspended ? '· Suspended' : ''}</p>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      <p>Joined: {user.created_at ? new Date(user.created_at as string).toLocaleDateString() : (user.joined ? new Date(user.joined as string).toLocaleDateString() : '—')}</p>
                      <p className="text-[11px]">Last login: {user.last_sign_in_at ? new Date(user.last_sign_in_at as string).toLocaleDateString() : '—'}</p>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <p className="font-medium text-foreground">{user.orders as number || 0} orders · Rs {Number(user.total_spent || 0).toLocaleString('en-IN')}</p>
                      <p className="text-[11px] text-muted-foreground">{user.active_services as number || 0} instances · {user.open_tickets as number || 0} tickets</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleToggleSuspend(user)} disabled={actionLoading === user.user_id} className={`px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider transition-colors ${user.is_suspended ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' : 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'}`}>
                          {actionLoading === user.user_id ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : (user.is_suspended ? 'Activate' : 'Suspend')}
                        </button>
                        <button onClick={() => handlePasswordReset(user.email as string, user.user_id as string)} disabled={actionLoading === `reset-${user.user_id}`} className="px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors">
                          {actionLoading === `reset-${user.user_id}` ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : 'Reset'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TICKETS ─────────────────────────────────────────────────
export function TicketsTab({ tickets, searchQuery, setSearchQuery, statusFilter, setStatusFilter, actionLoading, updateTicketStatus, admin, showToast, statusColors }: {
  tickets: Record<string, unknown>[]; searchQuery: string; setSearchQuery: (v: string) => void; statusFilter: string; setStatusFilter: (v: string) => void;
  actionLoading: string | null; updateTicketStatus: (id: string, s: string) => void; admin: { email: string; name: string } | null; showToast: (t: 'success' | 'error', m: string) => void; statusColors: Record<string, string>;
}) {
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [ticketReplies, setTicketReplies] = useState<Record<string, unknown>[]>([]);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  const loadTicketReplies = async (ticketId: string) => {
    const supabase = createClient();
    const { data } = await supabase.from('ticket_replies').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true });
    setTicketReplies(data || []);
  };

  const handleTicketExpand = (ticketId: string) => {
    if (expandedTicket === ticketId) { setExpandedTicket(null); setTicketReplies([]); }
    else { setExpandedTicket(ticketId); loadTicketReplies(ticketId); setReplyText(''); }
  };

  const sendTicketReply = async (ticketId: string) => {
    if (!replyText.trim() || !admin) return;
    setReplyLoading(true);
    const res = await adminFetch('reply-ticket', { ticketId, message: replyText, adminEmail: admin.email });
    if (res.ok) { showToast('success', 'Reply sent'); setReplyText(''); loadTicketReplies(ticketId); }
    else showToast('error', 'Failed to send reply');
    setReplyLoading(false);
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch = !searchQuery || (t.subject as string)?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Support Queue</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Triage, reply, and resolve customer tickets</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Filter by subject..." className="w-full pl-8 pr-3 py-1.5 rounded-md bg-background border border-border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-1.5 rounded-md bg-background border border-border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground w-[160px]">
          <option value="all">All Statuses</option><option value="open">Open</option><option value="pending">Pending</option><option value="resolved">Resolved</option><option value="closed">Closed</option>
        </select>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/50 p-12 text-center bg-muted/5"><LifeBuoy className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" /><p className="text-[13px] text-muted-foreground">No tickets matching criteria.</p></div>
      ) : (
        <div className="space-y-2">
          {filteredTickets.map((ticket) => (
            <div key={ticket.id as string} className="rounded-lg bg-background border border-border shadow-sm hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between p-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[13px] font-semibold text-foreground truncate">{ticket.subject as string}</h3>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${statusColors[ticket.status as string] || 'text-muted-foreground bg-muted'}`}>{ticket.status as string}</span>
                    <span className="text-[10px] text-muted-foreground capitalize bg-muted/30 px-1.5 py-0.5 rounded">{ticket.priority as string}</span>
                  </div>
                  <p className="text-[12px] text-muted-foreground line-clamp-1">{ticket.description as string}</p>
                </div>
                <span className="text-[11px] text-muted-foreground whitespace-nowrap ml-4 shrink-0">{new Date(ticket.created_at as string).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 pb-3 flex-wrap">
                {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                  <>
                    <button onClick={() => updateTicketStatus(ticket.id as string, 'resolved')} disabled={actionLoading === ticket.id} className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors">
                      {actionLoading === ticket.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}Resolve
                    </button>
                    <button onClick={() => updateTicketStatus(ticket.id as string, 'closed')} disabled={actionLoading === ticket.id} className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider bg-muted/50 text-muted-foreground hover:bg-muted transition-colors">
                      <XIcon className="h-3 w-3" />Close
                    </button>
                  </>
                )}
                {ticket.status === 'resolved' && (
                  <button onClick={() => updateTicketStatus(ticket.id as string, 'open')} disabled={actionLoading === ticket.id} className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors">
                    <RefreshCw className="h-3 w-3" />Reopen
                  </button>
                )}
                <button onClick={() => handleTicketExpand(ticket.id as string)} className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary hover:bg-primary/20 transition-colors ml-auto">
                  {expandedTicket === ticket.id ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  <MessageSquare className="h-3 w-3" />Thread
                </button>
              </div>

              {expandedTicket === ticket.id && (
                <div className="px-3 pb-3 pt-2 border-t border-border/50 space-y-2">
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {ticketReplies.length > 0 ? ticketReplies.map((reply) => (
                      <div key={reply.id as string} className={`flex ${reply.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-md px-3 py-2 text-[12px] ${reply.sender_type === 'admin' ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50 border border-border'}`}>
                          <p className="text-[10px] text-muted-foreground mb-0.5 capitalize font-semibold">{reply.sender_type as string}</p>
                          <p className="text-foreground">{reply.message as string}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{new Date(reply.created_at as string).toLocaleString()}</p>
                        </div>
                      </div>
                    )) : <p className="text-[11px] text-muted-foreground text-center py-3">No replies yet.</p>}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendTicketReply(ticket.id as string)} placeholder="Type reply..." className="flex-1 px-3 py-1.5 rounded-md bg-background border border-border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" />
                    <button onClick={() => sendTicketReply(ticket.id as string)} disabled={replyLoading || !replyText.trim()} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                      {replyLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
