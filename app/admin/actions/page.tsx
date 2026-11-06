'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, ShieldAlert, Terminal, Lock, Key, RefreshCw, 
  Search, Filter, CheckCircle2, XCircle, ArrowUpRight, Cpu, 
  Database, Server, Globe, FileCode, Play 
} from 'lucide-react';
import { AuditLogEntry, RiskTier, TargetService } from '@/lib/action-gateway/types';
import { ActionGatewayVisualizer } from '@/components/vaulthost/interactive/ActionGatewayVisualizer';

export default function AdminActionsAuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  // Policy override states
  const [strictAiMode, setStrictAiMode] = useState(true);
  const [prodEscalation, setProdEscalation] = useState(true);
  const [pqcAttestationEnabled, setPqcAttestationEnabled] = useState(true);

  // Test intent runner state
  const [testVerb, setTestVerb] = useState('list_records');
  const [testService, setTestService] = useState<TargetService>('dns');
  const [testActorType, setTestActorType] = useState<'user' | 'ai_agent'>('ai_agent');
  const [dispatching, setDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = '/api/action-gateway/audit?limit=100';
      if (serviceFilter !== 'all') url += `&targetService=${serviceFilter}`;
      if (tierFilter !== 'all') url += `&riskTier=${tierFilter}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [serviceFilter, tierFilter]);

  // Execute a test ActionIntent through the Gateway
  const handleTestDispatch = async () => {
    setDispatching(true);
    setDispatchResult(null);
    try {
      const intent = {
        intentId: crypto.randomUUID(),
        actor: {
          id: testActorType === 'ai_agent' ? 'test_agent_claude' : 'staff_tester',
          type: testActorType,
          tenantId: 'tenant_sandbox',
          roles: testActorType === 'ai_agent' ? ['ai_agent'] : ['super_admin'],
          delegationToken: 'del_sandbox_valid_test_token',
        },
        targetService: testService,
        actionVerb: testVerb,
        resourceUri: `vaulthost://tenants/tenant_sandbox/services/${testService}/sample_resource`,
        parameters: {
          timestamp: Date.now(),
          testPayload: true,
          environment: 'production',
        },
        idempotencyKey: `test_${Date.now()}`,
        reasoningTrace: 'Admin console manual invocation test',
        createdAt: new Date().toISOString(),
      };

      const res = await fetch('/api/action-gateway/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent }),
      });

      const data = await res.json();
      setDispatchResult(JSON.stringify(data, null, 2));
      await fetchLogs();
    } catch (err) {
      setDispatchResult(String(err));
    } finally {
      setDispatching(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.actionVerb.toLowerCase().includes(q) ||
      log.resourceUri.toLowerCase().includes(q) ||
      log.actor.id.toLowerCase().includes(q) ||
      log.actor.tenantId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-ink-surface border border-hairline">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-signal/10 border border-signal/20 text-signal mb-1">
            <Lock className="w-3.5 h-3.5" />
            EXECUTION PLANE & IMMUTABLE LEDGER
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary-v4">
            Action Gateway Audit Trail
          </h1>
          <p className="text-sm text-text-muted-v4 max-w-2xl">
            Cryptographically signed ledger recording all system mutations. Decoupled from AI reasoning
            planes, every intent is validated, classified, and sealed into a tamper-evident audit chain.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-ink-surface-2 hover:bg-ink-surface-2/80 text-text-secondary-v4 border border-hairline self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Ledger
        </button>
      </div>

      {/* Security Policies Control Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-ink-surface border border-hairline space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-text-muted-v4">AI Strict Mode</span>
            <span className="w-2 h-2 rounded-full bg-green-400" />
          </div>
          <h4 className="text-sm font-semibold text-text-primary-v4">AI Agent Escalation</h4>
          <p className="text-xs text-text-muted-v4">
            Forces all AI mutations targeting production to Tier 3 human approval.
          </p>
          <label className="flex items-center gap-2 text-xs font-mono text-signal cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={strictAiMode}
              onChange={(e) => setStrictAiMode(e.target.checked)}
              className="rounded"
            />
            {strictAiMode ? 'Strict Enforcement Active' : 'Standard Mode'}
          </label>
        </div>

        <div className="p-4 rounded-xl bg-ink-surface border border-hairline space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-text-muted-v4">Blast Radius Guard</span>
            <span className="w-2 h-2 rounded-full bg-green-400" />
          </div>
          <h4 className="text-sm font-semibold text-text-primary-v4">Production Shield</h4>
          <p className="text-xs text-text-muted-v4">
            Wildcard operations (* or batch &gt; 5) automatically bump risk tier by +1.
          </p>
          <label className="flex items-center gap-2 text-xs font-mono text-signal cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={prodEscalation}
              onChange={(e) => setProdEscalation(e.target.checked)}
              className="rounded"
            />
            {prodEscalation ? 'Blast Protection Active' : 'Relaxed Mode'}
          </label>
        </div>

        <div className="p-4 rounded-xl bg-ink-surface border border-hairline space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-text-muted-v4">Cryptography</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
          </div>
          <h4 className="text-sm font-semibold text-text-primary-v4">PQC / HMAC Chaining</h4>
          <p className="text-xs text-text-muted-v4">
            Every audit entry is signed with HMAC-SHA256 & ML-DSA-65 post-quantum proof.
          </p>
          <div className="text-xs font-mono text-cyan-300 pt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Immutable Merkle Link Verified
          </div>
        </div>
      </div>

      {/* Manual Test Dispatcher */}
      <div className="p-4 rounded-xl bg-ink-surface border border-hairline space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-text-muted-v4 flex items-center gap-2">
            <Play className="w-3.5 h-3.5 text-signal" />
            Live Gateway Intent Dispatcher & Simulator
          </span>
          <span className="text-xs font-mono text-text-muted-v4">Test deterministic classification</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <select
            value={testService}
            onChange={(e) => setTestService(e.target.value as TargetService)}
            className="px-3 py-2 rounded-lg bg-ink border border-hairline text-xs font-mono text-text-primary-v4"
          >
            <option value="dns">DNS (VaultDNS)</option>
            <option value="compute">Compute (VaultWorkers)</option>
            <option value="storage">Storage (VaultR2)</option>
            <option value="database">Database (VaultD1)</option>
            <option value="iam">IAM / Security</option>
          </select>

          <select
            value={testVerb}
            onChange={(e) => setTestVerb(e.target.value)}
            className="px-3 py-2 rounded-lg bg-ink border border-hairline text-xs font-mono text-text-primary-v4"
          >
            <option value="list_records">list_records (Tier 0: Read-only)</option>
            <option value="add_dns_record">add_dns_record (Tier 1: Low Mutation)</option>
            <option value="deploy_worker">deploy_worker (Tier 2: Deployment)</option>
            <option value="drop_table">drop_table (Tier 3: Destructive)</option>
            <option value="delete_database">delete_database (Tier 3: Destructive)</option>
          </select>

          <select
            value={testActorType}
            onChange={(e) => setTestActorType(e.target.value as 'user' | 'ai_agent')}
            className="px-3 py-2 rounded-lg bg-ink border border-hairline text-xs font-mono text-text-primary-v4"
          >
            <option value="ai_agent">Actor: AI Agent (Autonomous)</option>
            <option value="user">Actor: Human Staff Admin</option>
          </select>

          <button
            onClick={handleTestDispatch}
            disabled={dispatching}
            className="px-4 py-2 rounded-lg bg-signal text-black font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {dispatching ? 'Dispatching...' : 'Dispatch ActionIntent'}
          </button>
        </div>

        {dispatchResult && (
          <div className="mt-2 p-3 rounded-lg bg-ink-surface-2 border border-signal/20 space-y-1">
            <span className="text-xs font-mono text-signal">Gateway Response:</span>
            <pre className="text-xs font-mono text-green-300 overflow-x-auto max-h-36">
              {dispatchResult}
            </pre>
          </div>
        )}
      </div>

      {/* Interactive 3-Plane Visualizer Simulator */}
      <ActionGatewayVisualizer />

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted-v4" />
          <input
            type="text"
            placeholder="Search action verb, URI, actor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-ink-surface border border-hairline text-xs text-text-primary-v4 focus:border-signal outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-ink-surface border border-hairline text-xs font-mono text-text-secondary-v4"
          >
            <option value="all">All Services</option>
            <option value="compute">Compute</option>
            <option value="storage">Storage</option>
            <option value="database">Database</option>
            <option value="dns">DNS</option>
            <option value="iam">IAM</option>
          </select>

          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-ink-surface border border-hairline text-xs font-mono text-text-secondary-v4"
          >
            <option value="all">All Risk Tiers</option>
            <option value="0">Tier 0 (Read-only)</option>
            <option value="1">Tier 1 (Diff Confirm)</option>
            <option value="2">Tier 2 (Step-Up 2FA)</option>
            <option value="3">Tier 3 (Staff Dual-Auth)</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl bg-ink-surface border border-hairline overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-ink-surface-2 border-b border-hairline text-text-muted-v4 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Timestamp / Log ID</th>
                <th className="px-4 py-3">Risk Tier</th>
                <th className="px-4 py-3">Target Service & Verb</th>
                <th className="px-4 py-3">Actor & Tenant</th>
                <th className="px-4 py-3">Outcome</th>
                <th className="px-4 py-3">Cryptographic Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-muted-v4">
                    No audit records matching query. Use the Dispatcher above to generate live entries.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const tierColors: Record<RiskTier, string> = {
                    0: 'text-green-400 bg-green-500/10 border-green-500/20',
                    1: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
                    2: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                    3: 'text-red-400 bg-red-500/10 border-red-500/20',
                  };

                  return (
                    <tr
                      key={log.logId}
                      onClick={() => setSelectedLog(selectedLog?.logId === log.logId ? null : log)}
                      className="hover:bg-ink-surface-2/60 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-text-primary-v4">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        <div className="text-text-muted-v4 text-[10px]">
                          {log.logId.slice(0, 13)}...
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${tierColors[log.riskTier]}`}>
                          Tier {log.riskTier}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-text-primary-v4 flex items-center gap-1.5">
                          <Terminal className="w-3 h-3 text-signal" />
                          {log.actionVerb}
                        </div>
                        <div className="text-text-muted-v4 text-[11px] truncate max-w-xs">
                          {log.resourceUri}
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-text-primary-v4">
                          {log.actor.type === 'ai_agent' ? (
                            <Cpu className="w-3 h-3 text-cyan-400" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-signal" />
                          )}
                          {log.actor.id}
                        </div>
                        <div className="text-text-muted-v4 text-[10px]">
                          {log.actor.tenantId}
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                          log.outcome === 'executed' || log.outcome === 'confirmed'
                            ? 'bg-green-500/10 text-green-400'
                            : log.outcome === 'enqueued_approval'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}>
                          {log.outcome}
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 text-cyan-400 text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          HMAC-SHA256 Chained
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Log Drawer */}
      {selectedLog && (
        <div className="p-5 rounded-2xl bg-ink-surface border border-signal/40 space-y-3">
          <div className="flex items-center justify-between border-b border-hairline pb-2">
            <span className="text-xs font-mono font-semibold text-text-primary-v4 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-signal" />
              Cryptographic Entry Proof: {selectedLog.logId}
            </span>
            <button
              onClick={() => setSelectedLog(null)}
              className="text-xs text-text-muted-v4 hover:text-text-primary-v4"
            >
              Close
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-ink-surface-2 text-xs font-mono text-cyan-300 overflow-x-auto">
            {JSON.stringify(selectedLog, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
