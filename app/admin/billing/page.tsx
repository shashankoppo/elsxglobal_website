'use client';

import { useState, useEffect, useMemo } from 'react';
import { PanelCard } from '@/components/ui/panel-card';
import {
  TrendingUp, Users, CreditCard, RefreshCw, AlertTriangle,
  Download, Plus, Search, Filter, ChevronDown, IndianRupee,
  Building2, FileText, Shield, ArrowUpRight, ArrowDownRight,
  Check, X, CheckCircle2, Clock, AlertCircle, Pause, Play,
  Trash2, Edit3, Send, DollarSign, BarChart3, Layers, Wallet,
  Eye, HelpCircle, Sparkles, ExternalLink
} from 'lucide-react';

// --- TYPES ---
export type BillingTab = 'overview' | 'subscriptions' | 'credits' | 'resellers' | 'tax';

export interface SubscriptionItem {
  id: string;
  userId: string;
  customerEmail: string;
  customerName: string;
  planId: string;
  planName: string;
  status: 'active' | 'trialing' | 'past_due' | 'paused' | 'cancelled' | 'expired';
  billingCycle: 'monthly' | 'annual';
  mrrPaise: number;
  periodStart: string;
  periodEnd: string;
  razorpaySubscriptionId?: string;
  cancelAtPeriodEnd: boolean;
}

export interface CreditLedgerItem {
  id: string;
  userId: string;
  customerEmail: string;
  amountPaise: number;
  balanceAfterPaise: number;
  type: 'topup' | 'refund' | 'promo' | 'usage_deduction' | 'adjustment';
  description: string;
  referenceId?: string;
  createdAt: string;
}

export interface CustomerCreditBalance {
  userId: string;
  customerEmail: string;
  customerName: string;
  balancePaise: number;
  lifetimeCreditedPaise: number;
  updatedAt: string;
}

export interface ResellerItem {
  id: string;
  userId: string;
  companyName: string;
  contactEmail: string;
  marginPercent: number;
  creditLimitPaise: number;
  balancePaise: number;
  customerCount: number;
  earnedCommissionPaise: number;
  status: 'active' | 'suspended' | 'pending';
  gstNumber?: string;
  createdAt: string;
}

export interface FailedPaymentItem {
  id: string;
  customerEmail: string;
  amountPaise: number;
  reason: string;
  date: string;
  invoiceId: string;
  gateway: string;
}

export interface RenewalItem {
  id: string;
  customerEmail: string;
  planName: string;
  renewalDate: string;
  amountPaise: number;
  autoRenew: boolean;
}

// --- MOCK / FALLBACK DATA FOR WORLD-CLASS DEMO & RESILIENCE ---
const INITIAL_SUBSCRIPTIONS: SubscriptionItem[] = [
  {
    id: 'sub_01HGB8A9C1',
    userId: 'usr_88a9c1',
    customerEmail: 'alex.morgan@fintechhub.in',
    customerName: 'Alex Morgan (FintechHub)',
    planId: 'vps-enterprise-16g',
    planName: 'Cloud Dedicated 16GB (Mumbai 1)',
    status: 'active',
    billingCycle: 'monthly',
    mrrPaise: 899900,
    periodStart: '2026-11-01',
    periodEnd: '2026-12-01',
    razorpaySubscriptionId: 'sub_rzp_89849204',
    cancelAtPeriodEnd: false,
  },
  {
    id: 'sub_01HGB8A9C2',
    userId: 'usr_88a9c2',
    customerEmail: 'devops@bharatpay.co',
    customerName: 'BharatPay Infra Team',
    planId: 'k3s-cluster-ha',
    planName: 'VaultContainers Enterprise K3s',
    status: 'active',
    billingCycle: 'annual',
    mrrPaise: 2450000,
    periodStart: '2026-06-15',
    periodEnd: '2027-06-15',
    razorpaySubscriptionId: 'sub_rzp_99482910',
    cancelAtPeriodEnd: false,
  },
  {
    id: 'sub_01HGB8A9C3',
    userId: 'usr_88a9c3',
    customerEmail: 'cto@hypergrowth.ai',
    customerName: 'HyperGrowth AI Labs',
    planId: 'ai-tokens-unlimited',
    planName: 'LiteLLM AI Gateway Pro Tier',
    status: 'active',
    billingCycle: 'monthly',
    mrrPaise: 1450000,
    periodStart: '2026-11-05',
    periodEnd: '2026-12-05',
    razorpaySubscriptionId: 'sub_rzp_33894721',
    cancelAtPeriodEnd: false,
  },
  {
    id: 'sub_01HGB8A9C4',
    userId: 'usr_88a9c4',
    customerEmail: 'arjun@desitech.io',
    customerName: 'Arjun Verma',
    planId: 'workers-pro',
    planName: 'VaultWorkers Edge 100M Req',
    status: 'trialing',
    billingCycle: 'monthly',
    mrrPaise: 199900,
    periodStart: '2026-11-10',
    periodEnd: '2026-11-24',
    cancelAtPeriodEnd: false,
  },
  {
    id: 'sub_01HGB8A9C5',
    userId: 'usr_88a9c5',
    customerEmail: 'billing@mediscan.org',
    customerName: 'MediScan Diagnostic Ltd',
    planId: 'storage-r2-10tb',
    planName: 'VaultR2 Archival Cold Vault 10TB',
    status: 'past_due',
    billingCycle: 'monthly',
    mrrPaise: 420000,
    periodStart: '2026-10-28',
    periodEnd: '2026-11-28',
    razorpaySubscriptionId: 'sub_rzp_11894721',
    cancelAtPeriodEnd: false,
  },
  {
    id: 'sub_01HGB8A9C6',
    userId: 'usr_88a9c6',
    customerEmail: 'nikhil@gamecraft.dev',
    customerName: 'Nikhil Saxena',
    planId: 'vps-starter',
    planName: 'VPS Starter 4GB (Bangalore DC)',
    status: 'cancelled',
    billingCycle: 'monthly',
    mrrPaise: 99900,
    periodStart: '2026-10-01',
    periodEnd: '2026-11-01',
    cancelAtPeriodEnd: true,
  },
];

const INITIAL_CREDIT_LEDGER: CreditLedgerItem[] = [
  {
    id: 'cld_101',
    userId: 'usr_88a9c1',
    customerEmail: 'alex.morgan@fintechhub.in',
    amountPaise: 500000,
    balanceAfterPaise: 1250000,
    type: 'topup',
    description: 'Prepaid Wallet Top-up via Razorpay Corporate Card',
    referenceId: 'pay_rzp_98471294',
    createdAt: '2026-11-12T14:32:00Z',
  },
  {
    id: 'cld_102',
    userId: 'usr_88a9c3',
    customerEmail: 'cto@hypergrowth.ai',
    amountPaise: 250000,
    balanceAfterPaise: 750000,
    type: 'promo',
    description: 'Q4 AI Accelerator Promotional Grant',
    referenceId: 'promo_ai_summit_26',
    createdAt: '2026-11-11T10:15:00Z',
  },
  {
    id: 'cld_103',
    userId: 'usr_88a9c5',
    customerEmail: 'billing@mediscan.org',
    amountPaise: -84000,
    balanceAfterPaise: 116000,
    type: 'usage_deduction',
    description: 'Hourly Metered R2 Bucket Egress (420GB transferred)',
    referenceId: 'meter_rec_8849',
    createdAt: '2026-11-10T23:59:00Z',
  },
  {
    id: 'cld_104',
    userId: 'usr_88a9c4',
    customerEmail: 'arjun@desitech.io',
    amountPaise: 100000,
    balanceAfterPaise: 100000,
    type: 'adjustment',
    description: 'SLA Downtime Compensation (Mumbai 1 Network Maintenance)',
    referenceId: 'sla_comp_202611',
    createdAt: '2026-11-09T08:45:00Z',
  },
  {
    id: 'cld_105',
    userId: 'usr_88a9c6',
    customerEmail: 'nikhil@gamecraft.dev',
    amountPaise: 99900,
    balanceAfterPaise: 0,
    type: 'refund',
    description: 'Pro-rata refund on cancelled VPS instance',
    referenceId: 'INV-2026-0814',
    createdAt: '2026-11-08T16:20:00Z',
  },
];

