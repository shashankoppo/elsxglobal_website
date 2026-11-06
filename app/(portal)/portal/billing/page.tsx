'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { Receipt, CreditCard, Download, CheckCircle2, Clock, XCircle, ArrowRight, Sparkles, RefreshCw, Plus } from 'lucide-react';
import { PanelCard } from '@/components/ui/panel-card';

const DEMO_INVOICES = [
  { id: 'INV-2026-0041', amount: 4999, status: 'paid', created_at: '2026-09-01', plan: 'VPS Pro 8GB', period: 'Sep 2026' },
  { id: 'INV-2026-0028', amount: 4999, status: 'paid', created_at: '2026-08-01', plan: 'VPS Pro 8GB', period: 'Aug 2026' },
  { id: 'INV-2026-0014', amount: 4999, status: 'paid', created_at: '2026-07-01', plan: 'VPS Pro 8GB', period: 'Jul 2026' },
  { id: 'INV-2026-0003', amount: 4999, status: 'paid', created_at: '2026-06-01', plan: 'VPS Pro 8GB', period: 'Jun 2026' },
];

export default function BillingPage() {
  const [invoices, setInvoices] = useState<any[]>(DEMO_INVOICES);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'invoices' | 'payment-methods' | 'usage'>('invoices');

  useEffect(() => {
    async function fetchInvoices() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const { data, error } = await supabase
            .from('hosting_invoices')
            .select('*, hosting_orders(*)')
            .eq('user_id', userData.user.id)
            .order('created_at', { ascending: false });
            
          if (data && data.length > 0) {
            setInvoices(data);
          }
        }
      } catch (e) {
        console.error('Error fetching invoices, using demo data', e);
      } finally {
        setLoading(false);
      }
    }
    fetchInvoices();
  }, []);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'paid': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-amber-500" />;
      default: return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'paid': return 'text-green-500 bg-green-500/10';
      case 'pending': return 'text-amber-500 bg-amber-500/10';
      default: return 'text-red-500 bg-red-500/10';
    }
  };

  return (
    <div className="v4-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="text-sm text-text-muted-v4 mb-1">Portal → Billing</div>
          <h1 className="text-3xl font-bold text-text-primary-v4">Billing & Invoices</h1>
        </div>
        <button className="v4-btn-secondary flex items-center gap-2 py-2 px-4 text-sm" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <PanelCard className="p-5">
          <div className="text-sm text-text-muted-v4 mb-1">Current Balance</div>
          <div className="text-2xl font-bold text-text-primary-v4">₹0.00</div>
        </PanelCard>
        <PanelCard className="p-5">
          <div className="text-sm text-text-muted-v4 mb-1">Next Invoice</div>
          <div className="text-2xl font-bold text-text-primary-v4">Oct 1, 2026 — ₹4,999</div>
        </PanelCard>
        <PanelCard className="p-5">
          <div className="text-sm text-text-muted-v4 mb-1">Total Paid (2026)</div>
          <div className="text-2xl font-bold text-text-primary-v4">₹19,996</div>
        </PanelCard>
        <PanelCard className="p-5">
          <div className="text-sm text-text-muted-v4 mb-1">Active Subscriptions</div>
          <div className="text-2xl font-bold text-text-primary-v4">1</div>
        </PanelCard>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-hairline mb-6">
        <button 
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'invoices' ? 'border-signal text-signal' : 'border-transparent text-text-muted-v4 hover:text-text-primary-v4'}`}
          onClick={() => setActiveTab('invoices')}
        >
          <Receipt className="w-4 h-4 inline mr-2" /> Invoices
        </button>
        <button 
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'payment-methods' ? 'border-signal text-signal' : 'border-transparent text-text-muted-v4 hover:text-text-primary-v4'}`}
          onClick={() => setActiveTab('payment-methods')}
        >
          <CreditCard className="w-4 h-4 inline mr-2" /> Payment Methods
        </button>
        <button 
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'usage' ? 'border-signal text-signal' : 'border-transparent text-text-muted-v4 hover:text-text-primary-v4'}`}
          onClick={() => setActiveTab('usage')}
        >
          <Sparkles className="w-4 h-4 inline mr-2" /> Usage & Credits
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-ink rounded-lg border border-hairline min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-text-muted-v4">Loading...</div>
        ) : (
          <>
            {activeTab === 'invoices' && (
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-ink-surface border-b border-hairline text-sm text-text-muted-v4">
                    <tr>
                      <th className="px-6 py-4 font-medium">Invoice ID</th>
                      <th className="px-6 py-4 font-medium">Plan</th>
                      <th className="px-6 py-4 font-medium">Period</th>
                      <th className="px-6 py-4 font-medium">Amount</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {invoices.map((inv, idx) => (
                      <tr key={idx} className="border-b border-hairline last:border-0 hover:bg-ink-surface/50">
                        <td className="px-6 py-4 font-mono text-text-primary-v4">{inv.id}</td>
                        <td className="px-6 py-4 text-text-secondary-v4">{inv.plan || 'N/A'}</td>
                        <td className="px-6 py-4 text-text-secondary-v4">{inv.period || inv.created_at}</td>
                        <td className="px-6 py-4 font-medium text-text-primary-v4">₹{inv.amount.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(inv.status)}`}>
                            {getStatusIcon(inv.status)}
                            <span className="capitalize">{inv.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            className="text-text-muted-v4 hover:text-signal p-1 transition-colors"
                            onClick={() => alert('PDF export coming soon')}
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-6 border-t border-hairline bg-ink-surface/30 flex justify-between items-center">
                  <div className="text-sm text-text-secondary-v4">Need more resources?</div>
                  <Link href="/vaulthost/pricing" className="v4-btn-primary py-2 px-4 text-sm">Upgrade Plan</Link>
                </div>
              </div>
            )}

            {activeTab === 'payment-methods' && (
              <div className="p-6">
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between p-4 border border-hairline rounded-lg bg-ink-surface">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-white rounded flex items-center justify-center text-black font-bold text-xs italic">VISA</div>
                      <div>
                        <div className="text-text-primary-v4 font-medium">Visa ending in 4242</div>
                        <div className="text-xs text-text-muted-v4">Primary</div>
                      </div>
                    </div>
                    <button className="text-sm text-red-500 hover:text-red-400">Remove</button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-hairline rounded-lg bg-ink">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-slate-800 rounded flex items-center justify-center border border-hairline text-xs font-bold">UPI</div>
                      <div>
                        <div className="text-text-primary-v4 font-medium">user@upi</div>
                      </div>
                    </div>
                    <button className="text-sm text-red-500 hover:text-red-400">Remove</button>
                  </div>
                </div>
                
                <button 
                  className="v4-btn-secondary flex items-center gap-2 py-2 px-4 text-sm border-dashed"
                  onClick={() => alert('Add Payment Method modal coming soon')}
                >
                  <Plus className="w-4 h-4" /> Add Payment Method
                </button>
              </div>
            )}

            {activeTab === 'usage' && (
              <div className="p-6 space-y-8">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-text-primary-v4 font-medium">Storage</span>
                    <span className="text-text-secondary-v4">48.6 GB / 100 GB</span>
                  </div>
                  <div className="w-full bg-ink-surface-2 rounded-full h-2">
                    <div className="bg-signal h-2 rounded-full" style={{ width: '48.6%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-text-primary-v4 font-medium">Bandwidth</span>
                    <span className="text-text-secondary-v4">320 GB / 1 TB</span>
                  </div>
                  <div className="w-full bg-ink-surface-2 rounded-full h-2">
                    <div className="bg-signal h-2 rounded-full" style={{ width: '32%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-text-primary-v4 font-medium">Workers Requests</span>
                    <span className="text-text-secondary-v4">1.42M / 10M</span>
                  </div>
                  <div className="w-full bg-ink-surface-2 rounded-full h-2">
                    <div className="bg-signal h-2 rounded-full" style={{ width: '14.2%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-text-primary-v4 font-medium">API Calls</span>
                    <span className="text-text-secondary-v4">4.82M / unlimited</span>
                  </div>
                  <div className="w-full bg-ink-surface-2 rounded-full h-2">
                    <div className="bg-signal h-2 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <div className="text-green-400 font-medium">₹25.00 credits remaining</div>
                    <div className="text-sm text-green-400/80 mt-1">These credits will be automatically applied to your next invoice.</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
