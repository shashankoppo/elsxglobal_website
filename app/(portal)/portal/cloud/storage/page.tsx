'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  HardDrive, Plus, Upload, Download, Key, Shield, Trash2,
  Copy, Check, ExternalLink, Search, RefreshCw, Eye, ArrowUpRight,
  CheckCircle2, AlertTriangle, X
} from 'lucide-react';
import { PanelCard } from '@/components/ui/panel-card';
import { ActionConfirmationModal } from '@/components/portal/ActionConfirmationModal';
import { ActionExecutionResult } from '@/lib/action-gateway/types';

interface BucketItem {
  id: string;
  name: string;
  region: string;
  objects: number | string;
  sizeGb?: number;
  size?: string;
  egressCost?: string;
  egressCostSavedUsd?: number;
  created: string;
  publicAccess: boolean;
}

const INITIAL_BUCKETS: BucketItem[] = [
  {
    id: 'b-01',
    name: 'production-media-assets',
    region: 'Auto (Anycast Edge)',
    objects: '1,420,500',
    size: '34.2 GB',
    egressCost: '₹0.00 (Zero Egress)',
    created: '2026-06-15',
    publicAccess: true
  },
  {
    id: 'b-02',
    name: 'ai-training-embeddings',
    region: 'Auto (Anycast Edge)',
    objects: '2,400',
    size: '12.4 GB',
    egressCost: '₹0.00 (Zero Egress)',
    created: '2026-07-20',
    publicAccess: false
  },
  {
    id: 'b-03',
    name: 'database-automated-backups',
    region: 'Auto (Anycast Edge)',
    objects: '96',
    size: '2.0 GB',
    egressCost: '₹0.00 (Zero Egress)',
    created: '2026-08-01',
    publicAccess: false
  },
];

