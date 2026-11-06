'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Globe, Plus, ShieldCheck, RefreshCw, Trash2, Edit2, Check,
  Search, Shield, ArrowUpRight, CheckCircle2, Lock
} from 'lucide-react';
import { PanelCard } from '@/components/ui/panel-card';
import { ActionConfirmationModal } from '@/components/portal/ActionConfirmationModal';
import { ActionExecutionResult } from '@/lib/action-gateway/types';

const INITIAL_RECORDS = [
  { id: 'r-1', type: 'A', name: '@', content: '103.21.244.10', ttl: 'Auto', proxied: true },
  { id: 'r-2', type: 'CNAME', name: 'www', content: 'elsxglobal.cloud', ttl: 'Auto', proxied: true },
  { id: 'r-3', type: 'CNAME', name: 'api', content: 'api-gateway-proxy.vaulthost.workers.dev', ttl: 'Auto', proxied: true },
  { id: 'r-4', type: 'MX', name: '@', content: 'mail.titan.email (Priority 10)', ttl: '3600', proxied: false },
  { id: 'r-5', type: 'TXT', name: '@', content: 'v=spf1 include:spf.titan.email ~all', ttl: 'Auto', proxied: false },
];

export default function DNSManagementPage() {
  const [selectedDomain, setSelectedDomain] = useState('elsxglobal.cloud');
  const [records, setRecords] = useState(INITIAL_RECORDS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newType, setNewType] = useState('A');
  const [newName, setNewName] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newProxied, setNewProxied] = useState(true);
  const [dnssecEnabled, setDnssecEnabled] = useState(true);
  const [gatewayModalOpen, setGatewayModalOpen] = useState(false);
  const [gatewayResult, setGatewayResult] = useState<ActionExecutionResult | null>(null);
  const [pendingRecord, setPendingRecord] = useState<any>(null);

  // Sync records from real API
  useEffect(() => {
    fetch('/api/cloud/dns')
      .then(res => res.json())
      .then(data => {
        if (data.records && Array.isArray(data.records) && data.records.length > 0) {
          const mapped = data.records.map((r: any) => ({
            id: r.id,
            type: r.type,
            name: r.name,
            content: r.content,
            ttl: r.ttl ? `${r.ttl}s` : 'Auto',
            proxied: Boolean(r.proxied),
          }));
          setRecords(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newContent.trim()) return;

    const newRec = {
      id: `r-${Date.now()}`,
      type: newType,
      name: newName,
      content: newContent,
      ttl: 'Auto',
      proxied: newProxied
    };

    setPendingRecord(newRec);

    try {
      const intentId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'a0000000-0000-4000-8000-000000000001';
      const intent = {
        intentId,
        actor: {
          id: 'usr-client',
          type: 'user' as const,
          tenantId: 'tenant-default',
          roles: ['tenant_admin'],
        },
        targetService: 'dns' as const,
        actionVerb: 'create',
        resourceUri: `vaulthost://tenants/tenant-default/dns/${selectedDomain}/${newType}/${newName}`,
        parameters: { domain: selectedDomain, type: newType, name: newName, content: newContent, proxied: newProxied },
        idempotencyKey: `idem-${Date.now()}-${Math.random().toString(36).substring(2)}`,
        createdAt: new Date().toISOString(),
      };

      const res = await fetch('/api/action-gateway/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(intent),
      });

      const data: ActionExecutionResult = await res.json();
      setGatewayResult(data);

      if (data.status === 'executed') {
        setRecords([newRec, ...records]);
        setShowAddModal(false);
        setNewName('');
        setNewContent('');
      } else {
        setGatewayModalOpen(true);
      }
    } catch {
      setRecords([newRec, ...records]);
      setShowAddModal(false);
      setNewName('');
      setNewContent('');
    }
  };

  const handleConfirmTier1 = async (confirmationToken: string) => {
    if (!pendingRecord) return;
    try {
      const intentId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'a0000000-0000-4000-8000-000000000002';
      const res = await fetch('/api/action-gateway/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: {
            intentId,
            actor: { id: 'usr-client', type: 'user', tenantId: 'tenant-default', roles: ['tenant_admin'] },
            targetService: 'dns',
            actionVerb: 'create',
            resourceUri: `vaulthost://tenants/tenant-default/dns/${selectedDomain}/${pendingRecord.type}/${pendingRecord.name}`,
            parameters: pendingRecord,
            idempotencyKey: `idem-c-${Date.now()}-${Math.random().toString(36).substring(2)}`,
            createdAt: new Date().toISOString(),
          },
          options: { confirmationToken },
        }),
      });
      const data = await res.json();
      if (data.status === 'executed') {
        setRecords([pendingRecord, ...records]);
        setShowAddModal(false);
        setNewName('');
        setNewContent('');
        setPendingRecord(null);
      }
    } catch {
      setRecords([pendingRecord, ...records]);
      setShowAddModal(false);
    }
  };

  const handleVerifyTier2 = async (stepUpToken: string) => {
    if (!pendingRecord) return;
    try {
      const intentId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'a0000000-0000-4000-8000-000000000003';
      const res = await fetch('/api/action-gateway/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: {
            intentId,
            actor: { id: 'usr-client', type: 'user', tenantId: 'tenant-default', roles: ['tenant_admin'] },
            targetService: 'dns',
            actionVerb: 'create',
            resourceUri: `vaulthost://tenants/tenant-default/dns/${selectedDomain}/${pendingRecord.type}/${pendingRecord.name}`,
            parameters: pendingRecord,
            idempotencyKey: `idem-v-${Date.now()}-${Math.random().toString(36).substring(2)}`,
            createdAt: new Date().toISOString(),
          },
          options: { stepUpAuthToken: stepUpToken },
        }),
      });
      const data = await res.json();
      if (data.status === 'executed') {
        setRecords([pendingRecord, ...records]);
        setShowAddModal(false);
        setNewName('');
        setNewContent('');
        setPendingRecord(null);
      }
    } catch {
      setRecords([pendingRecord, ...records]);
      setShowAddModal(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      await fetch('/api/cloud/dns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_record',
          record: { id },
        }),
      });
    } catch {}
    setRecords(records.filter(r => r.id !== id));
  };

  const toggleProxy = (id: string) => {
    setRecords(records.map(r => r.id === id ? { ...r, proxied: !r.proxied } : r));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-signal font-mono">VaultHost Cloud</span>
            <span className="text-text-muted-v4 text-xs">/</span>
            <span className="text-xs text-text-primary-v4 font-medium">Anycast DNS &amp; Domains</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary-v4 mt-1 flex items-center gap-2.5">
            <Globe className="h-6 w-6 text-signal" /> Authoritative DNS &amp; Traffic Proxy
          </h1>
          <p className="text-xs text-text-secondary-v4 mt-0.5">
            Global Anycast resolution in &lt;11ms with automated DDoS mitigation and DNSSEC signing.
          </p>
        </div>
      </div>

      {/* Domain Bar & DNSSEC Status */}
      <div className="p-4 rounded-2xl bg-ink-surface border border-hairline flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal/10 text-signal border border-signal/20">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-text-primary-v4 font-mono">{selectedDomain}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-good/15 text-good border border-good/20 font-mono">
                Active Zone
              </span>
            </div>
            <p className="text-xs text-text-muted-v4 mt-0.5">
              Assigned Nameservers: <code className="text-signal">ns1.vaulthost.net</code>, <code className="text-signal">ns2.vaulthost.net</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-ink-surface-2 px-3 py-1.5 rounded-xl border border-hairline text-xs">
            <ShieldCheck className={`h-4 w-4 ${dnssecEnabled ? 'text-good' : 'text-text-muted-v4'}`} />
            <span className="text-text-secondary-v4">DNSSEC:</span>
            <button
              onClick={() => setDnssecEnabled(!dnssecEnabled)}
              className={`font-semibold font-mono ${dnssecEnabled ? 'text-good' : 'text-text-muted-v4'}`}
            >
              {dnssecEnabled ? 'PROTECTED' : 'DISABLED'}
            </button>
          </div>
        </div>
      </div>

      {/* DNS Records Table */}
      <div className="v4-panel rounded-2xl border border-hairline bg-ink-surface overflow-hidden">
        <div className="p-4 border-b border-hairline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-text-primary-v4 block">DNS Management Records ({records.length})</span>
            <span className="text-[11px] text-text-muted-v4 font-mono mt-0.5 block">Automatic SSL Included</span>
          </div>
          
          <button
            onClick={() => setShowAddModal(!showAddModal)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-btn v4-btn-primary text-xs font-semibold shadow-glow"
          >
            {showAddModal ? 'Cancel' : <><Plus className="h-3.5 w-3.5" /> Add Record</>}
          </button>
        </div>

        {/* Inline Add Record Form */}
        {showAddModal && (
          <div className="p-5 border-b border-hairline bg-ink-surface-2/50">
            <h3 className="text-sm font-bold text-text-primary-v4 flex items-center gap-2 mb-3">
              <Plus className="h-4 w-4 text-signal" /> Add New DNS Record
            </h3>
            
            <form onSubmit={handleAddRecord} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-text-secondary-v4 block mb-1 uppercase tracking-wider">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-ink-surface border border-hairline rounded-xl px-2.5 py-2 text-xs text-text-primary-v4 outline-none focus:border-signal"
                  >
                    <option value="A">A</option>
                    <option value="AAAA">AAAA</option>
                    <option value="CNAME">CNAME</option>
                    <option value="MX">MX</option>
                    <option value="TXT">TXT</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="text-[11px] font-semibold text-text-secondary-v4 block mb-1 uppercase tracking-wider">Name</label>
                  <input
                    type="text"
                    placeholder="@ or subdomain"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    className="w-full bg-ink-surface border border-hairline rounded-xl px-3 py-2 text-xs text-text-primary-v4 outline-none focus:border-signal"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-text-secondary-v4 block mb-1 uppercase tracking-wider">Target / Content</label>
                <input
                  type="text"
                  placeholder="e.g. 103.21.244.10"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  required
                  className="w-full bg-ink-surface border border-hairline rounded-xl px-3 py-2 text-xs text-text-primary-v4 outline-none focus:border-signal"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="proxiedCheck"
                    checked={newProxied}
                    onChange={(e) => setNewProxied(e.target.checked)}
                    className="rounded accent-signal"
                  />
                  <label htmlFor="proxiedCheck" className="text-xs text-text-secondary-v4 cursor-pointer hover:text-text-primary-v4">
                    Proxy traffic through VaultHost (DDoS protection & WAF enabled)
                  </label>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-btn text-xs text-text-muted-v4 hover:text-text-primary-v4 flex-1 sm:flex-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-btn v4-btn-primary text-xs font-semibold shadow-glow flex-1 sm:flex-none"
                  >
                    Save Record
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        <div className="overflow-x-auto terminal-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-hairline bg-ink-surface-2 text-text-muted-v4 font-mono text-[11px]">
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Content / Target</th>
                <th className="py-3 px-4">Proxy Status</th>
                <th className="py-3 px-4">TTL</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-ink-surface-2/60 transition-colors font-mono">
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded font-bold text-signal bg-signal/10 border border-signal/20 text-[10px]">
                      {r.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-text-primary-v4">{r.name}</td>
                  <td className="py-3 px-4 text-text-secondary-v4 max-w-xs truncate">{r.content}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleProxy(r.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                        r.proxied
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-ink-surface-2 text-text-muted-v4 border border-hairline'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${r.proxied ? 'bg-amber-400 animate-pulse' : 'bg-text-muted-v4'}`} />
                      {r.proxied ? 'Proxied (Orange Cloud)' : 'DNS Only'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-text-muted-v4">{r.ttl}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDeleteRecord(r.id)}
                      className="p-1.5 rounded hover:text-red-400 text-text-muted-v4 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Zone Analytics & DNSSEC */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 v4-panel p-5 border border-hairline rounded-2xl bg-ink-surface">
          <h3 className="text-sm font-bold text-text-primary-v4 mb-4 flex items-center gap-2">
            <Globe className="h-4 w-4 text-signal" /> Zone Analytics (24h)
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <span className="text-[11px] text-text-muted-v4 uppercase tracking-wider block mb-1">Total Queries</span>
              <span className="text-xl font-bold font-mono text-text-primary-v4">892.4K</span>
            </div>
            <div>
              <span className="text-[11px] text-text-muted-v4 uppercase tracking-wider block mb-1">Cache Hit Rate</span>
              <span className="text-xl font-bold font-mono text-signal">98.2%</span>
            </div>
            <div>
              <span className="text-[11px] text-text-muted-v4 uppercase tracking-wider block mb-1">Avg Response</span>
              <span className="text-xl font-bold font-mono text-green-400">8ms</span>
            </div>
          </div>
          <div>
            <span className="text-[11px] text-text-muted-v4 uppercase tracking-wider block mb-2">Top Queried Records</span>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-text-secondary-v4">elsxglobal.cloud (A)</span>
                <span className="text-text-primary-v4">412K</span>
              </div>
              <div className="w-full bg-ink-surface-2 h-1.5 rounded-full overflow-hidden mb-3">
                <div className="bg-signal h-full w-[46%]"></div>
              </div>
              
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-text-secondary-v4">api.elsxglobal.cloud (CNAME)</span>
                <span className="text-text-primary-v4">380K</span>
              </div>
              <div className="w-full bg-ink-surface-2 h-1.5 rounded-full overflow-hidden">
                <div className="bg-signal h-full w-[42%]"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="v4-panel p-5 border border-hairline rounded-2xl bg-ink-surface flex flex-col">
          <h3 className="text-sm font-bold text-text-primary-v4 mb-4 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-signal" /> DNSSEC Status
          </h3>
          
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-text-secondary-v4">Status</span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${dnssecEnabled ? 'bg-green-400/10 text-green-400 border border-green-400/20' : 'bg-red-400/10 text-red-400 border border-red-400/20'}`}>
                {dnssecEnabled ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
            
            {dnssecEnabled && (
              <div className="space-y-3 p-3 bg-ink-surface-2 rounded-xl border border-hairline font-mono text-[10px] break-all">
                <div>
                  <span className="text-text-muted-v4 block mb-0.5">Key Tag</span>
                  <span className="text-text-primary-v4">34291</span>
                </div>
                <div>
                  <span className="text-text-muted-v4 block mb-0.5">Algorithm</span>
                  <span className="text-text-primary-v4">13 (ECDSA Curve P-256 with SHA-256)</span>
                </div>
                <div>
                  <span className="text-text-muted-v4 block mb-0.5">DS Record</span>
                  <span className="text-text-primary-v4">34291 13 2 4E7B...</span>
                </div>
              </div>
            )}
            
            <p className="text-[10px] text-text-muted-v4 mt-4 text-center">
              Protects against DNS spoofing and cache poisoning.
            </p>
          </div>
        </div>
      </div>

      <ActionConfirmationModal
        isOpen={gatewayModalOpen}
        onClose={() => setGatewayModalOpen(false)}
        result={gatewayResult}
        onConfirmTier1={handleConfirmTier1}
        onVerifyTier2={handleVerifyTier2}
      />
    </div>
  );
}
