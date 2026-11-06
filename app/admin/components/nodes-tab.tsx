'use client';

import { useState, useEffect } from 'react';
import { adminFetch } from './admin-fetch';
import { Loader2, Plus, Server, Edit3, Trash2, CheckCircle, AlertCircle, Save, X as XIcon, Lock } from 'lucide-react';

export function NodesTab({ showToast }: { showToast: (t: 'success' | 'error', m: string) => void }) {
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);

  const fetchNodes = async () => {
    setLoading(true);
    const res = await adminFetch('get-nodes');
    if (res.ok) {
      const { data } = await res.json();
      setNodes(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const res = await adminFetch('save-node', { node: editing });
    if (res.ok) {
      showToast('success', 'Node saved successfully');
      setEditing(null);
      fetchNodes();
    } else {
      const err = await res.json().catch(() => ({}));
      showToast('error', err.error || 'Failed to save node');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this infrastructure node?')) return;
    const res = await adminFetch('delete-node', { id });
    if (res.ok) {
      showToast('success', 'Node deleted');
      setNodes(nodes.filter((n) => n.id !== id));
    } else {
      showToast('error', 'Failed to delete node');
    }
  };

  const testConnection = async (id: string) => {
    setTesting(id);
    const res = await adminFetch('test-node-connection', { id });
    if (res.ok) {
      showToast('success', 'Connection successful!');
    } else {
      showToast('error', 'Connection failed. Check API key/hostname.');
    }
    setTesting(null);
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="text-[13px] font-medium mb-1 block text-muted-foreground">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Infrastructure Nodes</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Manage self-hosted servers for dynamic provisioning</p>
        </div>
        {!editing && (
          <button onClick={() => setEditing({ name: '', provider_type: 'proxmox', hostname: '', api_key: '', status: 'active' })} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90">
            <Plus className="h-3.5 w-3.5" /> Add Node
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : editing ? (
        <div className="rounded-lg bg-background border border-border shadow-sm p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
            <h3 className="text-sm font-semibold text-foreground">{editing.id ? 'Edit Node' : 'New Node'}</h3>
            <button onClick={() => setEditing(null)} className="px-3 py-1.5 rounded-md bg-muted text-foreground text-[13px] font-medium hover:bg-muted/80 transition-colors">
              &larr; Back
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Node Name">
              <input type="text" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. EU Proxmox Cluster 1" className="input-base text-[13px] py-1.5" />
            </Field>
            <Field label="Provider Type">
              <select value={editing.provider_type} onChange={(e) => setEditing({ ...editing, provider_type: e.target.value })} className="input-base text-[13px] py-1.5">
                <option value="proxmox">Proxmox VE</option>
                <option value="nutanix">Nutanix AHV</option>
                <option value="cyberpanel">CyberPanel</option>
                <option value="cpanel">cPanel / WHM</option>
                <option value="guacamole">Apache Guacamole</option>
                <option value="powerdns">PowerDNS</option>
              </select>
            </Field>
            <Field label="Hostname / URL">
              <input type="text" value={editing.hostname} onChange={(e) => setEditing({ ...editing, hostname: e.target.value })} placeholder="https://192.168.1.100:8006" className="input-base text-[13px] py-1.5" />
            </Field>
            <Field label="API Key / Token">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input type="password" value={editing.api_key} onChange={(e) => setEditing({ ...editing, api_key: e.target.value })} placeholder="PVEAPIToken=root@pam!token=..." className="input-base text-[13px] py-1.5 pl-9" />
              </div>
            </Field>
            <Field label="Status">
              <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="input-base text-[13px] py-1.5">
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="offline">Offline</option>
              </select>
            </Field>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 disabled:opacity-50">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save Node
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-background border border-border shadow-sm overflow-hidden animate-fade-in">
          {nodes.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/50 p-12 text-center bg-muted/5 m-4">
              <Server className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-[13px] text-muted-foreground">No infrastructure nodes configured.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-muted/20 border-b border-border/50">
                  <tr>
                    <th className="px-4 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Name</th>
                    <th className="px-4 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Provider</th>
                    <th className="px-4 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Hostname</th>
                    <th className="px-4 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Status</th>
                    <th className="px-4 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 text-[12px]">
                  {nodes.map((node) => (
                    <tr key={node.id} className="hover:bg-muted/5 transition-colors group">
                      <td className="px-4 py-2 font-medium text-foreground whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Server className="h-3.5 w-3.5 text-muted-foreground" />
                          {node.name}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-muted-foreground capitalize whitespace-nowrap">{node.provider_type}</td>
                      <td className="px-4 py-2 text-muted-foreground font-mono text-[11px] whitespace-nowrap">{node.hostname}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${node.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                          {node.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => testConnection(node.id)} disabled={testing === node.id} className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground" title="Test Connection">
                            {testing === node.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                          </button>
                          <button onClick={() => setEditing(node)} className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground" title="Edit">
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleDelete(node.id)} className="p-1 rounded-md text-destructive hover:bg-destructive/10" title="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
