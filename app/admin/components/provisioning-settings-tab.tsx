'use client';

import { useState, useEffect } from 'react';
import { adminFetch } from './admin-fetch';
import {
  Loader2,
  Server,
  Globe,
  HardDrive,
  Cpu,
  Share2,
  Layers,
  Code2,
  Eye,
  EyeOff,
  Save,
  Activity,
  CheckCircle2,
  XCircle,
  Terminal,
  ChevronDown,
  ChevronUp,
  Box,
  Zap,
} from 'lucide-react';
import { ToggleSwitch } from './payments-settings-tab';

interface BackendTestResult {
  ok: boolean;
  configured: boolean;
  reachable: boolean;
  statusCode?: number;
  latencyMs?: number;
  message?: string;
}

export function ProvisioningSettingsTab({ showToast }: { showToast: (t: 'success' | 'error', m: string) => void }) {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const [testingBackend, setTestingBackend] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<Record<string, BackendTestResult>>({});
  const [showGuideDrawer, setShowGuideDrawer] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const res = await adminFetch('get-provisioning-settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings || data.data || {});
      } else {
        setSettings({});
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    const res = await adminFetch('save-provisioning-settings', { settings });
    if (res.ok) showToast('success', 'Provisioning settings saved');
    else {
      const err = await res.json().catch(() => ({}));
      showToast('error', err.error || 'Save failed');
    }
    setSaving(false);
  };

  const testBackend = async (backend: string) => {
    setTestingBackend(backend);
    try {
      const res = await adminFetch('test-backend-service', { backend });
      const data = await res.json().catch(() => ({ ok: false, configured: false, reachable: false, message: 'Probe error' }));
      setBackendStatus((prev) => ({ ...prev, [backend]: data }));
      if (data.reachable) {
        showToast('success', `${backend.toUpperCase()} reachable (${data.latencyMs ?? 0}ms)`);
      } else {
        showToast('error', data.message || `${backend.toUpperCase()} unreachable`);
      }
    } catch {
      showToast('error', `Failed to probe ${backend}`);
    }
    setTestingBackend(null);
  };

  const renderTestButton = (backend: string) => {
    const status = backendStatus[backend];
    const isTesting = testingBackend === backend;
    return (
      <div className="flex items-center gap-2">
        {status && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
              status.reachable
                ? 'bg-emerald-500/10 text-emerald-600'
                : 'bg-red-500/10 text-red-600'
            }`}
            title={status.message || ''}
          >
            {status.reachable ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
            {status.reachable ? `Online · ${status.latencyMs ?? 0}ms` : status.configured ? `Offline (${status.statusCode || 'ERR'})` : 'Not configured'}
          </span>
        )}
        <button
          type="button"
          onClick={() => testBackend(backend)}
          disabled={isTesting}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted hover:bg-muted/80 text-[11px] font-medium text-foreground transition-colors disabled:opacity-50"
        >
          {isTesting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Activity className="h-3 w-3" />}
          Test Connection
        </button>
      </div>
    );
  };

  const toggleSecret = (key: string) => {
    setShowSecret(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-4 pb-12 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/50">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Provisioning Engine &amp; Self-Hosted Backends</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Configure connections, run live latency probes, or deploy stacks manually via CLI.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowGuideDrawer(!showGuideDrawer)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted hover:bg-muted/80 text-[12px] font-medium text-foreground"
          >
            <Terminal className="h-3.5 w-3.5" />
            Manual Setup CLI Guide
            {showGuideDrawer ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save Changes
          </button>
        </div>
      </div>

      {showGuideDrawer && (
        <div className="rounded-lg bg-muted/20 border border-border p-4 space-y-3 text-[12px]">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Terminal className="h-4 w-4 text-primary" />
              Manual Self-Hosted Setup CLI &amp; Docker Compose Reference
            </h3>
            <span className="text-[11px] font-mono text-muted-foreground">deploy/ &amp; deploy/ansible/</span>
          </div>
          <p className="text-muted-foreground">
            Run any of the standalone Compose stacks on bare-metal or Proxmox LXC nodes, then save credentials below and click <strong>Test Connection</strong>.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 font-mono text-[11px]">
            <div className="rounded bg-background border border-border p-3 space-y-1">
              <div className="font-semibold text-foreground font-sans">1. Docker Compose Stacks (Single/Multi-Node)</div>
              <pre className="overflow-x-auto text-muted-foreground whitespace-pre-wrap">{`cd deploy && cp .env.example .env
docker compose -f docker-compose.dns.yml up -d
docker compose -f docker-compose.storage.yml up -d
docker compose -f docker-compose.ai-gateway.yml up -d
docker compose -f docker-compose.tunnel.yml up -d
docker compose -f docker-compose.rabbitmq.yml up -d
docker compose -f docker-compose.workers.yml up -d
docker compose -f docker-compose.pages.yml up -d`}</pre>
            </div>
            <div className="rounded bg-background border border-border p-3 space-y-1">
              <div className="font-semibold text-foreground font-sans">2. Ansible Proxmox LXC Automation</div>
              <pre className="overflow-x-auto text-muted-foreground whitespace-pre-wrap">{`cd deploy/ansible
ansible-galaxy install geerlingguy.docker community.general community.docker
ansible-playbook -i inventory.yml create-lxcs.yml
ansible-playbook -i inventory.yml deploy-services.yml
# Ops CLI on server:
./scripts/manage.sh status && ./scripts/manage.sh health`}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Pterodactyl Config */}
      <div className="rounded-lg bg-background border border-border shadow-sm p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <div>
              <h3 className="font-medium text-[13px]">Pterodactyl Panel</h3>
              <p className="text-[11px] text-muted-foreground">{settings.pterodactyl_enabled ? 'Active for Game/Node hosting' : 'Disabled'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {renderTestButton('pterodactyl')}
            <ToggleSwitch checked={settings.pterodactyl_enabled} onChange={(v: boolean) => setSettings({ ...settings, pterodactyl_enabled: v })} />
          </div>
        </div>
        
        {settings.pterodactyl_enabled && (
          <div className="space-y-3 mt-3 pt-3 border-t border-border/50">
            <div>
              <label className="text-[13px] font-medium mb-1 block text-muted-foreground">Panel URL</label>
              <input type="text" value={settings.pterodactyl_url || ''} onChange={(e) => setSettings({ ...settings, pterodactyl_url: e.target.value })} placeholder="https://panel.yourdomain.com" className="input-base text-[13px] py-1.5" />
            </div>
            <div>
              <label className="text-[13px] font-medium mb-1 block text-muted-foreground">Application API Key</label>
              <div className="relative">
                <input type={showSecret['ptero'] ? 'text' : 'password'} value={settings.pterodactyl_api_key || ''} onChange={(e) => setSettings({ ...settings, pterodactyl_api_key: e.target.value })} placeholder="ptlc_xxxxxxxxxxxx" className="input-base font-mono text-[13px] py-1.5 pr-10" />
                <button onClick={() => toggleSecret('ptero')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showSecret['ptero'] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Proxmox Config */}
      <div className="rounded-lg bg-background border border-border shadow-sm p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <Server className="h-4 w-4 text-muted-foreground" />
            <div>
              <h3 className="font-medium text-[13px]">Proxmox VE</h3>
              <p className="text-[11px] text-muted-foreground">{settings.proxmox_enabled ? 'Active for Cloud/VPS hosting' : 'Disabled'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {renderTestButton('proxmox')}
            <ToggleSwitch checked={settings.proxmox_enabled} onChange={(v: boolean) => setSettings({ ...settings, proxmox_enabled: v })} />
          </div>
        </div>

        {settings.proxmox_enabled && (
          <div className="space-y-3 mt-3 pt-3 border-t border-border/50">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[13px] font-medium mb-1 block text-muted-foreground">Proxmox URL</label>
                <input type="text" value={settings.proxmox_url || ''} onChange={(e) => setSettings({ ...settings, proxmox_url: e.target.value })} placeholder="https://proxmox.yourdomain.com:8006" className="input-base text-[13px] py-1.5" />
              </div>
              <div>
                <label className="text-[13px] font-medium mb-1 block text-muted-foreground">Default Node</label>
                <input type="text" value={settings.proxmox_node || ''} onChange={(e) => setSettings({ ...settings, proxmox_node: e.target.value })} placeholder="pve" className="input-base text-[13px] py-1.5" />
              </div>
            </div>
            <div>
              <label className="text-[13px] font-medium mb-1 block text-muted-foreground">Token ID</label>
              <input type="text" value={settings.proxmox_token_id || ''} onChange={(e) => setSettings({ ...settings, proxmox_token_id: e.target.value })} placeholder="root@pam!token" className="input-base font-mono text-[13px] py-1.5" />
            </div>
            <div>
              <label className="text-[13px] font-medium mb-1 block text-muted-foreground">Token Secret</label>
              <div className="relative">
                <input type={showSecret['proxmox'] ? 'text' : 'password'} value={settings.proxmox_secret || ''} onChange={(e) => setSettings({ ...settings, proxmox_secret: e.target.value })} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" className="input-base font-mono text-[13px] py-1.5 pr-10" />
                <button onClick={() => toggleSecret('proxmox')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showSecret['proxmox'] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* HestiaCP Config */}
      <div className="rounded-lg bg-background border border-border shadow-sm p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <div>
              <h3 className="font-medium text-[13px]">HestiaCP</h3>
              <p className="text-[11px] text-muted-foreground">{settings.hestiacp_enabled ? 'Active for Shared Hosting / Email' : 'Disabled'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {renderTestButton('hestiacp')}
            <ToggleSwitch checked={settings.hestiacp_enabled} onChange={(v: boolean) => setSettings({ ...settings, hestiacp_enabled: v })} />
          </div>
        </div>
        
        {settings.hestiacp_enabled && (
          <div className="space-y-3 mt-3 pt-3 border-t border-border/50">
            <div>
              <label className="text-[13px] font-medium mb-1 block text-muted-foreground">HestiaCP URL / IP</label>
              <input type="text" value={settings.hestiacp_url || ''} onChange={(e) => setSettings({ ...settings, hestiacp_url: e.target.value })} placeholder="https://192.168.1.1:8083" className="input-base text-[13px] py-1.5" />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[13px] font-medium mb-1 block text-muted-foreground">API Username</label>
                <input type="text" value={settings.hestiacp_username || ''} onChange={(e) => setSettings({ ...settings, hestiacp_username: e.target.value })} placeholder="admin" className="input-base text-[13px] py-1.5" />
              </div>
              <div>
                <label className="text-[13px] font-medium mb-1 block text-muted-foreground">API Secret / Password</label>
                <div className="relative">
                  <input type={showSecret['hestia'] ? 'text' : 'password'} value={settings.hestiacp_password || ''} onChange={(e) => setSettings({ ...settings, hestiacp_password: e.target.value })} placeholder="xxxxxxxx" className="input-base text-[13px] py-1.5 pr-10" />
                  <button onClick={() => toggleSecret('hestia')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showSecret['hestia'] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CyberPanel Config */}
      <div className="rounded-lg bg-background border border-border shadow-sm p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <div>
              <h3 className="font-medium text-[13px]">CyberPanel</h3>
              <p className="text-[11px] text-muted-foreground">{settings.cyberpanel_enabled ? 'Active for Shared Hosting / Email' : 'Disabled'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {renderTestButton('cyberpanel')}
            <ToggleSwitch checked={settings.cyberpanel_enabled} onChange={(v: boolean) => setSettings({ ...settings, cyberpanel_enabled: v })} />
          </div>
        </div>
        
        {settings.cyberpanel_enabled && (
          <div className="space-y-3 mt-3 pt-3 border-t border-border/50">
            <div>
              <label className="text-[13px] font-medium mb-1 block text-muted-foreground">CyberPanel URL</label>
              <input type="text" value={settings.cyberpanel_url || ''} onChange={(e) => setSettings({ ...settings, cyberpanel_url: e.target.value })} placeholder="https://panel.yourdomain.com:8090" className="input-base text-[13px] py-1.5" />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[13px] font-medium mb-1 block text-muted-foreground">Admin Username</label>
                <input type="text" value={settings.cyberpanel_admin_user || ''} onChange={(e) => setSettings({ ...settings, cyberpanel_admin_user: e.target.value })} placeholder="admin" className="input-base text-[13px] py-1.5" />
              </div>
              <div>
                <label className="text-[13px] font-medium mb-1 block text-muted-foreground">Admin Password</label>
                <div className="relative">
                  <input type={showSecret['cyber'] ? 'text' : 'password'} value={settings.cyberpanel_admin_pass || ''} onChange={(e) => setSettings({ ...settings, cyberpanel_admin_pass: e.target.value })} placeholder="xxxxxxxx" className="input-base text-[13px] py-1.5 pr-10" />
                  <button onClick={() => toggleSecret('cyber')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showSecret['cyber'] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DNS Backend (PowerDNS) */}
      <div className="rounded-lg bg-background border border-border shadow-sm p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <div>
              <h3 className="font-medium text-[13px]">DNS Backend (PowerDNS)</h3>
              <p className="text-[11px] text-muted-foreground">Authoritative DNS cluster and automated zone provisioning.</p>
            </div>
          </div>
          {renderTestButton('powerdns')}
        </div>
        <div className="space-y-3 mt-3 pt-3 border-t border-border/50">
          <div>
            <label className="text-[13px] font-medium mb-1 block text-muted-foreground">PowerDNS URL</label>
            <input
              type="text"
              value={settings.powerdns_url || ''}
              onChange={(e) => setSettings({ ...settings, powerdns_url: e.target.value })}
              placeholder="http://ns1.vaulthost.cloud:8081"
              className="input-base text-[13px] py-1.5"
            />
          </div>
          <div>
            <label className="text-[13px] font-medium mb-1 block text-muted-foreground">PowerDNS API Key</label>
            <div className="relative">
              <input
                type={showSecret['powerdns'] ? 'text' : 'password'}
                value={settings.powerdns_api_key || ''}
                onChange={(e) => setSettings({ ...settings, powerdns_api_key: e.target.value })}
                placeholder="pdns_apikey_secret"
                className="input-base font-mono text-[13px] py-1.5 pr-10"
              />
              <button onClick={() => toggleSecret('powerdns')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showSecret['powerdns'] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Object Storage (MinIO) */}
      <div className="rounded-lg bg-background border border-border shadow-sm p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <HardDrive className="h-4 w-4 text-muted-foreground" />
            <div>
              <h3 className="font-medium text-[13px]">Object Storage (MinIO)</h3>
              <p className="text-[11px] text-muted-foreground">S3-compatible distributed blob storage backend.</p>
            </div>
          </div>
          {renderTestButton('minio')}
        </div>
        <div className="space-y-3 mt-3 pt-3 border-t border-border/50">
          <div>
            <label className="text-[13px] font-medium mb-1 block text-muted-foreground">MinIO Endpoint</label>
            <input
              type="text"
              value={settings.minio_endpoint || ''}
              onChange={(e) => setSettings({ ...settings, minio_endpoint: e.target.value })}
              placeholder="https://s3.vaulthost.cloud"
              className="input-base text-[13px] py-1.5"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[13px] font-medium mb-1 block text-muted-foreground">MinIO Access Key</label>
              <input
                type="text"
                value={settings.minio_access_key || ''}
                onChange={(e) => setSettings({ ...settings, minio_access_key: e.target.value })}
                placeholder="minioadmin"
                className="input-base font-mono text-[13px] py-1.5"
              />
            </div>
            <div>
              <label className="text-[13px] font-medium mb-1 block text-muted-foreground">MinIO Secret Key</label>
              <div className="relative">
                <input
                  type={showSecret['minio'] ? 'text' : 'password'}
                  value={settings.minio_secret_key || ''}
                  onChange={(e) => setSettings({ ...settings, minio_secret_key: e.target.value })}
                  placeholder="xxxxxxxxxxxxxxxx"
                  className="input-base font-mono text-[13px] py-1.5 pr-10"
                />
                <button onClick={() => toggleSecret('minio')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showSecret['minio'] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Gateway (LiteLLM) */}
      <div className="rounded-lg bg-background border border-border shadow-sm p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <Cpu className="h-4 w-4 text-muted-foreground" />
            <div>
              <h3 className="font-medium text-[13px]">AI Gateway (LiteLLM)</h3>
              <p className="text-[11px] text-muted-foreground">Universal LLM routing, token metering, and load balancing proxy.</p>
            </div>
          </div>
          {renderTestButton('litellm')}
        </div>
        <div className="space-y-3 mt-3 pt-3 border-t border-border/50">
          <div>
            <label className="text-[13px] font-medium mb-1 block text-muted-foreground">LiteLLM Base URL</label>
            <input
              type="text"
              value={settings.litellm_base_url || ''}
              onChange={(e) => setSettings({ ...settings, litellm_base_url: e.target.value })}
              placeholder="https://ai.vaulthost.cloud"
              className="input-base text-[13px] py-1.5"
            />
          </div>
          <div>
            <label className="text-[13px] font-medium mb-1 block text-muted-foreground">LiteLLM Master Key</label>
            <div className="relative">
              <input
                type={showSecret['litellm'] ? 'text' : 'password'}
                value={settings.litellm_master_key || ''}
                onChange={(e) => setSettings({ ...settings, litellm_master_key: e.target.value })}
                placeholder="sk-xxxxxxxxxxxxxxxx"
                className="input-base font-mono text-[13px] py-1.5 pr-10"
              />
              <button onClick={() => toggleSecret('litellm')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showSecret['litellm'] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tunnels (FRP) */}
      <div className="rounded-lg bg-background border border-border shadow-sm p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <Share2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <h3 className="font-medium text-[13px]">Tunnels (FRP Reverse Proxy)</h3>
              <p className="text-[11px] text-muted-foreground">Fast reverse proxy and zero-trust edge tunnels.</p>
            </div>
          </div>
          {renderTestButton('frp')}
        </div>
        <div className="space-y-3 mt-3 pt-3 border-t border-border/50">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[13px] font-medium mb-1 block text-muted-foreground">FRP Server URL</label>
              <input
                type="text"
                value={settings.frp_server_url || ''}
                onChange={(e) => setSettings({ ...settings, frp_server_url: e.target.value })}
                placeholder="https://frp.vaulthost.cloud:7000"
                className="input-base text-[13px] py-1.5"
              />
            </div>
            <div>
              <label className="text-[13px] font-medium mb-1 block text-muted-foreground">FRP Base Domain</label>
              <input
                type="text"
                value={settings.frp_base_domain || ''}
                onChange={(e) => setSettings({ ...settings, frp_base_domain: e.target.value })}
                placeholder="tunnel.vaulthost.cloud"
                className="input-base text-[13px] py-1.5"
              />
            </div>
          </div>
          <div>
            <label className="text-[13px] font-medium mb-1 block text-muted-foreground">FRP Server Token</label>
            <div className="relative">
              <input
                type={showSecret['frp'] ? 'text' : 'password'}
                value={settings.frp_server_token || ''}
                onChange={(e) => setSettings({ ...settings, frp_server_token: e.target.value })}
                placeholder="frp_auth_token_secret"
                className="input-base font-mono text-[13px] py-1.5 pr-10"
              />
              <button onClick={() => toggleSecret('frp')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showSecret['frp'] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Queues (RabbitMQ) */}
      <div className="rounded-lg bg-background border border-border shadow-sm p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <div>
              <h3 className="font-medium text-[13px]">Queues (RabbitMQ)</h3>
              <p className="text-[11px] text-muted-foreground">AMQP message broker and worker task distribution.</p>
            </div>
          </div>
          {renderTestButton('rabbitmq')}
        </div>
        <div className="space-y-3 mt-3 pt-3 border-t border-border/50">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[13px] font-medium mb-1 block text-muted-foreground">RabbitMQ URL</label>
              <input
                type="text"
                value={settings.rabbitmq_url || ''}
                onChange={(e) => setSettings({ ...settings, rabbitmq_url: e.target.value })}
                placeholder="amqp://guest:guest@localhost:5672"
                className="input-base text-[13px] py-1.5"
              />
            </div>
            <div>
              <label className="text-[13px] font-medium mb-1 block text-muted-foreground">RabbitMQ Management URL</label>
              <input
                type="text"
                value={settings.rabbitmq_management_url || ''}
                onChange={(e) => setSettings({ ...settings, rabbitmq_management_url: e.target.value })}
                placeholder="http://localhost:15672"
                className="input-base text-[13px] py-1.5"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[13px] font-medium mb-1 block text-muted-foreground">RabbitMQ Username</label>
              <input
                type="text"
                value={settings.rabbitmq_username || ''}
                onChange={(e) => setSettings({ ...settings, rabbitmq_username: e.target.value })}
                placeholder="vaulthost"
                className="input-base text-[13px] py-1.5"
              />
            </div>
            <div>
              <label className="text-[13px] font-medium mb-1 block text-muted-foreground">RabbitMQ Password</label>
              <div className="relative">
                <input
                  type={showSecret['rabbitmq'] ? 'text' : 'password'}
                  value={settings.rabbitmq_password || ''}
                  onChange={(e) => setSettings({ ...settings, rabbitmq_password: e.target.value })}
                  placeholder="xxxxxxxx"
                  className="input-base text-[13px] py-1.5 pr-10"
                />
                <button onClick={() => toggleSecret('rabbitmq')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showSecret['rabbitmq'] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pages/CI-CD (Coolify) */}
      <div className="rounded-lg bg-background border border-border shadow-sm p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <Code2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <h3 className="font-medium text-[13px]">Pages / CI-CD (Coolify)</h3>
              <p className="text-[11px] text-muted-foreground">Self-hosted Heroku/Netlify alternative for automated application deployments.</p>
            </div>
          </div>
          {renderTestButton('coolify')}
        </div>
        <div className="space-y-3 mt-3 pt-3 border-t border-border/50">
          <div>
            <label className="text-[13px] font-medium mb-1 block text-muted-foreground">Coolify Base URL</label>
            <input
              type="text"
              value={settings.coolify_base_url || ''}
              onChange={(e) => setSettings({ ...settings, coolify_base_url: e.target.value })}
              placeholder="https://coolify.vaulthost.cloud"
              className="input-base text-[13px] py-1.5"
            />
          </div>
          <div>
            <label className="text-[13px] font-medium mb-1 block text-muted-foreground">Coolify API Key</label>
            <div className="relative">
              <input
                type={showSecret['coolify'] ? 'text' : 'password'}
                value={settings.coolify_api_key || ''}
                onChange={(e) => setSettings({ ...settings, coolify_api_key: e.target.value })}
                placeholder="coolify_bearer_token"
                className="input-base font-mono text-[13px] py-1.5 pr-10"
              />
              <button onClick={() => toggleSecret('coolify')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showSecret['coolify'] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Kubernetes (K3s) */}
      <div className="rounded-lg bg-background border border-border shadow-sm p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <Box className="h-4 w-4 text-muted-foreground" />
            <div>
              <h3 className="font-medium text-[13px]">Containers (K3s Kubernetes)</h3>
              <p className="text-[11px] text-muted-foreground">Control plane API for multi-tenant VaultContainers namespaces.</p>
            </div>
          </div>
          {renderTestButton('k3s')}
        </div>
        <div className="space-y-3 mt-3 pt-3 border-t border-border/50">
          <div>
            <label className="text-[13px] font-medium mb-1 block text-muted-foreground">K3s API URL</label>
            <input
              type="text"
              value={settings.k3s_api_url || ''}
              onChange={(e) => setSettings({ ...settings, k3s_api_url: e.target.value })}
              placeholder="https://k3s.vaulthost.cloud:6443"
              className="input-base text-[13px] py-1.5"
            />
          </div>
          <div>
            <label className="text-[13px] font-medium mb-1 block text-muted-foreground">K3s ServiceAccount Bearer Token</label>
            <div className="relative">
              <input
                type={showSecret['k3s'] ? 'text' : 'password'}
                value={settings.k3s_bearer_token || ''}
                onChange={(e) => setSettings({ ...settings, k3s_bearer_token: e.target.value })}
                placeholder="eyJhbGciOiJSUzI1NiIs..."
                className="input-base font-mono text-[13px] py-1.5 pr-10"
              />
              <button onClick={() => toggleSecret('k3s')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showSecret['k3s'] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edge Isolates (Workerd) */}
      <div className="rounded-lg bg-background border border-border shadow-sm p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <div>
              <h3 className="font-medium text-[13px]">Edge Workers (Cloudflare Workerd)</h3>
              <p className="text-[11px] text-muted-foreground">V8 isolate deployment API for serverless edge workers.</p>
            </div>
          </div>
          {renderTestButton('workerd')}
        </div>
        <div className="space-y-3 mt-3 pt-3 border-t border-border/50">
          <div>
            <label className="text-[13px] font-medium mb-1 block text-muted-foreground">Workerd Management API URL</label>
            <input
              type="text"
              value={settings.workerd_api_url || ''}
              onChange={(e) => setSettings({ ...settings, workerd_api_url: e.target.value })}
              placeholder="http://workers.vaulthost.cloud:8787"
              className="input-base text-[13px] py-1.5"
            />
          </div>
        </div>
      </div>

      {/* Domain Registrars (NameSilo, ResellerClub, Namecheap) */}
      <div className="rounded-lg bg-background border border-border shadow-sm p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <div>
              <h3 className="font-medium text-[13px]">Domain Registrar Integration</h3>
              <p className="text-[11px] text-muted-foreground">{settings.domains_enabled ? 'Active for Domain Purchasing' : 'Disabled'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {renderTestButton('namecheap')}
            <ToggleSwitch checked={settings.domains_enabled} onChange={(v: boolean) => setSettings({ ...settings, domains_enabled: v })} />
          </div>
        </div>
        
        {settings.domains_enabled && (
          <div className="space-y-3 mt-3 pt-3 border-t border-border/50">
            <div>
              <label className="text-[13px] font-medium mb-1 block text-muted-foreground">Active Provider</label>
              <select value={settings.domains_provider || 'namesilo'} onChange={(e) => setSettings({ ...settings, domains_provider: e.target.value })} className="input-base text-[13px] py-1.5 w-full">
                <option value="namesilo">NameSilo</option>
                <option value="resellerclub">ResellerClub</option>
                <option value="namecheap">Namecheap</option>
              </select>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[13px] font-medium mb-1 block text-muted-foreground">Reseller Username / ID</label>
                <input type="text" value={settings.domains_username || ''} onChange={(e) => setSettings({ ...settings, domains_username: e.target.value })} placeholder="user123" className="input-base text-[13px] py-1.5" />
              </div>
              <div>
                <label className="text-[13px] font-medium mb-1 block text-muted-foreground">API Key</label>
                <div className="relative">
                  <input type={showSecret['domain'] ? 'text' : 'password'} value={settings.domains_api_key || ''} onChange={(e) => setSettings({ ...settings, domains_api_key: e.target.value })} placeholder="xxxxxxxxxxxxxxxx" className="input-base text-[13px] py-1.5 pr-10" />
                  <button onClick={() => toggleSecret('domain')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showSecret['domain'] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button>
                </div>
              </div>
            </div>

            {/* Namecheap Specific Configuration */}
            <div className="mt-4 pt-3 border-t border-border/50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[12px] font-semibold text-foreground">Namecheap API Settings</h4>
                  <p className="text-[11px] text-muted-foreground">Specific parameters required for Namecheap XML API.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">Sandbox Mode</span>
                  <ToggleSwitch
                    checked={settings.namecheap_sandbox ?? true}
                    onChange={(v: boolean) => setSettings({ ...settings, namecheap_sandbox: v })}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-medium mb-1 block text-muted-foreground">Namecheap API User</label>
                  <input
                    type="text"
                    value={settings.namecheap_api_user || ''}
                    onChange={(e) => setSettings({ ...settings, namecheap_api_user: e.target.value })}
                    placeholder="nc_username"
                    className="input-base text-[13px] py-1.5"
                  />
                </div>
                <div>
                  <label className="text-[13px] font-medium mb-1 block text-muted-foreground">Namecheap Client IP (Whitelisted)</label>
                  <input
                    type="text"
                    value={settings.namecheap_client_ip || ''}
                    onChange={(e) => setSettings({ ...settings, namecheap_client_ip: e.target.value })}
                    placeholder="198.51.100.24"
                    className="input-base font-mono text-[13px] py-1.5"
                  />
                </div>
              </div>

              <div>
                <label className="text-[13px] font-medium mb-1 block text-muted-foreground">Namecheap API Key</label>
                <div className="relative">
                  <input
                    type={showSecret['namecheap'] ? 'text' : 'password'}
                    value={settings.namecheap_api_key || ''}
                    onChange={(e) => setSettings({ ...settings, namecheap_api_key: e.target.value })}
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="input-base font-mono text-[13px] py-1.5 pr-10"
                  />
                  <button onClick={() => toggleSecret('namecheap')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showSecret['namecheap'] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
