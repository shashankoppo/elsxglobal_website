'use client';

import { useState, useEffect } from 'react';
import { adminFetch } from './admin-fetch';
import { Loader2, Link as LinkIcon, Eye, EyeOff, Save, Webhook } from 'lucide-react';
import { ToggleSwitch } from './payments-settings-tab';

export function IntegrationsTab({ showToast }: { showToast: (t: 'success' | 'error', m: string) => void }) {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchSettings = async () => {
      const res = await adminFetch('get-integrations');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.data || {});
      } else {
        setSettings({});
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    const res = await adminFetch('save-integrations', { settings });
    if (res.ok) showToast('success', 'Integrations saved');
    else { const err = await res.json().catch(() => ({})); showToast('error', err.error || 'Save failed'); }
    setSaving(false);
  };

  const toggleSecret = (key: string) => {
    setShowSecret(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading || !settings) return <div className="flex items-center justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="w-full max-w-5xl space-y-4 animate-fade-in">
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Integrations & Webhooks</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Configure connections to external CRMs and services.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 disabled:opacity-50">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save Changes
        </button>
      </div>

      {/* Odoo Community Config */}
      <div className="rounded-lg bg-background border border-border shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
            <div>
              <h3 className="font-medium text-[13px]">Odoo Community CRM</h3>
              <p className="text-[11px] text-muted-foreground">Push contact form leads directly into your open-source Odoo CRM.</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3 mt-3 pt-3 border-t border-border/50">
          <div>
            <label className="text-[13px] font-medium mb-1 block text-muted-foreground">Odoo Base URL</label>
            <input type="text" value={settings.odoo_url || ''} onChange={(e) => setSettings({ ...settings, odoo_url: e.target.value })} placeholder="https://odoo.yourdomain.com" className="input-base text-[13px] py-1.5" />
          </div>
          <div>
            <label className="text-[13px] font-medium mb-1 block text-muted-foreground">Database Name</label>
            <input type="text" value={settings.odoo_db || ''} onChange={(e) => setSettings({ ...settings, odoo_db: e.target.value })} placeholder="elsxglobal" className="input-base text-[13px] py-1.5" />
          </div>
          <div>
            <label className="text-[13px] font-medium mb-1 block text-muted-foreground">Odoo API Key (XML-RPC)</label>
            <div className="relative">
              <input type={showSecret['odoo'] ? 'text' : 'password'} value={settings.odoo_api_key || ''} onChange={(e) => setSettings({ ...settings, odoo_api_key: e.target.value })} placeholder="xxxxxxxxxxxxxxxx" className="input-base font-mono text-[13px] py-1.5 pr-10" />
              <button onClick={() => toggleSecret('odoo')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showSecret['odoo'] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Generic Webhooks */}
      <div className="rounded-lg bg-background border border-border shadow-sm p-4 opacity-75">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Webhook className="h-4 w-4 text-muted-foreground" />
            <div>
              <h3 className="font-medium text-[13px]">Global Webhooks</h3>
              <p className="text-[11px] text-muted-foreground">Fire webhooks on order completion (Coming soon)</p>
            </div>
          </div>
          <ToggleSwitch checked={false} onChange={() => {}} />
        </div>
      </div>
    </div>
  );
}
