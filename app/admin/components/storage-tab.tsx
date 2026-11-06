'use client';

import { useState, useEffect } from 'react';
import {
  HardDrive, Database, Shield, Zap, Search, Plus, Trash2,
  ExternalLink, Key, RefreshCw, CheckCircle2, AlertTriangle,
  Folder, File, Download, X, Copy, Check, Filter, ArrowUpRight,
  TrendingDown, Globe, Lock, Unlock, Eye
} from 'lucide-react';

interface StorageBucket {
  id: string;
  name: string;
  tenantId: string;
  tenantName: string;
  region: 'ap-south-mumbai' | 'eu-west-frankfurt' | 'us-east-virginia' | 'auto-anycast';
  objectCount: number;
  sizeGb: number;
  createdDate: string;
  publicAccess: boolean;
  corsEnabled: boolean;
  status: 'active' | 'suspended';
}

interface S3Credential {
  id: string;
  accessKeyId: string;
  tenantOwner: string;
  tenantId: string;
  permissions: 'Read-Write' | 'Read-Only' | 'Admin';
  lastAccessedIp: string;
  lastActive: string;
  status: 'active' | 'revoked';
}

interface BucketObject {
  key: string;
  sizeBytes: number;
  lastModified: string;
  storageClass: 'Standard' | 'Infrequent-Access';
  contentType: string;
}

const INITIAL_BUCKETS: StorageBucket[] = [
  {
    id: 'bkt-01',
    name: 'bharatpay-settlement-receipts-2026',
    tenantId: 'ten-02',
    tenantName: 'Fintech Payments Bharat',
    region: 'ap-south-mumbai',
    objectCount: 4210000,
    sizeGb: 312000, // 312 TB
    createdDate: '2026-01-15',
    publicAccess: false,
    corsEnabled: true,
    status: 'active',
  },
  {
    id: 'bkt-02',
    name: 'apexdigital-user-media-production',
    tenantId: 'ten-01',
    tenantName: 'Apex Digital Systems',
    region: 'auto-anycast',
    objectCount: 6840000,
    sizeGb: 284000, // 284 TB
    createdDate: '2026-02-01',
    publicAccess: true,
    corsEnabled: true,
    status: 'active',
  },
  {
    id: 'bkt-03',
    name: 'hyperscale-weights-checkpoints',
    tenantId: 'ten-03',
    tenantName: 'HyperScale AI Labs',
    region: 'us-east-virginia',
    objectCount: 84200,
    sizeGb: 198000, // 198 TB
    createdDate: '2026-03-10',
    publicAccess: false,
    corsEnabled: false,
    status: 'active',
  },
  {
    id: 'bkt-04',
    name: 'globallogistics-telemetry-dumps',
    tenantId: 'ten-04',
    tenantName: 'Global Logistics Hub',
    region: 'eu-west-frankfurt',
    objectCount: 5210000,
    sizeGb: 48000, // 48 TB
    createdDate: '2026-04-18',
    publicAccess: false,
    corsEnabled: true,
    status: 'active',
  },
  {
    id: 'bkt-05',
    name: 'cloudnative-static-assets-cdn',
    tenantId: 'ten-05',
    tenantName: 'CloudNative Devs Studio',
    region: 'auto-anycast',
    objectCount: 620000,
    sizeGb: 600, // 600 GB
    createdDate: '2026-05-22',
    publicAccess: true,
    corsEnabled: true,
    status: 'active',
  },
];

const INITIAL_KEYS: S3Credential[] = [
  { id: 'key-1', accessKeyId: 'vlt_r2_4f81c9a012b', tenantOwner: 'Fintech Payments Bharat', tenantId: 'ten-02', permissions: 'Read-Write', lastAccessedIp: '103.21.244.18', lastActive: '1 min ago', status: 'active' },
  { id: 'key-2', accessKeyId: 'vlt_r2_9e2b77d483a', tenantOwner: 'Apex Digital Systems', tenantId: 'ten-01', permissions: 'Admin', lastAccessedIp: '141.101.120.34', lastActive: '8 min ago', status: 'active' },
  { id: 'key-3', accessKeyId: 'vlt_r2_1a77f02388c', tenantOwner: 'HyperScale AI Labs', tenantId: 'ten-03', permissions: 'Read-Write', lastAccessedIp: '172.68.22.91', lastActive: '23 min ago', status: 'active' },
  { id: 'key-4', accessKeyId: 'vlt_r2_3d99e5102aa', tenantOwner: 'Global Logistics Hub', tenantId: 'ten-04', permissions: 'Read-Only', lastAccessedIp: '198.41.200.5', lastActive: '2h ago', status: 'active' },
];

