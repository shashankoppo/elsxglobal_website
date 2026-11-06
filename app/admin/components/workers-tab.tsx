'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Zap, Cpu, Server, Activity, Search, Play, Pause, Trash2,
  AlertTriangle, CheckCircle2, Sliders, Terminal, Eye, X,
  ShieldAlert, RefreshCw, FileCode, Layers, ArrowUpRight,
  Filter, Ban, Check, Power
} from 'lucide-react';

interface WorkerDeployment {
  id: string;
  name: string;
  tenantId: string;
  tenantName: string;
  routePattern: string;
  activeVersion: string;
  replicas: 'Global Anycast' | 'Regional';
  cpuTimeMs: number;
  memoryCapMb: number;
  requestsPerSec: number;
  status: 'running' | 'throttled' | 'suspended';
  bindings: { type: string; name: string }[];
  envVarsCount: number;
  deployedAt: string;
}

interface WorkerLogEntry {
  id: string;
  timestamp: string;
  workerName: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  statusCode: number;
  colo: string;
  durationMs: number;
  cpuTimeMs: number;
}

const INITIAL_WORKERS: WorkerDeployment[] = [
  {
    id: 'wrk-01',
    name: 'payment-router-edge',
    tenantId: 'ten-02',
    tenantName: 'Fintech Payments Bharat',
    routePattern: 'api.bharatpay.co/v1/checkout/*',
    activeVersion: 'v3.8.2',
    replicas: 'Global Anycast',
    cpuTimeMs: 1.8,
    memoryCapMb: 128,
    requestsPerSec: 64200,
    status: 'running',
    bindings: [{ type: 'D1 Database', name: 'DB_FINTECH_PROD' }, { type: 'VaultR2 Bucket', name: 'RECEIPTS_BUCKET' }],
    envVarsCount: 8,
    deployedAt: '2 hours ago',
  },
  {
    id: 'wrk-02',
    name: 'auth-jwt-verifier',
    tenantId: 'ten-01',
    tenantName: 'Apex Digital Systems',
    routePattern: 'auth.apexdigital.io/*',
    activeVersion: 'v2.1.0',
    replicas: 'Global Anycast',
    cpuTimeMs: 0.9,
    memoryCapMb: 64,
    requestsPerSec: 48900,
    status: 'running',
    bindings: [{ type: 'KV Store', name: 'SESSIONS_KV' }],
    envVarsCount: 4,
    deployedAt: '1 day ago',
  },
  {
    id: 'wrk-03',
    name: 'ai-prompt-evaluator',
    tenantId: 'ten-03',
    tenantName: 'HyperScale AI Labs',
    routePattern: 'api.hyperscaleai.dev/v2/evaluate',
    activeVersion: 'v1.4.9',
    replicas: 'Global Anycast',
    cpuTimeMs: 14.2,
    memoryCapMb: 256,
    requestsPerSec: 12400,
    status: 'running',
    bindings: [{ type: 'AI Gateway', name: 'AI_ROUTER' }, { type: 'Vector DB', name: 'EMBEDDINGS_IDX' }],
    envVarsCount: 12,
    deployedAt: '3 hours ago',
  },
  {
    id: 'wrk-04',
    name: 'telemetry-ingest-pipeline',
    tenantId: 'ten-04',
    tenantName: 'Global Logistics Hub',
    routePattern: 'iot.globallogistics.com/stream',
    activeVersion: 'v2.0.4',
    replicas: 'Regional',
    cpuTimeMs: 3.4,
    memoryCapMb: 128,
    requestsPerSec: 88500,
    status: 'running',
    bindings: [{ type: 'Queue', name: 'IOT_INGEST_QUEUE' }],
    envVarsCount: 6,
    deployedAt: '5 days ago',
  },
  {
    id: 'wrk-05',
    name: 'ssr-html-edge-renderer',
    tenantId: 'ten-05',
    tenantName: 'CloudNative Devs Studio',
    routePattern: 'app.cloudnative.tech/*',
    activeVersion: 'v1.0.1',
    replicas: 'Global Anycast',
    cpuTimeMs: 8.6,
    memoryCapMb: 128,
    requestsPerSec: 1200,
    status: 'running',
    bindings: [{ type: 'VaultR2 Bucket', name: 'STATIC_CHUNKS' }],
    envVarsCount: 3,
    deployedAt: '1 week ago',
  },
];

