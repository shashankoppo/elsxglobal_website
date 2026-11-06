'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Bot, Terminal, ShieldAlert, ShieldCheck, Check, Copy, 
  ArrowLeft, Cpu, Key, FileCode, Sparkles, AlertCircle 
} from 'lucide-react';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ActionGatewayVisualizer } from '@/components/vaulthost/interactive/ActionGatewayVisualizer';

export default function AiAgentDocsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const actionIntentSchemaJson = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ActionIntent",
  "type": "object",
  "required": [
    "intentId",
    "actor",
    "targetService",
    "actionVerb",
    "resourceUri",
    "parameters",
    "idempotencyKey",
    "createdAt"
  ],
  "properties": {
    "intentId": { "type": "string", "format": "uuid" },
    "actor": {
      "type": "object",
      "required": ["id", "type", "tenantId", "roles"],
      "properties": {
        "id": { "type": "string" },
        "type": { "type": "string", "enum": ["ai_agent", "user", "system"] },
        "tenantId": { "type": "string" },
        "email": { "type": "string", "format": "email" },
        "roles": { "type": "array", "items": { "type": "string" } },
        "delegationToken": { "type": "string" },
        "clientIp": { "type": "string" }
      }
    },
    "targetService": {
      "type": "string",
      "enum": ["compute", "storage", "database", "dns", "ai_gateway", "network", "billing", "iam"]
    },
    "actionVerb": { "type": "string" },
    "resourceUri": { "type": "string" },
    "parameters": { "type": "object" },
    "idempotencyKey": { "type": "string", "minLength": 8 },
    "reasoningTrace": { "type": "string" },
    "confidenceScore": { "type": "number", "minimum": 0, "maximum": 1 },
    "createdAt": { "type": "string", "format": "date-time" }
  }
}`;

  const mcpExampleJson = `{
  "jsonrpc": "2.0",
  "id": "req-001",
  "method": "tools/call",
  "params": {
    "name": "vaulthost_workers_deploy",
    "arguments": {
      "workerName": "edge-auth-router",
      "action": "deploy",
      "environment": "production",
      "scriptCode": "export default { async fetch(req) { return new Response('OK'); } }"
    }
  }
}`;

  return (
    <div className="v4-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link
          href="/docs"
          className="inline-flex items-center gap-2 text-xs font-mono text-text-muted-v4 hover:text-signal transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Documentation Hub
        </Link>
      </div>

      <PageHeroV4
        eyebrow="Agent Specification"
        title={
          <>
            AI Agent & <span className="text-signal">Reasoning Plane Spec</span>
          </>
        }
        description="Deterministic protocol specification, JSON schemas, Model Context Protocol (MCP) tool catalogs, and Risk Tier classification taxonomy for autonomous agents."
      />

      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Key Rule Box */}
          <div className="p-6 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-cyan-200">
                Rule of Decoupled Intelligence for Autonomous Agents
              </h3>
              <p className="text-xs text-cyan-300/80 leading-relaxed font-mono">
                AI agents MUST NOT generate raw SQL, execute bash commands, or directly invoke infrastructure endpoints. Agents ONLY emit schema-validated <code>ActionIntent</code> payloads. The Action Gateway independently evaluates identity, tenant boundary, blast radius, and risk tier before any execution occurs.
              </p>
            </div>
          </div>

          {/* Interactive Action Gateway Simulator */}
          <div className="space-y-4">
            <ActionGatewayVisualizer />
          </div>

          {/* Risk Tier Taxonomy Table */}
          <div className="space-y-4">
            <h2 className="v4-display text-2xl font-bold text-text-primary-v4">
              Risk Classification Matrix
            </h2>
            <p className="text-xs text-text-secondary-v4">
              The Action Gateway deterministically maps every ActionIntent into one of four Risk Tiers based on verb semantics, environment, and blast radius.
            </p>

            <div className="rounded-2xl bg-ink-surface border border-hairline overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-ink-surface-2 border-b border-hairline text-text-muted-v4 uppercase">
                  <tr>
                    <th className="px-4 py-3">Tier</th>
                    <th className="px-4 py-3">Classification</th>
                    <th className="px-4 py-3">Allowed Verbs</th>
                    <th className="px-4 py-3">Gatekeeper Requirement</th>
                    <th className="px-4 py-3">Agent Behavior</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  <tr className="hover:bg-ink-surface-2/40">
                    <td className="px-4 py-3 font-bold text-green-400">Tier 0</td>
                    <td className="px-4 py-3">Read-only / Observability</td>
                    <td className="px-4 py-3 text-text-muted-v4">get, list, read, query, logs, metrics, status</td>
                    <td className="px-4 py-3">Immediate execution + signed audit log</td>
                    <td className="px-4 py-3 text-green-300">Synchronous result returned immediately</td>
                  </tr>
                  <tr className="hover:bg-ink-surface-2/40">
                    <td className="px-4 py-3 font-bold text-cyan-400">Tier 1</td>
                    <td className="px-4 py-3">Low-Mutation / Safe Addition</td>
                    <td className="px-4 py-3 text-text-muted-v4">create, add_dns_record, set, upload, stage, preview</td>
                    <td className="px-4 py-3">Diff preview + confirmationToken verification</td>
                    <td className="px-4 py-3 text-cyan-300">Inspect diff, present to user, re-submit token</td>
                  </tr>
                  <tr className="hover:bg-ink-surface-2/40">
                    <td className="px-4 py-3 font-bold text-amber-400">Tier 2</td>
                    <td className="px-4 py-3">High-Mutation / Service Deploy</td>
                    <td className="px-4 py-3 text-text-muted-v4">deploy_worker, scale, restart, switch_traffic, update_dns_zone</td>
                    <td className="px-4 py-3">Step-up 2FA / TOTP authentication challenge</td>
                    <td className="px-4 py-3 text-amber-300">Prompt human operator for 2FA verification token</td>
                  </tr>
                  <tr className="hover:bg-ink-surface-2/40">
                    <td className="px-4 py-3 font-bold text-red-400">Tier 3</td>
                    <td className="px-4 py-3">Destructive / Irreversible</td>
                    <td className="px-4 py-3 text-text-muted-v4">drop_table, delete_database, purge_all_dns, delete_bucket</td>
                    <td className="px-4 py-3">Dual-Authorization Human Staff Approval Queue</td>
                    <td className="px-4 py-3 text-red-300">Held in queue. Agent monitors status via requestId</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ActionIntent Schema */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="v4-display text-2xl font-bold text-text-primary-v4">
                Canonical ActionIntent JSON Schema
              </h2>
              <button
                onClick={() => copyToClipboard(actionIntentSchemaJson, 'schema')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-ink-surface border border-hairline text-text-secondary-v4 hover:text-signal"
              >
                {copiedId === 'schema' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedId === 'schema' ? 'Copied' : 'Copy Schema'}
              </button>
            </div>
            <pre className="p-4 rounded-2xl bg-ink-surface border border-hairline text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed max-h-96">
              {actionIntentSchemaJson}
            </pre>
          </div>

          {/* MCP Server Integration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="v4-display text-2xl font-bold text-text-primary-v4">
                Model Context Protocol (MCP) JSON-RPC 2.0
              </h2>
              <button
                onClick={() => copyToClipboard(mcpExampleJson, 'mcp')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-ink-surface border border-hairline text-text-secondary-v4 hover:text-signal"
              >
                {copiedId === 'mcp' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedId === 'mcp' ? 'Copied' : 'Copy Payload'}
              </button>
            </div>
            <p className="text-xs text-text-secondary-v4">
              All tools exposed by VaultHost conform to the standard MCP specification. External LLM orchestrators can invoke tools directly against <code>/api/action-gateway/mcp</code>.
            </p>
            <pre className="p-4 rounded-2xl bg-ink-surface border border-hairline text-xs font-mono text-green-300 overflow-x-auto leading-relaxed">
              {mcpExampleJson}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}
