'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import {
  Server, Globe, Database, Mail, Lock, RefreshCw, FileText,
  Loader2, Plus, Trash2, Copy, Check, ExternalLink,
  Shield, HardDrive, Activity, Download, Eye, EyeOff, Terminal, ArrowRight
} from 'lucide-react';

type Tab = 'overview' | 'dns' | 'databases' | 'email' | 'ssl' | 'backups' | 'files';

const DNS_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV'];

export default function ServiceManager() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = params.id as string;
  const actionParam = searchParams.get('action') || ''; // actions should probably be handled differently now, but we'll leave it blank

  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [service, setService] = useState<any | null>(null);
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

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { setLoading(false); return; }
      setUser({ id: authUser.id, email: authUser.email || '' });

      let { data: svc } = await supabase
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

      const domain = (svc.domain as string) || 'example.com';

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
      setLoading(false);

      // Show confirmation modal instead of auto-executing (prevents CSRF)
      if (actionParam) {
        setPendingAction(actionParam);
        router.replace(`/portal/service/${serviceId}`);
      }
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId]);

  const handleServerAction = useCallback(async (actionStr: string) => {
    if (!serviceId) return;
    setSubmitting(true);
    setActionResult(null);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/portal/server-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({ serviceId, action: actionStr })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errData.error || `Server returned ${res.status}`);
      }
      setActionResult({ ok: true, message: `${actionStr} executed successfully` });
    } catch (e: any) {
      console.error(e);
      setActionResult({ ok: false, message: e.message || `${actionStr} failed` });
    } finally {
      setSubmitting(false);
      setPendingAction(null);
    }
  }, [serviceId]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  const ensureDnsZone = async () => {
    if (dnsZone) return dnsZone;
    const supabase = createClient();
    const domain = (service?.domain as string) || 'example.com';
    const { data, error } = await supabase.from('dns_zones').insert({
      user_id: user?.id, domain, status: 'active',
    }).select().single();
    if (!error && data) { setDnsZone(data); return data; }
    return null;
  };

  const addDnsRecord = async () => {
    if (!newRecord.value.trim() || !user) return;
    setSubmitting(true);
    const zone = await ensureDnsZone();
    if (!zone) { setSubmitting(false); return; }
    const supabase = createClient();
    const { data, error } = await supabase.from('dns_records').insert({
      zone_id: (zone as { id: string }).id, user_id: user.id,
      type: newRecord.type, name: newRecord.name, value: newRecord.value,
      ttl: newRecord.ttl, priority: newRecord.priority ? parseInt(newRecord.priority) : null,
    }).select().single();
    if (error) { setActionResult({ ok: false, message: 'DNS: ' + error.message }); setSubmitting(false); return; }
    if (data) { setDnsRecords([data, ...dnsRecords]); setNewRecord({ type: 'A', name: '@', value: '', ttl: 3600, priority: '' }); }
    setSubmitting(false);
  };

  const deleteDnsRecord = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('dns_records').delete().eq('id', id).eq('user_id', user?.id);
    if (error) {
      setActionResult({ ok: false, message: 'Failed to delete DNS record: ' + error.message });
      return;
    }
    setDnsRecords(dnsRecords.filter((r) => r.id !== id));
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
    if (error) {
      setActionResult({ ok: false, message: 'Failed to delete database: ' + error.message });
      return;
    }
    setDatabases(databases.filter((d) => d.id !== id));
  };

  const createEmailAccount = async () => {
    if (!newEmail.local_part.trim() || !user) return;
    setSubmitting(true);
    const supabase = createClient();
    const domain = (service?.domain as string) || 'example.com';
    // Security Fix (C6): Do NOT store plaintext passwords. In a real system, this would be sent to a backend API and hashed.
    const { data, error } = await supabase.from('email_accounts').insert({
      user_id: user.id, domain, local_part: newEmail.local_part,
      password_hash: '***[redacted-requires-backend-hash]***',
      forward_to: newEmail.forward_to || null,
      storage_quota_mb: newEmail.quota, storage_used_mb: 0, status: 'active',
    }).select().single();
    if (error) { setActionResult({ ok: false, message: 'Email: ' + error.message }); setSubmitting(false); return; }
    if (data) { setEmailAccounts([data, ...emailAccounts]); setNewEmail({ local_part: '', password: '', quota: 1024, forward_to: '' }); }
    setSubmitting(false);
  };

  const deleteEmailAccount = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('email_accounts').delete().eq('id', id).eq('user_id', user?.id);
    if (error) {
      setActionResult({ ok: false, message: 'Failed to delete email account: ' + error.message });
      return;
    }
    setEmailAccounts(emailAccounts.filter((e) => e.id !== id));
  };

  const issueSsl = async () => {
    if (!user) return;
    setSubmitting(true);
    const supabase = createClient();
    const domain = (service?.domain as string) || 'example.com';
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
    const supabase = createClient();
    const { data, error } = await supabase.from('backup_snapshots').insert({
      user_id: user.id, service_id: serviceId,
      backup_type: 'manual', size_mb: 0,
      status: 'completed',
    }).select().single();
    if (error) { setActionResult({ ok: false, message: 'Backup: ' + error.message }); setSubmitting(false); return; }
    if (data) { setBackups([data, ...backups]); }
    setSubmitting(false);
  };

  const deleteBackup = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('backup_snapshots').delete().eq('id', id).eq('user_id', user?.id);
    if (error) {
      setActionResult({ ok: false, message: 'Failed to delete backup: ' + error.message });
      return;
    }
    setBackups(backups.filter((b) => b.id !== id));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;



  if (!service) {
    return (
      <div className="v4-panel rounded-2xl p-12 text-center bg-ink-surface/50 border-dashed border-hairline">
        <Server className="h-12 w-12 text-text-muted-v4 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2 text-text-primary-v4">Service not found</h2>
        <p className="text-sm text-text-secondary-v4 mb-6">The service you are looking for does not exist or you don't have access to it.</p>
        <button onClick={() => router.push('/portal/service')} className="inline-flex items-center gap-2 px-6 py-3 rounded-btn v4-btn-secondary text-sm font-medium">
          View All Services
        </button>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof Server }[] = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'dns', label: 'DNS', icon: Globe },
    { id: 'databases', label: 'Databases', icon: Database },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'ssl', label: 'SSL', icon: Lock },
    { id: 'backups', label: 'Backups', icon: RefreshCw },
    { id: 'files', label: 'Files', icon: FileText },
  ];

  return (
    <div className="space-y-8">
        <div className="relative overflow-hidden v4-panel p-8 mb-6 border-signal/20 bg-gradient-to-r from-ink-surface to-background/30">
          {service.status === 'failed' && (
            <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 flex items-start gap-3">
              <div className="p-2 bg-error/20 rounded-lg shrink-0">
                <Shield className="h-5 w-5 text-error" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-error">Provisioning Failed</h4>
                <p className="text-xs text-error/80 mt-1">Our automated system encountered an issue while setting up your server. Our support team has been notified and is investigating.</p>
              </div>
            </div>
          )}
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Server className="w-64 h-64 text-signal" />
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-signal/10 border border-signal/20 shadow-[0_0_15px_rgba(0,255,204,0.1)]">
                  <Server className="h-7 w-7 text-signal" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-text-primary-v4 v4-display">{service.plan_name as string}</h1>
                  <p className="text-sm font-medium text-text-secondary-v4 mt-1">{(service.domain as string) || 'Unconfigured Domain'}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-4 py-1.5 rounded-full font-semibold tracking-wider text-xs uppercase border shadow-sm ${
                service.status === 'active' ? 'text-good bg-good/10 border-good/20' 
                : service.status === 'failed' ? 'text-error bg-error/10 border-error/20'
                : service.status === 'pending_provisioning' ? 'text-warn bg-warn/10 border-warn/20'
                : 'text-blue-400 bg-blue-500/10 border-blue-500/20'
              }`}>
                {service.status === 'pending_provisioning' ? 'Setting Up...' : service.status as string}
              </span>
              {service.status === 'active' && service.web_console_url && (
                <a href={service.web_console_url as string} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-btn v4-btn-primary text-sm font-medium shadow-[0_0_15px_rgba(0,255,204,0.3)] hover:shadow-[0_0_25px_rgba(0,255,204,0.5)] group">
                  Launch Web Console <Terminal className="h-4 w-4 opacity-80" />
                </a>
              )}
              {service.status === 'active' && service.control_panel_url && (
                <a href={service.control_panel_url as string} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-btn v4-btn-secondary text-sm font-medium group">
                  Open Panel <ExternalLink className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </a>
              )}
            </div>
          </div>
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8 pt-6 border-t border-hairline bg-ink-surface/30 -mx-8 -mb-8 p-8 rounded-b-3xl">
            {service.ip_address && <div><p className="text-xs text-text-muted-v4 uppercase tracking-wider font-semibold mb-1">IP Address</p><div className="flex items-center gap-2"><p className="font-mono text-sm text-text-primary-v4">{service.ip_address as string}</p><button onClick={() => copyToClipboard(service.ip_address as string, 'ip')} className="text-text-muted-v4 hover:text-signal transition-colors">{copied === 'ip' ? <Check className="h-4 w-4 text-good" /> : <Copy className="h-4 w-4" />}</button></div></div>}
            {service.renewal_date && <div><p className="text-xs text-text-muted-v4 uppercase tracking-wider font-semibold mb-1">Renewal Date</p><p className="text-sm text-text-primary-v4 font-medium">{new Date(service.renewal_date as string).toLocaleDateString()}</p></div>}
            <div><p className="text-xs text-text-muted-v4 uppercase tracking-wider font-semibold mb-1">Created</p><p className="text-sm text-text-primary-v4">{new Date(service.created_at as string).toLocaleDateString()}</p></div>
            <div><p className="text-xs text-text-muted-v4 uppercase tracking-wider font-semibold mb-1">Plan</p><p className="text-sm font-semibold text-signal">{service.plan_name as string}</p></div>
          </div>
          
          {(service.username || service.password) && (
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-6 mt-0 pt-6 border-t border-hairline bg-ink-surface/50 -mx-8 -mb-8 p-8 rounded-b-3xl">
              <div className="sm:col-span-3 mb-[-1rem]"><h4 className="text-sm font-bold text-white flex items-center gap-2"><Lock className="w-4 h-4 text-signal" /> Access Credentials</h4></div>
              {service.username && <div><p className="text-xs text-text-muted-v4 uppercase tracking-wider font-semibold mb-1">Username</p><div className="flex items-center gap-2"><p className="font-mono text-sm text-text-primary-v4">{service.username as string}</p><button onClick={() => copyToClipboard(service.username as string, 'user')} className="text-text-muted-v4 hover:text-signal transition-colors">{copied === 'user' ? <Check className="h-4 w-4 text-good" /> : <Copy className="h-4 w-4" />}</button></div></div>}
              {service.password && <div><p className="text-xs text-text-muted-v4 uppercase tracking-wider font-semibold mb-1">Password</p><div className="flex items-center gap-2"><p className="font-mono text-sm text-text-primary-v4">{showPassword ? (service.password as string) : '••••••••••••'}</p><button onClick={() => setShowPassword(!showPassword)} className="text-text-muted-v4 hover:text-signal transition-colors">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button><button onClick={() => copyToClipboard(service.password as string, 'pass')} className="text-text-muted-v4 hover:text-signal transition-colors">{copied === 'pass' ? <Check className="h-4 w-4 text-good" /> : <Copy className="h-4 w-4" />}</button></div></div>}
              {service.ssh_port && <div><p className="text-xs text-text-muted-v4 uppercase tracking-wider font-semibold mb-1">SSH/RDP Port</p><p className="font-mono text-sm text-text-primary-v4">{service.ssh_port as string}</p></div>}
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide border-b border-hairline">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${activeTab === tab.id ? 'bg-ink-surface text-signal border-signal' : 'border-transparent text-text-secondary-v4 hover:text-text-primary-v4 hover:bg-ink-surface/50'}`}
            >
              <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-signal' : 'opacity-50'}`} /> {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Globe, label: 'DNS Records', value: dnsRecords.length, color: 'text-blue-400' },
              { icon: Database, label: 'Databases', value: databases.length, color: 'text-good' },
              { icon: Mail, label: 'Email Accounts', value: emailAccounts.length, color: 'text-warn' },
              { icon: Lock, label: 'SSL Certificates', value: sslCerts.length, color: 'text-good' },
              { icon: RefreshCw, label: 'Backups', value: backups.length, color: 'text-signal' },
              { icon: HardDrive, label: 'Storage Used', value: 'N/A', color: 'text-text-muted-v4' },
            ].map((stat) => (
              <div key={stat.label} className="v4-panel p-6 border-hairline hover:border-hairline-2 transition-colors relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 opacity-[0.02] group-hover:opacity-10 transition-opacity">
                  <stat.icon className="h-32 w-32" />
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} mb-4`} />
                <p className="text-4xl font-bold v4-display text-text-primary-v4 mb-1">{stat.value}</p>
                <p className="text-sm text-text-secondary-v4 font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'dns' && (
          <div className="space-y-6">
            <div className="liquid-glass-card rounded-2xl p-6">
              <h3 className="text-base font-semibold mb-4">Add DNS Record</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <select value={newRecord.type} onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value })} className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {DNS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <input type="text" value={newRecord.name} onChange={(e) => setNewRecord({ ...newRecord, name: e.target.value })} placeholder="Name (@ or subdomain)" className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <input type="text" value={newRecord.value} onChange={(e) => setNewRecord({ ...newRecord, value: e.target.value })} placeholder="Value (IP or target)" className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <input type="number" value={newRecord.ttl} onChange={(e) => setNewRecord({ ...newRecord, ttl: parseInt(e.target.value) || 3600 })} placeholder="TTL" className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
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
                  <thead><tr className="border-b border-border">
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Type</th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Name</th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Value</th>
                    <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase">TTL</th>
                    <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase"></th>
                  </tr></thead>
                  <tbody>{dnsRecords.map((r) => (
                    <tr key={r.id as string} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="p-4"><span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-medium">{r.type as string}</span></td>
                      <td className="p-4 text-sm font-mono">{r.name as string}</td>
                      <td className="p-4 text-sm font-mono max-w-xs truncate">{r.value as string}</td>
                      <td className="p-4 text-sm text-right text-muted-foreground">{r.ttl as number}</td>
                      <td className="p-4 text-right"><button onClick={() => deleteDnsRecord(r.id as string)} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-4 w-4" /></button></td>
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
                <input type="text" value={newDb.db_name} onChange={(e) => setNewDb({ ...newDb, db_name: e.target.value })} placeholder="Database name" className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <select value={newDb.db_type} onChange={(e) => setNewDb({ ...newDb, db_type: e.target.value })} className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="mysql">MySQL</option>
                  <option value="postgresql">PostgreSQL</option>
                </select>
                <button onClick={createDatabase} disabled={submitting || !newDb.db_name.trim()} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create
                </button>
              </div>
            </div>
            <div className="liquid-glass-card rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-border"><h3 className="text-base font-semibold">Databases ({databases.length})</h3></div>
              {databases.length === 0 ? (
                <div className="p-12 text-center"><Database className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" /><p className="text-sm text-muted-foreground">No databases yet. Create one above.</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                  <thead><tr className="border-b border-border">
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Name</th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Type</th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">User</th>
                    <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase">Size</th>
                    <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase"></th>
                  </tr></thead>
                  <tbody>{databases.map((db) => (
                    <tr key={db.id as string} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="p-4 text-sm font-mono">{db.db_name as string}</td>
                      <td className="p-4"><span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium uppercase">{db.db_type as string}</span></td>
                      <td className="p-4 text-sm font-mono">{db.db_user as string}</td>
                      <td className="p-4 text-sm text-right text-muted-foreground">{Number(db.size_mb || 0).toFixed(1)} MB</td>
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
                  <input type="text" value={newEmail.local_part} onChange={(e) => setNewEmail({ ...newEmail, local_part: e.target.value })} placeholder="name" className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@{(service.domain as string) || 'example.com'}</span>
                </div>
                <input type="text" value={newEmail.forward_to} onChange={(e) => setNewEmail({ ...newEmail, forward_to: e.target.value })} placeholder="Forward To (Optional)" className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <input type="password" value={newEmail.password} onChange={(e) => setNewEmail({ ...newEmail, password: e.target.value })} placeholder="Password" className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <input type="number" value={newEmail.quota} onChange={(e) => setNewEmail({ ...newEmail, quota: parseInt(e.target.value) || 1024 })} placeholder="Quota (MB)" className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <button onClick={createEmailAccount} disabled={submitting || !newEmail.local_part.trim()} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create
                </button>
              </div>
            </div>
            <div className="liquid-glass-card rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-border"><h3 className="text-base font-semibold">Email Accounts ({emailAccounts.length})</h3></div>
              {emailAccounts.length === 0 ? (
                <div className="p-12 text-center"><Mail className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" /><p className="text-sm text-muted-foreground">No email accounts yet. Create one above.</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                  <thead><tr className="border-b border-border">
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Email</th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Forward To</th>
                    <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase">Quota</th>
                    <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase">Used</th>
                    <th className="text-center p-4 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                    <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase"></th>
                  </tr></thead>
                  <tbody>{emailAccounts.map((em) => (
                    <tr key={em.id as string} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="p-4 text-sm font-medium">{em.local_part as string}@{em.domain as string}</td>
                      <td className="p-4 text-sm text-muted-foreground">{(em.forward_to as string) || '—'}</td>
                      <td className="p-4 text-sm text-right text-muted-foreground">{em.storage_quota_mb as number} MB</td>
                      <td className="p-4 text-sm text-right text-muted-foreground">{Number(em.storage_used_mb || 0).toFixed(1)} MB</td>
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
            <div className="liquid-glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold">SSL Certificates</h3>
                  <p className="text-sm text-muted-foreground mt-1">Issue a free Let&apos;s Encrypt certificate for your domain.</p>
                </div>
                <button onClick={issueSsl} disabled={submitting} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />} Issue Free SSL
                </button>
              </div>
            </div>
            {sslCerts.length === 0 ? (
              <div className="liquid-glass-card rounded-2xl p-12 text-center">
                <Lock className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No SSL certificates yet. Issue a free one above.</p>
              </div>
            ) : (
              <div className="space-y-3">{sslCerts.map((cert) => (
                <div key={cert.id as string} className="liquid-glass-card rounded-2xl p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 border border-green-500/20"><Lock className="h-5 w-5 text-green-500" /></div>
                      <div>
                        <p className="text-sm font-semibold">{cert.domain as string}</p>
                        <p className="text-xs text-muted-foreground">{cert.issuer as string} · {cert.cert_type as string}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">{cert.status as string}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-border text-sm">
                    <div><p className="text-xs text-muted-foreground">Valid From</p><p className="text-xs">{cert.valid_from ? new Date(cert.valid_from as string).toLocaleDateString() : '—'}</p></div>
                    <div><p className="text-xs text-muted-foreground">Valid Until</p><p className="text-xs">{cert.valid_until ? new Date(cert.valid_until as string).toLocaleDateString() : '—'}</p></div>
                    <div><p className="text-xs text-muted-foreground">Auto-Renew</p><p className="text-xs">{cert.auto_renew ? 'Enabled' : 'Disabled'}</p></div>
                  </div>
                </div>
              ))}</div>
            )}
          </div>
        )}

        {activeTab === 'backups' && (
          <div className="space-y-6">
            <div className="liquid-glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold">Backup Snapshots</h3>
                  <p className="text-sm text-muted-foreground mt-1">Create on-demand backups of your hosting service.</p>
                </div>
                <button onClick={createBackup} disabled={submitting} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Create Backup
                </button>
              </div>
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
                      <p className="text-xs text-muted-foreground">{(bk.size_mb as number).toFixed(1)} MB · {new Date(bk.created_at as string).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">{bk.status as string}</span>
                    <button title="Download not available — backups are stored on-server" className="p-2 rounded-lg hover:bg-muted text-muted-foreground cursor-not-allowed opacity-50" disabled>
                      <Download className="h-4 w-4" />
                    </button>
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
            <h3 className="text-lg font-semibold mb-2">File Manager</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">Access your files via the control panel. Upload, edit, and manage your website files with our web-based file manager.</p>
            {service.control_panel_url ? (
              <a href={service.control_panel_url as string} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm">
                Open File Manager <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">File manager will be available once your service is provisioned.</p>
            )}
          </div>
        )}

      {/* Action Result Toast */}
      {actionResult && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl border shadow-lg text-sm font-medium flex items-center gap-2 animate-in slide-in-from-bottom-4 ${
          actionResult.ok ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {actionResult.ok ? <Check className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
          {actionResult.message}
          <button onClick={() => setActionResult(null)} className="ml-2 opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Confirmation Modal for Server Actions (prevents CSRF) */}
      {pendingAction && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="v4-panel rounded-2xl p-8 max-w-md w-full mx-4 border-hairline shadow-2xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warn/10 border border-warn/20 mx-auto mb-4">
              <Shield className="h-7 w-7 text-warn" />
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">Confirm Server Action</h3>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Are you sure you want to <strong className="text-foreground">{pendingAction}</strong> this server?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPendingAction(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleServerAction(pendingAction)}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
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
