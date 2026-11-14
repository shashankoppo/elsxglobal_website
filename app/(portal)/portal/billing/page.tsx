'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { 
  Receipt, CreditCard, Download, CheckCircle2, Clock, XCircle, 
  ArrowRight, Sparkles, RefreshCw, Plus, Wallet, AlertCircle, 
  ArrowUpRight, ArrowDownRight, Check, X, Shield, Server, Zap, 
  HardDrive, AlertTriangle, IndianRupee, ExternalLink
} from 'lucide-react';
import { PanelCard } from '@/components/ui/panel-card';
import { SkeletonCard } from '@/components/ui/skeleton-loaders';

interface SubscriptionInfo {
  id: string;
  plan: string;
  tier: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  cycle: string;
  amount: number;
  nextBillingDate: string;
  autoRenew: boolean;
}

export default function BillingPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'invoices' | 'payment-methods' | 'usage'>('invoices');

  // Customer Billing State
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [creditBalance, setCreditBalance] = useState<number>(0);
  const [lifetimeCredited, setLifetimeCredited] = useState<number>(0);

  // Metered Usage Quotas
  const [quotas, setQuotas] = useState({
    apiRequests: { used: 0, limit: 10000000, label: '0 / 10M requests', percentage: 0 },
    storage: { used: 0, limit: 100, label: '0 GB / 100 GB', percentage: 0 },
    aiTokens: { used: 0, limit: 2000000, label: '0 / 2M tokens', percentage: 0 },
    bandwidth: { used: 0, limit: 1000, label: '0 GB / 1 TB', percentage: 0 },
  });

  // Modals & Feedback
  const [isAddCreditModalOpen, setIsAddCreditModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(1000);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    async function fetchBillingData() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          // Fetch invoices
          const { data, error } = await supabase
            .from('hosting_invoices')
            .select('*, hosting_orders(*)')
            .eq('user_id', userData.user.id)
            .order('created_at', { ascending: false });
            
          if (!error && data) {
            setInvoices(data);
          } else {
            setInvoices([]);
          }

          // Fetch customer credit balance
          try {
            const { data: creditData } = await supabase
              .from('credit_balances')
              .select('balance_paise, lifetime_credited_paise')
              .eq('user_id', userData.user.id)
              .maybeSingle();

            if (creditData) {
              setCreditBalance(Math.round(creditData.balance_paise / 100));
              setLifetimeCredited(Math.round(creditData.lifetime_credited_paise / 100));
            }
          } catch {
            // graceful fallback
          }

          // Fetch active subscription
          try {
            const { data: subData } = await supabase
              .from('subscriptions')
              .select('*, hosting_plans(*)')
              .eq('user_id', userData.user.id)
              .eq('status', 'active')
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            if (subData) {
              setSubscription({
                id: subData.id,
                plan: subData.hosting_plans?.name || subData.plan_id || 'Active Plan',
                tier: subData.hosting_plans?.tier || 'pro',
                status: subData.status,
                cycle: subData.billing_cycle || 'monthly',
                amount: Math.round((subData.next_invoice_amount_paise || 0) / 100),
                nextBillingDate: subData.current_period_end ? new Date(subData.current_period_end).toLocaleDateString() : 'N/A',
                autoRenew: !subData.cancel_at_period_end,
              });
            } else {
              setSubscription(null);
            }
          } catch {
            setSubscription(null);
          }
        } else {
          setInvoices([]);
        }
      } catch (e) {
        console.error('Error fetching billing data', e);
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    }
    fetchBillingData();
  }, []);

  const handleAddCredits = (amountToAdd: number) => {
    setCreditBalance(prev => prev + amountToAdd);
    setLifetimeCredited(prev => prev + amountToAdd);
    showToast(`₹${amountToAdd.toLocaleString('en-IN')} successfully added to prepaid wallet!`);
    setIsAddCreditModalOpen(false);
  };

  const handleConfirmCancel = () => {
    setSubscription(prev => prev ? ({ ...prev, status: 'cancelled', autoRenew: false }) : null);
    showToast('Subscription has been marked for cancellation at the end of the period.');
    setIsCancelModalOpen(false);
  };

  const totalPaid = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);

  const pendingAmount = invoices
    .filter((inv) => inv.status === 'pending')
    .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);

  const activeSubscriptions = invoices.filter((inv) => inv.status === 'paid').length > 0 ? 1 : 0;

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
    <div className="v4-page w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <div className="text-sm text-text-muted-v4 mb-1">Portal → Billing</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary-v4">Billing & Invoices</h1>
        </div>
        <button className="v4-btn-secondary flex items-center justify-center gap-2 py-2 px-4 text-sm w-full sm:w-auto" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <PanelCard className="p-5">
          <div className="text-sm text-text-muted-v4 mb-1">Total Paid</div>
          <div className="text-2xl font-bold text-text-primary-v4">₹{totalPaid.toLocaleString()}</div>
        </PanelCard>
        <PanelCard className="p-5">
          <div className="text-sm text-text-muted-v4 mb-1">Pending Amount</div>
          <div className="text-2xl font-bold text-text-primary-v4">₹{pendingAmount.toLocaleString()}</div>
        </PanelCard>
        <PanelCard className="p-5">
          <div className="text-sm text-text-muted-v4 mb-1">Next Renewal</div>
          <div className="text-2xl font-bold text-text-primary-v4">{subscription ? subscription.nextBillingDate : 'N/A'}</div>
        </PanelCard>
        <PanelCard className="p-5">
          <div className="text-sm text-text-muted-v4 mb-1">Active Subscriptions</div>
          <div className="text-2xl font-bold text-text-primary-v4">{subscription?.status === 'active' ? 1 : 0}</div>
        </PanelCard>
      </div>

      {/* ─── 1. SUBSCRIPTION STATUS & 2. PREPAID CREDIT BALANCE GRID ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {/* Subscription Status Card */}
        {subscription ? (
          <PanelCard className="p-6 bg-ink border border-hairline flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-signal" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-muted-v4">
                    Active Subscription Tier
                  </span>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  subscription.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${subscription.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                  {subscription.status === 'active' ? 'Active' : 'Cancelled'}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <h2 className="text-xl font-bold text-text-primary-v4">{subscription.plan}</h2>
                  <p className="text-xs text-text-muted-v4 mt-0.5">High-Performance NVMe Cloud Instance (Mumbai 1 DC)</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-mono font-bold text-text-primary-v4">₹{subscription.amount.toLocaleString()}</span>
                  <span className="text-xs text-text-muted-v4"> / {subscription.cycle}</span>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-md bg-ink-surface border border-hairline text-xs grid grid-cols-2 gap-2">
                <div>
                  <span className="text-text-muted-v4 text-[11px] block">Next Billing Cycle</span>
                  <span className="font-medium text-text-primary-v4">{subscription.nextBillingDate}</span>
                </div>
                <div>
                  <span className="text-text-muted-v4 text-[11px] block">Renewal Method</span>
                  <span className="font-medium text-text-primary-v4">{subscription.autoRenew ? 'Auto-debit (UPI / Card)' : 'Manual Invoice'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-hairline">
              <Link
                href="/vaulthost/pricing?tier=enterprise"
                className="text-xs font-semibold text-signal hover:underline flex items-center gap-1"
              >
                Modify Plan Specs <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              {subscription.status === 'active' && (
                <button
                  onClick={() => setIsCancelModalOpen(true)}
                  className="text-xs text-rose-400/80 hover:text-rose-400 hover:underline"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          </PanelCard>
        ) : (
          <PanelCard className="p-6 bg-ink border border-hairline flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Server className="w-4 h-4 text-signal" />
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted-v4">
                  Subscription Status
                </span>
              </div>
              <h2 className="text-xl font-bold text-text-primary-v4">No Active Subscriptions</h2>
              <p className="text-xs text-text-secondary-v4 mt-1">You do not currently have any active hosting plans or cloud subscriptions.</p>
            </div>
            <div className="pt-4 mt-6 border-t border-hairline">
              <Link href="/vaulthost/pricing" className="v4-btn-primary px-4 py-2 text-xs font-semibold inline-flex items-center gap-1.5">
                Browse Cloud Plans <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </PanelCard>
        )}

        {/* Credit Balance Card */}
        <PanelCard className="p-6 bg-ink border border-hairline flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted-v4">
                  Prepaid Wallet Balance
                </span>
              </div>
              <span className="text-[11px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                Auto-Deductions Active
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-3xl font-bold font-mono text-emerald-400">
                  ₹{creditBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-text-muted-v4 mt-0.5">
                  Lifetime Credits Awarded: ₹{lifetimeCredited.toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setIsAddCreditModalOpen(true)}
                className="v4-btn-primary flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> Add Credits
              </button>
            </div>

            <p className="mt-4 text-xs text-text-secondary-v4 leading-relaxed bg-ink-surface p-3 rounded border border-hairline">
              Prepaid credits are automatically applied towards metered hourly consumption (Workers, AI tokens, R2 storage) and future monthly plan invoices.
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 mt-4 border-t border-hairline text-xs">
            <span className="text-text-muted-v4">Zero invoice surprises guarantee</span>
            <button
              onClick={() => setActiveTab('usage')}
              className="text-signal hover:underline flex items-center gap-1 font-medium"
            >
              View Metered Ledger <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </PanelCard>
      </div>

      {/* ─── 3. USAGE METERS (METERED TELEMETRY GAUGES) ─── */}
      <PanelCard className="p-6 bg-ink border border-hairline mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-hairline pb-3">
          <div>
            <h3 className="text-sm font-semibold text-text-primary-v4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-signal" />
              Live Resource Quotas & Usage Meters
            </h3>
            <p className="text-xs text-text-secondary-v4 mt-0.5">
              Hourly metered consumption against your current tier allocations. Quotas reset automatically at month end.
            </p>
          </div>
          <span className="text-[11px] font-mono text-text-muted-v4 bg-ink-surface px-2.5 py-1 rounded border border-hairline self-start sm:self-auto">
            Billing Period Resets in 18 Days
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* API Requests */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-text-primary-v4 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-signal" /> API Requests
              </span>
              <span className="font-mono text-text-secondary-v4">{quotas.apiRequests.label} ({quotas.apiRequests.percentage}%)</span>
            </div>
            <div className="w-full bg-ink-surface-2 rounded-full h-2.5 overflow-hidden border border-hairline">
              <div
                className="bg-signal h-full rounded-full transition-all duration-500"
                style={{ width: `${quotas.apiRequests.percentage}%` }}
              />
            </div>
          </div>

          {/* Storage (VaultR2) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-text-primary-v4 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-blue-400" /> Object Storage (VaultR2)
              </span>
              <span className="font-mono text-text-secondary-v4">{quotas.storage.label} ({quotas.storage.percentage}%)</span>
            </div>
            <div className="w-full bg-ink-surface-2 rounded-full h-2.5 overflow-hidden border border-hairline">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${quotas.storage.percentage}%` }}
              />
            </div>
          </div>

          {/* AI Tokens (LiteLLM) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-text-primary-v4 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Tokens (LiteLLM Gateway)
              </span>
              <span className="font-mono text-text-secondary-v4">{quotas.aiTokens.label} ({quotas.aiTokens.percentage}%)</span>
            </div>
            <div className="w-full bg-ink-surface-2 rounded-full h-2.5 overflow-hidden border border-hairline">
              <div
                className="bg-purple-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${quotas.aiTokens.percentage}%` }}
              />
            </div>
          </div>

          {/* Bandwidth */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-text-primary-v4 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-emerald-400" /> Global Anycast Bandwidth
              </span>
              <span className="font-mono text-text-secondary-v4">{quotas.bandwidth.label} ({quotas.bandwidth.percentage}%)</span>
            </div>
            <div className="w-full bg-ink-surface-2 rounded-full h-2.5 overflow-hidden border border-hairline">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${quotas.bandwidth.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </PanelCard>

      {/* ─── 4. UPGRADE / DOWNGRADE PLAN SECTION ─── */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text-primary-v4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              Manage Subscription Plan & Tier Scaling
            </h3>
            <p className="text-xs text-text-secondary-v4 mt-0.5">
              Instantly upgrade or adjust your cloud resources with automated prorated billing.
            </p>
          </div>
          <Link
            href="/vaulthost/pricing"
            className="text-xs text-signal hover:underline flex items-center gap-1 font-medium"
          >
            Compare All Plans <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Starter Tier */}
          <div className="p-5 rounded-lg bg-ink border border-hairline hover:border-hairline-2 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted-v4 uppercase tracking-wider">Starter</span>
                <span className="text-xs font-mono text-text-secondary-v4">Entry Workloads</span>
              </div>
              <div>
                <h4 className="text-lg font-bold text-text-primary-v4">VPS Starter 4GB</h4>
                <div className="text-xl font-bold font-mono text-text-primary-v4 mt-1">
                  ₹1,999 <span className="text-xs font-normal text-text-muted-v4">/ mo</span>
                </div>
              </div>
              <ul className="text-xs text-text-secondary-v4 space-y-1.5 pt-2 border-t border-hairline">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> 2 vCPU Cores & 4GB RAM
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> 50GB NVMe Storage
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> 1M API Requests / mo
                </li>
              </ul>
            </div>
            <Link
              href="/vaulthost/pricing?tier=starter"
              className="mt-5 w-full py-2 px-3 rounded text-center text-xs font-medium bg-ink-surface hover:bg-ink-surface-2 border border-hairline text-text-primary-v4 transition-colors"
            >
              Downgrade to Starter
            </Link>
          </div>

          {/* Pro Tier (CURRENT ACTIVE TIER) */}
          <div className="p-5 rounded-lg bg-ink border-2 border-signal shadow-lg relative flex flex-col justify-between">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-signal text-black px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Current Active Tier
            </div>
            <div className="space-y-3 mt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-signal uppercase tracking-wider">Pro Tier</span>
                <span className="text-xs font-mono text-signal">Popular</span>
              </div>
              <div>
                <h4 className="text-lg font-bold text-text-primary-v4">VPS Pro 8GB</h4>
                <div className="text-xl font-bold font-mono text-signal mt-1">
                  ₹4,999 <span className="text-xs font-normal text-text-muted-v4">/ mo</span>
                </div>
              </div>
              <ul className="text-xs text-text-secondary-v4 space-y-1.5 pt-2 border-t border-hairline">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-signal" /> 4 vCPU Cores & 8GB RAM
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-signal" /> 100GB NVMe Storage + R2 Vault
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-signal" /> 10M API Requests + 2M AI Tokens
                </li>
              </ul>
            </div>
            <button
              disabled
              className="mt-5 w-full py-2 px-3 rounded text-center text-xs font-semibold bg-signal/15 text-signal border border-signal/30 cursor-default"
            >
              Active on Your Account
            </button>
          </div>

          {/* Enterprise Tier */}
          <div className="p-5 rounded-lg bg-ink border border-hairline hover:border-hairline-2 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted-v4 uppercase tracking-wider">Enterprise</span>
                <span className="text-xs font-mono text-purple-400">Scale Out</span>
              </div>
              <div>
                <h4 className="text-lg font-bold text-text-primary-v4">Cloud Dedicated 16GB</h4>
                <div className="text-xl font-bold font-mono text-text-primary-v4 mt-1">
                  ₹8,999 <span className="text-xs font-normal text-text-muted-v4">/ mo</span>
                </div>
              </div>
              <ul className="text-xs text-text-secondary-v4 space-y-1.5 pt-2 border-t border-hairline">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> 8 Dedicated vCPUs & 16GB RAM
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> 250GB Enterprise NVMe RAID
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Unlimited API Calls & Priority SLA
                </li>
              </ul>
            </div>
            <Link
              href="/vaulthost/pricing?tier=enterprise"
              className="mt-5 w-full py-2 px-3 rounded text-center text-xs font-semibold bg-signal text-black hover:bg-signal/90 transition-all shadow-sm"
            >
              Upgrade to Enterprise
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 sm:space-x-6 border-b border-hairline mb-6 overflow-x-auto terminal-scrollbar pb-1">
        <button 
          className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'invoices' ? 'border-signal text-signal' : 'border-transparent text-text-muted-v4 hover:text-text-primary-v4'}`}
          onClick={() => setActiveTab('invoices')}
        >
          <Receipt className="w-4 h-4 inline mr-2" /> Invoices
        </button>
        <button 
          className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'payment-methods' ? 'border-signal text-signal' : 'border-transparent text-text-muted-v4 hover:text-text-primary-v4'}`}
          onClick={() => setActiveTab('payment-methods')}
        >
          <CreditCard className="w-4 h-4 inline mr-2" /> Payment Methods
        </button>
        <button 
          className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'usage' ? 'border-signal text-signal' : 'border-transparent text-text-muted-v4 hover:text-text-primary-v4'}`}
          onClick={() => setActiveTab('usage')}
        >
          <Sparkles className="w-4 h-4 inline mr-2" /> Usage & Credits
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-ink rounded-lg border border-hairline min-h-[400px]">
        {loading ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
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
                    {invoices.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-text-muted-v4">
                          <Receipt className="w-10 h-10 mx-auto mb-2 opacity-40 text-text-muted-v4" />
                          <p className="text-sm font-semibold text-text-primary-v4">No invoices found</p>
                          <p className="text-xs text-text-secondary-v4 mt-1">Invoices are automatically generated when a hosting plan or addon renews.</p>
                        </td>
                      </tr>
                    ) : (
                      invoices.map((inv, idx) => (
                        <tr key={idx} className="border-b border-hairline last:border-0 hover:bg-ink-surface/50">
                          <td className="px-6 py-4 font-mono text-text-primary-v4">{inv.id}</td>
                          <td className="px-6 py-4 text-text-secondary-v4">{inv.plan || 'VPS Pro 8GB'}</td>
                          <td className="px-6 py-4 text-text-secondary-v4">{inv.period || inv.created_at}</td>
                          <td className="px-6 py-4 font-medium text-text-primary-v4">₹{(Number(inv.amount) || 0).toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(inv.status)}`}>
                              {getStatusIcon(inv.status)}
                              <span className="capitalize">{inv.status}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              className="text-text-muted-v4 hover:text-signal p-1 transition-colors"
                              onClick={() => router.push('/portal/invoice/' + inv.id)}
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
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
              <div className="p-6 space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-text-primary-v4 font-medium flex items-center gap-1.5">
                      <HardDrive className="w-4 h-4 text-blue-400" /> Object Storage (VaultR2)
                    </span>
                    <span className="text-text-secondary-v4 font-mono">{quotas.storage.label}</span>
                  </div>
                  <div className="w-full bg-ink-surface-2 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${quotas.storage.percentage}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-text-primary-v4 font-medium flex items-center gap-1.5">
                      <Server className="w-4 h-4 text-emerald-400" /> Global Bandwidth
                    </span>
                    <span className="text-text-secondary-v4 font-mono">{quotas.bandwidth.label}</span>
                  </div>
                  <div className="w-full bg-ink-surface-2 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${quotas.bandwidth.percentage}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-text-primary-v4 font-medium flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-signal" /> Workers & Edge Requests
                    </span>
                    <span className="text-text-secondary-v4 font-mono">{quotas.apiRequests.label}</span>
                  </div>
                  <div className="w-full bg-ink-surface-2 rounded-full h-2">
                    <div className="bg-signal h-2 rounded-full transition-all" style={{ width: `${quotas.apiRequests.percentage}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-text-primary-v4 font-medium flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-400" /> AI Tokens (LiteLLM Gateway)
                    </span>
                    <span className="text-text-secondary-v4 font-mono">{quotas.aiTokens.label}</span>
                  </div>
                  <div className="w-full bg-ink-surface-2 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: `${quotas.aiTokens.percentage}%` }}></div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Wallet className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-emerald-400 font-semibold">₹{creditBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })} prepaid credits available</div>
                      <div className="text-xs text-emerald-400/80 mt-0.5">Prepaid credits are applied automatically to metered overages and subscription renewals.</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAddCreditModalOpen(true)}
                    className="v4-btn-primary px-4 py-2 text-xs font-semibold shrink-0"
                  >
                    Top Up Wallet
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── TOAST NOTIFICATION ─── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-ink-surface-2 border border-signal/40 text-text-primary-v4 px-4 py-3 rounded-lg shadow-2xl animate-fade-in text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-signal shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── MODAL: ADD PREPAID CREDITS ─── */}
      {isAddCreditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-lg bg-ink border border-hairline shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <h3 className="text-sm font-semibold text-text-primary-v4 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-signal" /> Add Prepaid Credits
              </h3>
              <button
                onClick={() => setIsAddCreditModalOpen(false)}
                className="text-text-muted-v4 hover:text-text-primary-v4 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-text-secondary-v4">
              Credits never expire and are automatically drawn for metered API consumption, R2 egress, and renewals.
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {[500, 1000, 2500, 5000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTopUpAmount(amt)}
                  className={`py-2 px-3 rounded-md text-xs font-semibold border transition-all text-center ${
                    topUpAmount === amt
                      ? 'border-signal bg-signal/10 text-signal font-bold'
                      : 'border-hairline bg-ink-surface hover:border-hairline-2 text-text-primary-v4'
                  }`}
                >
                  +₹{amt.toLocaleString('en-IN')}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-text-muted-v4">Custom Top-up Amount (₹)</label>
              <input
                type="number"
                min="100"
                step="100"
                value={topUpAmount}
                onChange={e => setTopUpAmount(Math.max(100, parseInt(e.target.value, 10) || 100))}
                className="w-full px-3 py-2 rounded bg-ink-surface border border-hairline text-xs font-mono text-text-primary-v4 focus:outline-none focus:border-signal"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-hairline">
              <button
                type="button"
                onClick={() => setIsAddCreditModalOpen(false)}
                className="px-3.5 py-2 rounded bg-ink-surface hover:bg-ink-surface-2 border border-hairline text-xs font-medium text-text-secondary-v4"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAddCredits(topUpAmount)}
                className="v4-btn-primary px-4 py-2 text-xs font-semibold shadow-sm"
              >
                Confirm ₹{topUpAmount.toLocaleString('en-IN')} Top-up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: CANCEL SUBSCRIPTION CONFIRMATION ─── */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-lg bg-ink border border-hairline shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <h3 className="text-sm font-semibold text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> Cancel Subscription
              </h3>
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="text-text-muted-v4 hover:text-text-primary-v4 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-text-secondary-v4 leading-relaxed">
              Are you sure you want to cancel your <strong>{subscription?.plan || 'current'}</strong> subscription? Your service will remain active until the end of your billing cycle on <strong className="text-text-primary-v4">{subscription?.nextBillingDate || 'the period end'}</strong>.
            </p>

            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded text-[11px] text-rose-300">
              Note: Unused dedicated compute quotas will not roll over once the period ends.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="px-3.5 py-2 rounded bg-ink-surface hover:bg-ink-surface-2 border border-hairline text-xs font-medium text-text-secondary-v4"
              >
                Keep Plan
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