const INITIAL_LOGS: WorkerLogEntry[] = [
  { id: 'log-1', timestamp: '10:42:15.842', workerName: 'payment-router-edge', method: 'POST', path: '/v1/checkout/intent', statusCode: 200, colo: 'BOM', durationMs: 4.2, cpuTimeMs: 1.8 },
  { id: 'log-2', timestamp: '10:42:15.890', workerName: 'auth-jwt-verifier', method: 'GET', path: '/auth/verify', statusCode: 200, colo: 'SIN', durationMs: 2.1, cpuTimeMs: 0.8 },
  { id: 'log-3', timestamp: '10:42:16.012', workerName: 'telemetry-ingest-pipeline', method: 'POST', path: '/stream/gps', statusCode: 204, colo: 'FRA', durationMs: 5.6, cpuTimeMs: 3.1 },
  { id: 'log-4', timestamp: '10:42:16.140', workerName: 'ai-prompt-evaluator', method: 'POST', path: '/v2/evaluate', statusCode: 200, colo: 'ORD', durationMs: 28.4, cpuTimeMs: 12.8 },
  { id: 'log-5', timestamp: '10:42:16.295', workerName: 'payment-router-edge', method: 'POST', path: '/v1/checkout/capture', statusCode: 200, colo: 'BOM', durationMs: 6.8, cpuTimeMs: 2.2 },
  { id: 'log-6', timestamp: '10:42:16.410', workerName: 'ssr-html-edge-renderer', method: 'GET', path: '/dashboard', statusCode: 200, colo: 'LHR', durationMs: 14.1, cpuTimeMs: 7.9 },
  { id: 'log-7', timestamp: '10:42:16.520', workerName: 'auth-jwt-verifier', method: 'POST', path: '/auth/token', statusCode: 401, colo: 'SJC', durationMs: 3.4, cpuTimeMs: 1.1 },
];