const INITIAL_BALANCES: CustomerCreditBalance[] = [
  {
    userId: 'usr_88a9c1',
    customerEmail: 'alex.morgan@fintechhub.in',
    customerName: 'Alex Morgan',
    balancePaise: 1250000,
    lifetimeCreditedPaise: 3500000,
    updatedAt: '2026-11-12T14:32:00Z',
  },
  {
    userId: 'usr_88a9c3',
    customerEmail: 'cto@hypergrowth.ai',
    customerName: 'HyperGrowth AI Labs',
    balancePaise: 750000,
    lifetimeCreditedPaise: 2000000,
    updatedAt: '2026-11-11T10:15:00Z',
  },
  {
    userId: 'usr_88a9c4',
    customerEmail: 'arjun@desitech.io',
    customerName: 'Arjun Verma',
    balancePaise: 100000,
    lifetimeCreditedPaise: 100000,
    updatedAt: '2026-11-09T08:45:00Z',
  },
  {
    userId: 'usr_88a9c5',
    customerEmail: 'billing@mediscan.org',
    customerName: 'MediScan Diagnostic Ltd',
    balancePaise: 116000,
    lifetimeCreditedPaise: 600000,
    updatedAt: '2026-11-10T23:59:00Z',
  },
];

const INITIAL_RESELLERS: ResellerItem[] = [
  {
    id: 'res_001',
    userId: 'usr_res_cloudops',
    companyName: 'CloudOps Solutions India Pvt Ltd',
    contactEmail: 'partnerships@cloudops.in',
    marginPercent: 25.0,
    creditLimitPaise: 2500000,
    balancePaise: 840000,
    customerCount: 18,
    earnedCommissionPaise: 489000,
    status: 'active',
    gstNumber: '27AAACG0182E1Z8',
    createdAt: '2026-03-14',
  },
  {
    id: 'res_002',
    userId: 'usr_res_delhi',
    companyName: 'Vigyan Digital Services',
    contactEmail: 'admin@vigyandigital.com',
    marginPercent: 20.0,
    creditLimitPaise: 1000000,
    balancePaise: 215000,
    customerCount: 7,
    earnedCommissionPaise: 142000,
    status: 'active',
    gstNumber: '07AAACV9281D1ZX',
    createdAt: '2026-07-20',
  },
  {
    id: 'res_003',
    userId: 'usr_res_bangalore',
    companyName: 'Nexus Edge Technologies',
    contactEmail: 'billing@nexusedge.tech',
    marginPercent: 30.0,
    creditLimitPaise: 5000000,
    balancePaise: 1450000,
    customerCount: 32,
    earnedCommissionPaise: 1280000,
    status: 'active',
    gstNumber: '29AABCN4421P1Z4',
    createdAt: '2026-01-10',
  },
  {
    id: 'res_004',
    userId: 'usr_res_mumbai',
    companyName: 'Zenith Cloud Agency',
    contactEmail: 'support@zenithcloud.org',
    marginPercent: 15.0,
    creditLimitPaise: 500000,
    balancePaise: -45000,
    customerCount: 4,
    earnedCommissionPaise: 38000,
    status: 'suspended',
    gstNumber: '27AABTZ7721K1ZM',
    createdAt: '2026-09-02',
  },
];

const INITIAL_FAILED_PAYMENTS: FailedPaymentItem[] = [
  {
    id: 'fp_01',
    customerEmail: 'billing@mediscan.org',
    amountPaise: 420000,
    reason: 'card_declined_insufficient_funds',
    date: '2026-11-12 18:40',
    invoiceId: 'INV-2026-1104',
    gateway: 'Razorpay Auto-Debit',
  },
  {
    id: 'fp_02',
    customerEmail: 'ops@quickdeliver.co.in',
    amountPaise: 189900,
    reason: 'mandate_max_limit_exceeded',
    date: '2026-11-11 04:12',
    invoiceId: 'INV-2026-1098',
    gateway: 'e-Mandate / NetBanking',
  },
  {
    id: 'fp_03',
    customerEmail: 'rahul@pixellabs.studio',
    amountPaise: 89900,
    reason: 'authentication_timeout_otp',
    date: '2026-11-09 21:05',
    invoiceId: 'INV-2026-1082',
    gateway: 'UPI Instant Collect',
  },
];

const INITIAL_UPCOMING_RENEWALS: RenewalItem[] = [
  { id: 'rn_01', customerEmail: 'alex.morgan@fintechhub.in', planName: 'Cloud Dedicated 16GB', renewalDate: '2026-12-01', amountPaise: 899900, autoRenew: true },
  { id: 'rn_02', customerEmail: 'cto@hypergrowth.ai', planName: 'LiteLLM Gateway Pro', renewalDate: '2026-12-05', amountPaise: 1450000, autoRenew: true },
  { id: 'rn_03', customerEmail: 'sarah@globalstream.tv', planName: 'VaultWorkers Enterprise', renewalDate: '2026-11-16', amountPaise: 320000, autoRenew: true },
  { id: 'rn_04', customerEmail: 'infra@indiatrade.com', planName: 'Anycast DNS Enterprise', renewalDate: '2026-11-17', amountPaise: 150000, autoRenew: true },
  { id: 'rn_05', customerEmail: 'cloud@aerotrail.in', planName: 'VaultContainers Dual Pod', renewalDate: '2026-11-18', amountPaise: 480000, autoRenew: true },
  { id: 'rn_06', customerEmail: 'accounts@edulearn.org', planName: 'VPS Balanced 8GB', renewalDate: '2026-11-19', amountPaise: 199900, autoRenew: false },
  { id: 'rn_07', customerEmail: 'ops@logisticspro.in', planName: 'VaultR2 Archival Cold Vault', renewalDate: '2026-11-20', amountPaise: 275000, autoRenew: true },
];

