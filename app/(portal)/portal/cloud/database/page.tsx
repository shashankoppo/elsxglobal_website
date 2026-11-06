'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Database, Plus, Play, Table, Terminal, RefreshCw,
  Copy, Check, Search, Shield, ArrowUpRight, CheckCircle2
} from 'lucide-react';
import { PanelCard } from '@/components/ui/panel-card';

const INITIAL_DATABASES = [
  {
    id: 'db-01',
    name: 'production-app-db',
    tables: 14,
    size: '184 MB',
    reads24h: '3.4M',
    writes24h: '180K',
    replicas: '300+ Edge Nodes',
    created: '2026-05-10',
    status: 'Active'
  },
  {
    id: 'db-02',
    name: 'telemetry-metrics-db',
    tables: 6,
    size: '420 MB',
    reads24h: '8.2M',
    writes24h: '940K',
    replicas: '300+ Edge Nodes',
    created: '2026-07-02',
    status: 'Active'
  },
];

export default function DatabaseManagementPage() {
  const [databases, setDatabases] = useState(INITIAL_DATABASES);
  const [selectedDb, setSelectedDb] = useState<any>(INITIAL_DATABASES[0]);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDbName, setNewDbName] = useState('');
  const [querySql, setQuerySql] = useState('SELECT id, name, email, created_at FROM users LIMIT 3;');
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryResult, setQueryResult] = useState<any[]>([
    { id: 1, name: 'Ananya Sharma', email: 'ananya@fintech.io', created_at: '2026-09-01' },
    { id: 2, name: 'Vikram Mehta', email: 'vikram@enterprise.in', created_at: '2026-09-10' },
    { id: 3, name: 'Marcus Vance', email: 'marcus@cloudops.com', created_at: '2026-09-18' },
  ]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDbName.trim()) return;

    const newDb = {
      id: `db-0${databases.length + 1}`,
      name: newDbName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      tables: 0,
      size: '0 B',
      reads24h: '0',
      writes24h: '0',
      replicas: '300+ Edge Nodes',
      created: 'Just now',
      status: 'Active'
    };

    setDatabases([newDb, ...databases]);
    setSelectedDb(newDb);
    setShowCreateModal(false);
    setNewDbName('');
  };

  const handleExecute = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setQueryResult([
        { id: 101, name: 'Sample Record 1', email: 'rec1@test.com', created_at: new Date().toISOString().split('T')[0] },
        { id: 102, name: 'Sample Record 2', email: 'rec2@test.com', created_at: new Date().toISOString().split('T')[0] },
      ]);
    }, 250);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-signal font-mono">VaultHost Cloud</span>
            <span className="text-text-muted-v4 text-xs">/</span>
            <span className="text-xs text-text-primary-v4 font-medium">VaultD1 Edge SQL</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary-v4 mt-1 flex items-center gap-2.5">
            <Database className="h-6 w-6 text-signal" /> VaultD1 Edge SQL Databases
          </h1>
          <p className="text-xs text-text-secondary-v4 mt-0.5">
            Serverless SQLite databases auto-replicated to 300+ edge locations with Drizzle and Prisma compatibility.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-btn v4-btn-primary text-xs font-semibold shadow-glow"
        >
          <Plus className="h-4 w-4" /> Create D1 Database
        </button>
      </div>

      {/* Main Grid: Databases List & Interactive SQL Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Databases List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="h-3.5 w-3.5 text-text-muted-v4 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search databases..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-ink-surface-2 border border-hairline rounded-xl pl-9 pr-3 py-2 text-xs text-text-primary-v4 outline-none focus:border-signal"
              />
            </div>
            <span className="text-xs text-text-muted-v4 font-mono">{databases.length} DBs</span>
          </div>

          <div className="space-y-2.5">
            {databases.map((db) => {
              const isSelected = selectedDb?.id === db.id;
              return (
                <div
                  key={db.id}
                  onClick={() => setSelectedDb(db)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-signal/5 border-signal/40 shadow-sm'
                      : 'bg-ink-surface border-hairline hover:border-signal/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-text-primary-v4 font-mono">{db.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-good/15 text-good border border-good/20 font-mono">
                          {db.status}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted-v4 mt-1 font-mono">
                        {db.tables} Tables • {db.size} • {db.reads24h} reads/24h
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(db.id, `npx vh d1 execute ${db.name} --command="SELECT 1"`);
                      }}
                      className="p-1.5 rounded-lg bg-ink-surface-2 border border-hairline hover:text-text-primary-v4 text-text-muted-v4 transition-colors"
                      title="Copy CLI query command"
                    >
                      {copiedId === db.id ? <Check className="h-3.5 w-3.5 text-good" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* D1 Connection Info Box */}
          <div className="v4-panel p-4 rounded-2xl border border-hairline bg-ink-surface text-xs space-y-2">
            <span className="font-bold text-text-primary-v4 flex items-center gap-1.5">
              <Terminal className="h-4 w-4 text-signal" /> Quick Bindings in worker.ts
            </span>
            <pre className="p-2.5 rounded-xl bg-ink font-mono text-[11px] text-green-400 overflow-x-auto">
{`const result = await env.DB.prepare(
  "SELECT * FROM users WHERE id = ?"
).bind(userId).first();`}
            </pre>
          </div>
        </div>

        {/* Live SQL Console for Selected Database */}
        <div className="lg:col-span-7 space-y-4">
          <div className="v4-panel rounded-2xl border border-hairline bg-ink-surface overflow-hidden">
            <div className="p-4 border-b border-hairline bg-ink-surface-2/60 flex items-center justify-between">
              <span className="text-xs font-bold text-text-primary-v4 font-mono flex items-center gap-2">
                <Database className="h-3.5 w-3.5 text-signal" /> Query Console — {selectedDb?.name}
              </span>
              <button
                onClick={handleExecute}
                disabled={isExecuting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg v4-btn-primary text-xs font-semibold shadow-glow disabled:opacity-50"
              >
                <Play className="h-3 w-3 fill-current" />
                {isExecuting ? 'Running...' : 'Run SQL'}
              </button>
            </div>

            <div className="p-3 bg-ink">
              <textarea
                value={querySql}
                onChange={(e) => setQuerySql(e.target.value)}
                rows={3}
                className="w-full bg-transparent font-mono text-xs text-green-400 outline-none resize-none leading-relaxed p-1"
              />
            </div>

            {/* Results Table */}
            <div className="p-4 border-t border-hairline">
              <div className="flex items-center justify-between pb-2 mb-2 text-xs text-text-muted-v4">
                <span>Output Grid ({queryResult.length} rows)</span>
                <span className="text-good font-mono text-[11px]">Query finished in 1.4ms</span>
              </div>

              {isExecuting ? (
                <div className="py-8 flex items-center justify-center text-text-muted-v4 text-xs gap-2">
                  <div className="w-4 h-4 border-2 border-signal border-t-transparent rounded-full animate-spin" />
                  Executing against edge replica...
                </div>
              ) : (
                <div className="overflow-x-auto terminal-scrollbar rounded-xl border border-hairline bg-ink">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-hairline bg-ink-surface-2 text-text-muted-v4 font-mono text-[11px]">
                        {Object.keys(queryResult[0] || {}).map((col) => (
                          <th key={col} className="py-2 px-3">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline">
                      {queryResult.map((row, i) => (
                        <tr key={i} className="hover:bg-ink-surface-2/60 transition-colors font-mono text-text-secondary-v4">
                          {Object.values(row).map((val: any, j) => (
                            <td key={j} className="py-1.5 px-3 whitespace-nowrap text-text-primary-v4">
                              {String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Database Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="v4-panel max-w-md w-full p-6 rounded-3xl border border-signal/40 bg-ink-surface shadow-2xl">
            <h3 className="text-lg font-bold text-text-primary-v4 flex items-center gap-2">
              <Database className="h-5 w-5 text-signal" /> Create VaultD1 SQL Database
            </h3>
            <p className="text-xs text-text-secondary-v4 mt-1 leading-relaxed">
              Instantiate a serverless SQLite database with global read replication and automated point-in-time backups.
            </p>

            <form onSubmit={handleCreate} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-primary-v4 block mb-1">Database Name</label>
                <input
                  type="text"
                  placeholder="e.g. auth-database-prod"
                  value={newDbName}
                  onChange={(e) => setNewDbName(e.target.value)}
                  required
                  className="w-full bg-ink-surface-2 border border-hairline rounded-xl px-3 py-2 text-xs text-text-primary-v4 outline-none focus:border-signal"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary-v4 block mb-1">Primary Region</label>
                <select className="w-full bg-ink-surface-2 border border-hairline rounded-xl px-3 py-2 text-xs text-text-primary-v4 outline-none focus:border-signal">
                  <option value="bom">Asia-South (Mumbai, India)</option>
                  <option value="sin">Asia-Southeast (Singapore)</option>
                  <option value="fra">Europe (Frankfurt, Germany)</option>
                  <option value="ord">North America (Chicago, USA)</option>
                </select>
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
                  Create Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
