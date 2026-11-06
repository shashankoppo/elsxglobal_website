'use client';

import { useState } from 'react';
import { Database, Play, Table, Terminal, RefreshCw, CheckCircle2, Copy, ArrowRight } from 'lucide-react';

const PRESET_QUERIES = [
  {
    name: 'Get Active Users',
    sql: 'SELECT id, username, email, plan, created_at FROM users WHERE status = "active" LIMIT 4;'
  },
  {
    name: 'Edge Latency Aggregation',
    sql: 'SELECT colo_region, COUNT(*) as total_requests, ROUND(AVG(latency_ms), 2) as avg_latency FROM edge_metrics GROUP BY colo_region ORDER BY avg_latency ASC;'
  },
  {
    name: 'Top Storage Consumers',
    sql: 'SELECT tenant_id, bucket_count, total_gb_stored, updated_at FROM r2_tenants ORDER BY total_gb_stored DESC LIMIT 3;'
  }
];

const SAMPLE_RESULTS: Record<string, any[]> = {
  'Get Active Users': [
    { id: 1041, username: 'alex.dev', email: 'alex@company.com', plan: 'Enterprise', created_at: '2026-08-12' },
    { id: 1042, username: 'sarah.ai', email: 'sarah@tensor.io', plan: 'Pro', created_at: '2026-08-18' },
    { id: 1043, username: 'rahul.cloud', email: 'rahul@fintech.in', plan: 'Enterprise', created_at: '2026-09-02' },
    { id: 1044, username: 'elena.edge', email: 'elena@berlin.de', plan: 'Pro', created_at: '2026-09-14' },
  ],
  'Edge Latency Aggregation': [
    { colo_region: 'BOM (Mumbai)', total_requests: '14,280,100', avg_latency: '1.8ms' },
    { colo_region: 'SIN (Singapore)', total_requests: '9,840,250', avg_latency: '2.4ms' },
    { colo_region: 'FRA (Frankfurt)', total_requests: '8,190,400', avg_latency: '3.1ms' },
    { colo_region: 'ORD (Chicago)', total_requests: '11,400,200', avg_latency: '3.8ms' },
  ],
  'Top Storage Consumers': [
    { tenant_id: 't_enterprise_01', bucket_count: 14, total_gb_stored: '42,800 GB', updated_at: '10m ago' },
    { tenant_id: 't_fintech_asia', bucket_count: 8, total_gb_stored: '18,400 GB', updated_at: '25m ago' },
    { tenant_id: 't_ai_research', bucket_count: 22, total_gb_stored: '94,200 GB', updated_at: '1h ago' },
  ]
};

export function D1SQLConsole() {
  const [activeQuery, setActiveQuery] = useState(PRESET_QUERIES[0]);
  const [sqlText, setSqlText] = useState(PRESET_QUERIES[0].sql);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any[]>(SAMPLE_RESULTS['Get Active Users']);
  const [execTime, setExecTime] = useState('1.4ms');

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setExecTime((Math.random() * 0.8 + 1.1).toFixed(1) + 'ms');
      setResults(SAMPLE_RESULTS[activeQuery.name] || SAMPLE_RESULTS['Get Active Users']);
    }, 280);
  };

  const handleSelectPreset = (p: typeof PRESET_QUERIES[0]) => {
    setActiveQuery(p);
    setSqlText(p.sql);
    setResults(SAMPLE_RESULTS[p.name]);
    setExecTime((Math.random() * 0.8 + 1.1).toFixed(1) + 'ms');
  };

  return (
    <div className="v4-panel rounded-3xl border border-hairline overflow-hidden shadow-2xl bg-ink">
      {/* Header */}
      <div className="p-4 border-b border-hairline bg-ink-surface/90 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal/10 text-signal border border-signal/20">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary-v4">VaultD1 Edge SQL Console</h3>
            <p className="text-[11px] text-text-muted-v4">Serverless SQLite • Global Read Replicas • Drizzle & Prisma Compatible</p>
          </div>
        </div>

        {/* Query Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          {PRESET_QUERIES.map((p) => (
            <button
              key={p.name}
              onClick={() => handleSelectPreset(p)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                activeQuery.name === p.name
                  ? 'bg-signal/15 text-signal border border-signal/40'
                  : 'bg-ink-surface-2 text-text-secondary-v4 hover:text-text-primary-v4 border border-hairline'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* SQL Editor Area */}
      <div className="p-4 bg-ink border-b border-hairline">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-hairline/60 text-xs text-text-muted-v4">
          <span className="font-mono text-signal">Query Editor — d1_database_prod</span>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg v4-btn-primary text-xs font-semibold shadow-glow disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            {isRunning ? 'Executing...' : 'Run Query'}
          </button>
        </div>
        <textarea
          value={sqlText}
          onChange={(e) => setSqlText(e.target.value)}
          rows={3}
          className="w-full bg-ink-surface font-mono text-xs text-green-400 p-3 rounded-xl border border-hairline outline-none resize-none leading-relaxed focus:border-signal/40"
        />
      </div>

      {/* Results Grid */}
      <div className="p-4 bg-ink-surface">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-hairline text-xs">
          <span className="text-text-muted-v4 flex items-center gap-1.5">
            <Table className="h-3.5 w-3.5 text-signal" /> Query Results ({results.length} rows)
          </span>
          <span className="text-good font-mono text-[11px] bg-good/10 px-2 py-0.5 rounded-full border border-good/20">
            Executed in {execTime} across 300+ edge replicas
          </span>
        </div>

        {isRunning ? (
          <div className="py-12 flex flex-col items-center justify-center text-text-muted-v4 gap-2">
            <div className="w-5 h-5 border-2 border-signal border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Querying distributed SQLite at edge...</span>
          </div>
        ) : (
          <div className="overflow-x-auto terminal-scrollbar rounded-xl border border-hairline bg-ink">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-hairline bg-ink-surface-2 text-text-muted-v4 font-mono text-[11px]">
                  {Object.keys(results[0] || {}).map((col) => (
                    <th key={col} className="py-2.5 px-4">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {results.map((row, i) => (
                  <tr key={i} className="hover:bg-ink-surface-2/60 transition-colors font-mono text-text-secondary-v4">
                    {Object.values(row).map((val: any, j) => (
                      <td key={j} className="py-2 px-4 whitespace-nowrap text-text-primary-v4">
                        {String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-hairline flex items-center justify-between text-xs">
          <span className="text-text-muted-v4 font-mono text-[11px]">Drizzle ORM &amp; Prisma Compatible</span>
          <a href="/portal/cloud/database" className="text-signal hover:underline flex items-center gap-1">
            Open D1 Database Console &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
