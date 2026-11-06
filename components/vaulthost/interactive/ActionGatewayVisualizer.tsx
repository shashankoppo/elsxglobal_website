'use client';

import { useState } from 'react';
import { 
  Bot, ShieldCheck, ShieldAlert, Cpu, Lock, CheckCircle2, 
  ArrowRight, Play, RefreshCw, Key, AlertTriangle, FileCode, Check, Copy 
} from 'lucide-react';

interface Scenario {
  id: string;
  name: string;
  service: string;
  verb: string;
  tier: 0 | 1 | 2 | 3;
  tierLabel: string;
  tierColor: string;
  intent: {
    intentId: string;
    actor: {
      id: string;
      type: 'ai_agent' | 'user' | 'system';
      tenantId: string;
      roles: string[];
    };
    targetService: string;
    actionVerb: string;
    resourceUri: string;
    parameters: Record<string, any>;
    reasoningTrace: string;
    confidenceScore: number;
  };
}

const SCENARIOS: Scenario[] = [
  {
    id: 'purge-dns',
    name: 'DNS Cache Purge (Autonomous Operation)',
    service: 'dns',
    verb: 'purge_cache',
    tier: 0,
    tierLabel: 'Tier 0: Autonomous Auto-Approval',
    tierColor: 'text-good border-good/30 bg-good/10',
    intent: {
      intentId: 'int_9f81a702-8b4e-4e3a',
      actor: {
        id: 'agent_edge_optimizer_v4',
        type: 'ai_agent',
        tenantId: 'cust_tenant_prod_01',
        roles: ['autonomous_operator', 'edge_cache_admin']
      },
      targetService: 'dns',
      actionVerb: 'purge_cache',
      resourceUri: 'zones/vaulthost.dev/cache',
      parameters: { purge_everything: true, reason: 'Stale asset eviction after release' },
      reasoningTrace: 'Observed 404 rate increase on /v2/api after deployment #912. Evicting edge L2 cache to force origin refetch.',
      confidenceScore: 0.99
    }
  },
  {
    id: 'vps-reboot',
    name: 'VPS Graceful Restart (State Snapshot)',
    service: 'compute',
    verb: 'restart_instance',
    tier: 1,
    tierLabel: 'Tier 1: Logged & Snapshot Reversible',
    tierColor: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10',
    intent: {
      intentId: 'int_4a12c890-7d1f-4b2a',
      actor: {
        id: 'agent_sysadmin_remediator',
        type: 'ai_agent',
        tenantId: 'cust_tenant_prod_01',
        roles: ['infra_remediator']
      },
      targetService: 'compute',
      actionVerb: 'restart_instance',
      resourceUri: 'instances/vps-mumbai-epyc-01',
      parameters: { graceful: true, timeoutSeconds: 30 },
      reasoningTrace: 'Memory consumption exceeds 94% threshold due to orphaned worker processes. Initiating graceful reload with memory dump capture.',
      confidenceScore: 0.96
    }
  },
  {
    id: 'deploy-worker',
    name: 'Edge Function Deployment (Step-up 2FA Challenge)',
    service: 'compute',
    verb: 'deploy_worker',
    tier: 2,
    tierLabel: 'Tier 2: Human Operator 2FA Challenge',
    tierColor: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
    intent: {
      intentId: 'int_7c992a10-3e2b-4f99',
      actor: {
        id: 'agent_ci_releaser',
        type: 'ai_agent',
        tenantId: 'cust_tenant_prod_01',
        roles: ['deployment_agent']
      },
      targetService: 'compute',
      actionVerb: 'deploy_worker',
      resourceUri: 'workers/edge-auth-router/releases',
      parameters: { scriptHash: 'sha256:e3b0c44298fc1c149afbf4c8996fb924', trafficShiftPercent: 100 },
      reasoningTrace: 'CI pipeline #184 passed unit & integration tests. Proposing 100% production traffic cutover to release v2.4.1.',
      confidenceScore: 0.94
    }
  },
  {
    id: 'drop-database',
    name: 'Drop Production Database (Multi-Party Quorum Hold)',
    service: 'database',
    verb: 'drop_database',
    tier: 3,
    tierLabel: 'Tier 3: Destructive Quorum Quarantine',
    tierColor: 'text-red-400 border-red-400/30 bg-red-400/10',
    intent: {
      intentId: 'int_ff0183ac-9912-4211',
      actor: {
        id: 'agent_database_migrator',
        type: 'ai_agent',
        tenantId: 'cust_tenant_prod_01',
        roles: ['db_admin']
      },
      targetService: 'database',
      actionVerb: 'drop_database',
      resourceUri: 'databases/prod_payments_primary',
      parameters: { force: true, archiveSnapshot: false },
      reasoningTrace: 'Scheduled decommissioning of legacy schema after cutover.',
      confidenceScore: 0.88
    }
  }
];

