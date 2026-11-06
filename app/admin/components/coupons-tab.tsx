'use client';

import { useState, useEffect } from 'react';
import { adminFetch } from './admin-fetch';
import { Loader2, Plus, Tag, Trash2, Edit, Save } from 'lucide-react';
import { ToggleSwitch } from './payments-settings-tab';

export function CouponsTab({ showToast }: { showToast: (t: 'success' | 'error', m: string) => void }) {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    const res = await adminFetch('list-coupons');
    if (res.ok) {
      const data = await res.json();
      setCoupons(data.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openNew = () => {
    setCurrentCoupon({ code: '', discount_type: 'percentage', discount_value: 0, max_uses: null, is_active: true });
    setModalOpen(true);
  };

  const openEdit = (c: any) => {
    setCurrentCoupon({ ...c });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!currentCoupon.code || currentCoupon.discount_value <= 0) {
      showToast('error', 'Please fill required fields properly.');
      return;
    }
    
    setSaving(true);
    const res = await adminFetch('save-coupon', currentCoupon);
    if (res.ok) {
      showToast('success', 'Coupon saved');
      setModalOpen(false);
      fetchCoupons();
    } else {
      const err = await res.json().catch(() => ({}));
      showToast('error', err.error || 'Failed to save coupon');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    const res = await adminFetch('delete-coupon', { couponId: id });
    if (res.ok) {
      showToast('success', 'Coupon deleted');
      fetchCoupons();
    } else {
      showToast('error', 'Failed to delete');
    }
  };

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="w-full max-w-5xl space-y-4 animate-fade-in">
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Coupons & Promotions</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Manage discount codes for your customers.</p>
        </div>
        {!modalOpen && (
          <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90">
            <Plus className="h-3.5 w-3.5" /> New Coupon
          </button>
        )}
      </div>

      {modalOpen && currentCoupon ? (
        <div className="rounded-lg bg-background border border-border shadow-sm p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
            <h3 className="text-sm font-semibold text-foreground">{currentCoupon.id ? 'Edit Coupon' : 'New Coupon'}</h3>
            <button onClick={() => setModalOpen(false)} className="px-3 py-1.5 rounded-md bg-muted text-foreground text-[13px] font-medium hover:bg-muted/80 transition-colors">
              &larr; Back to List
            </button>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[13px] font-medium mb-1 block text-muted-foreground">Coupon Code</label>
              <input type="text" value={currentCoupon.code} onChange={e => setCurrentCoupon({ ...currentCoupon, code: e.target.value.toUpperCase() })} className="input-base text-[13px] py-1.5 font-mono uppercase" placeholder="e.g. SUMMER20" />
            </div>
            
            <div>
              <label className="text-[13px] font-medium mb-1 block text-muted-foreground">Discount Type</label>
              <select 
                value={currentCoupon.discount_type} 
                onChange={e => setCurrentCoupon({ ...currentCoupon, discount_type: e.target.value })} 
                className="input-base text-[13px] py-1.5"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (Rs)</option>
              </select>
            </div>
            
            <div>
              <label className="text-[13px] font-medium mb-1 block text-muted-foreground">Discount Value</label>
              <input type="number" min="0" value={currentCoupon.discount_value} onChange={e => setCurrentCoupon({ ...currentCoupon, discount_value: Number(e.target.value) })} className="input-base text-[13px] py-1.5" placeholder="20" />
            </div>

            <div>
              <label className="text-[13px] font-medium mb-1 block text-muted-foreground">Max Uses (Optional)</label>
              <input type="number" min="1" value={currentCoupon.max_uses || ''} onChange={e => setCurrentCoupon({ ...currentCoupon, max_uses: e.target.value ? Number(e.target.value) : null })} className="input-base text-[13px] py-1.5" placeholder="Leave blank for unlimited" />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-md bg-muted/20 border border-border mt-4 max-w-sm">
            <div>
              <label className="font-medium text-[13px] block text-foreground">Active Status</label>
              <span className="text-[11px] text-muted-foreground">Enable or disable this coupon</span>
            </div>
            <ToggleSwitch checked={currentCoupon.is_active} onChange={v => setCurrentCoupon({ ...currentCoupon, is_active: v })} />
          </div>

          <div className="flex justify-end mt-6">
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 disabled:opacity-50">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {currentCoupon.id ? 'Save Changes' : 'Create Coupon'}
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-background border border-border shadow-sm overflow-hidden animate-fade-in">
          {coupons.length === 0 ? (
             <div className="rounded-lg border border-dashed border-border/50 p-12 text-center bg-muted/5 m-4">
               <p className="text-[13px] text-muted-foreground">No coupons found. Create your first promotion!</p>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-muted/20 border-b border-border/50">
                  <tr>
                    <th className="px-4 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Code</th>
                    <th className="px-4 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Discount</th>
                    <th className="px-4 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Usage</th>
                    <th className="px-4 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Status</th>
                    <th className="px-4 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 text-[12px]">
                  {coupons.map(coupon => (
                    <tr key={coupon.id} className="hover:bg-muted/5 transition-colors group">
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2 font-mono font-medium text-foreground">
                          <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                          {coupon.code.toUpperCase()}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-foreground font-medium">
                        {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `Rs ${coupon.discount_value} OFF`}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">
                        {coupon.current_uses} {coupon.max_uses ? `/ ${coupon.max_uses}` : 'uses'}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${coupon.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                          {coupon.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(coupon)} className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground" title="Edit"><Edit className="h-3.5 w-3.5" /></button>
                          <button onClick={() => handleDelete(coupon.id)} className="p-1 rounded-md text-destructive hover:bg-destructive/10" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
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
