'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldAlert, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, 
  RefreshCw, Cpu, Database, Server, Terminal, Lock, ChevronDown, 
  ChevronUp, UserCheck, Eye, ArrowRight, Sparkles 
} from 'lucide-react';
import { ApprovalRequest, ActionExecutionResult } from '@/lib/action-gateway/types';

export default function AdminApprovalQueuePage() {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState<ApprovalRequest | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [staff2FaToken, setStaff2FaToken] = useState('Admin@2026!');
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [simulating, setSimulating] = useState(false);

  // Fetch pending requests
  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/action-gateway/approvals');
      const data = await res.json();
      if (data.approvals) {
        setRequests(data.approvals);
      }
    } catch (err) {
      console.error('Failed to load approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  // Handle staff approval
  const handleApprove = async (requestId: string) => {
    setApprovingId(requestId);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/action-gateway/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          requestId,
          staff2FaToken,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({
          type: 'success',
          text: `Action executed successfully! Log signature: ${data.result?.auditLogId?.slice(0, 8)}...`,
        });
        setSelectedReq(null);
        await fetchApprovals();
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Failed to authorize action execution',
        });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Network failure during authorization' });
    } finally {
      setApprovingId(null);
    }
  };

  // Handle staff rejection
  const handleReject = async () => {
    if (!selectedReq) return;
    setStatusMessage(null);
    try {
      const res = await fetch('/api/action-gateway/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          requestId: selectedReq.requestId,
          rejectionReason: rejectionReason || 'Rejected by staff operator policy override.',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({
          type: 'success',
          text: 'Request rejected. Constructive feedback returned to reasoning agent.',
        });
        setRejectionModalOpen(false);
        setSelectedReq(null);
        setRejectionReason('');
        await fetchApprovals();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to reject request' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Network failure during rejection' });
    }
  };

  // Seed simulated Tier 3 request for instant demonstration
  const handleSeedDemoRequest = async () => {
    setSimulating(true);
    try {
      const mockIntent = {
        intentId: crypto.randomUUID(),
        actor: {
          id: 'agent_cluster_autopilot_v2',
          type: 'ai_agent',
          tenantId: 'tenant_acme_corp',
          email: 'agent@acme.ai',
          roles: ['ai_agent'],
          delegationToken: 'del_acme_scoped_worker_token',
        },
        targetService: 'database',
        actionVerb: 'drop_table',
        resourceUri: 'vaulthost://tenants/tenant_acme_corp/services/database/prod_analytics_legacy',
        parameters: {
          database: 'prod_analytics_legacy',
          table: 'historical_aggregates_2024',
          cascade: true,
          estimatedReclaimedStorageMb: 42000,
          environment: 'production',
        },
        idempotencyKey: `seed_${Date.now()}`,
        reasoningTrace:
          'Storage budget threshold exceeded (94%). All 2024 rows have been aggregated into cold parquet storage in VaultR2. Proposing drop of unindexed raw SQL table to prevent automated billing surcharge.',
        confidenceScore: 0.98,
        createdAt: new Date().toISOString(),
      };

      await fetch('/api/action-gateway/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: mockIntent }),
      });

      await fetchApprovals();
      setStatusMessage({
        type: 'success',
        text: 'Simulated Tier 3 ActionIntent generated and held in Staff Approval Queue.',
      });
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-ink-surface border border-hairline relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-red-500/10 border border-red-500/20 text-red-400 mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            TIER 3 DUAL-AUTHORIZATION GATEWAY
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary-v4 flex items-center gap-3">
            Staff Approval Queue
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-red-500/20 text-red-300 border border-red-500/30">
              {requests.length} Pending
            </span>
          </h1>
          <p className="text-sm text-text-muted-v4 max-w-2xl">
            Autonomous AI reasoning engines cannot mutate production state without strict verification.
            All destructive, teardown, and production-affecting actions are queued here for human sign-off.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSeedDemoRequest}
            disabled={simulating}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-signal/10 hover:bg-signal/20 text-signal border border-signal/30 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            {simulating ? 'Generating...' : 'Simulate Tier 3 AI Intent'}
          </button>
          <button
            onClick={fetchApprovals}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-ink-surface-2 hover:bg-ink-surface-2/80 text-text-secondary-v4 border border-hairline transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Notifications */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center gap-3 ${
            statusMessage.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-green-400" />
          ) : (
            <XCircle className="w-5 h-5 shrink-0 text-red-400" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Content Area */}
      {requests.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-ink-surface border border-hairline space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-text-primary-v4">Approval Queue is Empty</h3>
            <p className="text-sm text-text-muted-v4 max-w-md mx-auto">
              All AI agents and execution pipelines are currently within safe baseline parameters. No pending Tier 3 destructive mutations.
            </p>
          </div>
          <button
            onClick={handleSeedDemoRequest}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-signal text-black font-semibold hover:opacity-95 transition-opacity"
          >
            <Sparkles className="w-4 h-4" />
            Generate Sample AI Intent to Test
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Request List */}
          <div className="lg:col-span-1 space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-text-muted-v4 px-1">
              Active Pending Requests ({requests.length})
            </div>
            {requests.map((req) => {
              const isSelected = selectedReq?.requestId === req.requestId;
              return (
                <div
                  key={req.requestId}
                  onClick={() => setSelectedReq(req)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-ink-surface-2 border-red-500/50 ring-1 ring-red-500/30 shadow-lg shadow-red-500/5'
                      : 'bg-ink-surface border-hairline hover:border-text-muted-v4/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 uppercase font-semibold">
                      Tier 3 Destructive
                    </span>
                    <span className="text-xs text-text-muted-v4 font-mono">
                      {new Date(req.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="text-sm font-medium text-text-primary-v4 flex items-center gap-1.5 font-mono mb-1">
                    <Terminal className="w-3.5 h-3.5 text-signal" />
                    {req.intent.actionVerb}
                  </h4>

                  <p className="text-xs text-text-muted-v4 truncate mb-3">
                    {req.intent.resourceUri}
                  </p>

                  <div className="flex items-center justify-between text-xs text-text-secondary-v4 border-t border-hairline/50 pt-2 font-mono">
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-cyan-400" />
                      {req.intent.actor.type === 'ai_agent' ? 'AI Agent' : 'Human'}
                    </span>
                    <span className="text-text-muted-v4">
                      {req.intent.actor.tenantId}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed Diff & Authorization Panel */}
          <div className="lg:col-span-2">
            {selectedReq ? (
              <div className="rounded-2xl bg-ink-surface border border-hairline p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-hairline pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 font-semibold uppercase">
                        Requires Staff Dual-Authorization
                      </span>
                      <span className="text-xs font-mono text-text-muted-v4">
                        ID: {selectedReq.requestId}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-text-primary-v4 font-mono">
                      {selectedReq.intent.actionVerb}
                    </h3>
                    <p className="text-xs text-text-muted-v4 font-mono">
                      Target: {selectedReq.intent.resourceUri}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono text-text-muted-v4 block">Confidence</span>
                    <span className="text-sm font-mono font-bold text-green-400">
                      {((selectedReq.intent.confidenceScore || 0.95) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* AI Reasoning Trace */}
                {selectedReq.intent.reasoningTrace && (
                  <div className="p-4 rounded-xl bg-ink-surface-2 border border-signal/20 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-signal uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      AI Model Reasoning Trace
                    </div>
                    <p className="text-xs text-text-secondary-v4 leading-relaxed font-mono">
                      {selectedReq.intent.reasoningTrace}
                    </p>
                  </div>
                )}

                {/* Target Parameters */}
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase text-text-muted-v4">Action Parameters</span>
                  <pre className="p-3 rounded-xl bg-ink-surface-2 border border-hairline text-xs font-mono text-cyan-300 overflow-x-auto">
                    {JSON.stringify(selectedReq.intent.parameters, null, 2)}
                  </pre>
                </div>

                {/* Visual State Diff Preview */}
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase text-text-muted-v4">State Diff Preview (Before vs Proposed After)</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 space-y-1">
                      <span className="text-xs font-mono text-red-400 block font-semibold">BEFORE STATE</span>
                      <pre className="text-xs font-mono text-red-200/80 overflow-x-auto max-h-48">
                        {JSON.stringify(selectedReq.diff.beforeState, null, 2)}
                      </pre>
                    </div>
                    <div className="p-3 rounded-xl bg-green-950/20 border border-green-500/20 space-y-1">
                      <span className="text-xs font-mono text-green-400 block font-semibold">PROPOSED AFTER STATE</span>
                      <pre className="text-xs font-mono text-green-200/80 overflow-x-auto max-h-48">
                        {JSON.stringify(selectedReq.diff.afterState, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Staff Authorization Form */}
                <div className="p-4 rounded-xl bg-ink-surface-2 border border-hairline space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-text-primary-v4">
                      <Lock className="w-4 h-4 text-signal" />
                      Staff 2FA Dual-Authorization Challenge
                    </div>
                    <span className="text-xs text-text-muted-v4 font-mono">Demo token: Admin@2026!</span>
                  </div>

                  <input
                    type="password"
                    value={staff2FaToken}
                    onChange={(e) => setStaff2FaToken(e.target.value)}
                    placeholder="Enter Staff 2FA / Password Passcode..."
                    className="w-full px-3 py-2 rounded-lg bg-ink border border-hairline text-sm text-text-primary-v4 focus:border-signal outline-none font-mono"
                  />

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => handleApprove(selectedReq.requestId)}
                      disabled={approvingId === selectedReq.requestId || !staff2FaToken}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-green-600 hover:bg-green-500 text-white transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {approvingId === selectedReq.requestId ? 'Executing...' : 'Approve & Execute Mutation'}
                    </button>

                    <button
                      onClick={() => setRejectionModalOpen(true)}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 transition-colors"
                    >
                      Reject with Feedback
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex items-center justify-center rounded-2xl bg-ink-surface border border-hairline text-sm text-text-muted-v4">
                Select a pending request from the left column to inspect its diff and authorize execution.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-ink-surface border border-hairline p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-text-primary-v4">Reject Action Intent</h3>
            <p className="text-xs text-text-muted-v4">
              Provide constructive feedback to the reasoning agent. The agent will read this explanation and synthesize an alternative plan.
            </p>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Do not drop raw analytics table until Q1 audit is finalized. Retain until 2026-10-01..."
              className="w-full p-3 rounded-xl bg-ink border border-hairline text-xs font-mono text-text-primary-v4 focus:border-signal outline-none"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectionModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-text-muted-v4 hover:text-text-primary-v4"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