export function WorkersTab({ showToast }: { showToast: (type: 'success' | 'error', msg: string) => void }) {
  const [workers, setWorkers] = useState<WorkerDeployment[]>(INITIAL_WORKERS);
  const [searchWorker, setSearchWorker] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Logs stream state
  const [logs, setLogs] = useState<WorkerLogEntry[]>(INITIAL_LOGS);
  const [streaming, setStreaming] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Fleet policy limits
  const [freeCpuLimit, setFreeCpuLimit] = useState(10);
  const [proCpuLimit, setProCpuLimit] = useState(50);
  const [enterpriseCpuLimit, setEnterpriseCpuLimit] = useState(200);
  const [defaultMemoryCap, setDefaultMemoryCap] = useState(128);
  const [prewarmIsolates, setPrewarmIsolates] = useState(true);

  // Inspector modal
  const [inspectingWorker, setInspectingWorker] = useState<WorkerDeployment | null>(null);

  // Simulate log streaming
  useEffect(() => {
    if (!streaming) return;

    const interval = setInterval(() => {
      const colos = ['BOM', 'SIN', 'FRA', 'LHR', 'ORD', 'SJC', 'NRT'];
      const methods: ('GET' | 'POST')[] = ['GET', 'POST'];
      const randomWorker = workers[Math.floor(Math.random() * workers.length)];
      if (!randomWorker || randomWorker.status === 'suspended') return;

      const now = new Date();
      const timeStr = `${now.toTimeString().split(' ')[0]}.${now.getMilliseconds().toString().padStart(3, '0')}`;
      const statusCodes = [200, 200, 200, 204, 304, 200, 502];
      const code = statusCodes[Math.floor(Math.random() * statusCodes.length)];

      const newLog: WorkerLogEntry = {
        id: `log-${Date.now()}`,
        timestamp: timeStr,
        workerName: randomWorker.name,
        method: methods[Math.floor(Math.random() * methods.length)],
        path: randomWorker.routePattern.replace('*', 'action'),
        statusCode: code,
        colo: colos[Math.floor(Math.random() * colos.length)],
        durationMs: +(Math.random() * 8 + 1.2).toFixed(1),
        cpuTimeMs: +(Math.random() * 3 + 0.5).toFixed(1),
      };

      setLogs(prev => [...prev.slice(-30), newLog]);
    }, 1200);

    return () => clearInterval(interval);
  }, [streaming, workers]);

  // Auto-scroll logs
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Initial workers sync
  useEffect(() => {
    fetch('/api/cloud/workers')
      .then(res => res.json())
      .then(data => {
        if (data.workers && Array.isArray(data.workers) && data.workers.length > 0) {
          setWorkers(prev => {
            const map = new Map(prev.map(w => [w.id, w]));
            for (const w of data.workers) {
              if (!map.has(w.id)) {
                map.set(w.id, {
                  id: w.id,
                  name: w.name,
                  tenantId: 'ten-portal',
                  tenantName: 'Portal Managed',
                  routePattern: w.route_pattern || `${w.name}.vaulthost.cloud/*`,
                  activeVersion: 'v1.0.0',
                  replicas: 'Global Anycast',
                  cpuTimeMs: 4.2,
                  memoryCapMb: 128,
                  requestsPerSec: 1200,
                  status: w.status === 'suspended' ? 'suspended' : 'running',
                  bindings: [],
                  envVarsCount: 2,
                  deployedAt: 'Recently',
                });
              }
            }
            return Array.from(map.values());
          });
        }
      })
      .catch(() => {});
  }, []);

  // Emergency kill-switch
  const handleToggleKillSwitch = async (workerId: string, currentStatus: WorkerDeployment['status']) => {
    const nextStatus = currentStatus === 'suspended' ? 'running' : 'suspended';
    setWorkers(prev => prev.map(w => w.id === workerId ? { ...w, status: nextStatus } : w));
    
    try {
      await fetch('/api/cloud/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: nextStatus === 'suspended' ? 'suspend_worker' : 'resume_worker',
          worker: { id: workerId },
        }),
      });
    } catch {}

    if (nextStatus === 'suspended') {
      showToast('error', `EMERGENCY KILL-SWITCH: Worker ${workerId} suspended globally across 1,240 isolates`);
    } else {
      showToast('success', `Worker ${workerId} resumed across global isolates`);
    }
    if (inspectingWorker?.id === workerId) {
      setInspectingWorker(prev => prev ? { ...prev, status: nextStatus } : null);
    }
  };

  // Save Fleet policy
  const handleSavePolicies = () => {
    showToast('success', `Fleet policies updated: Free: ${freeCpuLimit}ms, Pro: ${proCpuLimit}ms, Ent: ${enterpriseCpuLimit}ms`);
  };

  const filteredWorkers = workers.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchWorker.toLowerCase()) ||
                          w.tenantName.toLowerCase().includes(searchWorker.toLowerCase()) ||
                          w.routePattern.toLowerCase().includes(searchWorker.toLowerCase());
    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-hairline gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-signal animate-pulse" />
            <h1 className="text-xl font-semibold tracking-tight text-text-primary-v4">
              Serverless Edge Workers & Isolates Fleet Manager
            </h1>
          </div>
          <p className="text-[13px] text-text-muted-v4 mt-1">
            Ultra-low latency V8 isolate execution, zero cold-starts, live console streaming, and multi-tenant resource limits
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStreaming(!streaming)}
            className={`px-3 py-1.5 rounded-btn text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              streaming
                ? 'bg-ink-surface hover:bg-ink-surface-2 border-hairline text-text-primary-v4'
                : 'bg-warn/10 text-warn border-warn/30'
            }`}
          >
            {streaming ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {streaming ? 'Pause Stream' : 'Resume Stream'}
          </button>
        </div>
      </div>

      {/* Global Fleet Telemetry Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="v4-panel p-4">
          <div className="flex items-center justify-between text-text-muted-v4 mb-1 text-xs">
            <span>Active Worker Deployments</span>
            <Zap className="h-4 w-4 text-signal" />
          </div>
          <div className="text-2xl font-semibold tracking-tight text-text-primary-v4">
            412 <span className="text-xs font-normal text-text-muted-v4">scripts</span>
          </div>
          <div className="text-[11px] text-good mt-1 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> 100% deployed to Anycast edge
          </div>
        </div>

        <div className="v4-panel p-4">
          <div className="flex items-center justify-between text-text-muted-v4 mb-1 text-xs">
            <span>Global Invocations</span>
            <Activity className="h-4 w-4 text-signal" />
          </div>
          <div className="text-2xl font-semibold tracking-tight text-text-primary-v4">
            284,000 <span className="text-xs font-normal text-text-muted-v4">req/s</span>
          </div>
          <div className="text-[11px] text-text-muted-v4 mt-1">
            Peak: 340k req/s
          </div>
        </div>

        <div className="v4-panel p-4">
          <div className="flex items-center justify-between text-text-muted-v4 mb-1 text-xs">
            <span>P95 Execution Latency</span>
            <Cpu className="h-4 w-4 text-signal" />
          </div>
          <div className="text-2xl font-semibold tracking-tight text-good">
            2.8 <span className="text-xs font-normal text-text-muted-v4">ms</span>
          </div>
          <div className="text-[11px] text-good mt-1 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Zero cold-start V8 isolates
          </div>
        </div>

        <div className="v4-panel p-4">
          <div className="flex items-center justify-between text-text-muted-v4 mb-1 text-xs">
            <span>Active V8 Edge Isolates</span>
            <Server className="h-4 w-4 text-signal" />
          </div>
          <div className="text-2xl font-semibold tracking-tight text-text-primary-v4">
            1,240
          </div>
          <div className="text-[11px] text-text-muted-v4 mt-1">
            Across 38 Anycast scrubbing PoPs
          </div>
        </div>
      </div>

      {/* Live Log Stream / Execution Tail */}
      <div className="v4-panel p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-hairline gap-2">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-signal" />
            <h2 className="font-semibold text-sm text-text-primary-v4">Live Worker Execution Tail (Global PoPs)</h2>
            <span className="w-2 h-2 rounded-full bg-signal animate-ping" />
          </div>
          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5 text-text-muted-v4 cursor-pointer">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="w-3.5 h-3.5 accent-[hsl(var(--v4-signal))]"
              />
              Auto-scroll
            </label>
            <button
              onClick={() => setLogs([])}
              className="text-text-muted-v4 hover:text-text-primary-v4 flex items-center gap-1 text-[11px]"
            >
              <Trash2 className="h-3 w-3" /> Clear
            </button>
          </div>
        </div>

        {/* Console Box */}
        <div
          ref={logContainerRef}
          className="bg-black/90 text-text-primary-v4 rounded-btn p-3 font-mono text-xs max-h-56 overflow-y-auto space-y-1.5 border border-hairline select-text"
        >
          {logs.length === 0 ? (
            <div className="text-text-muted-v4 text-center py-6">No logs in buffer. Waiting for edge events...</div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="flex items-center gap-2 text-[11px] hover:bg-white/5 px-1 py-0.5 rounded">
                <span className="text-text-muted-v4 shrink-0">{log.timestamp}</span>
                <span className={`px-1 rounded text-[10px] font-bold ${
                  log.statusCode >= 500 ? 'bg-bad text-white' :
                  log.statusCode >= 400 ? 'bg-warn text-black' :
                  'bg-good/20 text-good'
                }`}>
                  {log.statusCode}
                </span>
                <span className="font-bold text-signal px-1 py-0.2 rounded bg-signal/10">{log.method}</span>
                <span className="text-text-secondary-v4 truncate max-w-xs">{log.path}</span>
                <span className="text-purple-400 font-medium">[{log.workerName}]</span>
                <span className="ml-auto text-text-muted-v4 text-[10px] shrink-0">
                  {log.colo} • {log.durationMs}ms ({log.cpuTimeMs}ms CPU)
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Global Limit Policies Settings */}
      <div className="v4-panel p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-signal" />
            <h2 className="font-semibold text-sm text-text-primary-v4">CPU & Memory Fleet Governor Policies</h2>
          </div>
          <button
            onClick={handleSavePolicies}
            className="px-3 py-1 rounded-btn bg-signal text-black font-semibold text-xs hover:bg-signal/90"
          >
            Save Fleet Policy
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-btn bg-ink-surface-2 border border-hairline space-y-2">
            <label className="text-text-muted-v4 font-medium block">Free Tier Max CPU Time</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={freeCpuLimit}
                onChange={(e) => setFreeCpuLimit(parseInt(e.target.value) || 10)}
                className="w-full px-2 py-1 rounded-btn bg-ink-surface border border-hairline text-text-primary-v4 font-mono font-bold"
              />
              <span className="text-text-muted-v4">ms</span>
            </div>
            <div className="text-[10px] text-text-muted-v4">Hard kill if exceeded</div>
          </div>

          <div className="p-3 rounded-btn bg-ink-surface-2 border border-hairline space-y-2">
            <label className="text-text-muted-v4 font-medium block">Pro Tier Max CPU Time</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={proCpuLimit}
                onChange={(e) => setProCpuLimit(parseInt(e.target.value) || 50)}
                className="w-full px-2 py-1 rounded-btn bg-ink-surface border border-hairline text-text-primary-v4 font-mono font-bold"
              />
              <span className="text-text-muted-v4">ms</span>
            </div>
            <div className="text-[10px] text-text-muted-v4">Standard enterprise SLA</div>
          </div>

          <div className="p-3 rounded-btn bg-ink-surface-2 border border-hairline space-y-2">
            <label className="text-text-muted-v4 font-medium block">Enterprise Max CPU</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={enterpriseCpuLimit}
                onChange={(e) => setEnterpriseCpuLimit(parseInt(e.target.value) || 200)}
                className="w-full px-2 py-1 rounded-btn bg-ink-surface border border-hairline text-text-primary-v4 font-mono font-bold"
              />
              <span className="text-text-muted-v4">ms</span>
            </div>
            <div className="text-[10px] text-text-muted-v4">Dedicated isolate instances</div>
          </div>

          <div className="p-3 rounded-btn bg-ink-surface-2 border border-hairline space-y-2">
            <label className="text-text-muted-v4 font-medium block">Default Memory Ceiling</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={defaultMemoryCap}
                onChange={(e) => setDefaultMemoryCap(parseInt(e.target.value) || 128)}
                className="w-full px-2 py-1 rounded-btn bg-ink-surface border border-hairline text-text-primary-v4 font-mono font-bold"
              />
              <span className="text-text-muted-v4">MB</span>
            </div>
            <div className="text-[10px] text-text-muted-v4">V8 heap allocation cap</div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-hairline text-xs">
          <div>
            <div className="font-medium text-text-primary-v4">V8 Isolate Warm-Pool Pre-warming</div>
            <div className="text-[11px] text-text-muted-v4">Pre-instantiates isolates in memory to maintain sub-millisecond cold start times</div>
          </div>
          <button
            onClick={() => { setPrewarmIsolates(!prewarmIsolates); showToast('success', `Pre-warming ${!prewarmIsolates ? 'enabled' : 'disabled'}`); }}
            className={`w-10 h-5.5 rounded-full transition-colors relative p-0.5 ${prewarmIsolates ? 'bg-signal' : 'bg-ink-surface-2 border border-hairline'}`}
          >
            <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${prewarmIsolates ? 'translate-x-4.5' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      {/* Worker Deployments Registry Table */}
      <div className="v4-panel p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-hairline gap-3">
          <div>
            <h2 className="font-semibold text-sm text-text-primary-v4">Worker Deployments Registry</h2>
            <p className="text-[12px] text-text-muted-v4">All active serverless functions running across the VaultHost edge network</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted-v4" />
              <input
                type="text"
                placeholder="Search worker or route..."
                value={searchWorker}
                onChange={(e) => setSearchWorker(e.target.value)}
                className="w-full pl-8 pr-3 py-1 rounded-btn bg-ink-surface border border-hairline text-xs text-text-primary-v4 placeholder:text-text-muted-v4 focus:outline-none focus:border-signal"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1 rounded-btn bg-ink-surface border border-hairline text-xs text-text-primary-v4 focus:outline-none focus:border-signal"
            >
              <option value="all">All Statuses</option>
              <option value="running">Running</option>
              <option value="throttled">Throttled</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-hairline text-text-muted-v4 text-[11px] uppercase tracking-wider font-semibold">
                <th className="pb-2.5">Worker Name</th>
                <th className="pb-2.5">Tenant Owner</th>
                <th className="pb-2.5">Route Pattern</th>
                <th className="pb-2.5">Version</th>
                <th className="pb-2.5">Replicas</th>
                <th className="pb-2.5">P95 CPU</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filteredWorkers.map(w => (
                <tr key={w.id} className="hover:bg-ink-surface-2/60 transition-colors">
                  <td className="py-3 font-semibold text-text-primary-v4 flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-signal shrink-0" />
                    <span>{w.name}</span>
                  </td>
                  <td className="py-3">
                    <div className="text-text-primary-v4">{w.tenantName}</div>
                    <div className="text-[10px] text-text-muted-v4 font-mono">{w.tenantId}</div>
                  </td>
                  <td className="py-3 font-mono text-[11px] text-text-secondary-v4 max-w-xs truncate">
                    {w.routePattern}
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-chip text-[10px] font-mono bg-ink-surface border border-hairline text-text-secondary-v4">
                      {w.activeVersion}
                    </span>
                  </td>
                  <td className="py-3 text-[11px] text-text-muted-v4">{w.replicas}</td>
                  <td className="py-3 v4-readout-primary font-bold text-text-primary-v4">
                    {w.cpuTimeMs} ms
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-chip font-medium border ${
                      w.status === 'running'
                        ? 'bg-good/10 text-good border-good/20'
                        : w.status === 'throttled'
                        ? 'bg-warn/10 text-warn border-warn/20'
                        : 'bg-bad/10 text-bad border-bad/20'
                    }`}>
                      {w.status === 'running' && <CheckCircle2 className="h-3 w-3" />}
                      {w.status === 'throttled' && <AlertTriangle className="h-3 w-3" />}
                      {w.status === 'suspended' && <Power className="h-3 w-3" />}
                      {w.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setInspectingWorker(w)}
                        className="px-2 py-1 rounded-btn bg-ink-surface hover:bg-ink-surface-2 border border-hairline text-text-secondary-v4 hover:text-text-primary-v4 text-[11px] transition-colors flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" /> Inspect
                      </button>
                      <button
                        onClick={() => handleToggleKillSwitch(w.id, w.status)}
                        className={`px-2 py-1 rounded-btn text-[11px] transition-colors border ${
                          w.status === 'suspended'
                            ? 'bg-good/10 text-good border-good/20 hover:bg-good/20'
                            : 'bg-bad/10 text-bad border-bad/20 hover:bg-bad/20'
                        }`}
                        title={w.status === 'suspended' ? 'Resume worker' : 'Emergency kill-switch'}
                      >
                        {w.status === 'suspended' ? 'Resume' : 'Kill-switch'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Worker Inspector Modal */}
      {inspectingWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="v4-panel max-w-lg w-full p-6 space-y-4 shadow-2xl bg-ink-surface border border-hairline">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div>
                <h3 className="font-semibold text-text-primary-v4 text-sm flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-signal" /> Worker: {inspectingWorker.name}
                </h3>
                <p className="text-[11px] text-text-muted-v4 mt-0.5">
                  Tenant: {inspectingWorker.tenantName} ({inspectingWorker.tenantId})
                </p>
              </div>
              <button onClick={() => setInspectingWorker(null)} className="text-text-muted-v4 hover:text-text-primary-v4">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-btn bg-ink-surface-2 border border-hairline">
                <div>
                  <span className="text-text-muted-v4">Route Pattern:</span>
                  <div className="font-mono text-text-primary-v4 truncate">{inspectingWorker.routePattern}</div>
                </div>
                <div>
                  <span className="text-text-muted-v4">Active Version:</span>
                  <div className="font-mono text-signal">{inspectingWorker.activeVersion}</div>
                </div>
                <div>
                  <span className="text-text-muted-v4">Throughput:</span>
                  <div className="font-mono text-text-primary-v4">{inspectingWorker.requestsPerSec.toLocaleString()} req/s</div>
                </div>
                <div>
                  <span className="text-text-muted-v4">Memory Cap:</span>
                  <div className="font-mono text-text-primary-v4">{inspectingWorker.memoryCapMb} MB</div>
                </div>
              </div>

              <div>
                <span className="text-text-muted-v4 font-medium mb-1.5 block">Resource Bindings</span>
                <div className="space-y-1.5">
                  {inspectingWorker.bindings.map((b, i) => (
                    <div key={i} className="p-2 rounded-btn bg-ink-surface-2 border border-hairline flex items-center justify-between">
                      <span className="font-mono text-text-primary-v4 font-medium">{b.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-ink-surface border border-hairline text-text-secondary-v4">
                        {b.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-2.5 rounded-btn bg-ink-surface-2 border border-hairline flex items-center justify-between text-text-muted-v4">
                <span>Encrypted Environment Secrets:</span>
                <span className="font-mono text-text-primary-v4 font-bold">{inspectingWorker.envVarsCount} encrypted secrets</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-hairline">
              <button
                onClick={() => handleToggleKillSwitch(inspectingWorker.id, inspectingWorker.status)}
                className={`px-3 py-1.5 rounded-btn text-xs font-semibold ${
                  inspectingWorker.status === 'suspended'
                    ? 'bg-good text-black hover:bg-good/90'
                    : 'bg-bad text-white hover:bg-bad/90'
                }`}
              >
                {inspectingWorker.status === 'suspended' ? 'Resume Worker' : 'Emergency Kill-Switch'}
              </button>

              <button
                onClick={() => setInspectingWorker(null)}
                className="px-3 py-1.5 rounded-btn bg-signal text-black font-semibold text-xs hover:bg-signal/90"
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
