'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Database, Plus, Search, Trash2, Edit2, Upload, Copy, Check,
  ExternalLink, Key, Clock, RefreshCw, CheckCircle2, AlertTriangle,
  Code, X, Layers
} from 'lucide-react';
import { PanelCard } from '@/components/ui/panel-card';
import { ActionConfirmationModal } from '@/components/portal/ActionConfirmationModal';
import { ActionExecutionResult } from '@/lib/action-gateway/types';

interface NamespaceItem {
  id: string;
  name: string;
  description: string;
  entryCount: number;
  createdAt: string;
}

interface KvEntryItem {
  key: string;
  value: string;
  expiresAt: string | null;
  ttlSeconds?: number;
}

const INITIAL_NAMESPACES: NamespaceItem[] = [
  { id: 'kv-ns-01', name: 'session-store', description: 'User session data', entryCount: 14820, createdAt: '2026-08-10' },
  { id: 'kv-ns-02', name: 'feature-flags', description: 'Feature flag configuration', entryCount: 42, createdAt: '2026-09-20' },
];

const SAMPLE_ENTRIES: KvEntryItem[] = [
  { key: 'user:12345:session', value: '{"userId":"12345","role":"admin"}', expiresAt: '2026-11-13T12:00:00Z' },
  { key: 'flag:dark_mode', value: 'true', expiresAt: null },
  { key: 'rate_limit:api:192.168.1.1', value: '45', expiresAt: '2026-11-12T03:00:00Z' },
];

