'use client';

import { useState, useEffect } from 'react';
import { adminFetch, createClient } from './admin-fetch';
import {
  Loader2, RefreshCw, Search, X as XIcon, Send,
  Users, Receipt, Wallet, TrendingUp, DollarSign, Database as DbIcon,
  CreditCard, QrCode, Building2, Upload, Eye, EyeOff, Settings,
  BadgeCheck, ExternalLink, Trash2, Plus, Save, Check,
} from 'lucide-react';

// ─── INVOICES ────────────────────────────────────────────────
export function InvoicesTab({ invoices, statusColors, showToast, onRefresh }: { invoices: Record<string, unknown>[]; statusColors: Record<string, string>; showToast: (t: 'success'|'error', m: string) => void; onRefresh: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div><h1 className="text-xl font-semibold text-foreground">Billing & Invoices</h1><p className="text-[13px] text-muted-foreground mt-1">Track and manage customer invoices</p></div>
      </div>
      {invoices.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/50 p-12 text-center bg-muted/5"><Receipt className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" /><p className="text-[13px] text-muted-foreground">No invoices generated yet.</p></div>
      ) : (
        <div className="rounded-lg bg-background border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full text-left border-collapse">
            <thead><tr className="border-b border-border/50 bg-muted/20 text-[10px] text-muted-foreground uppercase tracking-wider">
              <th className="px-4 py-2 font-medium">Invoice #</th><th className="px-4 py-2 font-medium text-right">Amount</th><th className="px-4 py-2 font-medium text-right">Tax</th><th className="px-4 py-2 font-medium text-right">Total</th><th className="px-4 py-2 font-medium">Status</th><th className="px-4 py-2 font-medium text-right">Date</th><th className="px-4 py-2 font-medium text-center">Actions</th>
            </tr></thead>
            <tbody className="text-[12px]">
              {invoices.map((inv) => (
                <tr key={inv.id as string} className="border-b border-border/30 hover:bg-muted/10 transition-colors last:border-0">
                  <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">{inv.invoice_number as string}</td>
                  <td className="px-4 py-2.5 text-right">Rs {(inv.amount as number).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">Rs {(inv.tax_amount as number).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-foreground">Rs {(inv.total as number).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                  <td className="px-4 py-2.5"><span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${statusColors[inv.status as string] || 'text-muted-foreground bg-muted'}`}>{inv.status as string}</span></td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground whitespace-nowrap">{new Date(inv.created_at as string).toLocaleDateString()}</td>
                  <td className="px-4 py-2.5 text-center">
                    {(inv.status === 'unpaid' || inv.status === 'draft') ? (
                      <button onClick={async () => {
                        const supabase = createClient();
                        const { error } = await supabase.from('invoices').update({ status: 'paid' }).eq('id', inv.id);
                        if (error) showToast('error', error.message);
                        else { showToast('success', 'Invoice marked as paid'); onRefresh(); }
                      }} className="px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors">Mark Paid</button>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}
    </div>
  );
}

// ─── LEADS ───────────────────────────────────────────────────
export function LeadsTab({ leads, onRefresh, statusColors }: { leads: Record<string, unknown>[]; onRefresh: () => void; statusColors: Record<string, string> }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div><h1 className="text-xl font-semibold text-foreground">CRM Leads</h1><p className="text-[13px] text-muted-foreground mt-1">Odoo-synced leads and pipeline</p></div>
        <button onClick={onRefresh} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted hover:bg-muted/80 text-[13px] font-medium transition-colors"><RefreshCw className="h-3.5 w-3.5" />Refresh</button>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {[{ label: 'Total Leads', value: leads.length, icon: Users, color: '#00ffcc' }, { label: 'New', value: leads.filter((l) => (l.status as string) === 'new' || !(l.status as string)).length, icon: TrendingUp, color: '#10b981' }, { label: 'Contacted', value: leads.filter((l) => (l.status as string) === 'contacted').length, icon: Check, color: '#0ea5e9' }, { label: 'Qualified', value: leads.filter((l) => (l.status as string) === 'qualified').length, icon: DollarSign, color: '#f59e0b' }].map((stat) => (
          <div key={stat.label} className="p-3 rounded-lg bg-muted/20 border border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5"><stat.icon className="h-4 w-4" style={{ color: stat.color }} /><span className="text-[13px] text-muted-foreground">{stat.label}</span></div>
            <span className="text-[15px] font-semibold text-foreground">{stat.value}</span>
          </div>
        ))}
      </div>
      {leads.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/50 p-12 text-center bg-muted/5"><DbIcon className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" /><p className="text-[13px] text-muted-foreground">No leads synced yet.</p></div>
      ) : (
        <div className="rounded-lg bg-background border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full text-left border-collapse">
            <thead><tr className="border-b border-border/50 bg-muted/20 text-[10px] text-muted-foreground uppercase tracking-wider">
              <th className="px-4 py-2 font-medium">Name</th><th className="px-4 py-2 font-medium">Email</th><th className="px-4 py-2 font-medium">Intent</th><th className="px-4 py-2 font-medium">Company</th><th className="px-4 py-2 font-medium">Status</th><th className="px-4 py-2 font-medium text-right">Date</th>
            </tr></thead>
            <tbody className="text-[12px]">
              {leads.map((lead) => (
                <tr key={lead.id as string} className="border-b border-border/30 hover:bg-muted/10 transition-colors last:border-0">
                  <td className="px-4 py-2.5 font-medium text-foreground">{(lead.full_name as string) || '—'}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{(lead.work_email as string) || '—'}</td>
                  <td className="px-4 py-2.5"><span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary">{(lead.intent as string) || '—'}</span></td>
                  <td className="px-4 py-2.5 text-muted-foreground">{(lead.company as string) || '—'}</td>
                  <td className="px-4 py-2.5"><span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${statusColors[(lead.status as string) || 'new'] || 'text-muted-foreground bg-muted'}`}>{(lead.status as string) || 'new'}</span></td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground whitespace-nowrap">{lead.created_at ? new Date(lead.created_at as string).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}
    </div>
  );
}

// ─── PAYMENTS ────────────────────────────────────────────────
export function PaymentsTab() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [proofModal, setProofModal] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from('transactions').select('*, hosting_orders(*)').order('created_at', { ascending: false }).limit(100);
    setTransactions(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAction = async (tx: any, action: 'approve' | 'reject') => {
    setProcessingId(tx.id);
    const supabase = createClient();
    if (action === 'approve') {
      await supabase.from('transactions').update({ status: 'success' }).eq('id', tx.id);
      if (tx.order_id) await supabase.from('hosting_orders').update({ status: 'paid' }).eq('id', tx.order_id);
    } else {
      await supabase.from('transactions').update({ status: 'failed' }).eq('id', tx.id);
    }
    await fetchTransactions();
    setProcessingId(null);
  };

  const txStatusColors: Record<string, string> = { success: 'bg-green-500/10 text-green-500 border-green-500/20', pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20', failed: 'bg-red-500/10 text-red-500 border-red-500/20', initiated: 'bg-blue-500/10 text-blue-500 border-blue-500/20', refunded: 'bg-purple-500/10 text-purple-500 border-purple-500/20' };

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-border/50"><div><h1 className="text-xl font-semibold text-foreground">Transaction Ledger</h1><p className="text-[13px] text-muted-foreground mt-1">Payment audit trail across all gateways</p></div></div>
      {transactions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/50 p-12 text-center bg-muted/5"><Wallet className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" /><p className="text-[13px] text-muted-foreground">No transactions recorded.</p></div>
      ) : (
        <div className="rounded-lg bg-background border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full text-left border-collapse">
            <thead><tr className="border-b border-border/50 bg-muted/20 text-[10px] text-muted-foreground uppercase tracking-wider">
              <th className="px-4 py-2 font-medium">Order Ref</th><th className="px-4 py-2 font-medium text-right">Amount</th><th className="px-4 py-2 font-medium">Gateway</th><th className="px-4 py-2 font-medium">Status</th><th className="px-4 py-2 font-medium text-right">Timestamp</th><th className="px-4 py-2 font-medium text-center">Proof</th><th className="px-4 py-2 font-medium text-center">Actions</th>
            </tr></thead>
            <tbody className="text-[12px]">
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-border/30 hover:bg-muted/10 transition-colors last:border-0">
                  <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">{tx.order_id ? (tx.order_id as string).slice(0, 8).toUpperCase() : '—'}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-foreground">Rs {Number(tx.amount).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-2.5"><span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-muted text-muted-foreground capitalize">{tx.gateway || '—'}</span></td>
                  <td className="px-4 py-2.5"><span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${txStatusColors[tx.status] || txStatusColors.initiated}`}>{tx.status}</span></td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground whitespace-nowrap">{new Date(tx.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-2.5 text-center">{tx.metadata?.proof_url ? <button onClick={() => setProofModal(tx.metadata.proof_url)} className="text-[11px] text-primary hover:underline font-medium">View</button> : '—'}</td>
                  <td className="px-4 py-2.5 text-center">
                    {(tx.status === 'pending' || tx.status === 'initiated') ? (
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleAction(tx, 'approve')} disabled={processingId === tx.id} className="px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider bg-green-500/10 text-green-600 hover:bg-green-500/20 disabled:opacity-50 transition-colors">Approve</button>
                        <button onClick={() => handleAction(tx, 'reject')} disabled={processingId === tx.id} className="px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider bg-red-500/10 text-red-600 hover:bg-red-500/20 disabled:opacity-50 transition-colors">Reject</button>
                      </div>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}
      {proofModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/90 backdrop-blur-md p-4" onClick={() => setProofModal(null)}>
          <div className="max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#0a0a0a] border border-hairline shadow-2xl rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-white">Payment Proof</h3><button onClick={() => setProofModal(null)} className="p-2 rounded-lg hover:bg-ink-surface-2 text-white"><XIcon className="h-5 w-5" /></button></div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={proofModal} 
                alt="Payment proof" 
                className="w-full rounded-xl" 
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent && !parent.querySelector('a')) {
                    const link = document.createElement('a');
                    link.href = proofModal;
                    link.target = "_blank";
                    link.rel = "noreferrer";
                    link.className = "text-sm text-signal hover:underline";
                    link.innerText = "View Payment Proof (Image failed to load)";
                    parent.appendChild(link);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PAYMENT SETTINGS ────────────────────────────────────────
export function PaymentSettingsTab({ showToast }: { showToast: (t: 'success' | 'error', m: string) => void }) {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const res = await adminFetch('get-payment-settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings || {});
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
    const res = await adminFetch('save-payment-settings', { settings });
    if (res.ok) showToast('success', 'Payment settings saved');
    else { const err = await res.json().catch(() => ({})); showToast('error', err.error || 'Save failed'); }
    setSaving(false);
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast('error', 'QR image too large. Max 2MB.'); return; }
    setUploadingQr(true);
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop();
      const fileName = `custom-qr-${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage.from('qr-uploads').upload(fileName, file, { cacheControl: '3600', upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('qr-uploads').getPublicUrl(data.path);
      setSettings({ ...settings, custom_qr_image_url: urlData.publicUrl });
      showToast('success', 'Custom QR uploaded. Click Save to apply.');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingQr(false);
    }
  };

  if (loading || !settings) return <div className="flex items-center justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="w-full max-w-5xl space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Payment Gateways</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Configure Razorpay, Stripe, UPI, and bank transfer credentials</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          Save Changes
        </button>
      </div>

      <div className="v4-panel bg-zinc-900/50 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20"><CreditCard className="h-5 w-5 text-blue-500" /></div><div><h3 className="font-semibold">Razorpay</h3><p className="text-xs text-zinc-500">{settings.razorpay_enabled && settings.razorpay_key_id ? 'Connected' : 'Not configured'}</p></div></div>
          <ToggleSwitch checked={settings.razorpay_enabled} onChange={(v) => setSettings({ ...settings, razorpay_enabled: v })} />
        </div>
        {settings.razorpay_enabled && (
          <div className="space-y-4 mt-4 pt-4 border-t border-border">
            <div><label className="text-sm font-medium mb-1.5 block">Mode</label><div className="flex gap-2">{['sandbox', 'live'].map((mode) => <button key={mode} onClick={() => setSettings({ ...settings, razorpay_mode: mode })} className={`px-4 py-2 rounded-xl text-sm font-medium capitalize ${settings.razorpay_mode === mode ? 'v4-btn-primary rounded-btn' : 'liquid-glass'}`}>{mode}</button>)}</div></div>
            <div><label className="text-sm font-medium mb-1.5 block">Key ID</label><input type="text" value={settings.razorpay_key_id || ''} onChange={(e) => setSettings({ ...settings, razorpay_key_id: e.target.value })} placeholder="rzp_test_xxxxxxxxxxxx" className="input-base font-mono" /></div>
            <div><label className="text-sm font-medium mb-1.5 block">Key Secret</label><div className="relative"><input type={showSecret ? 'text' : 'password'} value={settings.razorpay_key_secret || ''} onChange={(e) => setSettings({ ...settings, razorpay_key_secret: e.target.value })} placeholder="••••••••••••••••" className="input-base font-mono pr-10" /><button onClick={() => setShowSecret(!showSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-foreground">{showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
          </div>
        )}
      </div>

      <div className="v4-panel bg-zinc-900/50 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20"><CreditCard className="h-5 w-5 text-indigo-500" /></div><div><h3 className="font-semibold">Stripe</h3><p className="text-xs text-zinc-500">{settings.stripe_enabled && settings.stripe_publishable_key ? 'Connected' : 'Not configured'}</p></div></div>
          <ToggleSwitch checked={settings.stripe_enabled} onChange={(v) => setSettings({ ...settings, stripe_enabled: v })} />
        </div>
        {settings.stripe_enabled && (
          <div className="space-y-4 mt-4 pt-4 border-t border-border">
            <div><label className="text-sm font-medium mb-1.5 block">Publishable Key</label><input type="text" value={settings.stripe_publishable_key || ''} onChange={(e) => setSettings({ ...settings, stripe_publishable_key: e.target.value })} placeholder="pk_test_xxxxxxxxxxxx" className="input-base font-mono" /></div>
            <div><label className="text-sm font-medium mb-1.5 block">Secret Key</label><div className="relative"><input type={showSecret ? 'text' : 'password'} value={settings.stripe_secret_key || ''} onChange={(e) => setSettings({ ...settings, stripe_secret_key: e.target.value })} placeholder="sk_test_xxxxxxxxxxxx" className="input-base font-mono pr-10" /><button onClick={() => setShowSecret(!showSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-foreground">{showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
            <div><label className="text-sm font-medium mb-1.5 block">Webhook Secret</label><div className="relative"><input type={showSecret ? 'text' : 'password'} value={settings.stripe_webhook_secret || ''} onChange={(e) => setSettings({ ...settings, stripe_webhook_secret: e.target.value })} placeholder="whsec_xxxxxxxxxxxx" className="input-base font-mono pr-10" /><button onClick={() => setShowSecret(!showSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-foreground">{showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
          </div>
        )}
      </div>

      <div className="v4-panel bg-zinc-900/50 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 border border-green-500/20"><QrCode className="h-5 w-5 text-green-500" /></div><div><h3 className="font-semibold">UPI / Manual QR</h3><p className="text-xs text-zinc-500">Dynamic UPI QR with manual verification</p></div></div>
          <ToggleSwitch checked={settings.upi_enabled} onChange={(v) => setSettings({ ...settings, upi_enabled: v })} />
        </div>
        {settings.upi_enabled && (
          <div className="space-y-4 mt-4 pt-4 border-t border-border">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1.5 block">UPI ID</label><input type="text" value={settings.upi_id || ''} onChange={(e) => setSettings({ ...settings, upi_id: e.target.value })} placeholder="business@axisbank" className="input-base font-mono" /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Display Name</label><input type="text" value={settings.upi_display_name || ''} onChange={(e) => setSettings({ ...settings, upi_display_name: e.target.value })} placeholder="ELSxGlobal" className="input-base" /></div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Custom QR Image (overrides dynamic QR)</label>
              {settings.custom_qr_image_url ? (
                <div className="flex items-center gap-4"><div className="w-24 h-24 rounded-xl overflow-hidden bg-white border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={settings.custom_qr_image_url} alt="Custom QR" className="w-full h-full object-contain" /></div><button onClick={() => setSettings({ ...settings, custom_qr_image_url: '' })} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-500/10"><Trash2 className="h-4 w-4" />Remove</button></div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors"><div className="flex flex-col items-center gap-2">{uploadingQr ? <Loader2 className="h-6 w-6 animate-spin text-signal" /> : <Upload className="h-6 w-6 text-zinc-500" />}<span className="text-xs text-zinc-500">{uploadingQr ? 'Uploading...' : 'Upload custom QR (PNG/JPEG, max 2MB)'}</span></div><input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" disabled={uploadingQr} /></label>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="v4-panel bg-zinc-900/50 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20"><Building2 className="h-5 w-5 text-amber-500" /></div><div><h3 className="font-semibold">Bank Transfer</h3><p className="text-xs text-zinc-500">Manual bank transfer with proof upload</p></div></div>
          <ToggleSwitch checked={settings.bank_transfer_enabled} onChange={(v) => setSettings({ ...settings, bank_transfer_enabled: v })} />
        </div>
        {settings.bank_transfer_enabled && (
          <div className="grid sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
            <div><label className="text-sm font-medium mb-1.5 block">Account Name</label><input type="text" value={settings.bank_details?.account_name || ''} onChange={(e) => setSettings({ ...settings, bank_details: { ...settings.bank_details, account_name: e.target.value } })} placeholder="ELSxGlobal Pvt Ltd" className="input-base" /></div>
            <div><label className="text-sm font-medium mb-1.5 block">Account Number</label><input type="text" value={settings.bank_details?.account_number || ''} onChange={(e) => setSettings({ ...settings, bank_details: { ...settings.bank_details, account_number: e.target.value } })} placeholder="0000000000000000" className="input-base font-mono" /></div>
            <div><label className="text-sm font-medium mb-1.5 block">IFSC Code</label><input type="text" value={settings.bank_details?.ifsc || ''} onChange={(e) => setSettings({ ...settings, bank_details: { ...settings.bank_details, ifsc: e.target.value } })} placeholder="AXIS0000000" className="input-base font-mono" /></div>
            <div><label className="text-sm font-medium mb-1.5 block">Bank Name</label><input type="text" value={settings.bank_details?.bank_name || ''} onChange={(e) => setSettings({ ...settings, bank_details: { ...settings.bank_details, bank_name: e.target.value } })} placeholder="Axis Bank" className="input-base" /></div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SITE SETTINGS ──────────────────────────────────────────
export function SiteSettingsTab({ showToast }: { showToast: (t: 'success' | 'error', m: string) => void }) {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const res = await adminFetch('get-site-settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings || {});
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
    const res = await adminFetch('save-site-settings', { settings });
    if (res.ok) showToast('success', 'Site settings saved');
    else { const err = await res.json().catch(() => ({})); showToast('error', err.error || 'Save failed'); }
    setSaving(false);
  };

  if (loading || !settings) return <div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-signal" /></div>;

  return (
    <div className="w-full max-w-5xl">
      <div className="flex items-center justify-between mb-6"><div><h1 className="text-2xl font-semibold tracking-tight text-white">Site Settings</h1><p className="text-sm text-zinc-500">Organization metadata and trust badge management</p></div><Settings className="h-6 w-6 text-signal" /></div>
      <div className="v4-panel bg-zinc-900/50 rounded-2xl p-6 mb-6">
        <h3 className="font-semibold mb-4">Organization Metadata</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium mb-1.5 block">Organization Name</label><input type="text" value={settings.org_name || ''} onChange={(e) => setSettings({ ...settings, org_name: e.target.value })} className="input-base" /></div>
          <div><label className="text-sm font-medium mb-1.5 block">Tagline</label><input type="text" value={settings.tagline || ''} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} className="input-base" /></div>
          <div><label className="text-sm font-medium mb-1.5 block">Support Email</label><input type="email" value={settings.support_email || ''} onChange={(e) => setSettings({ ...settings, support_email: e.target.value })} className="input-base" /></div>
          <div><label className="text-sm font-medium mb-1.5 block">Support Phone</label><input type="text" value={settings.support_phone || ''} onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })} className="input-base" /></div>
        </div>
      </div>
      <div className="v4-panel bg-zinc-900/50 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4"><div><h3 className="font-semibold">Trust Badges</h3><p className="text-xs text-zinc-500">Only badges with Verified + Display enabled appear on the public site</p></div><button onClick={() => setSettings({ ...settings, trust_badges: [...(settings.trust_badges || []), { id: `badge-${Date.now()}`, name: 'New Badge', logo_url: '', verify_url: '', verified: false, display: false }] })} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl v4-panel rounded-btn text-sm"><Plus className="h-4 w-4" />Add Badge</button></div>
        <div className="space-y-3">
          {(settings.trust_badges || []).map((badge: any, idx: number) => (
            <div key={badge.id} className="v4-panel rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">{badge.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={badge.logo_url} alt={badge.name} className="h-6 w-6 object-contain" />
                ) : <BadgeCheck className="h-5 w-5 text-signal" />}</div><input type="text" value={badge.name} onChange={(e) => { const badges = [...settings.trust_badges]; badges[idx] = { ...badges[idx], name: e.target.value }; setSettings({ ...settings, trust_badges: badges }); }} className="px-3 py-1.5 rounded-lg bg-background border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
                <button onClick={() => { const badges = [...settings.trust_badges]; badges.splice(idx, 1); setSettings({ ...settings, trust_badges: badges }); }} className="p-2 rounded-lg text-red-500 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <input type="text" value={badge.logo_url || ''} onChange={(e) => { const badges = [...settings.trust_badges]; badges[idx] = { ...badges[idx], logo_url: e.target.value }; setSettings({ ...settings, trust_badges: badges }); }} placeholder="Logo URL" className="px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <input type="text" value={badge.verify_url || ''} onChange={(e) => { const badges = [...settings.trust_badges]; badges[idx] = { ...badges[idx], verify_url: e.target.value }; setSettings({ ...settings, trust_badges: badges }); }} placeholder="Verification URL" className="px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm"><ToggleSwitch checked={badge.verified} onChange={(v) => { const badges = [...settings.trust_badges]; badges[idx] = { ...badges[idx], verified: v }; setSettings({ ...settings, trust_badges: badges }); }} small />Verified</label>
                <label className="flex items-center gap-2 text-sm"><ToggleSwitch checked={badge.display} onChange={(v) => { const badges = [...settings.trust_badges]; badges[idx] = { ...badges[idx], display: v }; setSettings({ ...settings, trust_badges: badges }); }} small />Display on site</label>
                {badge.verify_url && <a href={badge.verify_url} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs text-signal hover:underline flex items-center gap-1">Verify <ExternalLink className="h-3 w-3" /></a>}
              </div>
            </div>
          ))}
          {(!settings.trust_badges || settings.trust_badges.length === 0) && <p className="text-sm text-zinc-500 text-center py-8">No trust badges configured.</p>}
        </div>
      </div>
      <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl v4-btn-primary rounded-btn font-medium text-sm hover:bg-primary/90 disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save Site Settings</button>
    </div>
  );
}

// ─── EMAIL LOG ───────────────────────────────────────────────
export function EmailLogTab() {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchEmails = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('email_log').select('*').order('created_at', { ascending: false }).limit(200);
      setEmails(data || []);
      setLoading(false);
    };
    fetchEmails();
  }, []);

  const emailStatusColors: Record<string, string> = { sent: 'text-green-500 bg-green-500/10 border-green-500/20', logged: 'text-blue-500 bg-blue-500/10 border-blue-500/20', failed: 'text-red-500 bg-red-500/10 border-red-500/20' };
  const filtered = emails.filter((e) => { const matchSearch = !search || e.subject?.toLowerCase().includes(search.toLowerCase()) || e.recipient?.toLowerCase().includes(search.toLowerCase()); const matchStatus = statusFilter === 'all' || e.status === statusFilter; return matchSearch && matchStatus; });

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-border/50"><div><h1 className="text-xl font-semibold text-foreground">Email Audit Log</h1><p className="text-[13px] text-muted-foreground mt-1">Outbound email notification history</p></div></div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter by subject or recipient..." className="w-full pl-8 pr-3 py-1.5 rounded-md bg-background border border-border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" /></div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-1.5 rounded-md bg-background border border-border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground w-[160px]"><option value="all">All Statuses</option><option value="sent">Sent</option><option value="logged">Logged</option><option value="failed">Failed</option></select>
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/50 p-12 text-center bg-muted/5"><Send className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" /><p className="text-[13px] text-muted-foreground">No emails sent yet.</p></div>
      ) : (
        <div className="rounded-lg bg-background border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full text-left border-collapse">
            <thead><tr className="border-b border-border/50 bg-muted/20 text-[10px] text-muted-foreground uppercase tracking-wider">
              <th className="px-4 py-2 font-medium">Recipient</th><th className="px-4 py-2 font-medium">Subject</th><th className="px-4 py-2 font-medium">Template</th><th className="px-4 py-2 font-medium">Status</th><th className="px-4 py-2 font-medium text-right">Timestamp</th>
            </tr></thead>
            <tbody className="text-[12px]">
              {filtered.map((e) => (
                <tr key={e.id} className="border-b border-border/30 hover:bg-muted/10 transition-colors last:border-0">
                  <td className="px-4 py-2.5 truncate max-w-[180px] text-muted-foreground">{e.recipient}</td>
                  <td className="px-4 py-2.5 font-medium text-foreground truncate max-w-[260px]">{e.subject}</td>
                  <td className="px-4 py-2.5"><span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-muted text-muted-foreground">{e.template || '—'}</span></td>
                  <td className="px-4 py-2.5"><span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${emailStatusColors[e.status] || emailStatusColors.logged}`}>{e.status}</span></td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground whitespace-nowrap">{new Date(e.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}
    </div>
  );
}

// ─── SHARED ──────────────────────────────────────────────────
export function ToggleSwitch({ checked, onChange, small }: { checked: boolean; onChange: (v: boolean) => void; small?: boolean }) {
  return <button type="button" onClick={() => onChange(!checked)} className={`relative flex items-center ${small ? 'h-5 w-9' : 'h-6 w-11'} rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-muted'}`}><span className={`absolute left-0.5 ${small ? 'h-4 w-4' : 'h-5 w-5'} rounded-full bg-white shadow transition-transform ${checked ? (small ? 'translate-x-4' : 'translate-x-5') : 'translate-x-0'}`} /></button>;
}






