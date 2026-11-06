'use client';

import { useState, useEffect } from 'react';
import { adminFetch } from './admin-fetch';
import {
  Loader2, Check, X as XIcon, Eye, RotateCcw, Search, CreditCard,
} from 'lucide-react';

export function OrdersTab({ orders, searchQuery, setSearchQuery, statusFilter, setStatusFilter, actionLoading, updateOrderStatus, refundOrder, statusColors }: {
  orders: Record<string, unknown>[]; searchQuery: string; setSearchQuery: (v: string) => void; statusFilter: string; setStatusFilter: (v: string) => void;
  actionLoading: string | null; updateOrderStatus: (id: string, s: string) => void; refundOrder: (id: string, r: string) => void; statusColors: Record<string, string>;
}) {
  const [detailOrder, setDetailOrder] = useState<Record<string, unknown> | null>(null);
  const [detailData, setDetailData] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [refundModal, setRefundModal] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState('');



  const loadDetail = async (orderId: string) => {
    setDetailLoading(true);
    const res = await adminFetch('order-detail', { orderId });
    if (res.ok) {
      const data = await res.json();
      setDetailData(data);
      setDetailOrder(data.order);
    } else {
      setDetailData(null);
    }
    setDetailLoading(false);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Orders Management</h1>
          <p className="text-[13px] text-muted-foreground mt-1">View, approve, and manage customer orders</p>
        </div>
      </div>
      
      {!detailOrder && !refundModal && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Filter by plan name, order ID, or user email..." className="w-full pl-8 pr-3 py-1.5 rounded-md bg-background border border-border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-1.5 rounded-md bg-background border border-border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground w-[180px]">
            <option value="all">All Statuses</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="pending_verification">Pending Verification</option>
            <option value="paid">Paid</option>
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      )}

      {detailOrder ? (
        <div className="rounded-lg bg-background border border-border shadow-sm animate-fade-in flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/10">
            <h3 className="text-[14px] font-semibold text-foreground">Order Configuration</h3>
            <button onClick={() => setDetailOrder(null)} className="px-3 py-1.5 rounded-md bg-muted text-muted-foreground hover:text-foreground text-[12px] font-medium transition-colors">
              &larr; Back to List
            </button>
          </div>
          {detailLoading ? <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : detailData && (
            <div className="p-4 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-y-4 gap-x-6 text-[12px]">
                <div><p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Order ID</p><p className="font-mono text-foreground font-medium">{(detailData.order.id as string).slice(0, 8).toUpperCase()}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Plan</p><p className="font-medium text-foreground">{detailData.order.plan_name}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Email</p><p className="text-foreground truncate" title={detailData.order.user_email}>{detailData.order.user_email || '—'}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Billing Cycle</p><p className="capitalize text-foreground">{detailData.order.billing_cycle}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Total</p><p className="font-semibold text-foreground">Rs {Number(detailData.order.total).toLocaleString('en-IN')}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Status</p><span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${statusColors[detailData.order.status] || 'text-muted-foreground bg-muted'}`}>{detailData.order.status}</span></div>
                <div><p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Domain</p><p className="text-foreground">{detailData.order.domain || '—'}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Gateway</p><p className="capitalize text-foreground">{detailData.order.payment_method || '—'}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">OS</p><p className="text-foreground">{detailData.order.os_selection || '—'}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Control Panel</p><p className="text-foreground">{detailData.order.panel_selection || '—'}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Region</p><p className="text-foreground">{detailData.order.server_location || '—'}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Created At</p><p className="text-foreground whitespace-nowrap">{new Date(detailData.order.created_at).toLocaleString()}</p></div>
              </div>
              
              {detailData.order.payment_proof_url && (
                <div className="pt-4 border-t border-border/50">
                  <p className="text-[13px] font-semibold text-foreground mb-3">Verification Document</p>
                  <div className="bg-muted/10 border border-border/50 rounded-md p-3 flex flex-col items-center gap-2 max-w-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={detailData.order.payment_proof_url} 
                      alt="Payment proof" 
                      className="max-h-48 rounded object-contain w-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const parent = (e.target as HTMLImageElement).parentElement;
                        if (parent && !parent.querySelector('a')) {
                          const link = document.createElement('a');
                          link.href = detailData.order.payment_proof_url;
                          link.target = "_blank";
                          link.rel = "noreferrer";
                          link.className = "text-[12px] text-primary hover:underline";
                          link.innerText = "View Document externally";
                          parent.appendChild(link);
                        }
                      }}
                    />
                  </div>
                </div>
              )}
              
              <div className="grid md:grid-cols-2 gap-6">
                {detailData.services?.length > 0 && (
                  <div className="pt-4 border-t border-border/50">
                    <p className="text-[13px] font-semibold text-foreground mb-2">Provisioned Resources</p>
                    <div className="space-y-1.5">
                      {detailData.services.map((s: any) => (
                        <div key={s.id} className="text-[12px] flex justify-between items-center bg-background border border-border p-2 rounded-md shadow-sm">
                          <span className="text-foreground font-medium">{s.plan_name}</span>
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${statusColors[s.status] || ''}`}>{s.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {detailData.transactions?.length > 0 && (
                  <div className="pt-4 border-t border-border/50">
                    <p className="text-[13px] font-semibold text-foreground mb-2">Audit Ledger (Transactions)</p>
                    <div className="space-y-1.5">
                      {detailData.transactions.map((t: any) => (
                        <div key={t.id} className="text-[12px] flex items-center justify-between bg-background border border-border p-2 rounded-md shadow-sm">
                          <div className="flex flex-col">
                            <span className="capitalize text-foreground font-medium">{t.gateway}</span>
                            <span className="text-[10px] text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-foreground">Rs {Number(t.amount).toLocaleString('en-IN')}</span>
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${statusColors[t.status] || ''}`}>{t.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : refundModal ? (
        <div className="rounded-lg bg-background border border-border shadow-sm animate-fade-in max-w-xl mx-auto mt-8">
          <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/10">
            <h3 className="text-[14px] font-semibold text-foreground">Initiate Refund</h3>
            <button onClick={() => { setRefundModal(null); setRefundReason(''); }} className="px-3 py-1.5 rounded-md bg-muted text-muted-foreground hover:text-foreground text-[12px] font-medium transition-colors">
              Cancel
            </button>
          </div>
          <div className="p-4">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-md p-3 mb-4">
              <p className="text-[12px] text-amber-600 font-medium">Warning: This action is irreversible.</p>
              <p className="text-[11px] text-amber-600/80 mt-1">Marking this order as refunded will immediately suspend associated services and record a refund transaction.</p>
            </div>
            <div className="mb-4">
              <label className="text-[12px] font-medium mb-1.5 block text-foreground">Justification / Reason</label>
              <textarea value={refundReason} onChange={(e) => setRefundReason(e.target.value)} placeholder="Provide an audit trail reason..." className="w-full bg-background border border-border rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" rows={3} />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => { setRefundModal(null); setRefundReason(''); }} className="px-4 py-1.5 rounded-md bg-muted text-foreground text-[12px] font-medium hover:bg-muted/80 transition-colors">Abort</button>
              <button onClick={() => { refundOrder(refundModal, refundReason); setRefundModal(null); setRefundReason(''); }} disabled={actionLoading === refundModal || !refundReason.trim()} className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-md bg-destructive text-destructive-foreground text-[12px] font-medium hover:bg-destructive/90 disabled:opacity-50 transition-colors">
                {actionLoading === refundModal ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />} Execute Refund
              </button>
            </div>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/50 p-12 text-center animate-fade-in bg-muted/5"><CreditCard className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" /><p className="text-[13px] text-muted-foreground">No orders matching criteria.</p></div>
      ) : (
        <div className="rounded-lg bg-background border border-border shadow-sm overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20 text-[10px] text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-2 font-medium">Identifier</th>
                  <th className="px-4 py-2 font-medium">Plan / Customer</th>
                  <th className="px-4 py-2 font-medium">Billing</th>
                  <th className="px-4 py-2 font-medium text-right">Total (Rs)</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium text-right">Timestamp</th>
                  <th className="px-4 py-2 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[12px]">
                {orders.map((order) => (
                  <tr key={order.id as string} className="border-b border-border/30 hover:bg-muted/10 transition-colors last:border-0">
                    <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
                      {(order.id as string).slice(0, 8)}
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-foreground">{order.plan_name as string}</p>
                      <p className="text-[11px] text-muted-foreground">{(order.user_email as string) || '—'}</p>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground capitalize">{order.billing_cycle as string}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-foreground">{(order.total as number)?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '—'}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${statusColors[order.status as string] || 'text-muted-foreground bg-muted'}`}>
                        {order.status as string}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground whitespace-nowrap">
                      {new Date(order.created_at as string).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => loadDetail(order.id as string)} className="p-1 rounded bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Inspect">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        {(order.status === 'pending_verification' || order.status === 'pending_payment' || order.status === 'pending') && (
                          <div className="inline-flex items-center gap-1 border-l border-border/50 pl-1 ml-1">
                            <button onClick={() => updateOrderStatus(order.id as string, 'active')} disabled={actionLoading === order.id} className="p-1 rounded bg-green-500/10 hover:bg-green-500/20 text-green-600 transition-colors" title="Approve">
                              {actionLoading === order.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                            </button>
                            <button onClick={() => updateOrderStatus(order.id as string, 'cancelled')} disabled={actionLoading === order.id} className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-600 transition-colors" title="Reject">
                              <XIcon className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                        {(order.status === 'paid' || order.status === 'active') && (
                          <div className="inline-flex items-center border-l border-border/50 pl-1 ml-1">
                            <button onClick={() => setRefundModal(order.id as string)} disabled={actionLoading === order.id} className="p-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 transition-colors" title="Refund">
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}