export function ActionGatewayVisualizer() {
  const [activeScenarioId, setActiveScenarioId] = useState<string>('purge-dns');
  const [simulationStep, setSimulationStep] = useState<number>(0);
  const [simulating, setSimulating] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [totpApproved, setTotpApproved] = useState(false);
  const [copied, setCopied] = useState(false);

  const scenario = SCENARIOS.find((s) => s.id === activeScenarioId) || SCENARIOS[0];

  const handleRunSimulation = () => {
    setSimulating(true);
    setSimulationStep(1);
    setTotpApproved(false);
    setTotpCode('');

    setTimeout(() => {
      setSimulationStep(2); // Gateway Policy Evaluation
      setTimeout(() => {
        setSimulationStep(3); // Verification Gate
        if (scenario.tier === 0 || scenario.tier === 1) {
          setTimeout(() => {
            setSimulationStep(4); // Execution Complete
            setSimulating(false);
          }, 800);
        } else {
          // Tier 2 or 3 stops at step 3 for human challenge
          setSimulating(false);
        }
      }, 700);
    }, 600);
  };

  const handleApproveTotp = () => {
    if (totpCode.length === 6) {
      setTotpApproved(true);
      setSimulating(true);
      setTimeout(() => {
        setSimulationStep(4);
        setSimulating(false);
      }, 600);
    }
  };

  const hmacSig = `sha256:7f9a12c8${scenario.id.slice(0, 4)}e93019ab921b74f0148c2b7405e6b12a`;

  return (
    <div className="v4-panel p-6 rounded-3xl border-hairline bg-ink-surface/90">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-hairline">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-signal animate-pulse" />
            <h3 className="text-xl font-medium text-text-primary-v4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-signal" /> Interactive Action Gateway Simulator
            </h3>
          </div>
          <p className="text-xs text-text-muted-v4 mt-1">
            Experience the strict Decoupled Intelligence boundary: AI proposes an ActionIntent, the Action Gateway enforces deterministic risk tiers, cryptographic HMAC signing, and fails closed.
          </p>
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={simulating}
          className="v4-btn-primary px-5 py-2.5 rounded-xl text-xs font-mono font-medium flex items-center gap-2 shrink-0 group disabled:opacity-50"
        >
          {simulating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying Policy...
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" /> Dispatch ActionIntent
            </>
          )}
        </button>
      </div>

      {/* Scenario Selector Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-6">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              setActiveScenarioId(s.id);
              setSimulationStep(0);
              setTotpApproved(false);
            }}
            className={`p-3.5 text-left rounded-2xl border font-mono transition-all flex flex-col justify-between ${
              activeScenarioId === s.id
                ? 'border-signal bg-signal/10 shadow-lg'
                : 'border-hairline bg-ink-surface-2 hover:border-hairline-2'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${s.tierColor}`}>
                Tier {s.tier}
              </span>
              <span className="text-[10px] text-text-muted-v4">{s.service}</span>
            </div>
            <div className="text-xs font-semibold text-text-primary-v4 line-clamp-1">{s.verb}</div>
            <div className="text-[11px] text-text-muted-v4 mt-1 line-clamp-2">{s.name}</div>
          </button>
        ))}
      </div>

      {/* 3-Plane Interactive Architecture Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Plane 1: Reasoning Plane */}
        <div className={`p-5 rounded-2xl border transition-all ${
          simulationStep >= 1 ? 'border-signal bg-ink-surface-2' : 'border-hairline bg-ink-surface/50 opacity-80'
        }`}>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-hairline">
            <span className="text-xs font-mono uppercase tracking-wider text-signal font-semibold flex items-center gap-1.5">
              <Bot className="w-4 h-4" /> 1. Reasoning Plane
            </span>
            <span className="text-[10px] text-text-muted-v4">AI Agent</span>
          </div>

          <p className="text-xs text-text-secondary-v4 mb-3">
            Autonomous agent assesses system state and formulates a strict, declarative <code>ActionIntent</code>.
          </p>

          <div className="rounded-xl bg-ink/70 p-3 font-mono text-[11px] text-text-muted-v4 border border-hairline overflow-x-auto max-h-56">
            <div className="text-cyan-300 font-semibold mb-1">Intent ID: {scenario.intent.intentId}</div>
            <div>Actor: <span className="text-text-primary-v4">{scenario.intent.actor.id}</span></div>
            <div>Verb: <span className="text-signal">{scenario.intent.actionVerb}</span></div>
            <div>Resource: <span className="text-text-secondary-v4">{scenario.intent.resourceUri}</span></div>
            <div className="mt-2 text-[10px] text-amber-300 italic">
              "{scenario.intent.reasoningTrace}"
            </div>
          </div>
        </div>

        {/* Plane 2: Action Gateway Plane */}
        <div className={`p-5 rounded-2xl border transition-all ${
          simulationStep >= 2 ? 'border-signal bg-ink-surface-2' : 'border-hairline bg-ink-surface/50 opacity-80'
        }`}>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-hairline">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
              <Lock className="w-4 h-4" /> 2. Action Gateway
            </span>
            <span className="text-[10px] text-text-muted-v4">Deterministic Guard</span>
          </div>

          <p className="text-xs text-text-secondary-v4 mb-3">
            Evaluates blast radius, computes HMAC tamper seal, and maps action to policy safeguards.
          </p>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between p-2 rounded-lg bg-ink/60 border border-hairline">
              <span className="text-text-muted-v4">Classified Risk:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${scenario.tierColor}`}>
                Tier {scenario.tier}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-ink/60 border border-hairline">
              <span className="text-text-muted-v4">HMAC Signature:</span>
              <span className="text-signal text-[10px] truncate max-w-[140px]">{hmacSig}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-ink/60 border border-hairline">
              <span className="text-text-muted-v4">Policy Rule:</span>
              <span className="text-text-primary-v4 text-[11px]">{scenario.tierLabel.split(':')[1]}</span>
            </div>
          </div>
        </div>

        {/* Plane 3: Execution / Audit Plane */}
        <div className={`p-5 rounded-2xl border transition-all ${
          simulationStep >= 4 ? 'border-good bg-good/5' : 'border-hairline bg-ink-surface/50 opacity-80'
        }`}>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-hairline">
            <span className="text-xs font-mono uppercase tracking-wider text-good font-semibold flex items-center gap-1.5">
              <Cpu className="w-4 h-4" /> 3. Execution Plane
            </span>
            <span className="text-[10px] text-text-muted-v4">Infrastructure</span>
          </div>

          <p className="text-xs text-text-secondary-v4 mb-3">
            Executes only with valid cryptographic token; records tamper-proof ledger entry.
          </p>

          {simulationStep >= 4 ? (
            <div className="p-3 rounded-xl bg-good/10 border border-good/30 text-xs font-mono text-good space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" /> Action Executed
              </div>
              <div className="text-[10px] text-text-secondary-v4">Ledger Block #8192 verified</div>
              <div className="text-[10px] text-text-muted-v4">Latency: 4.8ms | Idempotency Key OK</div>
            </div>
          ) : simulationStep === 3 && scenario.tier >= 2 ? (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-300">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <AlertTriangle className="w-4 h-4" /> Gate Challenge Active
              </div>
              <div className="text-[11px] text-text-muted-v4">
                {scenario.tier === 2 ? 'Awaiting Operator TOTP step-up verification.' : 'Quarantine hold: Requires 2 staff approvals.'}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-ink/40 border border-hairline text-center text-xs text-text-muted-v4 font-mono">
              Ready for dispatch.
            </div>
          )}
        </div>
      </div>

      {/* Interactive Challenge Modal / Box for Tier 2 and Tier 3 */}
      {simulationStep === 3 && scenario.tier === 2 && !totpApproved && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-300 font-mono font-semibold text-sm">
                <Key className="w-4 h-4" /> Tier 2 Challenge: Enter Operator TOTP (2FA) Token
              </div>
              <p className="text-xs text-text-secondary-v4 mt-1">
                Because this action mutates edge service code, the AI cannot proceed autonomously. Test code: <strong>847291</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                placeholder="847291"
                className="w-28 px-3 py-2 text-sm font-mono text-center rounded-xl bg-ink border border-amber-500/40 text-amber-200 outline-none tracking-widest"
              />
              <button
                onClick={handleApproveTotp}
                disabled={totpCode.length !== 6}
                className="px-4 py-2 rounded-xl bg-amber-400 text-black text-xs font-mono font-bold hover:bg-amber-300 disabled:opacity-40 transition-colors"
              >
                Approve Intent
              </button>
            </div>
          </div>
        </div>
      )}

      {simulationStep === 3 && scenario.tier === 3 && (
        <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 mb-6 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-red-400 font-mono font-semibold text-sm">
            <ShieldAlert className="w-5 h-5" /> Tier 3 Safety Interlock: Quorum Hold Initiated
          </div>
          <p className="text-xs text-text-secondary-v4 mt-1">
            Destructive actions cannot be approved by a single token. A ticket has been placed in the Dual-Authorization Staff Queue.
            Ticket ID: <span className="font-mono text-signal">QUORUM-REQ-9014</span>. Autonomous agents cannot bypass this safeguard.
          </p>
        </div>
      )}
    </div>
  );
}
