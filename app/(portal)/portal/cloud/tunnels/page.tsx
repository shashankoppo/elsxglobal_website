'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Lock, Plus, Terminal, Activity, Copy, Check,
  Shield, Server, ArrowUpRight, CheckCircle2, Trash2
} from 'lucide-react';
import { PanelCard } from '@/components/ui/panel-card';

const INITIAL_TUNNELS = [
  {
    id: 'tun-01',
    name: 'homelab-k8s-ingress',
    hostname: 'k8s.elsxglobal.cloud',
    localTarget: 'http://localhost:8080',
    status: 'HEALTHY',
    uptime: '14 days',
    connections: 4,
    created: '2026-08-10'
  },
  {
    id: 'tun-02',
    name: 'internal-crm-backend',
    hostname: 'crm.elsxglobal.cloud',
    localTarget: 'http://192.168.1.45:3000',
    status: 'HEALTHY',
    uptime: '28 days',
    connections: 2,
    created: '2026-07-28'
  },
];

export default function TunnelsManagementPage() {
  const [tunnels, setTunnels] = useState(INITIAL_TUNNELS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTunnelName, setNewTunnelName] = useState('');
  const [newTarget, setNewTarget] = useState('http://localhost:3000');
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTunnelName.trim()) return;

    const fakeToken = `vh_tun_${Math.random().toString(36).substring(2, 18)}_${Date.now()}`;
    const newT = {
      id: `tun-0${tunnels.length + 1}`,
      name: newTunnelName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      hostname: `${newTunnelName.toLowerCase()}.edge.vaulthost.cloud`,
      localTarget: newTarget,
      status: 'HEALTHY',
      uptime: 'Just now',
      connections: 1,
      created: 'Today'
    };

    setTunnels([newT, ...tunnels]);
    setCreatedToken(fakeToken);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-signal font-mono">VaultHost Cloud</span>
            <span className="text-text-muted-v4 text-xs">/</span>
            <span className="text-xs text-text-primary-v4 font-medium">VaultTunnel Ingress</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary-v4 mt-1 flex items-center gap-2.5">
            <Lock className="h-6 w-6 text-signal" /> VaultTunnel Secure Ingress
          </h1>
          <p className="text-xs text-text-secondary-v4 mt-0.5">
            Expose local services, internal Kubernetes clusters, and private APIs without opening inbound firewall ports.
          </p>
        </div>

        <button
          onClick={() => { setShowCreateModal(true); setCreatedToken(null); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-btn v4-btn-primary text-xs font-semibold shadow-glow"
        >
          <Plus className="h-4 w-4" /> Create Tunnel
        </button>
      </div>

      {/* Cloudflared Compatibility Banner */}
      <div className="p-4 rounded-2xl bg-ink-surface border border-hairline font-mono text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Terminal className="h-4 w-4 text-signal shrink-0" />
          <div>
            <span className="text-text-primary-v4 font-bold text-xs">Drop-in cloudflared Compatibility</span>
            <p className="text-text-muted-v4 text-[11px] font-mono mt-0.5">Already using cloudflared? Connect seamlessly with your existing config files.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <code className="text-green-400 bg-ink p-1.5 rounded-lg border border-hairline text-[11px]">
            vaulthost tunnel run --token &lt;YOUR_TOKEN&gt;
          </code>
        </div>
      </div>

      {/* Tunnels List */}
      <div className="v4-panel rounded-2xl border border-hairline bg-ink-surface overflow-hidden">
        <div className="p-4 border-b border-hairline flex items-center justify-between">
          <span className="text-xs font-bold text-text-primary-v4">Active Ingress Tunnels ({tunnels.length})</span>
          <span className="text-xs text-good font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-good animate-pulse" /> All Tunnels Connected
          </span>
        </div>

        <div className="overflow-x-auto terminal-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-hairline bg-ink-surface-2 text-text-muted-v4 font-mono text-[11px]">
                <th className="py-3 px-4">Tunnel Name</th>
                <th className="py-3 px-4">Edge Hostname</th>
                <th className="py-3 px-4">Local Target</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Active Conns</th>
                <th className="py-3 px-4">Uptime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {tunnels.map((t) => (
                <tr key={t.id} className="hover:bg-ink-surface-2/60 transition-colors font-mono">
                  <td className="py-3 px-4 font-bold text-text-primary-v4">{t.name}</td>
                  <td className="py-3 px-4 text-signal">{t.hostname}</td>
                  <td className="py-3 px-4 text-text-secondary-v4">{t.localTarget}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-good/15 text-good border border-good/20 font-bold">
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-text-muted-v4">{t.connections} active</td>
                  <td className="py-3 px-4 text-text-muted-v4">{t.uptime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Tunnel Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="v4-panel max-w-md w-full p-6 rounded-3xl border border-signal/40 bg-ink-surface shadow-2xl">
            <h3 className="text-lg font-bold text-text-primary-v4 flex items-center gap-2">
              <Lock className="h-5 w-5 text-signal" /> Create Secure Ingress Tunnel
            </h3>
            <p className="text-xs text-text-secondary-v4 mt-1 leading-relaxed">
              Route traffic from the edge directly to your local port without opening firewall holes.
            </p>

            {!createdToken ? (
              <form onSubmit={handleCreate} className="mt-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-text-primary-v4 block mb-1">Tunnel Name</label>
                  <input
                    type="text"
                    placeholder="e.g. local-dev-backend"
                    value={newTunnelName}
                    onChange={(e) => setNewTunnelName(e.target.value)}
                    required
                    className="w-full bg-ink-surface-2 border border-hairline rounded-xl px-3 py-2 text-xs text-text-primary-v4 outline-none focus:border-signal"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-primary-v4 block mb-1">Local Service Target URL</label>
                  <input
                    type="text"
                    placeholder="e.g. http://localhost:3000"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    required
                    className="w-full bg-ink-surface-2 border border-hairline rounded-xl px-3 py-2 text-xs text-text-primary-v4 outline-none focus:border-signal font-mono"
                  />
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
                    Generate Tunnel
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-5 space-y-4">
                <div className="p-3 rounded-2xl bg-good/10 border border-good/20 text-xs text-good font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Tunnel Provisioned Successfully!
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-primary-v4 block mb-1">Run This Command on Your Machine</label>
                  <div className="p-3 rounded-xl bg-ink border border-hairline font-mono text-[11px] text-green-400 leading-relaxed overflow-x-auto">
                    <code>vaulthost tunnel run --token {createdToken}</code>
                  </div>
                  <button
                    onClick={() => handleCopy(`vaulthost tunnel run --token ${createdToken}`)}
                    className="mt-2 text-xs text-signal hover:underline flex items-center gap-1 font-medium"
                  >
                    {copiedToken ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copiedToken ? 'Copied Command!' : 'Copy CLI Command'}
                  </button>
                </div>

                <div className="pt-3 border-t border-hairline flex justify-end">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-5 py-2 rounded-btn v4-btn-primary text-xs font-semibold shadow-glow"
                  >
                    Done &amp; Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