export default function StorageManagementPage() {
  const [buckets, setBuckets] = useState<BucketItem[]>(INITIAL_BUCKETS);
  const [selectedBucket, setSelectedBucket] = useState<BucketItem | null>(INITIAL_BUCKETS[0]);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKeysModal, setShowKeysModal] = useState(false);
  const [newBucketName, setNewBucketName] = useState('');
  const [newBucketRegion, setNewBucketRegion] = useState('Auto (Anycast Edge)');
  const [newBucketPublic, setNewBucketPublic] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [credentials, setCredentials] = useState<any[]>([]);

  // Action Gateway verification modal state
  const [gatewayModalOpen, setGatewayModalOpen] = useState(false);
  const [gatewayResult, setGatewayResult] = useState<ActionExecutionResult | null>(null);
  const [pendingBucket, setPendingBucket] = useState<any>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadData = async () => {
    try {
      const res = await fetch('/api/cloud/storage');
      if (res.ok) {
        const json = await res.json();
        if (json.buckets && json.buckets.length > 0) {
          setBuckets(json.buckets.map((b: any) => ({
            ...b,
            size: `${b.sizeGb} GB`,
            objects: b.objects.toLocaleString(),
            egressCost: '₹0.00 (Zero Egress)',
          })));
          if (!selectedBucket) setSelectedBucket(json.buckets[0]);
        }
        if (json.credentials) {
          setCredentials(json.credentials);
        }
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBucketName.trim()) return;

    const candidate = {
      name: newBucketName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      region: newBucketRegion,
      publicAccess: newBucketPublic,
    };
    setPendingBucket(candidate);

    try {
      const res = await fetch('/api/cloud/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_bucket', bucket: candidate }),
      });
      const data = await res.json();

      if (data.status === 'executed') {
        const createdB: BucketItem = {
          id: data.bucket.id,
          name: data.bucket.name,
          region: data.bucket.region,
          objects: '0',
          size: '0 B',
          egressCost: '₹0.00 (Zero Egress)',
          created: 'Just now',
          publicAccess: data.bucket.publicAccess,
        };
        setBuckets([createdB, ...buckets]);
        setSelectedBucket(createdB);
        setShowCreateModal(false);
        setNewBucketName('');
        showToast('success', `Bucket s3://${createdB.name} created at Edge`);
      } else {
        setGatewayResult(data);
        setGatewayModalOpen(true);
      }
    } catch {
      showToast('error', 'Bucket creation dispatch failed');
    }
  };

  const handleConfirmTier1 = async (confirmationToken: string) => {
    if (!pendingBucket) return;
    try {
      const res = await fetch('/api/cloud/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_bucket',
          bucket: pendingBucket,
          options: { confirmationToken },
          intent: {
            intentId: crypto.randomUUID(),
            actor: { id: 'usr-client', type: 'user', tenantId: 'ten_portal_default', roles: ['tenant_admin'] },
            targetService: 'storage',
            actionVerb: 'create_bucket',
            resourceUri: `storage://r2/${pendingBucket.name}`,
            parameters: pendingBucket,
            idempotencyKey: `idem-bkt-${Date.now()}`,
            createdAt: new Date().toISOString(),
          }
        }),
      });
      const data = await res.json();
      if (data.status === 'executed') {
        const createdB: BucketItem = {
          id: data.bucket.id,
          name: data.bucket.name,
          region: data.bucket.region,
          objects: '0',
          size: '0 B',
          egressCost: '₹0.00 (Zero Egress)',
          created: 'Just now',
          publicAccess: data.bucket.publicAccess,
        };
        setBuckets([createdB, ...buckets]);
        setSelectedBucket(createdB);
        setShowCreateModal(false);
        setNewBucketName('');
        showToast('success', `Verified: Created s3://${createdB.name}`);
      }
    } catch {
      showToast('error', 'Confirmation failed');
    } finally {
      setGatewayModalOpen(false);
      setPendingBucket(null);
    }
  };

  const handleGenerateKey = async () => {
    try {
      const res = await fetch('/api/cloud/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_credential', name: 'Portal Developer Key', permissions: 'Read-Write' }),
      });
      const data = await res.json();
      if (data.success) {
        setCredentials(prev => [...prev, data.key]);
        showToast('success', 'New S3 Access Key generated');
      }
    } catch {
      showToast('error', 'Key generation failed');
    }
  };

  const handleRevokeKey = async (id: string) => {
    try {
      await fetch('/api/cloud/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revoke_credential', id }),
      });
      setCredentials(prev => prev.filter(k => k.id !== id));
      showToast('success', 'Access key revoked');
    } catch {
      showToast('error', 'Key revocation failed');
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSimulatedUpload = () => {
    if (!selectedBucket) return;
    const fakeFileName = `asset-upload-${Date.now().toString().slice(-4)}.webp`;
    showToast('success', `File '${fakeFileName}' uploaded to s3://${selectedBucket.name} via Anycast edge`);
    setSelectedBucket(prev => prev ? {
      ...prev,
      objects: typeof prev.objects === 'number' ? prev.objects + 1 : (parseInt(String(prev.objects).replace(/,/g, '')) + 1).toLocaleString(),
    } : null);
  };

  const filteredBuckets = buckets.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
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
            <span className="text-xs text-text-primary-v4 font-medium">VaultR2 Object Storage</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary-v4 mt-1 flex items-center gap-2.5">
            <HardDrive className="h-6 w-6 text-signal" /> VaultR2 Object Storage
          </h1>
          <p className="text-xs text-text-secondary-v4 mt-0.5">
            Store infinite objects with S3-compatible APIs. Zero egress fees worldwide.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowKeysModal(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-btn v4-btn-secondary text-xs font-medium"
          >
            <Key className="h-3.5 w-3.5 text-signal" /> S3 API Keys
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-btn v4-btn-primary text-xs font-semibold shadow-glow"
          >
            <Plus className="h-4 w-4" /> Create Bucket
          </button>
        </div>
      </div>

      {/* S3 Endpoint Connection Strip */}
      <div className="p-4 rounded-2xl bg-ink-surface border border-hairline font-mono text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Key className="h-4 w-4 text-signal shrink-0" />
          <div>
            <span className="text-text-muted-v4 text-[11px] block">S3 Compatible API Endpoint</span>
            <span className="text-text-primary-v4 font-bold text-xs">https://r2.vaulthost.cloud</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCopy('endpoint', 'https://r2.vaulthost.cloud')}
            className="px-3 py-1.5 rounded-lg bg-ink-surface-2 border border-hairline text-text-secondary-v4 hover:text-text-primary-v4 transition-colors text-xs flex items-center gap-1.5"
          >
            {copiedKey === 'endpoint' ? <Check className="h-3.5 w-3.5 text-good" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedKey === 'endpoint' ? 'Copied' : 'Copy Endpoint'}
          </button>
        </div>
      </div>

      {/* Main Grid: Buckets + Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Buckets List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted-v4" />
              <input
                type="text"
                placeholder="Search buckets by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-ink-surface border border-hairline text-xs text-text-primary-v4 outline-none focus:border-signal"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredBuckets.map((bucket) => {
              const isSelected = selectedBucket?.id === bucket.id;
              return (
                <div
                  key={bucket.id}
                  onClick={() => setSelectedBucket(bucket)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-signal bg-signal/5'
                      : 'border-hairline bg-ink-surface hover:border-hairline-2'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-ink-surface-2 border border-hairline text-signal">
                        <HardDrive className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-text-primary-v4 font-mono">{bucket.name}</h3>
                          {bucket.publicAccess ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Public
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                              Private
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted-v4 mt-0.5">{bucket.region}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-text-primary-v4 block">
                        {bucket.size || '0 B'}
                      </span>
                      <span className="text-[11px] text-text-muted-v4">
                        {bucket.objects} objects
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Bucket Details */}
        <div className="lg:col-span-4 space-y-4">
          {selectedBucket ? (
            <>
              <div className="v4-panel p-5 rounded-2xl border border-hairline bg-ink-surface space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-hairline">
                  <span className="text-xs font-bold text-text-primary-v4 font-mono">{selectedBucket.name}</span>
                  <span className="text-[10px] text-text-muted-v4 font-mono">Created {selectedBucket.created}</span>
                </div>

                {/* Analytics Snapshot */}
                <div className="grid grid-cols-2 gap-2 text-center py-2">
                  <div className="bg-ink rounded-lg p-2 border border-hairline">
                    <span className="block text-[10px] text-text-muted-v4">Total Size</span>
                    <span className="text-signal font-bold text-sm">{selectedBucket.size || '0 B'}</span>
                  </div>
                  <div className="bg-ink rounded-lg p-2 border border-hairline">
                    <span className="block text-[10px] text-text-muted-v4">Object Count</span>
                    <span className="text-text-primary-v4 font-bold text-sm">{selectedBucket.objects}</span>
                  </div>
                  <div className="bg-ink rounded-lg p-2 border border-hairline">
                    <span className="block text-[10px] text-text-muted-v4">Egress Fee</span>
                    <span className="text-green-400 font-bold text-sm">₹0.00</span>
                  </div>
                  <div className="bg-ink rounded-lg p-2 border border-hairline">
                    <span className="block text-[10px] text-text-muted-v4">Network Tax</span>
                    <span className="text-green-400 font-bold text-sm">0% Free</span>
                  </div>
                </div>

                {/* Upload Zone */}
                <div
                  onClick={handleSimulatedUpload}
                  className="mt-4 border-2 border-dashed border-hairline rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-signal transition-colors bg-ink cursor-pointer group"
                >
                  <Upload className="w-6 h-6 text-text-muted-v4 group-hover:text-signal mb-2 transition-colors" />
                  <span className="text-sm font-medium text-text-primary-v4">Click to simulate upload</span>
                  <span className="text-xs text-text-muted-v4 mt-1">Multi-part S3 upload to Anycast edge</span>
                </div>

                <div className="space-y-2 text-xs pt-4">
                  <div className="flex justify-between py-1 border-b border-hairline/60">
                    <span className="text-text-muted-v4">S3 URI</span>
                    <span className="font-mono text-signal">s3://{selectedBucket.name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-hairline/60">
                    <span className="text-text-muted-v4">Storage Class</span>
                    <select className="bg-transparent text-text-primary-v4 outline-none font-medium border border-hairline rounded px-1">
                      <option>Standard (₹1.50/GB/mo)</option>
                      <option>Infrequent Access (₹0.90/GB/mo)</option>
                      <option>Archive (₹0.30/GB/mo)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => setShowKeysModal(true)}
                    className="w-full py-2 rounded-btn v4-btn-secondary text-xs font-medium flex items-center justify-center gap-1.5"
                  >
                    <Key className="h-3.5 w-3.5 text-signal" /> Manage S3 Access Keys
                  </button>
                </div>
              </div>

              {/* Lifecycle Rules Panel */}
              <div className="v4-panel p-5 rounded-2xl border border-hairline bg-ink-surface space-y-3">
                <h4 className="text-sm font-bold text-text-primary-v4 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-signal" /> Lifecycle Rules
                </h4>
                <div className="space-y-2">
                  <div className="bg-ink border border-hairline p-3 rounded-lg text-xs">
                    <span className="font-semibold text-text-primary-v4 block mb-1">Auto-Archive Old Objects</span>
                    <span className="text-text-secondary-v4">Transition to Archive class after 90 days.</span>
                  </div>
                  <div className="bg-ink border border-hairline p-3 rounded-lg text-xs">
                    <span className="font-semibold text-text-primary-v4 block mb-1">Delete Temp Files</span>
                    <span className="text-text-secondary-v4">Delete prefix `temp/` after 30 days.</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="v4-panel p-8 rounded-2xl border border-hairline text-center text-text-muted-v4">
              Select a bucket to inspect details.
            </div>
          )}
        </div>
      </div>

      {/* S3 Keys Modal */}
      {showKeysModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="v4-panel max-w-lg w-full p-6 rounded-3xl border border-hairline bg-ink-surface shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <h3 className="text-base font-bold text-text-primary-v4 flex items-center gap-2">
                <Key className="w-4 h-4 text-signal" /> S3 API Credentials
              </h3>
              <button onClick={() => setShowKeysModal(false)} className="text-text-muted-v4 hover:text-text-primary-v4">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {credentials.map(k => (
                <div key={k.id} className="p-3 bg-ink rounded-xl border border-hairline flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-text-primary-v4 block">{k.name}</span>
                    <code className="text-[11px] text-text-muted-v4 font-mono">{k.accessKey}</code>
                  </div>
                  <button
                    onClick={() => handleRevokeKey(k.id)}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 text-xs"
                    title="Revoke Key"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-hairline">
              <button
                onClick={handleGenerateKey}
                className="px-4 py-2 rounded-btn v4-btn-primary text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Generate New Key
              </button>
              <button
                onClick={() => setShowKeysModal(false)}
                className="px-4 py-2 rounded-btn v4-btn-secondary text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Bucket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="v4-panel max-w-md w-full p-6 rounded-3xl border border-signal/40 bg-ink-surface shadow-2xl">
            <h3 className="text-lg font-bold text-text-primary-v4 flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-signal" /> Create VaultR2 Storage Bucket
            </h3>
            <p className="text-xs text-text-secondary-v4 mt-1 leading-relaxed">
              Create an S3-compatible bucket auto-replicated across global Anycast PoPs with zero bandwidth fees.
            </p>

            <form onSubmit={handleCreate} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-primary-v4 block mb-1">Bucket Name</label>
                <input
                  type="text"
                  placeholder="e.g. app-assets-prod"
                  value={newBucketName}
                  onChange={(e) => setNewBucketName(e.target.value)}
                  required
                  className="w-full bg-ink-surface-2 border border-hairline rounded-xl px-3 py-2 text-xs text-text-primary-v4 outline-none focus:border-signal"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary-v4 block mb-1">Location Hint</label>
                <select
                  value={newBucketRegion}
                  onChange={e => setNewBucketRegion(e.target.value)}
                  className="w-full bg-ink-surface-2 border border-hairline rounded-xl px-3 py-2 text-xs text-text-primary-v4 outline-none focus:border-signal"
                >
                  <option value="Auto (Anycast Edge)">Global Anycast (Automatic closest replication)</option>
                  <option value="Mumbai, India (ap-south)">Asia-Pacific (Mumbai, India)</option>
                  <option value="Western Europe (Frankfurt)">Western Europe (Frankfurt)</option>
                  <option value="Eastern US (Virginia)">Eastern North America (Virginia)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pubAccess"
                  checked={newBucketPublic}
                  onChange={e => setNewBucketPublic(e.target.checked)}
                  className="rounded border-hairline bg-ink"
                />
                <label htmlFor="pubAccess" className="text-xs text-text-secondary-v4 cursor-pointer">
                  Enable Public Read Access (CDN distribution)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-hairline">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-btn text-xs text-text-muted-v4 hover:text-text-primary-v4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-btn v4-btn-primary text-xs font-semibold shadow-glow"
                >
                  Create Bucket
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
