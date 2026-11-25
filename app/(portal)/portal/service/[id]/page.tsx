'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import {
  Server, Globe, Database, Mail, Lock, RefreshCw, FileText,
  Loader2, Plus, Trash2, Copy, Check, ExternalLink,
  Shield, HardDrive, Activity, Download, Eye, EyeOff, Terminal,
  KeyRound, Play, Square, RotateCcw, Flame, Wrench, Cpu
} from 'lucide-react';

type Tab =
  | 'overview'
  | 'access'
  | 'firewall'
  | 'os'
  | 'dns'
  | 'databases'
  | 'email'
  | 'ssl'
  | 'backups'
  | 'files';

interface FirewallRule {
  id: string;
  port: string;
  protocol: 'TCP' | 'UDP';
  action: 'ALLOW' | 'DENY';
  source: string;
  label: string;
}

const DNS_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV'];

const OS_TEMPLATES = [
  { id: 'ubuntu-22.04', name: 'Ubuntu 22.04 LTS', desc: 'Stable LTS cloud-init image with HWE kernel' },
  { id: 'ubuntu-24.04', name: 'Ubuntu 24.04 LTS', desc: 'Latest Noble Numbat LTS with Linux 6.8' },
  { id: 'debian-12', name: 'Debian 12 Bookworm', desc: 'Minimal hardened Debian production base' },
  { id: 'almalinux-9', name: 'AlmaLinux 9', desc: 'RHEL-compatible enterprise cPanel/CyberPanel base' },
  { id: 'rocky-linux-9', name: 'Rocky Linux 9', desc: 'Enterprise RHEL 9 downstream stable release' },
  { id: 'fedora-39', name: 'Fedora 39 Server', desc: 'Cutting-edge Linux kernel & Podman stack' },
  { id: 'windows-server-2022', name: 'Windows Server 2022', desc: 'RDP-ready Windows Datacenter evaluation image' },
];

const BOOTSTRAP_PRESETS = [
  { id: 'docker', label: 'Docker + Compose + UFW', cmd: 'curl -fsSL https://get.docker.com | sh && apt-get install -y docker-compose-plugin ufw' },
  { id: 'node', label: 'Node.js 20 LTS + PM2 + Nginx', cmd: 'curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs nginx && npm i -g pm2' },
  { id: 'python', label: 'Python 3.12 + FastAPI + Uvicorn', cmd: 'apt-get update && apt-get install -y python3 python3-pip python3-venv nginx && pip3 install fastapi uvicorn' },
  { id: 'lemp', label: 'LEMP (Nginx + MySQL 8 + PHP 8.3)', cmd: 'apt-get update && apt-get install -y nginx mysql-server php8.3-fpm php8.3-mysql' },
  { id: 'k3s', label: 'K3s Single-Node Kubernetes', cmd: 'curl -sfL https://get.k3s.io | sh -' },
];

const DEFAULT_FIREWALL: FirewallRule[] = [
  { id: 'fw-ssh', port: '22', protocol: 'TCP', action: 'ALLOW', source: '0.0.0.0/0', label: 'SSH Management' },
  { id: 'fw-http', port: '80', protocol: 'TCP', action: 'ALLOW', source: '0.0.0.0/0', label: 'HTTP Web Traffic' },
  { id: 'fw-https', port: '443', protocol: 'TCP', action: 'ALLOW', source: '0.0.0.0/0', label: 'HTTPS TLS Traffic' },
];