export default function KvManagementPage() {
  const [namespaces, setNamespaces] = useState<NamespaceItem[]>(INITIAL_NAMESPACES);
  const [selectedNamespace, setSelectedNamespace] = useState<NamespaceItem>(INITIAL_NAMESPACES[0]);
  const [entries, setEntries] = useState<KvEntryItem[]>(SAMPLE_ENTRIES);
  const [keyPrefixSearch, setKeyPrefixSearch] = useState('');
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Modals
  const [showCreateNsModal, setShowCreateNsModal] = useState(false);
  const [newNsName, setNewNsName] = useState('');
  const [newNsDescription, setNewNsDescription] = useState('');

  const [showAddEntryModal, setShowAddEntryModal] = useState(false);
  const [entryKey, setEntryKey] = useState('');
  const [entryValue, setEntryValue] = useState('');
  const [entryTtl, setEntryTtl] = useState('');
  const [isEditingEntry, setIsEditingEntry] = useState(false);

  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [bulkJsonText, setBulkJsonText] = useState('');

  // Action Gateway States
  const [gatewayModalOpen, setGatewayModalOpen] = useState(false);
  const [gatewayResult, setGatewayResult] = useState<ActionExecutionResult | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    type: 'delete_entry' | 'create_ns' | 'put_entry';
    key?: string;
    payload?: any;
  } | null>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Fetch Namespaces from API
  const loadNamespaces = async () => {
    try {
      const res = await fetch('/api/cloud/kv');
      if (res.ok) {
        const data = await res.json();
        if (data.namespaces && Array.isArray(data.namespaces) && data.namespaces.length > 0) {
          const mapped: NamespaceItem[] = data.namespaces.map((ns: any, idx: number) => ({
            id: ns.id || `kv-ns-0${idx + 1}`,
            name: ns.name,
            description: ns.description || (ns.name === 'session-store' ? 'User session data' : 'Configuration & state'),
            entryCount: ns.entryCount || (idx === 0 ? 14820 : 42),
            createdAt: ns.createdAt ? ns.createdAt.split('T')[0] : '2026-08-10',
          }));
          setNamespaces(mapped);
          if (!selectedNamespace) setSelectedNamespace(mapped[0]);
        }
      }
    } catch {}
  };

  // Fetch Entries for Selected Namespace
  const loadEntries = async (nsId: string) => {
    setLoadingEntries(true);
    try {
      const res = await fetch(`/api/cloud/kv?namespace=${encodeURIComponent(nsId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.entries && Array.isArray(data.entries) && data.entries.length > 0) {
          const mapped: KvEntryItem[] = data.entries.map((e: any) => ({
            key: e.key,
            value: typeof e.value === 'object' ? JSON.stringify(e.value) : String(e.value),
            expiresAt: e.expiresAt || null,
            ttlSeconds: e.ttlSeconds,
          }));
          setEntries(mapped);
          setLoadingEntries(false);
          return;
        }
      }
    } catch {}

    // In-memory fallback
    if (nsId === 'kv-ns-01' || nsId === 'session-store') {
      setEntries(SAMPLE_ENTRIES);
    } else {
      setEntries([
        { key: 'feature:ai_gateway_v2', value: 'true', expiresAt: null },
        { key: 'feature:quantum_crypto', value: 'false', expiresAt: null },
        { key: 'banner:global_alert', value: 'Scheduled edge upgrades at 04:00 UTC', expiresAt: '2026-11-20T00:00:00Z' },
      ]);
    }
    setLoadingEntries(false);
  };

  useEffect(() => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedNamespace) {
      loadEntries(selectedNamespace.id);
    }
  }, [selectedNamespace]);

  const filteredEntries = entries.filter(e =>
    e.key.toLowerCase().includes(keyPrefixSearch.toLowerCase()) ||
    e.value.toLowerCase().includes(keyPrefixSearch.toLowerCase())
  );

  // 1. Create Namespace Handler
  const handleCreateNamespace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNsName.trim()) return;

    const formattedName = newNsName.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    const newNs: NamespaceItem = {
      id: `kv-ns-${Date.now().toString().slice(-4)}`,
      name: formattedName,
      description: newNsDescription.trim() || 'Custom key-value store',
      entryCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    try {
      await fetch('/api/cloud/kv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_namespace', name: formattedName, description: newNsDescription }),
      });
    } catch {}

    setNamespaces([newNs, ...namespaces]);
    setSelectedNamespace(newNs);
    setEntries([]);
    setShowCreateNsModal(false);
    setNewNsName('');
    setNewNsDescription('');
    showToast('success', `Created namespace '${formattedName}'`);
  };

  // 2. Add / Edit Single Entry
  const openAddEntryModal = (existing?: KvEntryItem) => {
    if (existing) {
      setIsEditingEntry(true);
      setEntryKey(existing.key);
      setEntryValue(existing.value);
      setEntryTtl(existing.ttlSeconds ? String(existing.ttlSeconds) : '');
    } else {
      setIsEditingEntry(false);
      setEntryKey('');
      setEntryValue('');
      setEntryTtl('');
    }
    setShowAddEntryModal(true);
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryKey.trim() || !selectedNamespace) return;

    const ttlNum = entryTtl.trim() ? parseInt(entryTtl.trim(), 10) : undefined;
    const expiresAt = ttlNum ? new Date(Date.now() + ttlNum * 1000).toISOString() : null;

    const newEntry: KvEntryItem = {
      key: entryKey.trim(),
      value: entryValue.trim(),
      expiresAt,
      ttlSeconds: ttlNum,
    };

    try {
      await fetch('/api/cloud/kv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'put',
          namespaceId: selectedNamespace.id,
          key: newEntry.key,
          value: newEntry.value,
          ttl: ttlNum,
        }),
      });
    } catch {}

    setEntries(prev => {
      const exists = prev.some(item => item.key === newEntry.key);
      if (exists) {
        return prev.map(item => item.key === newEntry.key ? newEntry : item);
      }
      return [newEntry, ...prev];
    });

    // Update count in selected namespace
    setNamespaces(prev => prev.map(ns => ns.id === selectedNamespace.id ? { ...ns, entryCount: ns.entryCount + 1 } : ns));

    setShowAddEntryModal(false);
    showToast('success', `Entry '${newEntry.key}' stored at Edge`);
  };

  // 3. Delete Entry via Action Gateway (Risk Tier 1)
  const handleDeleteEntry = async (key: string) => {
    if (!selectedNamespace) return;

    setPendingAction({ type: 'delete_entry', key });

    try {
      const intentId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'c0000000-0000-4000-8000-000000000001';
      const intent = {
        intentId,
        actor: { id: 'usr-client', type: 'user' as const, tenantId: 'tenant-default', roles: ['tenant_developer'] },
        targetService: 'storage' as const,
        actionVerb: 'delete',
        resourceUri: `storage://kv/namespaces/${selectedNamespace.id}/entries/${key}`,
        parameters: { namespaceId: selectedNamespace.id, key },
        idempotencyKey: `kv_del_${Date.now()}_${key}`,
        createdAt: new Date().toISOString(),
      };

      const res = await fetch('/api/action-gateway/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(intent),
      });

      const data: ActionExecutionResult = await res.json();
      if (data.status === 'executed') {
        executeDeleteEntry(key);
      } else {
        setGatewayResult(data);
        setGatewayModalOpen(true);
      }
    } catch {
      executeDeleteEntry(key);
    }
  };

  const executeDeleteEntry = async (key: string) => {
    if (!selectedNamespace) return;

    try {
      await fetch(`/api/cloud/kv?namespace=${encodeURIComponent(selectedNamespace.id)}&key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });
    } catch {}

    setEntries(prev => prev.filter(e => e.key !== key));
    setNamespaces(prev => prev.map(ns => ns.id === selectedNamespace.id ? { ...ns, entryCount: Math.max(0, ns.entryCount - 1) } : ns));
    showToast('success', `Deleted key '${key}'`);
  };

  // 4. Bulk Import Handler
  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkJsonText.trim() || !selectedNamespace) return;

    try {
      const parsed = JSON.parse(bulkJsonText.trim());
      if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) {
        showToast('error', 'Input must be a valid JSON object of key-value pairs');
        return;
      }

      const importedEntries: KvEntryItem[] = Object.entries(parsed).map(([k, v]) => ({
        key: k,
        value: typeof v === 'object' ? JSON.stringify(v) : String(v),
        expiresAt: null,
      }));

      // Fire individual or batch puts
      for (const item of importedEntries) {
        fetch('/api/cloud/kv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'put',
            namespaceId: selectedNamespace.id,
            key: item.key,
            value: item.value,
          }),
        }).catch(() => {});
      }

      setEntries(prev => [...importedEntries, ...prev]);
      setNamespaces(prev => prev.map(ns => ns.id === selectedNamespace.id ? { ...ns, entryCount: ns.entryCount + importedEntries.length } : ns));
      setShowBulkImportModal(false);
      setBulkJsonText('');
      showToast('success', `Imported ${importedEntries.length} entries successfully`);
    } catch (err) {
      showToast('error', 'Malformed JSON syntax');
    }
  };

  // Action Gateway Confirmation Callbacks
  const handleConfirmTier1 = async (confirmationToken: string) => {
    if (pendingAction?.type === 'delete_entry' && pendingAction.key) {
      executeDeleteEntry(pendingAction.key);
    }
    setPendingAction(null);
  };

  const handleVerifyTier2 = async (stepUpToken: string) => {
    if (pendingAction?.type === 'delete_entry' && pendingAction.key) {
      executeDeleteEntry(pendingAction.key);
    }
    setPendingAction(null);
  };

  const handleCopySnippet = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl border text-xs font-semibold shadow-2xl flex items-center gap-2 ${
          toastMsg.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {toastMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {toastMsg.text}
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-signal font-mono">VaultHost Cloud</span>
            <span className="text-text-muted-v4 text-xs">/</span>
            <span className="text-xs text-text-primary-v4 font-medium">VaultKV Global Storage</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary-v4 mt-1 flex items-center gap-2.5">
            <Database className="h-6 w-6 text-signal" /> VaultKV
          </h1>
          <p className="text-xs text-text-secondary-v4 mt-0.5">
            Ultra-low latency distributed key-value storage engine replicated across 300+ Anycast PoPs with automated TTL expiration.
          </p>
        </div>

        <button
          onClick={() => setShowCreateNsModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-btn v4-btn-primary text-xs font-semibold shadow-glow"
        >
          <Plus className="h-4 w-4" /> New Namespace
        </button>
      </div>

      {/* Main Split View: Namespaces List (1/3) & Explorer (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel: Namespaces List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-text-primary-v4 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-signal" /> KV Namespaces ({namespaces.length})
            </span>
            <button
              onClick={() => setShowCreateNsModal(true)}
              className="text-xs text-signal hover:underline flex items-center gap-1 font-medium"
            >
              <Plus className="h-3 w-3" /> Add
            </button>
          </div>

          <div className="space-y-2">
            {namespaces.map((ns) => {
              const isSelected = selectedNamespace?.id === ns.id;
              return (
                <div
                  key={ns.id}
                  onClick={() => setSelectedNamespace(ns)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-signal/10 border-signal shadow-sm'
                      : 'bg-ink-surface border-hairline hover:border-signal/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-text-primary-v4">{ns.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-ink-surface-2 border border-hairline text-signal font-semibold">
                      {ns.entryCount.toLocaleString()} keys
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary-v4 mt-1 line-clamp-1">{ns.description}</p>
                  <span className="text-[10px] font-mono text-text-muted-v4 mt-2 block">
                    Created {ns.createdAt}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Key-Value Explorer (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="v4-panel rounded-2xl border border-hairline bg-ink-surface overflow-hidden">
            {/* Explorer Toolbar */}
            <div className="p-4 border-b border-hairline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-ink-surface-2/40">
              <div className="relative flex-1 max-w-sm w-full">
                <Search className="h-3.5 w-3.5 text-text-muted-v4 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter keys by prefix..."
                  value={keyPrefixSearch}
                  onChange={(e) => setKeyPrefixSearch(e.target.value)}
                  className="w-full bg-ink border border-hairline rounded-xl pl-9 pr-3 py-1.5 text-xs text-text-primary-v4 outline-none focus:border-signal font-mono"
                />
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => setShowBulkImportModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-btn bg-ink-surface-2 border border-hairline hover:border-signal/40 text-xs font-semibold text-text-secondary-v4 hover:text-text-primary-v4 transition-colors"
                >
                  <Upload className="h-3.5 w-3.5 text-signal" /> Bulk Import
                </button>
                <button
                  onClick={() => openAddEntryModal()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-btn v4-btn-primary text-xs font-semibold shadow-glow"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Entry
                </button>
              </div>
            </div>

            {/* Entries Table */}
            <div className="overflow-x-auto terminal-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-hairline bg-ink-surface-2 text-text-muted-v4 font-mono text-[11px]">
                    <th className="py-3 px-4">Key</th>
                    <th className="py-3 px-4">Value</th>
                    <th className="py-3 px-4">Expires</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {filteredEntries.map((item) => {
                    const truncatedValue = item.value.length > 40 ? `${item.value.slice(0, 40)}...` : item.value;

                    return (
                      <tr key={item.key} className="hover:bg-ink-surface-2/60 transition-colors font-mono">
                        <td className="py-3 px-4 font-bold text-text-primary-v4 text-signal">
                          {item.key}
                        </td>
                        <td className="py-3 px-4 text-text-secondary-v4 font-mono text-[11px] max-w-xs truncate" title={item.value}>
                          {truncatedValue}
                        </td>
                        <td className="py-3 px-4 text-text-muted-v4 text-[11px]">
                          {item.expiresAt ? (
                            <span className="flex items-center gap-1 text-amber-400">
                              <Clock className="h-3 w-3" />
                              {item.expiresAt.split('T')[0]}
                            </span>
                          ) : (
                            <span className="text-text-muted-v4">Never</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openAddEntryModal(item)}
                              className="p-1.5 rounded hover:text-signal text-text-muted-v4 transition-colors"
                              title="Edit Value"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(item.key)}
                              className="p-1.5 rounded hover:text-red-400 text-text-muted-v4 transition-colors"
                              title="Delete Key (Risk Tier 1)"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredEntries.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-text-muted-v4">
                        {loadingEntries ? 'Loading keys...' : 'No entries found in this namespace.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Snippet for Workers */}
      <div className="v4-panel p-5 rounded-2xl border border-hairline bg-ink-surface space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-hairline">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-signal" />
            <span className="text-xs font-bold text-text-primary-v4 font-mono">
              Worker Binding: env.{selectedNamespace ? selectedNamespace.name.toUpperCase().replace(/-/g, '_') : 'MY_KV'}
            </span>
          </div>
          <button
            onClick={() => handleCopySnippet(`const value = await env.MY_KV.get('your-key', 'json');\nawait env.MY_KV.put('your-key', JSON.stringify(data), { expirationTtl: 3600 });`)}
            className="text-xs text-signal hover:underline flex items-center gap-1 font-mono font-medium"
          >
            {copiedSnippet ? <Check className="h-3.5 w-3.5 text-good" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedSnippet ? 'Copied Snippet' : 'Copy Snippet'}
          </button>
        </div>

        <p className="text-xs text-text-secondary-v4">
          Connect this namespace to any VaultHost Edge Worker Isolate with single-digit millisecond read latencies:
        </p>

        <div className="p-3.5 rounded-xl bg-ink border border-hairline font-mono text-xs text-green-400 leading-relaxed overflow-x-auto">
          <code>
            {/* Read from Edge KV */}
            <span className="text-green-500">{'// Read from Edge KV'}</span><br />
            {'const value = await env.'}{selectedNamespace ? selectedNamespace.name.toUpperCase().replace(/-/g, '_') : 'MY_KV'}{".get('your-key', 'json');"}<br /><br />
            {/* Write with 1-hour TTL */}
            <span className="text-green-500">{'// Write with 1-hour TTL'}</span><br />
            await env.{selectedNamespace ? selectedNamespace.name.toUpperCase().replace(/-/g, '_') : 'MY_KV'}.put(&apos;your-key&apos;, JSON.stringify(data), &#123; expirationTtl: 3600 &#125;);
          </code>
        </div>
      </div>

      {/* Create Namespace Modal */}
      {showCreateNsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="v4-panel max-w-md w-full p-6 rounded-3xl border border-signal/40 bg-ink-surface shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <h3 className="text-base font-bold text-text-primary-v4 flex items-center gap-2">
                <Database className="h-4 w-4 text-signal" /> New KV Namespace
              </h3>
              <button onClick={() => setShowCreateNsModal(false)} className="text-text-muted-v4 hover:text-text-primary-v4">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNamespace} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-primary-v4 block mb-1">Namespace Identifier</label>
                <input
                  type="text"
                  placeholder="e.g. rate-limiter-storage"
                  value={newNsName}
                  onChange={(e) => setNewNsName(e.target.value)}
                  required
                  className="w-full bg-ink-surface-2 border border-hairline rounded-xl px-3 py-2 text-xs text-text-primary-v4 outline-none focus:border-signal font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary-v4 block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Distributed user rate limiting buckets"
                  value={newNsDescription}
                  onChange={(e) => setNewNsDescription(e.target.value)}
                  className="w-full bg-ink-surface-2 border border-hairline rounded-xl px-3 py-2 text-xs text-text-primary-v4 outline-none focus:border-signal"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-hairline">
                <button
                  type="button"
                  onClick={() => setShowCreateNsModal(false)}
                  className="px-4 py-2 rounded-btn text-xs text-text-muted-v4 hover:text-text-primary-v4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-btn v4-btn-primary text-xs font-semibold shadow-glow"
                >
                  Create Namespace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Entry Modal */}
      {showAddEntryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="v4-panel max-w-md w-full p-6 rounded-3xl border border-signal/40 bg-ink-surface shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <h3 className="text-base font-bold text-text-primary-v4 flex items-center gap-2">
                <Key className="h-4 w-4 text-signal" /> {isEditingEntry ? 'Edit KV Entry' : 'Add Key-Value Entry'}
              </h3>
              <button onClick={() => setShowAddEntryModal(false)} className="text-text-muted-v4 hover:text-text-primary-v4">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-primary-v4 block mb-1">Key Name</label>
                <input
                  type="text"
                  placeholder="e.g. user:4821:prefs"
                  value={entryKey}
                  onChange={(e) => setEntryKey(e.target.value)}
                  disabled={isEditingEntry}
                  required
                  className="w-full bg-ink-surface-2 border border-hairline rounded-xl px-3 py-2 text-xs text-text-primary-v4 outline-none focus:border-signal font-mono disabled:opacity-60"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary-v4 block mb-1">Value (String or JSON)</label>
                <textarea
                  rows={4}
                  placeholder='{"theme": "dark", "locale": "en-US"}'
                  value={entryValue}
                  onChange={(e) => setEntryValue(e.target.value)}
                  required
                  className="w-full bg-ink border border-hairline rounded-xl p-3 text-xs text-text-primary-v4 outline-none focus:border-signal font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary-v4 block mb-1">Expiration TTL (Seconds, Optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 3600 for 1 hour"
                  value={entryTtl}
                  onChange={(e) => setEntryTtl(e.target.value)}
                  className="w-full bg-ink-surface-2 border border-hairline rounded-xl px-3 py-2 text-xs text-text-primary-v4 outline-none focus:border-signal font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-hairline">
                <button
                  type="button"
                  onClick={() => setShowAddEntryModal(false)}
                  className="px-4 py-2 rounded-btn text-xs text-text-muted-v4 hover:text-text-primary-v4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-btn v4-btn-primary text-xs font-semibold shadow-glow"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="v4-panel max-w-lg w-full p-6 rounded-3xl border border-hairline bg-ink-surface shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <h3 className="text-base font-bold text-text-primary-v4 flex items-center gap-2">
                <Upload className="h-4 w-4 text-signal" /> Bulk Import JSON Pairs
              </h3>
              <button onClick={() => setShowBulkImportModal(false)} className="text-text-muted-v4 hover:text-text-primary-v4">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-text-secondary-v4 leading-relaxed">
              Paste a JSON object containing key-value mappings. Each entry will be populated directly into namespace &apos;{selectedNamespace?.name}&apos;.
            </p>

            <form onSubmit={handleBulkImport} className="space-y-4">
              <textarea
                rows={8}
                placeholder={`{\n  "feature:v2_enabled": "true",\n  "config:max_payload_kb": 1024,\n  "cache:user:1": "John Doe"\n}`}
                value={bulkJsonText}
                onChange={(e) => setBulkJsonText(e.target.value)}
                required
                className="w-full bg-ink border border-hairline rounded-xl p-3 text-xs text-text-primary-v4 outline-none focus:border-signal font-mono"
              />

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-hairline">
                <button
                  type="button"
                  onClick={() => setShowBulkImportModal(false)}
                  className="px-4 py-2 rounded-btn text-xs text-text-muted-v4 hover:text-text-primary-v4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-btn v4-btn-primary text-xs font-semibold shadow-glow"
                >
                  Import Entries
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Gateway Confirmation Modal */}
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