const SAMPLE_BUCKET_OBJECTS: BucketObject[] = [
  { key: 'production/models/checkpoint-epoch-48.bin', sizeBytes: 14820000000, lastModified: '2026-09-26 18:24:10', storageClass: 'Standard', contentType: 'application/octet-stream' },
  { key: 'production/models/config.json', sizeBytes: 4210, lastModified: '2026-09-26 18:24:12', storageClass: 'Standard', contentType: 'application/json' },
  { key: 'logs/2026/09/26/ingress-telemetry.parquet', sizeBytes: 842000000, lastModified: '2026-09-26 23:59:00', storageClass: 'Infrequent-Access', contentType: 'application/vnd.apache.parquet' },
  { key: 'assets/brand/hero-vector-2026.svg', sizeBytes: 124800, lastModified: '2026-09-25 11:15:32', storageClass: 'Standard', contentType: 'image/svg+xml' },
  { key: 'backups/db-snapshot-daily-latest.tar.zst', sizeBytes: 42100000000, lastModified: '2026-09-27 02:00:15', storageClass: 'Standard', contentType: 'application/zstd' },
];

export function StorageTab({ showToast }: { showToast: (type: 'success' | 'error', msg: string) => void }) {
  const [buckets, setBuckets] = useState<StorageBucket[]>(INITIAL_BUCKETS);
  const [credentials, setCredentials] = useState<S3Credential[]>(INITIAL_KEYS);
  const [searchBucket, setSearchBucket] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');

  // Modals state
  const [browsingBucket, setBrowsingBucket] = useState<StorageBucket | null>(null);
  const [editingPolicyBucket, setEditingPolicyBucket] = useState<StorageBucket | null>(null);
  const [showCreateBucketModal, setShowCreateBucketModal] = useState(false);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newBucketName, setNewBucketName] = useState('');
  const [newBucketRegion, setNewBucketRegion] = useState<StorageBucket['region']>('auto-anycast');
  const [newBucketPublic, setNewBucketPublic] = useState(false);

  // New generated key modal state
  const [newKeyData, setNewKeyData] = useState<{ id: string; secret: string; tenant: string } | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Sync storage buckets & credentials from API
  useEffect(() => {
    fetch('/api/cloud/storage')
      .then(res => res.json())
      .then(data => {
        if (data.buckets && Array.isArray(data.buckets) && data.buckets.length > 0) {
          setBuckets(prev => {
            const map = new Map(prev.map(b => [b.id, b]));
            for (const b of data.buckets) {
              if (!map.has(b.id)) {
                map.set(b.id, {
                  id: b.id,
                  name: b.name,
                  tenantId: 'ten-admin',
                  tenantName: 'VaultHost Cloud',
                  region: (b.region || 'auto-anycast') as StorageBucket['region'],
                  objectCount: b.object_count || 120,
                  sizeGb: +(b.size_gb || 4.2),
                  createdDate: b.created_at ? b.created_at.split('T')[0] : '2026-06-01',
                  publicAccess: Boolean(b.is_public),
                  corsEnabled: true,
                  status: 'active',
                });
              }
            }
            return Array.from(map.values());
          });
        }
      })
      .catch(() => {});
  }, []);

  // Format bytes helper
  const formatBytes = (bytes: number) => {
    if (bytes >= 1e12) return `${(bytes / 1e12).toFixed(2)} TB`;
    if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
    if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  // Create Bucket
  const handleCreateBucket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBucketName.trim()) return;
    const bucket: StorageBucket = {
      id: `bkt-${Date.now().toString().slice(-4)}`,
      name: newBucketName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      tenantId: 'ten-admin',
      tenantName: 'VaultHost Internal Services',
      region: newBucketRegion,
      objectCount: 0,
      sizeGb: 0,
      createdDate: new Date().toISOString().split('T')[0],
      publicAccess: newBucketPublic,
      corsEnabled: true,
      status: 'active',
    };
    try {
      await fetch('/api/cloud/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_bucket',
          bucket: {
            name: bucket.name,
            region: bucket.region,
            isPublic: bucket.publicAccess,
          },
          options: { autoExecuteIfApproved: true },
        }),
      });
    } catch {}
    setBuckets([bucket, ...buckets]);
    showToast('success', `Bucket "${bucket.name}" provisioned across VaultR2 storage nodes`);
    setShowCreateBucketModal(false);
    setNewBucketName('');
  };

  // Delete Bucket
  const handleDeleteBucket = async (bucketId: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete bucket "${name}"?`)) return;
    try {
      await fetch('/api/cloud/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_bucket',
          bucket: { id: bucketId, name },
        }),
      });
    } catch {}
    setBuckets(prev => prev.filter(b => b.id !== bucketId));
    showToast('success', `Bucket "${name}" purged`);
  };

  // Toggle Policy
  const handleSavePolicy = () => {
    if (!editingPolicyBucket) return;
    setBuckets(prev => prev.map(b => b.id === editingPolicyBucket.id ? editingPolicyBucket : b));
    showToast('success', `Policies for "${editingPolicyBucket.name}" synced to edge`);
    setEditingPolicyBucket(null);
  };

  // Revoke S3 Key
  const handleRevokeKey = async (keyId: string) => {
    try {
      await fetch('/api/cloud/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'revoke_credential',
          credential: { id: keyId },
        }),
      });
    } catch {}
    setCredentials(prev => prev.map(k => k.id === keyId ? { ...k, status: 'revoked' } : k));
    showToast('success', 'S3 API credential revoked immediately across all gateway nodes');
  };

  // Generate Key
  const handleGenerateKey = async () => {
    const accId = `vlt_r2_${Math.random().toString(36).substring(2, 12)}`;
    const secret = Array.from({ length: 40 }, () => Math.floor(Math.random() * 36).toString(36)).join('');
    try {
      await fetch('/api/cloud/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_credential',
          credential: { label: 'Admin Generated S3 Key', permissions: 'Read-Write' },
        }),
      });
    } catch {}
    setNewKeyData({
      id: accId,
      secret,
      tenant: 'Apex Digital Systems',
    });
    setCredentials([
      {
        id: `key-${Date.now()}`,
        accessKeyId: accId,
        tenantOwner: 'Apex Digital Systems',
        tenantId: 'ten-01',
        permissions: 'Read-Write',
        lastAccessedIp: 'Just generated',
        lastActive: 'Just now',
        status: 'active',
      },
      ...credentials
    ]);
    setShowNewKeyModal(true);
  };

  const filteredBuckets = buckets.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchBucket.toLowerCase()) ||
                          b.tenantName.toLowerCase().includes(searchBucket.toLowerCase());
    const matchesRegion = regionFilter === 'all' || b.region === regionFilter;
    return matchesSearch && matchesRegion;
  });

  const totalStorageTb = (buckets.reduce((acc, b) => acc + b.sizeGb, 0) / 1000).toFixed(1);
  const totalObjectsM = (buckets.reduce((acc, b) => acc + b.objectCount, 0) / 1e6).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-hairline gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-signal animate-pulse" />
            <h1 className="text-xl font-semibold tracking-tight text-text-primary-v4">
              VaultR2 Storage & Buckets Console
            </h1>
          </div>
          <p className="text-[13px] text-text-muted-v4 mt-1">
            Global S3-compatible object storage with guaranteed ₹0 / $0 egress fees, geo-replication, and tenant isolation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleGenerateKey}
            className="px-3 py-1.5 rounded-btn border border-hairline bg-ink-surface hover:bg-ink-surface-2 text-[12px] font-medium text-text-primary-v4 transition-colors flex items-center gap-1.5"
          >
            <Key className="h-3.5 w-3.5 text-signal" /> Generate S3 Key
          </button>
          <button
            onClick={() => setShowCreateBucketModal(true)}
            className="px-3.5 py-1.5 rounded-btn bg-signal text-black font-semibold text-xs hover:bg-signal/90 flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Create Bucket
          </button>
        </div>
      </div>

      {/* Global Storage Telemetry Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="v4-panel p-4">
          <div className="flex items-center justify-between text-text-muted-v4 mb-1 text-xs">
            <span>Total Stored Data</span>
            <HardDrive className="h-4 w-4 text-signal" />
          </div>
          <div className="text-2xl font-semibold tracking-tight text-text-primary-v4">
            842.6 <span className="text-xs font-normal text-text-muted-v4">TB</span>
          </div>
          <div className="text-[11px] text-good mt-1 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> NVMe-oF Distributed SAN healthy
          </div>
        </div>

        <div className="v4-panel p-4">
          <div className="flex items-center justify-between text-text-muted-v4 mb-1 text-xs">
            <span>Objects Count</span>
            <File className="h-4 w-4 text-signal" />
          </div>
          <div className="text-2xl font-semibold tracking-tight text-text-primary-v4">
            18.4M <span className="text-xs font-normal text-text-muted-v4">objects</span>
          </div>
          <div className="text-[11px] text-text-muted-v4 mt-1">
            Across 124 tenant buckets
          </div>
        </div>

        <div className="v4-panel p-4">
          <div className="flex items-center justify-between text-text-muted-v4 mb-1 text-xs">
            <span>24h Outbound Egress</span>
            <Zap className="h-4 w-4 text-signal" />
          </div>
          <div className="text-2xl font-semibold tracking-tight text-text-primary-v4">
            42.1 <span className="text-xs font-normal text-text-muted-v4">TB</span>
          </div>
          <div className="text-[11px] text-good font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> ₹0 Egress Cost (Zero Bandwidth Tax)
          </div>
        </div>

        <div className="v4-panel p-4">
          <div className="flex items-center justify-between text-text-muted-v4 mb-1 text-xs">
            <span>Active Buckets</span>
            <Database className="h-4 w-4 text-signal" />
          </div>
          <div className="text-2xl font-semibold tracking-tight text-text-primary-v4">
            124
          </div>
          <div className="text-[11px] text-signal mt-1">
            100% S3 API compatibility
          </div>
        </div>
      </div>

      {/* Bandwidth Tax Savings Counter Banner */}
      <div className="v4-panel p-5 bg-gradient-to-r from-ink-surface via-ink-surface-2 to-ink-surface border-hairline">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-chip text-[11px] font-bold bg-good/10 text-good border border-good/20">
                ZERO EGRESS TAX GUARANTEE
              </span>
              <span className="text-xs text-text-muted-v4">Compared to AWS S3 & Google Cloud Storage</span>
            </div>
            <h2 className="text-base font-semibold text-text-primary-v4">
              Tenants saved <span className="text-good font-bold font-mono">$3,789.00</span> in egress fees this month
            </h2>
            <p className="text-xs text-text-muted-v4">
              AWS S3 charges $0.09/GB for Internet egress. VaultR2 delivers 42.1 TB/day with completely unmetered, zero-cost edge distribution.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-ink-surface p-3 rounded-btn border border-hairline shrink-0">
            <div className="text-center px-2">
              <div className="text-[10px] text-text-muted-v4 uppercase">AWS S3 Cost</div>
              <div className="text-sm font-bold text-bad font-mono">$3,789.00</div>
            </div>
            <div className="h-8 w-px bg-hairline" />
            <div className="text-center px-2">
              <div className="text-[10px] text-text-muted-v4 uppercase">VaultR2 Egress</div>
              <div className="text-sm font-bold text-good font-mono">$0.00</div>
            </div>
            <div className="h-8 w-px bg-hairline" />
            <div className="text-center px-2">
              <div className="text-[10px] text-text-muted-v4 uppercase">Savings</div>
              <div className="text-sm font-bold text-signal font-mono">100%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Bucket Explorer */}
      <div className="v4-panel p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-hairline gap-3">
          <div>
            <h2 className="font-semibold text-sm text-text-primary-v4">Global VaultR2 Bucket Explorer</h2>
            <p className="text-[12px] text-text-muted-v4">Browse multi-tenant object containers, storage sizes, and S3 endpoint configurations</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted-v4" />
              <input
                type="text"
                placeholder="Search bucket, tenant..."
                value={searchBucket}
                onChange={(e) => setSearchBucket(e.target.value)}
                className="w-full pl-8 pr-3 py-1 rounded-btn bg-ink-surface border border-hairline text-xs text-text-primary-v4 placeholder:text-text-muted-v4 focus:outline-none focus:border-signal"
              />
            </div>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="px-2.5 py-1 rounded-btn bg-ink-surface border border-hairline text-xs text-text-primary-v4 focus:outline-none focus:border-signal"
            >
              <option value="all">All Regions</option>
              <option value="auto-anycast">Anycast Global</option>
              <option value="ap-south-mumbai">ap-south (Mumbai)</option>
              <option value="eu-west-frankfurt">eu-west (Frankfurt)</option>
              <option value="us-east-virginia">us-east (Virginia)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-hairline text-text-muted-v4 text-[11px] uppercase tracking-wider font-semibold">
                <th className="pb-2.5">Bucket Name</th>
                <th className="pb-2.5">Tenant Owner</th>
                <th className="pb-2.5">Region</th>
                <th className="pb-2.5">Objects</th>
                <th className="pb-2.5">Storage Size</th>
                <th className="pb-2.5">Access Policy</th>
                <th className="pb-2.5">Created</th>
                <th className="pb-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filteredBuckets.map(b => (
                <tr key={b.id} className="hover:bg-ink-surface-2/60 transition-colors">
                  <td className="py-3 font-semibold text-text-primary-v4 flex items-center gap-2">
                    <Folder className="h-4 w-4 text-signal shrink-0" />
                    <span className="font-mono">{b.name}</span>
                  </td>
                  <td className="py-3">
                    <div className="text-text-primary-v4">{b.tenantName}</div>
                    <div className="text-[10px] text-text-muted-v4 font-mono">{b.tenantId}</div>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-chip text-[10px] font-mono bg-ink-surface border border-hairline text-text-secondary-v4">
                      {b.region}
                    </span>
                  </td>
                  <td className="py-3 v4-readout-primary font-medium text-text-primary-v4">
                    {b.objectCount > 1000 ? `${(b.objectCount / 1000).toFixed(0)}k` : b.objectCount}
                  </td>
                  <td className="py-3 v4-readout-primary font-bold text-text-primary-v4">
                    {b.sizeGb >= 1000 ? `${(b.sizeGb / 1000).toFixed(1)} TB` : `${b.sizeGb} GB`}
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-chip font-medium border ${
                      b.publicAccess
                        ? 'bg-warn/10 text-warn border-warn/20'
                        : 'bg-ink-surface text-text-secondary-v4 border-hairline'
                    }`}>
                      {b.publicAccess ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                      {b.publicAccess ? 'Public Read' : 'Private'}
                    </span>
                  </td>
                  <td className="py-3 text-text-muted-v4 whitespace-nowrap">{b.createdDate}</td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setBrowsingBucket(b)}
                        className="px-2 py-1 rounded-btn bg-ink-surface hover:bg-ink-surface-2 border border-hairline text-text-secondary-v4 hover:text-text-primary-v4 text-[11px] transition-colors flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" /> Browse
                      </button>
                      <button
                        onClick={() => setEditingPolicyBucket(b)}
                        className="px-2 py-1 rounded-btn bg-ink-surface hover:bg-ink-surface-2 border border-hairline text-text-secondary-v4 hover:text-text-primary-v4 text-[11px] transition-colors"
                      >
                        Policies
                      </button>
                      <button
                        onClick={() => handleDeleteBucket(b.id, b.name)}
                        className="p-1 rounded text-text-muted-v4 hover:text-bad hover:bg-bad/10 transition-colors"
                        title="Delete bucket"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* S3 Access Key Governance */}
      <div className="v4-panel p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-hairline gap-3">
          <div>
            <h2 className="font-semibold text-sm text-text-primary-v4">S3 API Access Key Governance</h2>
            <p className="text-[12px] text-text-muted-v4">Provisioned IAM service accounts, AWS S3 API keys, and client endpoint IP history</p>
          </div>
          <span className="text-[11px] text-text-muted-v4 v4-readout">
            {credentials.filter(c => c.status === 'active').length} Active Keys
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-hairline text-text-muted-v4 text-[11px] uppercase tracking-wider font-semibold">
                <th className="pb-2.5">Access Key ID</th>
                <th className="pb-2.5">Tenant Owner</th>
                <th className="pb-2.5">Permissions</th>
                <th className="pb-2.5">Last Accessed IP</th>
                <th className="pb-2.5">Last Active</th>
                <th className="pb-2.5">Key Status</th>
                <th className="pb-2.5 text-right">Revocation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {credentials.map(c => (
                <tr key={c.id} className="hover:bg-ink-surface-2/60 transition-colors">
                  <td className="py-3 font-mono font-medium text-text-primary-v4 flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5 text-signal" />
                    {c.accessKeyId}
                  </td>
                  <td className="py-3">
                    <div className="text-text-primary-v4 font-medium">{c.tenantOwner}</div>
                    <div className="text-[10px] text-text-muted-v4 font-mono">{c.tenantId}</div>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-chip text-[11px] font-medium bg-ink-surface border border-hairline text-text-secondary-v4">
                      {c.permissions}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-[11px] text-text-secondary-v4">{c.lastAccessedIp}</td>
                  <td className="py-3 text-text-muted-v4">{c.lastActive}</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-chip font-medium border ${
                      c.status === 'active'
                        ? 'bg-good/10 text-good border-good/20'
                        : 'bg-bad/10 text-bad border-bad/20'
                    }`}>
                      {c.status === 'active' ? 'Active' : 'Revoked'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {c.status === 'active' ? (
                      <button
                        onClick={() => handleRevokeKey(c.id)}
                        className="px-2 py-1 rounded-btn bg-bad/10 hover:bg-bad/20 text-bad border border-bad/20 text-[11px] transition-colors"
                      >
                        Revoke Key
                      </button>
                    ) : (
                      <span className="text-[11px] text-text-muted-v4">Revoked</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Browse Objects Modal */}
      {browsingBucket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="v4-panel max-w-2xl w-full p-6 space-y-4 shadow-2xl bg-ink-surface border border-hairline">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div>
                <h3 className="font-semibold text-text-primary-v4 text-sm flex items-center gap-2">
                  <Folder className="h-4 w-4 text-signal" /> Objects in {browsingBucket.name}
                </h3>
                <p className="text-[11px] text-text-muted-v4 mt-0.5 font-mono">
                  s3://{browsingBucket.name}/ ({browsingBucket.region})
                </p>
              </div>
              <button onClick={() => setBrowsingBucket(null)} className="text-text-muted-v4 hover:text-text-primary-v4">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-hairline text-text-muted-v4 text-[10px] uppercase font-semibold">
                    <th className="pb-2">Object Key</th>
                    <th className="pb-2">Size</th>
                    <th className="pb-2">Storage Class</th>
                    <th className="pb-2">Last Modified</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {SAMPLE_BUCKET_OBJECTS.map((obj, i) => (
                    <tr key={i} className="hover:bg-ink-surface-2/60">
                      <td className="py-2.5 font-mono text-[11px] text-text-primary-v4 flex items-center gap-1.5">
                        <File className="h-3.5 w-3.5 text-text-muted-v4 shrink-0" />
                        <span className="truncate max-w-xs">{obj.key}</span>
                      </td>
                      <td className="py-2.5 font-mono text-text-muted-v4">{formatBytes(obj.sizeBytes)}</td>
                      <td className="py-2.5">
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-ink-surface border border-hairline text-text-secondary-v4">
                          {obj.storageClass}
                        </span>
                      </td>
                      <td className="py-2.5 text-text-muted-v4 text-[10px]">{obj.lastModified}</td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => showToast('success', `Initiated signed download for ${obj.key}`)}
                          className="p-1 rounded text-text-muted-v4 hover:text-signal"
                          title="Download object"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-hairline text-xs">
              <span className="text-text-muted-v4">5 objects shown (simulated sample)</span>
              <button
                onClick={() => setBrowsingBucket(null)}
                className="px-3 py-1.5 rounded-btn bg-signal text-black font-semibold text-xs hover:bg-signal/90"
              >
                Close Explorer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Policies Modal */}
      {editingPolicyBucket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="v4-panel max-w-md w-full p-6 space-y-4 shadow-2xl bg-ink-surface border border-hairline">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <h3 className="font-semibold text-text-primary-v4 text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-signal" /> Bucket Policies: {editingPolicyBucket.name}
              </h3>
              <button onClick={() => setEditingPolicyBucket(null)} className="text-text-muted-v4 hover:text-text-primary-v4">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-btn bg-ink-surface-2 border border-hairline">
                <div>
                  <div className="font-medium text-text-primary-v4">Public Read Access (URL)</div>
                  <div className="text-[11px] text-text-muted-v4">Allow objects to be read via custom domain CDN without S3 auth</div>
                </div>
                <input
                  type="checkbox"
                  checked={editingPolicyBucket.publicAccess}
                  onChange={(e) => setEditingPolicyBucket({ ...editingPolicyBucket, publicAccess: e.target.checked })}
                  className="w-4 h-4 accent-[hsl(var(--v4-signal))]"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-btn bg-ink-surface-2 border border-hairline">
                <div>
                  <div className="font-medium text-text-primary-v4">CORS Allow Origin (*)</div>
                  <div className="text-[11px] text-text-muted-v4">Permit direct browser multipart uploads via presigned URLs</div>
                </div>
                <input
                  type="checkbox"
                  checked={editingPolicyBucket.corsEnabled}
                  onChange={(e) => setEditingPolicyBucket({ ...editingPolicyBucket, corsEnabled: e.target.checked })}
                  className="w-4 h-4 accent-[hsl(var(--v4-signal))]"
                />
              </div>

              <div>
                <label className="text-text-muted-v4 font-medium mb-1 block">Lifecycle Auto-Transition Rule</label>
                <select className="w-full px-3 py-1.5 rounded-btn bg-ink-surface-2 border border-hairline text-text-primary-v4 text-xs focus:outline-none focus:border-signal">
                  <option>Keep Standard Tier indefinitely</option>
                  <option>Transition to Infrequent Access after 30 days</option>
                  <option>Expire and purge objects after 90 days</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
              <button
                onClick={() => setEditingPolicyBucket(null)}
                className="px-3 py-1.5 rounded-btn border border-hairline text-text-muted-v4 hover:text-text-primary-v4 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePolicy}
                className="px-3 py-1.5 rounded-btn bg-signal text-black font-semibold text-xs hover:bg-signal/90"
              >
                Save Policies
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Bucket Modal */}
      {showCreateBucketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="v4-panel max-w-md w-full p-6 space-y-4 shadow-2xl bg-ink-surface border border-hairline">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <h3 className="font-semibold text-text-primary-v4 text-sm flex items-center gap-2">
                <Plus className="h-4 w-4 text-signal" /> Create New VaultR2 Bucket
              </h3>
              <button onClick={() => setShowCreateBucketModal(false)} className="text-text-muted-v4 hover:text-text-primary-v4">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBucket} className="space-y-3 text-xs">
              <div>
                <label className="text-text-muted-v4 font-medium mb-1 block">Bucket Name (Globally Unique DNS)</label>
                <input
                  type="text"
                  required
                  placeholder="my-company-assets-prod"
                  value={newBucketName}
                  onChange={(e) => setNewBucketName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-btn bg-ink-surface-2 border border-hairline text-text-primary-v4 font-mono text-xs focus:outline-none focus:border-signal"
                />
              </div>

              <div>
                <label className="text-text-muted-v4 font-medium mb-1 block">Storage Region / Placement</label>
                <select
                  value={newBucketRegion}
                  onChange={(e) => setNewBucketRegion(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-btn bg-ink-surface-2 border border-hairline text-text-primary-v4 text-xs focus:outline-none focus:border-signal"
                >
                  <option value="auto-anycast">Automatic Global Anycast (Smart Placement)</option>
                  <option value="ap-south-mumbai">Asia South (Mumbai, IN)</option>
                  <option value="eu-west-frankfurt">Europe West (Frankfurt, DE)</option>
                  <option value="us-east-virginia">US East (N. Virginia, US)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pubAccess"
                  checked={newBucketPublic}
                  onChange={(e) => setNewBucketPublic(e.target.checked)}
                  className="w-4 h-4 accent-[hsl(var(--v4-signal))]"
                />
                <label htmlFor="pubAccess" className="text-text-secondary-v4 cursor-pointer">
                  Allow Public Object URLs (CDN Direct Read)
                </label>
              </div>

              <div className="p-2.5 rounded-btn bg-good/10 border border-good/20 text-[11px] text-good">
                ✓ Guaranteed zero egress pricing forever. Compatible with AWS SDK, S3cmd, Rclone, and Cyberduck.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
                <button
                  type="button"
                  onClick={() => setShowCreateBucketModal(false)}
                  className="px-3 py-1.5 rounded-btn border border-hairline text-text-muted-v4 hover:text-text-primary-v4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-btn bg-signal text-black font-semibold text-xs hover:bg-signal/90"
                >
                  Provision Bucket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generated New Key Modal */}
      {showNewKeyModal && newKeyData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="v4-panel max-w-md w-full p-6 space-y-4 shadow-2xl bg-ink-surface border border-hairline">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <h3 className="font-semibold text-text-primary-v4 text-sm flex items-center gap-2">
                <Key className="h-4 w-4 text-signal" /> S3 API Credentials Generated
              </h3>
              <button onClick={() => setShowNewKeyModal(false)} className="text-text-muted-v4 hover:text-text-primary-v4">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-text-muted-v4">
              Save your Secret Access Key securely. It will never be shown again in plain text.
            </p>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <span className="text-[10px] text-text-muted-v4 font-sans block">Access Key ID</span>
                <input
                  type="text"
                  readOnly
                  value={newKeyData.id}
                  className="w-full px-3 py-1.5 rounded-btn bg-ink-surface-2 border border-hairline text-text-primary-v4 select-all text-xs"
                />
              </div>

              <div>
                <span className="text-[10px] text-text-muted-v4 font-sans block">Secret Access Key</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={newKeyData.secret}
                    className="w-full px-3 py-1.5 rounded-btn bg-ink-surface-2 border border-hairline text-signal select-all text-xs"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(newKeyData.secret);
                      setCopiedSecret(true);
                      setTimeout(() => setCopiedSecret(false), 2000);
                      showToast('success', 'Secret Key copied');
                    }}
                    className="px-2.5 py-1.5 rounded-btn bg-ink-surface-2 border border-hairline text-text-primary-v4 text-xs"
                  >
                    {copiedSecret ? <Check className="h-4 w-4 text-good" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-text-muted-v4 font-sans block">S3 Endpoint URL</span>
                <input
                  type="text"
                  readOnly
                  value="https://r2.vaulthost.com"
                  className="w-full px-3 py-1.5 rounded-btn bg-ink-surface-2 border border-hairline text-text-muted-v4 text-xs select-all"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-hairline">
              <button
                onClick={() => setShowNewKeyModal(false)}
                className="px-3.5 py-1.5 rounded-btn bg-signal text-black font-semibold text-xs hover:bg-signal/90"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