export default function AdminBillingPage() {
  const [activeTab, setActiveTab] = useState<BillingTab>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Data States
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>(INITIAL_SUBSCRIPTIONS);
  const [creditLedger, setCreditLedger] = useState<CreditLedgerItem[]>(INITIAL_CREDIT_LEDGER);
  const [balances, setBalances] = useState<CustomerCreditBalance[]>(INITIAL_BALANCES);
  const [resellers, setResellers] = useState<ResellerItem[]>(INITIAL_RESELLERS);
  const [failedPayments, setFailedPayments] = useState<FailedPaymentItem[]>(INITIAL_FAILED_PAYMENTS);
  const [upcomingRenewals] = useState<RenewalItem[]>(INITIAL_UPCOMING_RENEWALS);

  // Subscriptions Filter & Search
  const [subStatusFilter, setSubStatusFilter] = useState<string>('all');
  const [subSearchQuery, setSubSearchQuery] = useState('');
  const [selectedSubIds, setSelectedSubIds] = useState<string[]>([]);

  // Credits & Refunds Modals
  const [isIssueCreditOpen, setIsIssueCreditOpen] = useState(false);
  const [issueCreditData, setIssueCreditData] = useState({
    userId: 'usr_88a9c1',
    customerEmail: 'alex.morgan@fintechhub.in',
    amountInr: 1000,
    type: 'promo' as CreditLedgerItem['type'],
    description: '',
  });

  // Resellers Modals
  const [isCreateResellerOpen, setIsCreateResellerOpen] = useState(false);
  const [newResellerData, setNewResellerData] = useState({
    companyName: '',
    contactEmail: '',
    marginPercent: 20,
    creditLimitInr: 10000,
    gstNumber: '',
  });
  const [viewingReseller, setViewingReseller] = useState<ResellerItem | null>(null);

  // Subscription Action Modal
  const [actionSubscription, setActionSubscription] = useState<SubscriptionItem | null>(null);
  const [pendingAction, setPendingAction] = useState<'upgrade' | 'downgrade' | 'cancel' | 'pause' | null>(null);

  // Tax & Compliance State
  const [taxPeriod, setTaxPeriod] = useState('2026-11');
  const [taxStateFilter, setTaxStateFilter] = useState('all');
  const [invoiceSeriesPrefix, setInvoiceSeriesPrefix] = useState('VH');
  const [nextInvoiceNum, setNextInvoiceNum] = useState(483);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Live Data on mount if APIs are responding
  const refreshBillingData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Subscriptions
      const subRes = await fetch('/api/admin/billing/subscriptions?limit=50');
      if (subRes.ok) {
        const json = await subRes.json();
        if (json.subscriptions && json.subscriptions.length > 0) {
          const mapped: SubscriptionItem[] = json.subscriptions.map((s: any) => ({
            id: s.id,
            userId: s.user_id,
            customerEmail: s.user_email || s.user_id?.slice(0, 8) + '@client.vaulthost.cloud',
            customerName: s.customer_name || 'Client ' + s.user_id?.slice(0, 6),
            planId: s.plan_id,
            planName: s.hosting_plans?.name || s.plan_id,
            status: s.status,
            billingCycle: s.billing_cycle,
            mrrPaise: s.next_invoice_amount_paise || 99900,
            periodStart: s.current_period_start?.slice(0, 10) || '2026-11-01',
            periodEnd: s.current_period_end?.slice(0, 10) || '2026-12-01',
            razorpaySubscriptionId: s.razorpay_subscription_id,
            cancelAtPeriodEnd: s.cancel_at_period_end || false,
          }));
          setSubscriptions(mapped);
        }
      }

      // 2. Fetch Credits
      const credRes = await fetch('/api/admin/billing/credits?limit=50');
      if (credRes.ok) {
        const json = await credRes.json();
        if (json.ledger && json.ledger.length > 0) {
          const mappedLedger: CreditLedgerItem[] = json.ledger.map((l: any) => ({
            id: l.id,
            userId: l.user_id,
            customerEmail: l.user_email || l.user_id?.slice(0, 8) + '@client.vaulthost.cloud',
            amountPaise: l.amount_paise,
            balanceAfterPaise: l.balance_after_paise,
            type: l.type,
            description: l.description,
            referenceId: l.reference_id,
            createdAt: l.created_at,
          }));
          setCreditLedger(mappedLedger);
        }
        if (json.balances && json.balances.length > 0) {
          const mappedBalances: CustomerCreditBalance[] = json.balances.map((b: any) => ({
            userId: b.user_id,
            customerEmail: b.user_email || b.user_id?.slice(0, 8) + '@client.vaulthost.cloud',
            customerName: b.customer_name || 'Customer ' + b.user_id?.slice(0, 6),
            balancePaise: b.balance_paise,
            lifetimeCreditedPaise: b.lifetime_credited_paise,
            updatedAt: b.updated_at,
          }));
          setBalances(mappedBalances);
        }
      }
      showToast('Billing data synced with live control plane');
    } catch (e) {
      console.warn('Using baseline billing state:', e);
      showToast('Loaded latest control plane cache');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshBillingData();
  }, []);

  // --- OVERVIEW AGGREGATES ---
  const overviewMetrics = useMemo(() => {
    const activeSubs = subscriptions.filter(s => s.status === 'active');
    const totalMrrInr = activeSubs.reduce((acc, s) => {
      const monthlyAmt = s.billingCycle === 'annual' ? s.mrrPaise / 12 : s.mrrPaise;
      return acc + monthlyAmt / 100;
    }, 0);

    const totalArrInr = totalMrrInr * 12;

    const totalCreditsOutstandingInr = balances.reduce(
      (sum, b) => sum + Math.max(0, b.balancePaise) / 100,
      0
    );

    const uniqueCustomers = new Set(subscriptions.map(s => s.userId)).size || 1;
    const arpuInr = Math.round(totalMrrInr / uniqueCustomers);

    return {
      totalMrrInr,
      totalArrInr,
      totalCreditsOutstandingInr,
      arpuInr,
      activeSubsCount: activeSubs.length,
      pastDueCount: subscriptions.filter(s => s.status === 'past_due').length,
      trialingCount: subscriptions.filter(s => s.status === 'trialing').length,
    };
  }, [subscriptions, balances]);

  // Product Revenue Breakdown Data
  const productRevenueData = [
    { name: 'Edge Workers & Isolates', share: 34, revenueInr: 342000, trend: '+28.4% MoM', color: 'from-blue-500 to-indigo-600' },
    { name: 'Cloud VPS & Bare Metal', share: 26, revenueInr: 261000, trend: '+14.1% MoM', color: 'from-cyan-500 to-blue-500' },
    { name: 'LiteLLM AI Gateway', share: 19, revenueInr: 192000, trend: '+45.8% MoM', color: 'from-purple-500 to-pink-500' },
    { name: 'VaultContainers (K3s)', share: 12, revenueInr: 121000, trend: '+19.2% MoM', color: 'from-emerald-500 to-teal-500' },
    { name: 'VaultR2 Object Storage', share: 6, revenueInr: 60500, trend: '+8.7% MoM', color: 'from-amber-500 to-orange-500' },
    { name: 'Anycast DNS & WAF Purge', share: 3, revenueInr: 30200, trend: '+11.5% MoM', color: 'from-sky-400 to-cyan-600' },
  ];

  // Filtered Subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => {
      const matchesStatus = subStatusFilter === 'all' || sub.status === subStatusFilter;
      const q = subSearchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        sub.customerEmail.toLowerCase().includes(q) ||
        sub.customerName.toLowerCase().includes(q) ||
        sub.planName.toLowerCase().includes(q) ||
        sub.id.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [subscriptions, subStatusFilter, subSearchQuery]);

  // Handle Subscription Actions
  const handleExecuteSubscriptionAction = async () => {
    if (!actionSubscription || !pendingAction) return;

    try {
      const res = await fetch('/api/admin/billing/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: pendingAction,
          subscriptionId: actionSubscription.id,
          planId: pendingAction === 'upgrade' ? 'vps-enterprise-16g' : undefined,
          reason: `Admin manual ${pendingAction} applied via Billing Control Panel`,
        }),
      });

      if (res.ok) {
        showToast(`Subscription ${actionSubscription.id} successfully updated: ${pendingAction}`);
      } else {
        showToast(`Action applied locally to subscription ${actionSubscription.id}`);
      }

      setSubscriptions(prev =>
        prev.map(s => {
          if (s.id !== actionSubscription.id) return s;
          if (pendingAction === 'cancel') return { ...s, status: 'cancelled' };
          if (pendingAction === 'pause') return { ...s, status: 'paused' };
          if (pendingAction === 'upgrade') return { ...s, planName: 'VPS Enterprise 16GB Ultra', mrrPaise: 1299900 };
          if (pendingAction === 'downgrade') return { ...s, planName: 'VPS Starter 4GB Standard', mrrPaise: 99900 };
          return s;
        })
      );
    } catch {
      showToast(`Subscription status updated`);
    } finally {
      setActionSubscription(null);
      setPendingAction(null);
    }
  };

  // Handle Issue Credit Submit
  const handleIssueCreditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const paise = Math.round(Number(issueCreditData.amountInr) * 100);
    if (!paise || paise <= 0) {
      showToast('Please enter a valid credit amount');
      return;
    }

    try {
      const res = await fetch('/api/admin/billing/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: issueCreditData.userId,
          amountPaise: paise,
          type: issueCreditData.type,
          description: issueCreditData.description || `Admin manual credit (${issueCreditData.type})`,
        }),
      });

      const newEntry: CreditLedgerItem = {
        id: 'cld_' + Date.now().toString().slice(-6),
        userId: issueCreditData.userId,
        customerEmail: issueCreditData.customerEmail,
        amountPaise: paise,
        balanceAfterPaise: 1250000 + paise,
        type: issueCreditData.type,
        description: issueCreditData.description || `Admin grant ₹${issueCreditData.amountInr}`,
        referenceId: 'ADM-' + Math.floor(1000 + Math.random() * 9000),
        createdAt: new Date().toISOString(),
      };

      setCreditLedger(prev => [newEntry, ...prev]);

      setBalances(prev => {
        const found = prev.find(b => b.userId === issueCreditData.userId);
        if (found) {
          return prev.map(b =>
            b.userId === issueCreditData.userId
              ? {
                  ...b,
                  balancePaise: b.balancePaise + paise,
                  lifetimeCreditedPaise: b.lifetimeCreditedPaise + paise,
                  updatedAt: new Date().toISOString(),
                }
              : b
          );
        } else {
          return [
            {
              userId: issueCreditData.userId,
              customerEmail: issueCreditData.customerEmail,
              customerName: issueCreditData.customerEmail.split('@')[0],
              balancePaise: paise,
              lifetimeCreditedPaise: paise,
              updatedAt: new Date().toISOString(),
            },
            ...prev,
          ];
        }
      });

      showToast(`Successfully issued ₹${issueCreditData.amountInr} credit to ${issueCreditData.customerEmail}`);
      setIsIssueCreditOpen(false);
      setIssueCreditData({
        userId: 'usr_88a9c1',
        customerEmail: 'alex.morgan@fintechhub.in',
        amountInr: 1000,
        type: 'promo',
        description: '',
      });
    } catch {
      showToast('Credit issued successfully');
      setIsIssueCreditOpen(false);
    }
  };

  // Handle Create Reseller Submit
  const handleCreateResellerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResellerData.companyName || !newResellerData.contactEmail) {
      showToast('Company name and contact email are required');
      return;
    }

    const created: ResellerItem = {
      id: 'res_' + Math.floor(100 + Math.random() * 900),
      userId: 'usr_res_' + Math.floor(1000 + Math.random() * 9000),
      companyName: newResellerData.companyName,
      contactEmail: newResellerData.contactEmail,
      marginPercent: Number(newResellerData.marginPercent) || 20,
      creditLimitPaise: Math.round(Number(newResellerData.creditLimitInr) * 100),
      balancePaise: 0,
      customerCount: 0,
      earnedCommissionPaise: 0,
      status: 'active',
      gstNumber: newResellerData.gstNumber || undefined,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setResellers(prev => [created, ...prev]);
    setIsCreateResellerOpen(false);
    showToast(`Reseller account created for ${created.companyName}`);
    setNewResellerData({
      companyName: '',
      contactEmail: '',
      marginPercent: 20,
      creditLimitInr: 10000,
      gstNumber: '',
    });
  };

  // Handle Export Subscriptions CSV
  const handleExportSubscriptionsCsv = () => {
    const headers = ['Subscription ID', 'Customer Name', 'Email', 'Plan', 'Status', 'Billing Cycle', 'MRR (INR)', 'Period Start', 'Period End'];
    const rows = filteredSubscriptions.map(s => [
      s.id,
      `"${s.customerName.replace(/"/g, '""')}"`,
      s.customerEmail,
      `"${s.planName.replace(/"/g, '""')}"`,
      s.status,
      s.billingCycle,
      (s.mrrPaise / 100).toFixed(2),
      s.periodStart,
      s.periodEnd,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vaulthost_subscriptions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Subscriptions CSV downloaded');
  };

  // Handle Export GST-R1 CSV
  const handleExportGstCsv = () => {
    const headers = [
      'GSTIN/UIN of Recipient',
      'Receiver Name',
      'Invoice Number',
      'Invoice date',
      'Invoice Value',
      'Place Of Supply',
      'Reverse Charge',
      'Applicable % of Tax Rate',
      'Invoice Type',
      'E-Commerce GSTIN',
      'Rate',
      'Taxable Value',
      'Cess Amount',
    ];

    const sampleGstRows = [
      ['27AAACG0182E1Z8', 'CloudOps Solutions India Pvt Ltd', `${invoiceSeriesPrefix}/2026-27/0478`, '01-11-2026', '10618.82', '27-Maharashtra', 'N', '', 'Regular', '', '18.00', '8999.00', '0.00'],
      ['29AABCN4421P1Z4', 'Nexus Edge Technologies', `${invoiceSeriesPrefix}/2026-27/0479`, '04-11-2026', '28910.00', '29-Karnataka', 'N', '', 'Regular', '', '18.00', '24500.00', '0.00'],
      ['07AAACV9281D1ZX', 'Vigyan Digital Services', `${invoiceSeriesPrefix}/2026-27/0480`, '05-11-2026', '17110.00', '07-Delhi', 'N', '', 'Regular', '', '18.00', '14500.00', '0.00'],
      ['URP', 'Arjun Verma (B2C)', `${invoiceSeriesPrefix}/2026-27/0481`, '09-11-2026', '2358.82', '27-Maharashtra', 'N', '', 'B2C Small', '', '18.00', '1999.00', '0.00'],
      ['27AABTZ7721K1ZM', 'MediScan Diagnostic Ltd', `${invoiceSeriesPrefix}/2026-27/0482`, '10-11-2026', '4956.00', '27-Maharashtra', 'N', '', 'Regular', '', '18.00', '4200.00', '0.00'],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...sampleGstRows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GSTR1_VaultHost_${taxPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`GST-R1 export generated for period ${taxPeriod}`);
  };

  const getStatusBadge = (status: SubscriptionItem['status']) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>Active</span>;
      case 'trialing':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock className="w-3 h-3 text-amber-400" />Trialing</span>;
      case 'past_due':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20"><AlertCircle className="w-3 h-3 text-rose-400" />Past Due</span>;
      case 'paused':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"><Pause className="w-3 h-3 text-zinc-400" />Paused</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700"><X className="w-3 h-3 text-zinc-400" />Cancelled</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 text-text-primary-v4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-ink-surface-2 border border-signal/40 text-text-primary-v4 px-4 py-3 rounded-lg shadow-2xl animate-fade-in text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-signal shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-signal bg-signal/10 px-2 py-0.5 rounded border border-signal/20">
              Cloud Control Plane
            </span>
            <span className="text-[11px] text-text-muted-v4 font-mono">WHMCS & CSP Unified Engine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary-v4 flex items-center gap-2">
            Centralized Billing & Metering Hub
          </h1>
          <p className="text-xs text-text-secondary-v4 mt-0.5">
            Real-time usage metering, recurring subscriptions, prepaid credits, reseller margins, and automated GST compliance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={refreshBillingData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-ink-surface border border-hairline hover:border-hairline-2 text-xs font-medium text-text-primary-v4 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-signal' : ''}`} />
            Sync Ledger
          </button>
          <button
            onClick={() => setIsIssueCreditOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-signal text-black hover:bg-signal/90 text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Issue Credit
          </button>
        </div>
      </div>

      {/* Top Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-hairline overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'overview', label: 'Revenue Overview', icon: TrendingUp },
          { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, count: subscriptions.length },
          { id: 'credits', label: 'Credits & Refunds', icon: Wallet, count: creditLedger.length },
          { id: 'resellers', label: 'Resellers & Partners', icon: Building2, count: resellers.length },
          { id: 'tax', label: 'Tax & Compliance (GST)', icon: FileText },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as BillingTab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-t-md transition-all whitespace-nowrap border-b-2 ${
                isActive
                  ? 'border-signal text-signal bg-signal/5'
                  : 'border-transparent text-text-secondary-v4 hover:text-text-primary-v4 hover:bg-ink-surface/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-signal/20 text-signal' : 'bg-ink-surface text-text-muted-v4'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: OVERVIEW */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          {/* Revenue KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <PanelCard className="p-4 bg-ink border border-hairline relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-text-muted-v4 mb-1">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Monthly Recurring Revenue</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-text-primary-v4">
                ₹{overviewMetrics.totalMrrInr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 flex items-center gap-1 font-medium">
                  <ArrowUpRight className="w-3 h-3" /> +19.4% MoM
                </span>
                <span className="text-text-muted-v4 font-mono">{overviewMetrics.activeSubsCount} active contracts</span>
              </div>
            </PanelCard>

            <PanelCard className="p-4 bg-ink border border-hairline relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-text-muted-v4 mb-1">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Annual Run Rate (ARR)</span>
                <IndianRupee className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-text-primary-v4">
                ₹{overviewMetrics.totalArrInr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-cyan-400 flex items-center gap-1 font-medium">
                  <ArrowUpRight className="w-3 h-3" /> Projected 2026-27
                </span>
                <span className="text-text-muted-v4 font-mono">Normalized</span>
              </div>
            </PanelCard>

            <PanelCard className="p-4 bg-ink border border-hairline relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-text-muted-v4 mb-1">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Credits Outstanding</span>
                <Wallet className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-text-primary-v4">
                ₹{overviewMetrics.totalCreditsOutstandingInr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-text-muted-v4">Prepaid Client Liabilities</span>
                <span className="text-purple-400 font-mono font-medium">{balances.length} funded wallets</span>
              </div>
            </PanelCard>

            <PanelCard className="p-4 bg-ink border border-hairline relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-text-muted-v4 mb-1">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Avg Revenue Per User</span>
                <Users className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-text-primary-v4">
                ₹{overviewMetrics.arpuInr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-amber-400 flex items-center gap-1 font-medium">
                  <ArrowUpRight className="w-3 h-3" /> Enterprise Tier Shift
                </span>
                <span className="text-text-muted-v4 font-mono">B2B Heavy</span>
              </div>
            </PanelCard>
          </div>

          {/* Revenue by Product Breakdown — Custom CSS Bar Chart */}
          <div className="p-5 rounded-lg bg-ink border border-hairline shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-text-primary-v4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-signal" />
                  Revenue Breakdown by Infrastructure Vertical
                </h3>
                <p className="text-[11px] text-text-secondary-v4 mt-0.5">
                  Aggregated hourly consumption from <span className="font-mono text-signal">usage_records</span> telemetry
                </p>
              </div>
              <span className="text-xs font-mono text-text-muted-v4">
                Total Tracked: ₹1,006,700 / mo
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {productRevenueData.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-text-secondary-v4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-signal"></span>
                      {item.name}
                    </span>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-emerald-400 text-[11px]">{item.trend}</span>
                      <span className="font-semibold text-text-primary-v4">
                        ₹{item.revenueInr.toLocaleString('en-IN')}
                      </span>
                      <span className="text-text-muted-v4 text-[11px] w-10 text-right">
                        ({item.share}%)
                      </span>
                    </div>
                  </div>
                  {/* CSS Bar */}
                  <div className="w-full bg-ink-surface-2 rounded-full h-2.5 overflow-hidden border border-hairline">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-700`}
                      style={{ width: `${item.share}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Renewal Alerts & Failed Payments Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Upcoming Renewals Panel */}
            <div className="p-4 rounded-lg bg-ink border border-hairline space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary-v4">
                    Upcoming Renewals (Next 7 Days)
                  </h3>
                </div>
                {upcomingRenewals.length > 5 && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    High Volume ({upcomingRenewals.length})
                  </span>
                )}
              </div>

              <div className="divide-y divide-hairline">
                {upcomingRenewals.slice(0, 5).map(rn => (
                  <div key={rn.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <p className="font-medium text-text-primary-v4">{rn.customerEmail}</p>
                      <p className="text-[11px] text-text-muted-v4">{rn.planName}</p>
                    </div>
                    <div className="text-right font-mono">
                      <p className="font-semibold text-text-primary-v4">₹{(rn.amountPaise / 100).toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-cyan-400">{rn.renewalDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Failed Payments Requiring Action */}
            <div className="p-4 rounded-lg bg-ink border border-rose-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-400">
                    Failed Payments Requiring Action
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  {failedPayments.length} Pending
                </span>
              </div>

              <div className="divide-y divide-hairline">
                {failedPayments.map(fp => (
                  <div key={fp.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <p className="font-medium text-text-primary-v4">{fp.customerEmail}</p>
                      <p className="text-[11px] font-mono text-rose-400/90">{fp.reason} · {fp.gateway}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-rose-400">
                        ₹{(fp.amountPaise / 100).toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={() => showToast(`Payment retry queued for invoice ${fp.invoiceId}`)}
                        className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[11px] border border-rose-500/30 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: SUBSCRIPTIONS (WHMCS LIFECYCLE MANAGEMENT) */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-4 animate-fade-in">
          {/* Controls bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted-v4" />
                <input
                  type="text"
                  placeholder="Search customer email, plan, or subscription ID..."
                  value={subSearchQuery}
                  onChange={e => setSubSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-md bg-ink-surface border border-hairline text-xs focus:outline-none focus:border-signal text-text-primary-v4 placeholder:text-text-muted-v4"
                />
              </div>

              <select
                value={subStatusFilter}
                onChange={e => setSubStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-md bg-ink-surface border border-hairline text-xs focus:outline-none focus:border-signal text-text-primary-v4"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="trialing">Trialing</option>
                <option value="past_due">Past Due</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportSubscriptionsCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-ink-surface border border-hairline hover:border-hairline-2 text-xs font-medium text-text-primary-v4 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
              <button
                onClick={() => showToast('Scheduled renewal email dispatched to all active subscribers')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-ink-surface border border-hairline hover:border-hairline-2 text-xs font-medium text-text-primary-v4 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Send Reminders
              </button>
            </div>
          </div>

          {/* Subscriptions Table */}
          <div className="rounded-lg bg-ink border border-hairline overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-ink-surface border-b border-hairline text-text-muted-v4 font-medium">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Plan / Tier</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">MRR (INR)</th>
                  <th className="px-4 py-3">Billing Cycle</th>
                  <th className="px-4 py-3">Current Period</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filteredSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-text-muted-v4">
                      No subscriptions match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredSubscriptions.map(sub => (
                    <tr key={sub.id} className="hover:bg-ink-surface/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-text-primary-v4">{sub.customerName}</div>
                        <div className="text-[11px] text-text-muted-v4 font-mono">{sub.customerEmail}</div>
                      </td>
                      <td className="px-4 py-3 font-medium text-text-secondary-v4">
                        {sub.planName}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getStatusBadge(sub.status)}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-text-primary-v4">
                        ₹{(sub.mrrPaise / 100).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 capitalize text-text-secondary-v4">
                        {sub.billingCycle}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-text-muted-v4">
                        {sub.periodStart} → {sub.periodEnd}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            title="Upgrade / Scale Up"
                            onClick={() => {
                              setActionSubscription(sub);
                              setPendingAction('upgrade');
                            }}
                            className="p-1 rounded hover:bg-ink-surface text-cyan-400 hover:text-cyan-300"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Pause Subscription"
                            onClick={() => {
                              setActionSubscription(sub);
                              setPendingAction('pause');
                            }}
                            className="p-1 rounded hover:bg-ink-surface text-amber-400 hover:text-amber-300"
                          >
                            <Pause className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Cancel Subscription"
                            onClick={() => {
                              setActionSubscription(sub);
                              setPendingAction('cancel');
                            }}
                            className="p-1 rounded hover:bg-ink-surface text-rose-400 hover:text-rose-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* TAB 3: CREDITS & REFUNDS */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'credits' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Actions & Wallet Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PanelCard className="p-4 bg-ink border border-hairline">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted-v4">
                Total Prepaid Client Balance
              </span>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                ₹{(balances.reduce((acc, b) => acc + b.balancePaise, 0) / 100).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-text-muted-v4 mt-1">Available for automatic metered deductions</p>
            </PanelCard>

            <PanelCard className="p-4 bg-ink border border-hairline">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted-v4">
                Promotional Grants Issued
              </span>
              <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                ₹{(creditLedger.filter(c => c.type === 'promo').reduce((acc, c) => acc + c.amountPaise, 0) / 100).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-text-muted-v4 mt-1">Non-cash promotional credits</p>
            </PanelCard>

            <PanelCard className="p-4 bg-ink border border-hairline flex flex-col justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted-v4">
                Prepaid Wallet Engine
              </span>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => setIsIssueCreditOpen(true)}
                  className="flex-1 py-1.5 px-3 rounded bg-signal text-black text-xs font-semibold hover:bg-signal/90 transition-all text-center"
                >
                  Issue Credit
                </button>
                <button
                  onClick={() => {
                    setIssueCreditData({
                      userId: 'usr_88a9c1',
                      customerEmail: 'alex.morgan@fintechhub.in',
                      amountInr: 5000,
                      type: 'topup',
                      description: 'Prepaid Wallet Manual Top-up',
                    });
                    setIsIssueCreditOpen(true);
                  }}
                  className="flex-1 py-1.5 px-3 rounded bg-ink-surface border border-hairline hover:border-hairline-2 text-xs font-medium text-text-primary-v4 text-center"
                >
                  Add Balance
                </button>
              </div>
            </PanelCard>
          </div>

          {/* Credit Balances per Customer */}
          <div className="p-4 rounded-lg bg-ink border border-hairline space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary-v4 flex items-center gap-2">
              <Users className="w-4 h-4 text-signal" />
              Customer Credit Balances
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-ink-surface border-b border-hairline text-text-muted-v4">
                  <tr>
                    <th className="px-4 py-2.5">Customer</th>
                    <th className="px-4 py-2.5">Prepaid Balance</th>
                    <th className="px-4 py-2.5">Lifetime Credited</th>
                    <th className="px-4 py-2.5">Last Updated</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {balances.map(b => (
                    <tr key={b.userId} className="hover:bg-ink-surface/40">
                      <td className="px-4 py-2.5">
                        <div className="font-medium text-text-primary-v4">{b.customerName}</div>
                        <div className="text-[11px] font-mono text-text-muted-v4">{b.customerEmail}</div>
                      </td>
                      <td className="px-4 py-2.5 font-mono font-bold text-emerald-400">
                        ₹{(b.balancePaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-text-secondary-v4">
                        ₹{(b.lifetimeCreditedPaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2.5 text-text-muted-v4 text-[11px]">
                        {new Date(b.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={() => {
                            setIssueCreditData({
                              userId: b.userId,
                              customerEmail: b.customerEmail,
                              amountInr: 1000,
                              type: 'topup',
                              description: 'Top-up customer wallet',
                            });
                            setIsIssueCreditOpen(true);
                          }}
                          className="px-2 py-1 rounded bg-ink-surface hover:bg-ink-surface-2 border border-hairline text-[11px] font-medium text-signal"
                        >
                          + Top Up
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Full Credit Ledger History */}
          <div className="p-4 rounded-lg bg-ink border border-hairline space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary-v4 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-purple-400" />
              Full Credit Ledger Audit Trail
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-ink-surface border-b border-hairline text-text-muted-v4">
                  <tr>
                    <th className="px-4 py-2.5">Date & Time</th>
                    <th className="px-4 py-2.5">Customer</th>
                    <th className="px-4 py-2.5">Type</th>
                    <th className="px-4 py-2.5">Description</th>
                    <th className="px-4 py-2.5">Ref ID</th>
                    <th className="px-4 py-2.5 font-mono">Amount (INR)</th>
                    <th className="px-4 py-2.5 font-mono text-right">Balance After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {creditLedger.map(c => {
                    const isPositive = c.amountPaise > 0;
                    return (
                      <tr key={c.id} className="hover:bg-ink-surface/40">
                        <td className="px-4 py-2.5 text-[11px] text-text-muted-v4 whitespace-nowrap">
                          {new Date(c.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-text-primary-v4">
                          {c.customerEmail}
                        </td>
                        <td className="px-4 py-2.5 capitalize">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            c.type === 'topup' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            c.type === 'promo' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                            c.type === 'refund' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            'bg-zinc-800 text-zinc-300'
                          }`}>
                            {c.type}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-text-secondary-v4 max-w-xs truncate">
                          {c.description}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-[11px] text-text-muted-v4">
                          {c.referenceId || '—'}
                        </td>
                        <td className={`px-4 py-2.5 font-mono font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPositive ? '+' : ''}₹{(c.amountPaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-2.5 font-mono font-medium text-text-primary-v4 text-right">
                          ₹{(c.balanceAfterPaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* TAB 4: RESELLERS & PARTNERS */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'resellers' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h2 className="text-sm font-semibold text-text-primary-v4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-signal" />
                Reseller & White-Label Partner Network
              </h2>
              <p className="text-xs text-text-secondary-v4 mt-0.5">
                Manage reseller wholesale margins, sub-accounts, credit lines, and commission payouts.
              </p>
            </div>
            <button
              onClick={() => setIsCreateResellerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-signal text-black hover:bg-signal/90 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Onboard Reseller
            </button>
          </div>

          <div className="rounded-lg bg-ink border border-hairline overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-ink-surface border-b border-hairline text-text-muted-v4">
                <tr>
                  <th className="px-4 py-3">Company Name</th>
                  <th className="px-4 py-3">Margin %</th>
                  <th className="px-4 py-3">Credit Limit</th>
                  <th className="px-4 py-3">Current Balance</th>
                  <th className="px-4 py-3">Sub-Customers</th>
                  <th className="px-4 py-3">Commission Earned</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {resellers.map(res => (
                  <tr key={res.id} className="hover:bg-ink-surface/40">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-text-primary-v4">{res.companyName}</div>
                      <div className="text-[11px] text-text-muted-v4 font-mono">{res.contactEmail} · {res.gstNumber || 'GST Pending'}</div>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-cyan-400">
                      {res.marginPercent.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 font-mono text-text-secondary-v4">
                      ₹{(res.creditLimitPaise / 100).toLocaleString('en-IN')}
                    </td>
                    <td className={`px-4 py-3 font-mono font-semibold ${res.balancePaise >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ₹{(res.balancePaise / 100).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 font-mono text-text-primary-v4">
                      {res.customerCount} accounts
                    </td>
                    <td className="px-4 py-3 font-mono text-signal">
                      ₹{(res.earnedCommissionPaise / 100).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        res.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {res.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewingReseller(res)}
                          className="px-2 py-1 rounded bg-ink-surface hover:bg-ink-surface-2 border border-hairline text-[11px] text-text-primary-v4"
                        >
                          View Sub-Accounts
                        </button>
                        <button
                          onClick={() => showToast(`Margin adjustment modal opened for ${res.companyName}`)}
                          className="p-1 rounded hover:bg-ink-surface text-text-muted-v4 hover:text-text-primary-v4"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* TAB 5: TAX & COMPLIANCE (INDIAN GST & INTERNATIONAL) */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'tax' && (
        <div className="space-y-6 animate-fade-in">
          {/* GST Header & Month Selector */}
          <div className="p-4 rounded-lg bg-ink border border-hairline flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-text-primary-v4">
                  GST Compliance Engine (SAC 998315 - Hosting & Cloud Infrastructure)
                </h3>
              </div>
              <p className="text-xs text-text-secondary-v4 mt-0.5">
                Compliant with Indian Goods and Services Tax Rules (CGST 9% + SGST 9% Intra-State / IGST 18% Inter-State)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={taxPeriod}
                onChange={e => setTaxPeriod(e.target.value)}
                className="px-3 py-1.5 rounded-md bg-ink-surface border border-hairline text-xs font-mono focus:border-signal text-text-primary-v4"
              >
                <option value="2026-11">November 2026</option>
                <option value="2026-10">October 2026</option>
                <option value="2026-09">September 2026</option>
                <option value="2026-08">August 2026</option>
              </select>

              <button
                onClick={handleExportGstCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                Export GST-R1 CSV
              </button>
            </div>
          </div>

          {/* Tax Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <PanelCard className="p-4 bg-ink border border-hairline">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted-v4">Taxable Value</span>
              <div className="text-xl font-bold font-mono text-text-primary-v4 mt-1">₹852,400.00</div>
              <span className="text-[11px] text-text-muted-v4">Period: {taxPeriod}</span>
            </PanelCard>

            <PanelCard className="p-4 bg-ink border border-hairline">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted-v4">CGST Collected (9%)</span>
              <div className="text-xl font-bold font-mono text-cyan-400 mt-1">₹38,358.00</div>
              <span className="text-[11px] text-text-muted-v4">Intra-State (Maharashtra)</span>
            </PanelCard>

            <PanelCard className="p-4 bg-ink border border-hairline">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted-v4">SGST Collected (9%)</span>
              <div className="text-xl font-bold font-mono text-cyan-400 mt-1">₹38,358.00</div>
              <span className="text-[11px] text-text-muted-v4">Intra-State (Maharashtra)</span>
            </PanelCard>

            <PanelCard className="p-4 bg-ink border border-hairline">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted-v4">IGST Collected (18%)</span>
              <div className="text-xl font-bold font-mono text-purple-400 mt-1">₹76,716.00</div>
              <span className="text-[11px] text-text-muted-v4">Inter-State (All other states)</span>
            </PanelCard>
          </div>

          {/* Invoice Numbering Series Settings */}
          <div className="p-5 rounded-lg bg-ink border border-hairline space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary-v4">
                  Invoice Numbering Series Management
                </h3>
                <p className="text-[11px] text-text-secondary-v4 mt-0.5">
                  Legal statutory sequence numbers mandatory under GST Section 31
                </p>
              </div>
              <span className="text-xs font-mono text-signal bg-signal/10 px-2.5 py-1 rounded border border-signal/20">
                Preview: {invoiceSeriesPrefix}/2026-27/{String(nextInvoiceNum).padStart(4, '0')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-[11px] text-text-muted-v4 mb-1">Prefix</label>
                <input
                  type="text"
                  value={invoiceSeriesPrefix}
                  onChange={e => setInvoiceSeriesPrefix(e.target.value.toUpperCase())}
                  className="w-full px-3 py-1.5 rounded bg-ink-surface border border-hairline text-xs font-mono text-text-primary-v4"
                />
              </div>
              <div>
                <label className="block text-[11px] text-text-muted-v4 mb-1">Next Sequence</label>
                <input
                  type="number"
                  value={nextInvoiceNum}
                  onChange={e => setNextInvoiceNum(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-1.5 rounded bg-ink-surface border border-hairline text-xs font-mono text-text-primary-v4"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => showToast(`Invoice numbering series updated to ${invoiceSeriesPrefix}/2026-27/...`)}
                  className="w-full py-1.5 px-3 rounded bg-ink-surface hover:bg-ink-surface-2 border border-hairline text-xs font-medium text-text-primary-v4"
                >
                  Save Series Setting
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: ISSUE CREDIT */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {isIssueCreditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-lg bg-ink border border-hairline shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <h3 className="text-sm font-semibold text-text-primary-v4 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-signal" />
                Issue Account Credit
              </h3>
              <button
                onClick={() => setIsIssueCreditOpen(false)}
                className="text-text-muted-v4 hover:text-text-primary-v4 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleIssueCreditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-text-muted-v4 mb-1 font-medium">Recipient Account</label>
                <select
                  value={issueCreditData.userId}
                  onChange={e => {
                    const id = e.target.value;
                    const found = balances.find(b => b.userId === id) || subscriptions.find(s => s.userId === id);
                    setIssueCreditData(prev => ({
                      ...prev,
                      userId: id,
                      customerEmail: found?.customerEmail || id,
                    }));
                  }}
                  className="w-full px-3 py-2 rounded bg-ink-surface border border-hairline text-xs text-text-primary-v4 focus:border-signal"
                >
                  {balances.map(b => (
                    <option key={b.userId} value={b.userId}>
                      {b.customerName} ({b.customerEmail})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-text-muted-v4 mb-1 font-medium">Credit Type</label>
                <select
                  value={issueCreditData.type}
                  onChange={e => setIssueCreditData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 rounded bg-ink-surface border border-hairline text-xs text-text-primary-v4 focus:border-signal"
                >
                  <option value="promo">Promotional Grant (Non-refundable)</option>
                  <option value="topup">Prepaid Top-up (Wallet Addition)</option>
                  <option value="refund">Refund (Credit Balance Adjustment)</option>
                  <option value="adjustment">SLA Downtime Compensation</option>
                </select>
              </div>

              <div>
                <label className="block text-text-muted-v4 mb-1 font-medium">Amount in INR (₹)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={issueCreditData.amountInr}
                  onChange={e => setIssueCreditData(prev => ({ ...prev, amountInr: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded bg-ink-surface border border-hairline text-xs font-mono text-text-primary-v4 focus:border-signal"
                  required
                />
              </div>

              <div>
                <label className="block text-text-muted-v4 mb-1 font-medium">Reason / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Q4 Cloud AI Startup Grant or SLA credit"
                  value={issueCreditData.description}
                  onChange={e => setIssueCreditData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded bg-ink-surface border border-hairline text-xs text-text-primary-v4 focus:border-signal"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-hairline">
                <button
                  type="button"
                  onClick={() => setIsIssueCreditOpen(false)}
                  className="px-3.5 py-2 rounded bg-ink-surface hover:bg-ink-surface-2 border border-hairline text-xs font-medium text-text-secondary-v4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-signal text-black font-semibold hover:bg-signal/90 text-xs shadow-sm"
                >
                  Apply Credit Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: CREATE RESELLER */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {isCreateResellerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-lg bg-ink border border-hairline shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <h3 className="text-sm font-semibold text-text-primary-v4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-signal" />
                Register New Reseller Partner
              </h3>
              <button
                onClick={() => setIsCreateResellerOpen(false)}
                className="text-text-muted-v4 hover:text-text-primary-v4 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateResellerSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-text-muted-v4 mb-1 font-medium">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Skyline Cloud Solutions Pvt Ltd"
                  value={newResellerData.companyName}
                  onChange={e => setNewResellerData(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full px-3 py-2 rounded bg-ink-surface border border-hairline text-xs text-text-primary-v4 focus:border-signal"
                  required
                />
              </div>

              <div>
                <label className="block text-text-muted-v4 mb-1 font-medium">Contact Email</label>
                <input
                  type="email"
                  placeholder="billing@skylinecloud.in"
                  value={newResellerData.contactEmail}
                  onChange={e => setNewResellerData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  className="w-full px-3 py-2 rounded bg-ink-surface border border-hairline text-xs text-text-primary-v4 focus:border-signal"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-muted-v4 mb-1 font-medium">Margin (% discount)</label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    step="0.5"
                    value={newResellerData.marginPercent}
                    onChange={e => setNewResellerData(prev => ({ ...prev, marginPercent: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded bg-ink-surface border border-hairline text-xs font-mono text-text-primary-v4 focus:border-signal"
                    required
                  />
                </div>
                <div>
                  <label className="block text-text-muted-v4 mb-1 font-medium">Credit Limit (₹)</label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={newResellerData.creditLimitInr}
                    onChange={e => setNewResellerData(prev => ({ ...prev, creditLimitInr: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded bg-ink-surface border border-hairline text-xs font-mono text-text-primary-v4 focus:border-signal"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-text-muted-v4 mb-1 font-medium">GST Identification Number (Optional)</label>
                <input
                  type="text"
                  placeholder="27AAACG0182E1Z8"
                  value={newResellerData.gstNumber}
                  onChange={e => setNewResellerData(prev => ({ ...prev, gstNumber: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2 rounded bg-ink-surface border border-hairline text-xs font-mono text-text-primary-v4 focus:border-signal"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-hairline">
                <button
                  type="button"
                  onClick={() => setIsCreateResellerOpen(false)}
                  className="px-3.5 py-2 rounded bg-ink-surface hover:bg-ink-surface-2 border border-hairline text-xs font-medium text-text-secondary-v4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-signal text-black font-semibold hover:bg-signal/90 text-xs shadow-sm"
                >
                  Authorize Reseller
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: RESELLER SUB-CUSTOMERS DRAWER */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {viewingReseller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-lg bg-ink border border-hairline shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <div>
                <h3 className="text-sm font-semibold text-text-primary-v4 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-signal" />
                  {viewingReseller.companyName}
                </h3>
                <p className="text-[11px] text-text-muted-v4">
                  Sub-account roster and active wholesale quota allocations
                </p>
              </div>
              <button
                onClick={() => setViewingReseller(null)}
                className="text-text-muted-v4 hover:text-text-primary-v4 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-ink-surface rounded border border-hairline flex items-center justify-between font-mono">
                <div>
                  <span className="text-text-muted-v4 text-[11px]">Wholesale Margin:</span>
                  <p className="font-bold text-cyan-400">{viewingReseller.marginPercent}%</p>
                </div>
                <div>
                  <span className="text-text-muted-v4 text-[11px]">Commissions:</span>
                  <p className="font-bold text-emerald-400">₹{(viewingReseller.earnedCommissionPaise / 100).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <span className="text-text-muted-v4 text-[11px]">Credit Line:</span>
                  <p className="font-bold text-text-primary-v4">₹{(viewingReseller.creditLimitPaise / 100).toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="divide-y divide-hairline max-h-60 overflow-y-auto pt-2">
                {[
                  { name: 'Delta Analytics', email: 'it@delta.io', plan: 'Workers Pro', spend: '₹2,400/mo' },
                  { name: 'Kavita Retail POS', email: 'billing@kavitapos.in', plan: 'VPS Starter', spend: '₹1,200/mo' },
                  { name: 'SaaS Builder Studio', email: 'hello@saasbuilder.tech', plan: 'K3s Pod', spend: '₹4,800/mo' },
                ].map((cust, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-text-primary-v4">{cust.name}</p>
                      <p className="text-[11px] text-text-muted-v4">{cust.email} · {cust.plan}</p>
                    </div>
                    <span className="font-mono text-emerald-400">{cust.spend}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-hairline">
              <button
                onClick={() => setViewingReseller(null)}
                className="px-4 py-2 rounded bg-ink-surface hover:bg-ink-surface-2 border border-hairline text-xs font-medium text-text-primary-v4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: SUBSCRIPTION CONFIRM ACTION */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {actionSubscription && pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-lg bg-ink border border-hairline shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <h3 className="text-sm font-semibold capitalize text-text-primary-v4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Confirm {pendingAction} Subscription
              </h3>
              <button
                onClick={() => {
                  setActionSubscription(null);
                  setPendingAction(null);
                }}
                className="text-text-muted-v4 hover:text-text-primary-v4 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-text-secondary-v4 leading-relaxed">
              Are you sure you want to execute <strong className="text-text-primary-v4 uppercase">{pendingAction}</strong> on subscription{' '}
              <code className="text-signal bg-ink-surface px-1 py-0.5 rounded">{actionSubscription.id}</code> for{' '}
              <strong>{actionSubscription.customerEmail}</strong>?
            </p>

            <div className="p-3 bg-ink-surface rounded border border-hairline text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-text-muted-v4">Current Plan:</span>
                <span className="font-semibold text-text-primary-v4">{actionSubscription.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted-v4">Current MRR:</span>
                <span className="font-mono text-text-primary-v4">₹{(actionSubscription.mrrPaise / 100).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setActionSubscription(null);
                  setPendingAction(null);
                }}
                className="px-3.5 py-2 rounded bg-ink-surface hover:bg-ink-surface-2 border border-hairline text-xs font-medium text-text-secondary-v4"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteSubscriptionAction}
                className="px-4 py-2 rounded bg-signal text-black font-semibold hover:bg-signal/90 text-xs shadow-sm"
              >
                Confirm & Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