export default function ServiceManager() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = params.id as string;
  const actionParam = searchParams.get('action') || '';

  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [service, setService] = useState<any | null>(null);
  const [metrics, setMetrics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showPassword, setShowPassword] = useState(false);

  const [dnsZone, setDnsZone] = useState<Record<string, unknown> | null>(null);
  const [dnsRecords, setDnsRecords] = useState<Record<string, unknown>[]>([]);
  const [newRecord, setNewRecord] = useState({ type: 'A', name: '@', value: '', ttl: 3600, priority: '' });

  const [databases, setDatabases] = useState<Record<string, unknown>[]>([]);
  const [newDb, setNewDb] = useState({ db_name: '', db_type: 'mysql' });

  const [emailAccounts, setEmailAccounts] = useState<Record<string, unknown>[]>([]);
  const [newEmail, setNewEmail] = useState({ local_part: '', password: '', quota: 1024, forward_to: '' });

  const [sslCerts, setSslCerts] = useState<Record<string, unknown>[]>([]);
  const [backups, setBackups] = useState<Record<string, unknown>[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState('');
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<{ ok: boolean; message: string } | null>(null);

  // Dedicated Access / Cloud-Init / Manual setup state
  const [sshKeyInput, setSshKeyInput] = useState('');
  const [hostnameInput, setHostnameInput] = useState('');
  const [customPasswordInput, setCustomPasswordInput] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('docker');
  const [selectedOs, setSelectedOs] = useState('ubuntu-22.04');
  const [manualForm, setManualForm] = useState({
    hostname: '',
    ip_address: '',
    ipv6_address: '',
    ssh_port: '22',
    username: 'root',
    web_console_url: '',
    control_panel_url: '',
    manual_setup_notes: '',
  });
  const [firewallRules, setFirewallRules] = useState<FirewallRule[]>(DEFAULT_FIREWALL);
  const [newRule, setNewRule] = useState<Omit<FirewallRule, 'id'>>({
    port: '8080',
    protocol: 'TCP',
    action: 'ALLOW',
    source: '0.0.0.0/0',
    label: 'App Port',
  });

  const callServerAction = useCallback(async (payload: Record<string, any>) => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch('/api/portal/server-action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify({ serviceId, ...payload }),
    });
    const data = await res.json().catch(() => ({ error: 'Invalid response' }));
    if (!res.ok) throw new Error(data.error || `Server returned ${res.status}`);
    return data;
  }, [serviceId]);

  const refreshTelemetry = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/portal/server-action?serviceId=${encodeURIComponent(serviceId)}`, {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        if (json.service) setService(json.service);
        if (json.metrics) setMetrics(json.metrics);
      }
    } catch {
      // ignore background poll failures
    }
  }, [serviceId]);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { setLoading(false); return; }
      setUser({ id: authUser.id, email: authUser.email || '' });

      const { data: svc } = await supabase
        .from('hosting_services')
        .select('*')
        .eq('id', serviceId)
        .eq('user_id', authUser.id)
        .maybeSingle();

      setService(svc);

      if (!svc) {
        setLoading(false);
        return;
      }

      setSshKeyInput((svc.ssh_public_key as string) || '');
      setHostnameInput((svc.hostname as string) || (svc.domain as string) || '');
      setSelectedOs((svc.os_template as string) || 'ubuntu-22.04');
      setManualForm({
        hostname: (svc.hostname as string) || (svc.domain as string) || '',
        ip_address: (svc.ip_address as string) || '',
        ipv6_address: (svc.ipv6_address as string) || '',
        ssh_port: String(svc.ssh_port || 22),
        username: (svc.username as string) || 'root',
        web_console_url: (svc.web_console_url as string) || '',
        control_panel_url: (svc.control_panel_url as string) || '',
        manual_setup_notes: (svc.manual_setup_notes as string) || '',
      });
      if (Array.isArray(svc.firewall_rules) && svc.firewall_rules.length > 0) {
        setFirewallRules(svc.firewall_rules as FirewallRule[]);
      }

      const domain = (svc.domain as string) || (svc.hostname as string) || 'example.com';

      try {
        const [dnsZ, dnsR, dbs, emails, ssls, bks] = await Promise.all([
          supabase.from('dns_zones').select('*').eq('user_id', authUser.id).eq('domain', domain).maybeSingle(),
          supabase.from('dns_records').select('*').eq('user_id', authUser.id).order('created_at', { ascending: false }),
          supabase.from('hosting_databases').select('*').eq('user_id', authUser.id).eq('service_id', serviceId).order('created_at', { ascending: false }),
          supabase.from('email_accounts').select('*').eq('user_id', authUser.id).eq('domain', domain).order('created_at', { ascending: false }),
          supabase.from('ssl_certificates').select('*').eq('user_id', authUser.id).eq('domain', domain).order('created_at', { ascending: false }),
          supabase.from('backup_snapshots').select('*').eq('user_id', authUser.id).eq('service_id', serviceId).order('created_at', { ascending: false }),
        ]);

        setDnsZone(dnsZ.data || null);
        setDnsRecords((dnsR.data || []).filter((r) => (r as { zone_id?: string }).zone_id === (dnsZ.data as { id?: string })?.id));
        setDatabases(dbs.data || []);
        setEmailAccounts(emails.data || []);
        setSslCerts(ssls.data || []);
        setBackups(bks.data || []);
      } catch (err) {
        console.error('Failed to load service data:', err);
      }

      refreshTelemetry();
      setLoading(false);

      if (actionParam) {
        setPendingAction(actionParam);
        router.replace(`/portal/service/${serviceId}`);
      }
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId]);

  const handleServerAction = useCallback(async (actionStr: string, extra?: Record<string, any>) => {
    if (!serviceId) return;
    setSubmitting(true);
    setActionResult(null);
    try {
      const data = await callServerAction({ action: actionStr, ...(extra || {}) });
      setActionResult({ ok: true, message: data.message || `${actionStr} executed successfully` });
      await refreshTelemetry();
      return data;
    } catch (e: any) {
      setActionResult({ ok: false, message: e.message || `${actionStr} failed` });
      return null;
    } finally {
      setSubmitting(false);
      setPendingAction(null);
    }
  }, [serviceId, callServerAction, refreshTelemetry]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  const addDnsRecord = async () => {
    if (!newRecord.value.trim() || !user) return;
    setSubmitting(true);
    try {
      const res = await callServerAction({
        action: 'add_dns_record',
        type: newRecord.type,
        name: newRecord.name,
        value: newRecord.value,
        ttl: newRecord.ttl,
        priority: newRecord.priority ? parseInt(newRecord.priority, 10) : undefined,
      });
      if (res.record) {
        setDnsRecords([res.record, ...dnsRecords]);
        setNewRecord({ type: 'A', name: '@', value: '', ttl: 3600, priority: '' });
      }
      setActionResult({ ok: true, message: res.message || 'DNS record saved' });
    } catch (err: any) {
      setActionResult({ ok: false, message: 'DNS: ' + err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteDnsRecord = async (id: string) => {
    try {
      await callServerAction({ action: 'delete_dns_record', recordId: id });
      setDnsRecords(dnsRecords.filter((r) => r.id !== id));
      setActionResult({ ok: true, message: 'DNS record deleted' });
    } catch (err: any) {
      setActionResult({ ok: false, message: 'Failed to delete DNS record: ' + err.message });
    }
  };

  const createDatabase = async () => {
    if (!newDb.db_name.trim() || !user) return;
    setSubmitting(true);
    const supabase = createClient();
    const dbUser = `u_${newDb.db_name.substring(0, 8).toLowerCase()}`;
    const { data, error } = await supabase.from('hosting_databases').insert({
      user_id: user.id, service_id: serviceId,
      db_name: newDb.db_name, db_type: newDb.db_type, db_user: dbUser,
      db_host: 'localhost', db_port: newDb.db_type === 'mysql' ? 3306 : 5432,
      size_mb: 0,
      status: 'active',
    }).select().single();
    if (error) { setActionResult({ ok: false, message: 'Database: ' + error.message }); setSubmitting(false); return; }
    if (data) { setDatabases([data, ...databases]); setNewDb({ db_name: '', db_type: 'mysql' }); }
    setSubmitting(false);
  };

  const deleteDatabase = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('hosting_databases').delete().eq('id', id).eq('user_id', user?.id);
    if (error) { setActionResult({ ok: false, message: 'Failed to delete database: ' + error.message }); return; }
    setDatabases(databases.filter((d) => d.id !== id));
  };

  const createEmailAccount = async () => {
    if (!newEmail.local_part.trim() || !user) return;
    setSubmitting(true);
    try {
      const res = await callServerAction({
        action: 'create_email_account',
        localPart: newEmail.local_part,
        password: newEmail.password,
        forward_to: newEmail.forward_to || undefined,
        quota_mb: newEmail.quota,
      });
      if (res.account) {
        setEmailAccounts([res.account, ...emailAccounts]);
        setNewEmail({ local_part: '', password: '', quota: 1024, forward_to: '' });
      }
      setActionResult({ ok: true, message: res.message || 'Email account created' });
    } catch (err: any) {
      setActionResult({ ok: false, message: 'Email: ' + err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteEmailAccount = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('email_accounts').delete().eq('id', id).eq('user_id', user?.id);
    if (error) { setActionResult({ ok: false, message: 'Failed to delete email account: ' + error.message }); return; }
    setEmailAccounts(emailAccounts.filter((e) => e.id !== id));
  };

  const issueSsl = async () => {
    if (!user) return;
    setSubmitting(true);
    const supabase = createClient();
    const domain = (service?.domain as string) || (service?.hostname as string) || 'example.com';
    const validFrom = new Date();
    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 1);
    const { data, error } = await supabase.from('ssl_certificates').insert({
      user_id: user.id, domain, cert_type: 'lets_encrypt', issuer: "Let's Encrypt",
      valid_from: validFrom.toISOString(), valid_until: validUntil.toISOString(),
      status: 'active', auto_renew: true,
    }).select().single();
    if (error) { setActionResult({ ok: false, message: 'SSL: ' + error.message }); setSubmitting(false); return; }
    if (data) { setSslCerts([data, ...sslCerts]); }
    setSubmitting(false);
  };

  const createBackup = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const res = await callServerAction({ action: 'create_backup', type: 'manual' });
      if (res.backup) setBackups([res.backup, ...backups]);
      setActionResult({ ok: true, message: res.message || 'Snapshot backup created' });
    } catch (err: any) {
      setActionResult({ ok: false, message: 'Backup: ' + err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteBackup = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('backup_snapshots').delete().eq('id', id).eq('user_id', user?.id);
    if (error) { setActionResult({ ok: false, message: 'Failed to delete backup: ' + error.message }); return; }
    setBackups(backups.filter((b) => b.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="v4-panel rounded-2xl p-12 text-center bg-ink-surface/50 border-dashed border-hairline">
        <Server className="h-12 w-12 text-text-muted-v4 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2 text-text-primary-v4">Service not found</h2>
        <p className="text-sm text-text-secondary-v4 mb-6">
          The service you are looking for does not exist or you don&apos;t have access to it.
        </p>
        <button
          onClick={() => router.push('/portal/service')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-btn v4-btn-secondary text-sm font-medium"
        >
          View All Services
        </button>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof Server }[] = [
    { id: 'overview', label: 'Overview & Power', icon: Activity },
    { id: 'access', label: 'Access, SSH & Cloud-Init', icon: KeyRound },
    { id: 'firewall', label: 'Firewall & Ports', icon: Flame },
    { id: 'os', label: 'OS Reinstall', icon: RotateCcw },
    { id: 'dns', label: 'DNS', icon: Globe },
    { id: 'databases', label: 'Databases', icon: Database },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'ssl', label: 'SSL', icon: Lock },
    { id: 'backups', label: 'Backups', icon: RefreshCw },
    { id: 'files', label: 'Files', icon: FileText },
  ];

  const ipAddr = (service.ip_address as string) || '';
  const sshPort = Number(service.ssh_port || 22);
  const sshUser = (service.username as string) || 'root';
  const sshCmd = ipAddr ? `ssh ${sshUser}@${ipAddr}${sshPort !== 22 ? ` -p ${sshPort}` : ''}` : '';
  const sftpUri = ipAddr ? `sftp://${sshUser}@${ipAddr}:${sshPort}` : '';
  const specs = (service.specs_json as { vcpu?: number; ram_gb?: number; disk_gb?: number }) || {};

  const activePreset = BOOTSTRAP_PRESETS.find((p) => p.id === selectedPreset) || BOOTSTRAP_PRESETS[0];
  const ufwPorts = firewallRules
    .filter((r) => r.action === 'ALLOW')
    .map((r) => `ufw allow ${r.port}/${r.protocol.toLowerCase()}`)
    .join('\n');

  const cloudInitScript = `#cloud-config
hostname: ${hostnameInput || (service.hostname as string) || 'vaulthost-node'}
manage_etc_hosts: true
${sshKeyInput ? `users:\n  - name: ${sshUser}\n    sudo: ALL=(ALL) NOPASSWD:ALL\n    shell: /bin/bash\n    ssh_authorized_keys:\n      - ${sshKeyInput.trim()}` : ''}
package_update: true
runcmd:
  - ${activePreset.cmd}
  ${ufwPorts ? `- ${ufwPorts.split('\n').join('\n  - ')}\n  - ufw --force enable` : ''}
`;

  const customEndpointEntries =
    service.access_endpoints && typeof service.access_endpoints === 'object'
      ? Object.entries(service.access_endpoints).filter(([, v]) => Boolean(v))
      : [];

  return (
    <div className="space-y-8">
      {/* Header Card */}
      <div className="relative overflow-hidden v4-panel p-6 sm:p-8 mb-6 border-signal/20 bg-gradient-to-r from-ink-surface to-background/30">
        {service.status === 'failed' && (
          <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 flex items-start gap-3">
            <div className="p-2 bg-error/20 rounded-lg shrink-0">
              <Shield className="h-5 w-5 text-error" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-error">Automated Provisioning Notice</h4>
              <p className="text-xs text-error/80 mt-1">
                Automated provisioning did not finish. You can assign credentials manually in the &ldquo;Access, SSH &amp; Cloud-Init&rdquo; tab or contact engineering support.
              </p>
            </div>
          </div>
        )}

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-signal/10 border border-signal/20">
                <Server className="h-7 w-7 text-signal" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary-v4 v4-display">
                    {service.plan_name as string}
                  </h1>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-ink-surface-2 border border-hairline text-signal">
                    {service.provisioning_mode === 'manual' ? 'Manual / BYO' : 'Automated Node'}
                  </span>
                </div>
                <p className="text-sm font-mono text-text-secondary-v4 mt-1">
                  {(service.hostname as string) || (service.domain as string) || 'Unassigned hostname'}
                  {service.os_template ? ` · ${service.os_template}` : ''}
                  {specs.vcpu ? ` · ${specs.vcpu} vCPU / ${specs.ram_gb || 4}GB RAM / ${specs.disk_gb || 40}GB NVMe` : ''}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className={`px-4 py-1.5 rounded-full font-semibold tracking-wider text-xs uppercase border ${
              service.status === 'active'
                ? 'text-good bg-good/10 border-good/20'
                : service.status === 'failed'
                ? 'text-error bg-error/10 border-error/20'
                : 'text-warn bg-warn/10 border-warn/20'
            }`}>
              {service.setup_status === 'awaiting_setup' ? 'Awaiting Manual Setup' : (service.status as string)}
            </span>

            {service.web_console_url && (
              <a
                href={service.web_console_url as string}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-btn v4-btn-primary text-sm font-medium"
              >
                Web Console <Terminal className="h-4 w-4" />
              </a>
            )}
            {service.control_panel_url && (
              <a
                href={service.control_panel_url as string}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-btn v4-btn-secondary text-sm font-medium"
              >
                Control Panel <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        {/* Direct Access Bar */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-hairline">
          <div>
            <p className="text-[11px] text-text-muted-v4 uppercase tracking-wider font-semibold mb-1">Public IPv4 / Port</p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-sm text-text-primary-v4">
                {ipAddr ? `${ipAddr}:${sshPort}` : 'Not assigned yet'}
              </p>
              {ipAddr && (
                <button onClick={() => copyToClipboard(ipAddr, 'ip')} className="text-text-muted-v4 hover:text-signal">
                  {copied === 'ip' ? <Check className="h-4 w-4 text-good" /> : <Copy className="h-4 w-4" />}
                </button>
              )}
            </div>
          </div>

          <div>
            <p className="text-[11px] text-text-muted-v4 uppercase tracking-wider font-semibold mb-1">SSH Connect Command</p>
            {sshCmd ? (
              <div className="flex items-center gap-2">
                <p className="font-mono text-xs text-green-400 truncate">{sshCmd}</p>
                <button onClick={() => copyToClipboard(sshCmd, 'ssh')} className="text-text-muted-v4 hover:text-signal shrink-0">
                  {copied === 'ssh' ? <Check className="h-4 w-4 text-good" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            ) : (
              <p className="text-xs text-text-muted-v4">Set IPv4 in Access tab</p>
            )}
          </div>

          <div>
            <p className="text-[11px] text-text-muted-v4 uppercase tracking-wider font-semibold mb-1">Username / SFTP</p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-sm text-text-primary-v4">{sshUser}</p>
              {sftpUri && (
                <button onClick={() => copyToClipboard(sftpUri, 'sftp')} className="text-[11px] text-signal hover:underline">
                  {copied === 'sftp' ? 'Copied SFTP!' : 'Copy SFTP'}
                </button>
              )}
            </div>
          </div>

          <div>
            <p className="text-[11px] text-text-muted-v4 uppercase tracking-wider font-semibold mb-1">Root / OS Password</p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-sm text-text-primary-v4">
                {service.password ? (showPassword ? (service.password as string) : '••••••••••••') : 'SSH Key / Reset below'}
              </p>
              {service.password && (
                <>
                  <button onClick={() => setShowPassword(!showPassword)} className="text-text-muted-v4 hover:text-signal">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button onClick={() => copyToClipboard(service.password as string, 'pass')} className="text-text-muted-v4 hover:text-signal">
                    {copied === 'pass' ? <Check className="h-4 w-4 text-good" /> : <Copy className="h-4 w-4" />}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {(customEndpointEntries.length > 0 || service.manual_setup_notes) && (
          <div className="relative z-10 mt-6 pt-5 border-t border-hairline/60 grid sm:grid-cols-2 gap-4 text-xs">
            {customEndpointEntries.length > 0 && (
              <div className="p-3 rounded-xl bg-ink/70 border border-hairline">
                <div className="text-[10px] uppercase tracking-wider text-text-muted-v4 mb-1.5 font-semibold">Custom Endpoints &amp; Links</div>
                <div className="space-y-1 font-mono">
                  {customEndpointEntries.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2">
                      <span className="text-text-muted-v4">{k}:</span>
                      <span className="text-signal truncate">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {service.manual_setup_notes && (
              <div className="p-3 rounded-xl bg-ink/70 border border-hairline">
                <div className="text-[10px] uppercase tracking-wider text-text-muted-v4 mb-1.5 font-semibold">Manual Setup Notes</div>
                <p className="text-text-secondary-v4 whitespace-pre-wrap">{service.manual_setup_notes as string}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide border-b border-hairline">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
              activeTab === tab.id
                ? 'bg-ink-surface text-signal border-signal'
                : 'border-transparent text-text-secondary-v4 hover:text-text-primary-v4 hover:bg-ink-surface/50'
            }`}
          >
            <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-signal' : 'opacity-60'}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: OVERVIEW & POWER */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Live Power Actions + Telemetry */}
          <div className="v4-panel p-6 border-hairline">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-text-primary-v4 flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-signal" /> Instance Power &amp; Telemetry
                </h3>
                <p className="text-xs text-text-muted-v4 mt-0.5">
                  Control power state, take point-in-time snapshots, or refresh live backend metrics.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleServerAction('start')}
                  disabled={submitting}
                  className="px-3.5 py-2 rounded-lg bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-green-500/25"
                >
                  <Play className="h-3.5 w-3.5" /> Start
                </button>
                <button
                  onClick={() => setPendingAction('restart')}
                  disabled={submitting}
                  className="px-3.5 py-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-amber-500/25"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Reboot
                </button>
                <button
                  onClick={() => setPendingAction('stop')}
                  disabled={submitting}
                  className="px-3.5 py-2 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-red-500/25"
                >
                  <Square className="h-3.5 w-3.5" /> Stop
                </button>
                <button
                  onClick={() => handleServerAction('snapshot')}
                  disabled={submitting}
                  className="px-3.5 py-2 rounded-lg bg-signal/15 border border-signal/30 text-signal text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-signal/25"
                >
                  <HardDrive className="h-3.5 w-3.5" /> Snapshot
                </button>
                <button
                  onClick={refreshTelemetry}
                  className="px-3 py-2 rounded-lg border border-hairline text-text-secondary-v4 text-xs hover:text-text-primary-v4"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-ink border border-hairline">
                <div className="text-[11px] uppercase text-text-muted-v4">CPU Utilization</div>
                <div className="text-2xl font-bold text-text-primary-v4 mt-1 font-mono">
                  {metrics ? `${Number(metrics.cpuPercent || 0).toFixed(1)}%` : `${specs.vcpu || 2} vCPU`}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-ink border border-hairline">
                <div className="text-[11px] uppercase text-text-muted-v4">Memory Allocation</div>
                <div className="text-2xl font-bold text-text-primary-v4 mt-1 font-mono">
                  {metrics?.memoryUsedMb
                    ? `${Math.round(metrics.memoryUsedMb)} / ${Math.round(metrics.memoryTotalMb)} MB`
                    : `${specs.ram_gb || 4} GB`}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-ink border border-hairline">
                <div className="text-[11px] uppercase text-text-muted-v4">NVMe Disk Capacity</div>
                <div className="text-2xl font-bold text-text-primary-v4 mt-1 font-mono">
                  {metrics?.diskTotalGb ? `${metrics.diskTotalGb} GB` : `${specs.disk_gb || 40} GB`}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-ink border border-hairline">
                <div className="text-[11px] uppercase text-text-muted-v4">Firewall Rules</div>
                <div className="text-2xl font-bold text-signal mt-1 font-mono">{firewallRules.length} Active</div>
              </div>
            </div>
          </div>

          {/* Resource Counters */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Globe, label: 'DNS Records', value: dnsRecords.length, color: 'text-blue-400' },
              { icon: Database, label: 'Databases', value: databases.length, color: 'text-good' },
              { icon: Mail, label: 'Email Accounts', value: emailAccounts.length, color: 'text-warn' },
              { icon: Lock, label: 'SSL Certificates', value: sslCerts.length, color: 'text-good' },
              { icon: RefreshCw, label: 'Snapshots / Backups', value: backups.length, color: 'text-signal' },
              { icon: HardDrive, label: 'SSH Keys Configured', value: service.ssh_public_key ? 1 : 0, color: 'text-signal' },
            ].map((stat) => (
              <div key={stat.label} className="v4-panel p-6 border-hairline">
                <stat.icon className={`h-7 w-7 ${stat.color} mb-3`} />
                <p className="text-3xl font-bold v4-display text-text-primary-v4 mb-1">{stat.value}</p>
                <p className="text-xs text-text-secondary-v4 font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: ACCESS, SSH & CLOUD-INIT */}
      {activeTab === 'access' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: SSH Key, Password Reset, Hostname */}
          <div className="space-y-6">
            <div className="v4-panel p-6 border-hairline space-y-4">
              <h3 className="text-base font-bold text-text-primary-v4 flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-signal" /> SSH Public Key &amp; Authentication
              </h3>
              <div>
                <label className="block text-xs text-text-muted-v4 mb-1.5">Authorized SSH Public Key</label>
                <textarea
                  rows={3}
                  value={sshKeyInput}
                  onChange={(e) => setSshKeyInput(e.target.value)}
                  placeholder="ssh-ed25519 AAAA... user@workstation"
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs font-mono"
                />
              </div>
              <button
                onClick={() => handleServerAction('update_ssh_key', { sshPublicKey: sshKeyInput })}
                disabled={submitting || !sshKeyInput.trim()}
                className="v4-btn-primary px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-50"
              >
                Save &amp; Inject SSH Key
              </button>

              <div className="pt-4 border-t border-hairline space-y-3">
                <label className="block text-xs text-text-muted-v4">Rotate OS Password</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customPasswordInput}
                    onChange={(e) => setCustomPasswordInput(e.target.value)}
                    placeholder="Leave blank to auto-generate strong password"
                    className="flex-1 px-3 py-2 rounded-xl bg-background border border-border text-xs font-mono"
                  />
                  <button
                    onClick={() => handleServerAction('reset_password', { newPassword: customPasswordInput || undefined })}
                    disabled={submitting}
                    className="v4-btn-secondary px-4 py-2 rounded-xl text-xs font-semibold"
                  >
                    Rotate Password
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-hairline space-y-3">
                <label className="block text-xs text-text-muted-v4">Hostname / rDNS Label</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={hostnameInput}
                    onChange={(e) => setHostnameInput(e.target.value)}
                    placeholder="node1.yourdomain.com"
                    className="flex-1 px-3 py-2 rounded-xl bg-background border border-border text-xs font-mono"
                  />
                  <button
                    onClick={() => handleServerAction('update_hostname', { hostname: hostnameInput })}
                    disabled={submitting || !hostnameInput.trim()}
                    className="v4-btn-secondary px-4 py-2 rounded-xl text-xs font-semibold"
                  >
                    Update Hostname
                  </button>
                </div>
              </div>
            </div>

            {/* Flexible Manual / BYO Configuration */}
            <div className="v4-panel p-6 border-hairline space-y-4">
              <h3 className="text-base font-bold text-text-primary-v4 flex items-center gap-2">
                <Wrench className="h-4 w-4 text-signal" /> Manual / BYO Endpoint Setup
              </h3>
              <p className="text-xs text-text-muted-v4">
                Flexibly configure direct IPv4/IPv6, custom SSH port, IPMI/noVNC console URL, or runbook instructions for this node.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-text-muted-v4 mb-1">Public IPv4</label>
                  <input
                    value={manualForm.ip_address}
                    onChange={(e) => setManualForm({ ...manualForm, ip_address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border font-mono"
                  />
                </div>
                <div>
                  <label className="block text-text-muted-v4 mb-1">IPv6 Block / Address</label>
                  <input
                    value={manualForm.ipv6_address}
                    onChange={(e) => setManualForm({ ...manualForm, ipv6_address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border font-mono"
                  />
                </div>
                <div>
                  <label className="block text-text-muted-v4 mb-1">SSH Username</label>
                  <input
                    value={manualForm.username}
                    onChange={(e) => setManualForm({ ...manualForm, username: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border font-mono"
                  />
                </div>
                <div>
                  <label className="block text-text-muted-v4 mb-1">SSH Port</label>
                  <input
                    type="number"
                    value={manualForm.ssh_port}
                    onChange={(e) => setManualForm({ ...manualForm, ssh_port: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border font-mono"
                  />
                </div>
                <div>
                  <label className="block text-text-muted-v4 mb-1">Web Console URL</label>
                  <input
                    value={manualForm.web_console_url}
                    onChange={(e) => setManualForm({ ...manualForm, web_console_url: e.target.value })}
                    placeholder="https://ipmi.example.com"
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border font-mono"
                  />
                </div>
                <div>
                  <label className="block text-text-muted-v4 mb-1">Control Panel URL</label>
                  <input
                    value={manualForm.control_panel_url}
                    onChange={(e) => setManualForm({ ...manualForm, control_panel_url: e.target.value })}
                    placeholder="https://panel.example.com:8083"
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-text-muted-v4 mb-1">Custom Setup Notes</label>
                <textarea
                  rows={2}
                  value={manualForm.manual_setup_notes}
                  onChange={(e) => setManualForm({ ...manualForm, manual_setup_notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs"
                />
              </div>
              <button
                onClick={() => handleServerAction('save_manual_config', { ...manualForm, ssh_port: parseInt(manualForm.ssh_port, 10) || 22 })}
                disabled={submitting}
                className="v4-btn-primary px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Save Manual Node Configuration
              </button>
            </div>
          </div>

          {/* Right: Interactive Cloud-Init & Stack Bootstrap Script */}
          <div className="v4-panel p-6 border-hairline flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-text-primary-v4 flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-signal" /> Cloud-Init &amp; Bootstrap Generator
                </h3>
                <p className="text-xs text-text-muted-v4 mt-0.5">
                  Copy a production cloud-config or one-line SSH bootstrap with your SSH key &amp; firewall ports.
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(cloudInitScript, 'cloudinit')}
                className="v4-btn-secondary px-3 py-1.5 rounded-lg text-xs inline-flex items-center gap-1.5"
              >
                {copied === 'cloudinit' ? <Check className="h-3.5 w-3.5 text-good" /> : <Copy className="h-3.5 w-3.5" />}
                {copied === 'cloudinit' ? 'Copied' : 'Copy YAML'}
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {BOOTSTRAP_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedPreset(preset.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    selectedPreset === preset.id
                      ? 'bg-signal text-black border-signal font-semibold'
                      : 'bg-ink border-hairline text-text-secondary-v4 hover:text-text-primary-v4'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <pre className="flex-1 p-4 rounded-xl bg-black/80 border border-hairline text-[11px] font-mono text-green-400 overflow-x-auto whitespace-pre-wrap">
              {cloudInitScript}
            </pre>

            <div className="mt-4 p-3 rounded-xl bg-ink border border-hairline flex items-center justify-between gap-2 text-xs">
              <code className="font-mono text-text-secondary-v4 truncate">{activePreset.cmd}</code>
              <button
                onClick={() => copyToClipboard(activePreset.cmd, 'cmd')}
                className="text-signal shrink-0 inline-flex items-center gap-1"
              >
                {copied === 'cmd' ? <Check className="h-3.5 w-3.5 text-good" /> : <Copy className="h-3.5 w-3.5" />} Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: FIREWALL & PORTS */}
      {activeTab === 'firewall' && (
        <div className="space-y-6">
          <div className="v4-panel p-6 border-hairline">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-text-primary-v4">Security Group &amp; Port Rules</h3>
                <p className="text-xs text-text-muted-v4">Define inbound firewall policy enforced on your dedicated instance &amp; synced into Cloud-Init.</p>
              </div>
              <button
                onClick={() => handleServerAction('save_firewall_rules', { rules: firewallRules })}
                disabled={submitting}
                className="v4-btn-primary px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Save Firewall Policy
              </button>
            </div>

            <div className="grid sm:grid-cols-5 gap-3 mb-6">
              <input
                value={newRule.port}
                onChange={(e) => setNewRule({ ...newRule, port: e.target.value })}
                placeholder="Port (e.g. 8080)"
                className="px-3 py-2 rounded-xl bg-background border border-border text-xs font-mono"
              />
              <select
                value={newRule.protocol}
                onChange={(e) => setNewRule({ ...newRule, protocol: e.target.value as 'TCP' | 'UDP' })}
                className="px-3 py-2 rounded-xl bg-background border border-border text-xs"
              >
                <option value="TCP">TCP</option>
                <option value="UDP">UDP</option>
              </select>
              <select
                value={newRule.action}
                onChange={(e) => setNewRule({ ...newRule, action: e.target.value as 'ALLOW' | 'DENY' })}
                className="px-3 py-2 rounded-xl bg-background border border-border text-xs"
              >
                <option value="ALLOW">ALLOW</option>
                <option value="DENY">DENY</option>
              </select>
              <input
                value={newRule.source}
                onChange={(e) => setNewRule({ ...newRule, source: e.target.value })}
                placeholder="CIDR (0.0.0.0/0)"
                className="px-3 py-2 rounded-xl bg-background border border-border text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newRule.port.trim()) return;
                  setFirewallRules([...firewallRules, { id: `fw-${Date.now()}`, ...newRule }]);
                }}
                className="v4-btn-secondary px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Add Rule
              </button>
            </div>

            <div className="overflow-x-auto border border-hairline rounded-xl">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-ink-surface-2 border-b border-hairline text-text-muted-v4 uppercase">
                    <th className="p-3 text-left">Port</th>
                    <th className="p-3 text-left">Protocol</th>
                    <th className="p-3 text-left">Policy</th>
                    <th className="p-3 text-left">Source CIDR</th>
                    <th className="p-3 text-left">Label</th>
                    <th className="p-3 text-right">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {firewallRules.map((rule) => (
                    <tr key={rule.id}>
                      <td className="p-3 font-mono font-bold text-signal">{rule.port}</td>
                      <td className="p-3 font-mono">{rule.protocol}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rule.action === 'ALLOW' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {rule.action}
                        </span>
                      </td>
                      <td className="p-3 font-mono">{rule.source}</td>
                      <td className="p-3 text-text-secondary-v4">{rule.label}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setFirewallRules(firewallRules.filter((r) => r.id !== rule.id))}
                          className="text-text-muted-v4 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: OS REINSTALL */}
      {activeTab === 'os' && (
        <div className="v4-panel p-6 border-hairline space-y-6">
          <div>
            <h3 className="text-base font-bold text-text-primary-v4">OS Reinstall &amp; Image Provisioning</h3>
            <p className="text-xs text-text-muted-v4 mt-1">
              Re-image this instance with a clean Linux or Windows Server template. Current active OS: <span className="font-mono text-signal">{(service.os_template as string) || 'ubuntu-22.04'}</span>
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {OS_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setSelectedOs(tpl.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedOs === tpl.id
                    ? 'border-signal bg-signal/10'
                    : 'border-hairline bg-ink hover:border-hairline-2'
                }`}
              >
                <div className="text-sm font-bold text-text-primary-v4">{tpl.name}</div>
                <p className="text-xs text-text-muted-v4 mt-1">{tpl.desc}</p>
              </button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="text-xs text-amber-200">
              Reinstalling <span className="font-mono font-bold">{selectedOs}</span> will reprovision disk state from template. Take a snapshot before confirming.
            </div>
            <button
              onClick={() => setPendingAction('reinstall_os')}
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold shrink-0"
            >
              Reinstall OS ({selectedOs})
            </button>
          </div>
        </div>
      )}

      {/* EXISTING TABS PRESERVED */}
      {activeTab === 'dns' && (
        <div className="space-y-6">
          <div className="liquid-glass-card rounded-2xl p-6">
            <h3 className="text-base font-semibold mb-4">Add DNS Record</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <select value={newRecord.type} onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value })} className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm">
                {DNS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <input type="text" value={newRecord.name} onChange={(e) => setNewRecord({ ...newRecord, name: e.target.value })} placeholder="Name (@ or sub)" className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm" />
              <input type="text" value={newRecord.value} onChange={(e) => setNewRecord({ ...newRecord, value: e.target.value })} placeholder="Value (IP or target)" className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm" />
              <input type="number" value={newRecord.ttl} onChange={(e) => setNewRecord({ ...newRecord, ttl: parseInt(e.target.value, 10) || 3600 })} placeholder="TTL" className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm" />
              <button onClick={addDnsRecord} disabled={submitting || !newRecord.value.trim()} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add
              </button>
            </div>
          </div>
          <div className="liquid-glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border"><h3 className="text-base font-semibold">DNS Records ({dnsRecords.length})</h3></div>
            {dnsRecords.length === 0 ? (
              <div className="p-12 text-center"><Globe className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" /><p className="text-sm text-muted-foreground">No DNS records yet. Add one above.</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-border"><th className="text-left p-4 text-xs uppercase text-muted-foreground">Type</th><th className="text-left p-4 text-xs uppercase text-muted-foreground">Name</th><th className="text-left p-4 text-xs uppercase text-muted-foreground">Value</th><th className="text-right p-4 text-xs uppercase text-muted-foreground">TTL</th><th className="p-4"></th></tr></thead>
                  <tbody>{dnsRecords.map((rec) => (
                    <tr key={rec.id as string} className="border-b border-border/50">
                      <td className="p-4 font-mono text-xs text-signal">{rec.type as string}</td>
                      <td className="p-4 font-mono text-sm">{rec.name as string}</td>
                      <td className="p-4 font-mono text-sm">{rec.value as string}</td>
                      <td className="p-4 text-right text-sm text-muted-foreground">{rec.ttl as number}</td>
                      <td className="p-4 text-right"><button onClick={() => deleteDnsRecord(rec.id as string)} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-4 w-4" /></button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'databases' && (
        <div className="space-y-6">
          <div className="liquid-glass-card rounded-2xl p-6">
            <h3 className="text-base font-semibold mb-4">Create Database</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <input type="text" value={newDb.db_name} onChange={(e) => setNewDb({ ...newDb, db_name: e.target.value })} placeholder="Database Name" className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm" />
              <select value={newDb.db_type} onChange={(e) => setNewDb({ ...newDb, db_type: e.target.value })} className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm">
                <option value="mysql">MySQL 8</option>
                <option value="postgresql">PostgreSQL 16</option>
              </select>
              <button onClick={createDatabase} disabled={submitting || !newDb.db_name.trim()} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create
              </button>
            </div>
          </div>
          <div className="liquid-glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border"><h3 className="text-base font-semibold">Databases ({databases.length})</h3></div>
            {databases.length === 0 ? (
              <div className="p-12 text-center"><Database className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" /><p className="text-sm text-muted-foreground">No databases yet.</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-border"><th className="text-left p-4 text-xs uppercase text-muted-foreground">Name</th><th className="text-left p-4 text-xs uppercase text-muted-foreground">Type</th><th className="text-left p-4 text-xs uppercase text-muted-foreground">User</th><th className="text-right p-4 text-xs uppercase text-muted-foreground">Size</th><th className="p-4"></th></tr></thead>
                  <tbody>{databases.map((db) => (
                    <tr key={db.id as string} className="border-b border-border/50">
                      <td className="p-4 text-sm font-mono">{db.db_name as string}</td>
                      <td className="p-4 text-xs uppercase text-primary font-medium">{db.db_type as string}</td>
                      <td className="p-4 text-sm font-mono">{db.db_user as string}</td>
                      <td className="p-4 text-sm text-right">{Number(db.size_mb || 0).toFixed(1)} MB</td>
                      <td className="p-4 text-right"><button onClick={() => deleteDatabase(db.id as string)} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-4 w-4" /></button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'email' && (
        <div className="space-y-6">
          <div className="liquid-glass-card rounded-2xl p-6">
            <h3 className="text-base font-semibold mb-4">Create Email Account or Forwarder</h3>
            <div className="grid sm:grid-cols-5 gap-3">
              <div className="relative">
                <input type="text" value={newEmail.local_part} onChange={(e) => setNewEmail({ ...newEmail, local_part: e.target.value })} placeholder="name" className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">@{(service.domain as string) || 'example.com'}</span>
              </div>
              <input type="text" value={newEmail.forward_to} onChange={(e) => setNewEmail({ ...newEmail, forward_to: e.target.value })} placeholder="Forward To (Optional)" className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm" />
              <input type="password" value={newEmail.password} onChange={(e) => setNewEmail({ ...newEmail, password: e.target.value })} placeholder="Password" className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm" />
              <input type="number" value={newEmail.quota} onChange={(e) => setNewEmail({ ...newEmail, quota: parseInt(e.target.value, 10) || 1024 })} placeholder="Quota (MB)" className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm" />
              <button onClick={createEmailAccount} disabled={submitting || !newEmail.local_part.trim()} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create
              </button>
            </div>
          </div>
          <div className="liquid-glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border"><h3 className="text-base font-semibold">Email Accounts ({emailAccounts.length})</h3></div>
            {emailAccounts.length === 0 ? (
              <div className="p-12 text-center"><Mail className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" /><p className="text-sm text-muted-foreground">No email accounts yet.</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-border"><th className="text-left p-4 text-xs uppercase text-muted-foreground">Email</th><th className="text-left p-4 text-xs uppercase text-muted-foreground">Forward To</th><th className="text-right p-4 text-xs uppercase text-muted-foreground">Quota</th><th className="text-center p-4 text-xs uppercase text-muted-foreground">Status</th><th className="p-4"></th></tr></thead>
                  <tbody>{emailAccounts.map((em) => (
                    <tr key={em.id as string} className="border-b border-border/50">
                      <td className="p-4 text-sm font-medium">{em.local_part as string}@{em.domain as string}</td>
                      <td className="p-4 text-sm text-muted-foreground">{(em.forward_to as string) || '—'}</td>
                      <td className="p-4 text-sm text-right text-muted-foreground">{em.storage_quota_mb as number} MB</td>
                      <td className="p-4 text-center"><span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">{em.status as string}</span></td>
                      <td className="p-4 text-right"><button onClick={() => deleteEmailAccount(em.id as string)} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-4 w-4" /></button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'ssl' && (
        <div className="space-y-6">
          <div className="liquid-glass-card rounded-2xl p-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold">SSL Certificates</h3>
              <p className="text-sm text-muted-foreground mt-1">Issue a free Let&apos;s Encrypt certificate for your domain.</p>
            </div>
            <button onClick={issueSsl} disabled={submitting} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />} Issue Free SSL
            </button>
          </div>
          {sslCerts.length === 0 ? (
            <div className="liquid-glass-card rounded-2xl p-12 text-center"><p className="text-sm text-muted-foreground">No SSL certificates issued yet.</p></div>
          ) : (
            <div className="space-y-3">{sslCerts.map((cert) => (
              <div key={cert.id as string} className="liquid-glass-card rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{cert.domain as string}</p>
                  <p className="text-xs text-muted-foreground">{cert.issuer as string} · Expires {new Date(cert.valid_until as string).toLocaleDateString()}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400">{cert.status as string}</span>
              </div>
            ))}</div>
          )}
        </div>
      )}

      {activeTab === 'backups' && (
        <div className="space-y-6">
          <div className="liquid-glass-card rounded-2xl p-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold">Backup Snapshots</h3>
              <p className="text-sm text-muted-foreground mt-1">Create on-demand snapshots of your hosting service or dedicated VM.</p>
            </div>
            <button onClick={createBackup} disabled={submitting} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Create Backup
            </button>
          </div>
          {backups.length === 0 ? (
            <div className="liquid-glass-card rounded-2xl p-12 text-center">
              <RefreshCw className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No backups yet. Create one above.</p>
            </div>
          ) : (
            <div className="space-y-3">{backups.map((bk) => (
              <div key={bk.id as string} className="liquid-glass-card rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20"><RefreshCw className="h-5 w-5 text-primary" /></div>
                  <div>
                    <p className="text-sm font-semibold capitalize">{bk.backup_type as string} backup</p>
                    <p className="text-xs text-muted-foreground">{Number(bk.size_mb || 0).toFixed(1)} MB · {new Date(bk.created_at as string).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">{bk.status as string}</span>
                  <button title="Download not available — backups stored on server" className="p-2 rounded-lg text-muted-foreground opacity-40" disabled><Download className="h-4 w-4" /></button>
                  <button onClick={() => deleteBackup(bk.id as string)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}</div>
          )}
        </div>
      )}

      {activeTab === 'files' && (
        <div className="liquid-glass-card rounded-2xl p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">File Manager &amp; SFTP</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Access your files via SFTP ({sftpUri || 'configure IP in Access tab'}) or launch your control panel web file manager.
          </p>
          {service.control_panel_url ? (
            <a href={service.control_panel_url as string} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm">
              Open File Manager <ExternalLink className="h-4 w-4" />
            </a>
          ) : (
            <button onClick={() => setActiveTab('access')} className="v4-btn-secondary px-5 py-2.5 rounded-xl text-sm">
              Configure Control Panel &amp; SFTP Access
            </button>
          )}
        </div>
      )}

      {/* Action Result Toast */}
      {actionResult && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl border shadow-lg text-sm font-medium flex items-center gap-2 ${
          actionResult.ok ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {actionResult.ok ? <Check className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
          {actionResult.message}
          <button onClick={() => setActionResult(null)} className="ml-2 opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Confirmation Modal */}
      {pendingAction && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="v4-panel rounded-2xl p-8 max-w-md w-full mx-4 border-hairline shadow-2xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warn/10 border border-warn/20 mx-auto mb-4">
              <Shield className="h-7 w-7 text-warn" />
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">Confirm Server Action</h3>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Are you sure you want to <strong className="text-foreground">{pendingAction}</strong> this server?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPendingAction(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleServerAction(
                    pendingAction,
                    pendingAction === 'reinstall_os' ? { osTemplate: selectedOs } : undefined
                  )
                }
                disabled={submitting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
