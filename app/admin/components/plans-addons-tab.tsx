'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminFetch } from './admin-fetch';
import {
  Loader2, Plus, Eye, Edit3, ToggleLeft, ToggleRight, Trash2, Save, X as XIcon,
} from 'lucide-react';

export function PlansTab({ plans, actionLoading, togglePlanActive, deletePlan, showToast, onRefresh }: {
  plans: Record<string, unknown>[]; actionLoading: string | null; togglePlanActive: (id: string, c: boolean) => void; deletePlan: (id: string) => void; showToast: (t: 'success' | 'error', m: string) => void; onRefresh: () => void;
}) {
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);

  const savePlan = async () => {
    if (!editing) return;
    setSaving(true);
    const features = typeof editing.features === 'string' ? (editing.features as string).split('\n').filter(Boolean) : editing.features || [];
    const res = await adminFetch('save-plan', { ...editing, features });
    if (res.ok) { showToast('success', 'Plan saved'); setEditing(null); onRefresh(); }
    else { const err = await res.json().catch(() => ({})); showToast('error', err.error || 'Save failed'); }
    setSaving(false);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Hosting Plans</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Create, edit and manage hosting tiers</p>
        </div>
        {!editing && (
          <div className="flex gap-2">
            <Link href="/vaulthost" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted text-foreground hover:bg-muted/80 text-[13px] font-medium"><Eye className="h-4 w-4" />View on Site</Link>
            <button onClick={() => setEditing({ slug: '', name: '', tier: 'shared', price_monthly: 0, price_annual: 0, features: [], is_active: true, is_popular: false, sort_order: 0, provisioning_type: 'manual' })} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90"><Plus className="h-3.5 w-3.5" />New Plan</button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="rounded-lg bg-background border border-border shadow-sm p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
            <h3 className="text-sm font-semibold text-foreground">{(editing.id as string) ? 'Edit Plan' : 'New Plan'}</h3>
            <button onClick={() => setEditing(null)} className="px-3 py-1.5 rounded-md bg-muted text-foreground text-[13px] font-medium hover:bg-muted/80 transition-colors">
              &larr; Back to List
            </button>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Name"><input type="text" value={editing.name as string || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="input-base text-[13px] py-1.5" /></Field>
            <Field label="Slug"><input type="text" value={editing.slug as string || ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="input-base text-[13px] py-1.5" /></Field>
            <Field label="Tier"><select value={editing.tier as string || 'shared'} onChange={(e) => setEditing({ ...editing, tier: e.target.value })} className="input-base text-[13px] py-1.5"><option value="shared">Shared</option><option value="vps">VPS</option><option value="dedicated">Dedicated</option><option value="cloud">Cloud</option><option value="wordpress">WordPress</option></select></Field>
            <Field label="Provisioning">
              <select value={editing.provisioning_type as string || 'manual'} onChange={(e) => setEditing({ ...editing, provisioning_type: e.target.value })} className="input-base text-[13px] py-1.5">
                <option value="manual">Manual</option>
                <option value="proxmox">Proxmox</option>
                <option value="cyberpanel">CyberPanel</option>
                <option value="cpanel">cPanel</option>
                <option value="guacamole">Guacamole</option>
                <option value="odoo">Odoo CRM</option>
              </select>
            </Field>
            <Field label="Sort Order"><input type="number" value={editing.sort_order as number || 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} className="input-base text-[13px] py-1.5" /></Field>
            <Field label="Monthly (Rs)"><input type="number" value={editing.price_monthly as number || 0} onChange={(e) => setEditing({ ...editing, price_monthly: Number(e.target.value) })} className="input-base text-[13px] py-1.5" /></Field>
            <Field label="Annual (Rs)"><input type="number" value={editing.price_annual as number || 0} onChange={(e) => setEditing({ ...editing, price_annual: Number(e.target.value) })} className="input-base text-[13px] py-1.5" /></Field>
            <Field label="CPU"><input type="text" value={(editing.cpu as string) || ''} onChange={(e) => setEditing({ ...editing, cpu: e.target.value })} className="input-base text-[13px] py-1.5" /></Field>
            <Field label="RAM"><input type="text" value={(editing.ram as string) || ''} onChange={(e) => setEditing({ ...editing, ram: e.target.value })} className="input-base text-[13px] py-1.5" /></Field>
            <Field label="Storage"><input type="text" value={(editing.storage as string) || ''} onChange={(e) => setEditing({ ...editing, storage: e.target.value })} className="input-base text-[13px] py-1.5" /></Field>
            <Field label="Bandwidth"><input type="text" value={(editing.bandwidth as string) || ''} onChange={(e) => setEditing({ ...editing, bandwidth: e.target.value })} className="input-base text-[13px] py-1.5" /></Field>
          </div>
          <div className="mt-4"><Field label="Short Description"><input type="text" value={(editing.short_description as string) || ''} onChange={(e) => setEditing({ ...editing, short_description: e.target.value })} className="input-base text-[13px] py-1.5" /></Field></div>
          <div className="mt-4"><Field label="Features (one per line)"><textarea value={Array.isArray(editing.features) ? (editing.features as string[]).join('\n') : (editing.features as string) || ''} onChange={(e) => setEditing({ ...editing, features: e.target.value })} className="input-base text-[13px]" rows={4} /></Field></div>
          <div className="flex items-center gap-6 mt-4">
            <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={editing.is_popular as boolean || false} onChange={(e) => setEditing({ ...editing, is_popular: e.target.checked })} className="rounded border-border text-primary focus:ring-primary bg-background" />Popular</label>
            <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={editing.is_active !== false} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} className="rounded border-border text-primary focus:ring-primary bg-background" />Active</label>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button onClick={savePlan} disabled={saving} className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 disabled:opacity-50">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save Plan
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-background border border-border shadow-sm overflow-hidden animate-fade-in">
          {plans.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/50 p-12 text-center bg-muted/5 m-4">
              <p className="text-[13px] text-muted-foreground">No hosting plans configured.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-muted/20 border-b border-border/50">
                  <tr>
                    <th className="px-4 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Name</th>
                    <th className="px-4 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Tier</th>
                    <th className="px-4 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Provisioning</th>
                    <th className="px-4 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Monthly</th>
                    <th className="px-4 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Annual</th>
                    <th className="px-4 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Status</th>
                    <th className="px-4 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 text-[12px]">
                  {plans.map((plan) => (
                    <tr key={plan.id as string} className="hover:bg-muted/5 transition-colors">
                      <td className="px-4 py-2 font-medium text-foreground whitespace-nowrap">{plan.name as string}</td>
                      <td className="px-4 py-2 whitespace-nowrap"><span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-muted text-muted-foreground">{plan.tier as string}</span></td>
                      <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">{plan.provisioning_type as string || 'manual'}</td>
                      <td className="px-4 py-2 text-foreground whitespace-nowrap">Rs {plan.price_monthly as number}</td>
                      <td className="px-4 py-2 text-foreground whitespace-nowrap">Rs {plan.price_annual as number}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${plan.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                          {plan.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setEditing(plan)} className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground" title="Edit"><Edit3 className="h-3.5 w-3.5" /></button>
                          <button onClick={() => togglePlanActive(plan.id as string, plan.is_active as boolean)} disabled={actionLoading === plan.id} className={`p-1 rounded-md transition-colors ${plan.is_active ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-muted-foreground hover:bg-muted'}`} title={plan.is_active ? 'Deactivate' : 'Activate'}>{actionLoading === plan.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : plan.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}</button>
                          <button onClick={() => deletePlan(plan.id as string)} disabled={actionLoading === plan.id} className="p-1 rounded-md text-destructive hover:bg-destructive/10" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
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

export function AddonsTab({ addons, actionLoading, toggleAddonActive, deleteAddon, showToast, onRefresh }: {
  addons: Record<string, unknown>[]; actionLoading: string | null; toggleAddonActive: (id: string, c: boolean) => void; deleteAddon: (id: string) => void; showToast: (t: 'success' | 'error', m: string) => void; onRefresh: () => void;
}) {
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);

  const saveAddon = async () => {
    if (!editing) return;
    setSaving(true);
    const res = await adminFetch('save-addon', { ...editing });
    if (res.ok) { showToast('success', 'Add-on saved'); setEditing(null); onRefresh(); }
    else { const err = await res.json().catch(() => ({})); showToast('error', err.error || 'Save failed'); }
    setSaving(false);
  };

  return (
    <div className="animate-fade-in space-y-4 mt-8">
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Add-ons Management</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Create, edit, and manage hosting add-ons</p>
        </div>
        {!editing && (
          <div className="flex gap-2">
            <Link href="/vaulthost/addons" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted text-foreground hover:bg-muted/80 text-[13px] font-medium"><Eye className="h-4 w-4" />View on Site</Link>
            <button onClick={() => setEditing({ slug: '', name: '', category: 'security', price_monthly: 0, price_annual: 0, is_active: true, sort_order: 0 })} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90"><Plus className="h-3.5 w-3.5" />New Add-on</button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="rounded-lg bg-background border border-border shadow-sm p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
            <h3 className="text-sm font-semibold text-foreground">{(editing.id as string) ? 'Edit Add-on' : 'New Add-on'}</h3>
            <button onClick={() => setEditing(null)} className="px-3 py-1.5 rounded-md bg-muted text-foreground text-[13px] font-medium hover:bg-muted/80 transition-colors">
              &larr; Back to List
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Name"><input type="text" value={editing.name as string || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="input-base text-[13px] py-1.5" /></Field>
            <Field label="Slug"><input type="text" value={editing.slug as string || ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="input-base text-[13px] py-1.5" /></Field>
            <Field label="Category"><select value={editing.category as string || 'security'} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="input-base text-[13px] py-1.5"><option value="security">Security</option><option value="backup">Backup</option><option value="performance">Performance</option><option value="support">Support</option><option value="migration">Migration</option></select></Field>
            <Field label="Icon (lucide name)"><input type="text" value={(editing.icon as string) || ''} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} className="input-base text-[13px] py-1.5" /></Field>
            <Field label="Monthly Price (Rs)"><input type="number" value={editing.price_monthly as number || 0} onChange={(e) => setEditing({ ...editing, price_monthly: Number(e.target.value) })} className="input-base text-[13px] py-1.5" /></Field>
            <Field label="Annual Price (Rs)"><input type="number" value={editing.price_annual as number || 0} onChange={(e) => setEditing({ ...editing, price_annual: Number(e.target.value) })} className="input-base text-[13px] py-1.5" /></Field>
            <div className="col-span-2"><Field label="Description"><textarea value={(editing.description as string) || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="input-base text-[13px]" rows={2} /></Field></div>
            <label className="flex items-center gap-2 text-[13px] col-span-2"><input type="checkbox" checked={editing.is_active !== false} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} className="rounded border-border text-primary focus:ring-primary bg-background" />Active</label>
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={saveAddon} disabled={saving} className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 disabled:opacity-50">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save Add-on
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-background border border-border shadow-sm overflow-hidden animate-fade-in">
          {addons.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/50 p-12 text-center bg-muted/5 m-4">
              <p className="text-[13px] text-muted-foreground">No add-ons configured.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-muted/20 border-b border-border/50">
                  <tr>
                    <th className="px-4 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Name</th>
                    <th className="px-4 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Category</th>
                    <th className="px-4 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Monthly</th>
                    <th className="px-4 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Annual</th>
                    <th className="px-4 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Status</th>
                    <th className="px-4 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 text-[12px]">
                  {addons.map((addon) => (
                    <tr key={addon.id as string} className="hover:bg-muted/5 transition-colors">
                      <td className="px-4 py-2 font-medium text-foreground whitespace-nowrap">{addon.name as string}</td>
                      <td className="px-4 py-2 whitespace-nowrap"><span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-muted text-muted-foreground">{addon.category as string}</span></td>
                      <td className="px-4 py-2 text-foreground whitespace-nowrap">Rs {addon.price_monthly as number}</td>
                      <td className="px-4 py-2 text-foreground whitespace-nowrap">Rs {addon.price_annual as number}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${addon.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                          {addon.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setEditing(addon)} className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground" title="Edit"><Edit3 className="h-3.5 w-3.5" /></button>
                          <button onClick={() => toggleAddonActive(addon.id as string, addon.is_active as boolean)} disabled={actionLoading === addon.id} className={`p-1 rounded-md transition-colors ${addon.is_active ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-muted-foreground hover:bg-muted'}`} title={addon.is_active ? 'Deactivate' : 'Activate'}>{actionLoading === addon.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : addon.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}</button>
                          <button onClick={() => deleteAddon(addon.id as string)} disabled={actionLoading === addon.id} className="p-1 rounded-md text-destructive hover:bg-destructive/10" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-[13px] font-medium mb-1 block text-muted-foreground">{label}</label>{children}</div>;
}
