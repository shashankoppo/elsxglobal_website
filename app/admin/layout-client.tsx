'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Logo } from '@/components/ui/logo';
import { adminFetch } from './components/admin-fetch';
import { type Stats } from './components/overview-tab';
import {
  LayoutDashboard, Server, Receipt, LifeBuoy, LogOut, Menu, Loader2,
  Users, CreditCard, Package, Wallet, Plus, ShieldCheck, Globe,
  X as XIcon, RefreshCw, Send, Database as DbIcon, Settings,
  ChevronRight, Search, Tag, Sparkles, ShieldAlert, Zap, HardDrive, Network,
  IndianRupee
} from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export type Tab = 'overview' | 'orders' | 'plans' | 'addons' | 'coupons' | 'services' | 'users' | 'tickets' | 'invoices' | 'leads' | 'payments' | 'billing' | 'emails' | 'settings-payment' | 'settings-provisioning' | 'settings-site' | 'settings-integrations' | 'settings-nodes' | 'cloud' | 'approval-queue' | 'actions' | 'ai-governance' | 'security' | 'workers' | 'storage' | 'dns';

interface AdminInfo { email: string; name: string; }

export const statusColors: Record<string, string> = {
  active: 'text-green-600 bg-green-500/10 border-green-500/20', pending: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
  pending_payment: 'text-amber-600 bg-amber-500/10 border-amber-500/20', pending_verification: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
  provisioning: 'text-blue-600 bg-blue-500/10 border-blue-500/20', paid: 'text-green-600 bg-green-500/10 border-green-500/20',
  open: 'text-blue-600 bg-blue-500/10 border-blue-500/20', resolved: 'text-green-600 bg-green-500/10 border-green-500/20',
  overdue: 'text-red-600 bg-red-500/10 border-red-500/20', sent: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
  draft: 'text-muted-foreground bg-muted/20 border-border', failed: 'text-red-600 bg-red-500/10 border-red-500/20',
  suspended: 'text-red-600 bg-red-500/10 border-red-500/20', cancelled: 'text-muted-foreground bg-muted/20 border-border',
  closed: 'text-muted-foreground bg-muted/20 border-border', refunded: 'text-purple-600 bg-purple-500/10 border-purple-500/20',
  completed: 'text-green-600 bg-green-500/10 border-green-500/20', initiated: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
  new: 'text-blue-600 bg-blue-500/10 border-blue-500/20', contacted: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
  qualified: 'text-green-600 bg-green-500/10 border-green-500/20',
};

export const navSections: { label: string; items: { id: Tab; link: string; label: string; icon: typeof LayoutDashboard; badge?: number }[] }[] = [
  {
    label: 'Main',
    items: [
      { id: 'overview', link: '/admin/overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'orders', link: '/admin/orders', label: 'Orders', icon: CreditCard, badge: 0 },
      { id: 'services', link: '/admin/services', label: 'Services', icon: Server, badge: 0 },
    ],
  },
  {
    label: 'Execution Plane & AI Safety',
    items: [
      { id: 'approval-queue', link: '/admin/approval-queue', label: 'Tier 3 Approvals', icon: ShieldCheck, badge: 0 },
      { id: 'actions', link: '/admin/actions', label: 'Audit Trail & Gateway', icon: ShieldCheck },
    ],
  },
  {
    label: 'Cloud & Edge Fleet',
    items: [
      { id: 'cloud', link: '/admin/cloud', label: 'Cloud Infrastructure', icon: Globe },
      { id: 'ai-governance', link: '/admin/ai-governance', label: 'AI Governance & Gateway', icon: Sparkles },
      { id: 'security', link: '/admin/security', label: 'DDoS, WAF & Bot Defense', icon: ShieldAlert },
      { id: 'workers', link: '/admin/workers', label: 'Edge Workers & Isolates', icon: Zap },
      { id: 'storage', link: '/admin/storage', label: 'VaultR2 Buckets', icon: HardDrive },
      { id: 'dns', link: '/admin/dns', label: 'Anycast DNS & Purge', icon: Network },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { id: 'plans', link: '/admin/plans', label: 'Hosting Plans', icon: Package },
      { id: 'addons', link: '/admin/addons', label: 'Add-ons', icon: Plus },
      { id: 'coupons', link: '/admin/coupons', label: 'Coupons', icon: Tag },
    ],
  },
  {
    label: 'Customers',
    items: [
      { id: 'users', link: '/admin/users', label: 'Users', icon: Users },
      { id: 'tickets', link: '/admin/tickets', label: 'Support', icon: LifeBuoy, badge: 0 },
      { id: 'invoices', link: '/admin/invoices', label: 'Invoices', icon: Receipt, badge: 0 },
    ],
  },
  {
    label: 'Finance',
    items: [
      { id: 'billing', link: '/admin/billing', label: 'Billing Control', icon: IndianRupee },
      { id: 'payments', link: '/admin/payments', label: 'Transactions', icon: Wallet },
      { id: 'leads', link: '/admin/leads', label: 'Odoo Leads', icon: DbIcon },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'emails', link: '/admin/emails', label: 'Email Log', icon: Send },
      { id: 'settings-payment', link: '/admin/settings-payment', label: 'Payment Settings', icon: CreditCard },
      { id: 'settings-provisioning', link: '/admin/settings-provisioning', label: 'Provisioning', icon: Server },
      { id: 'settings-integrations', link: '/admin/settings-integrations', label: 'Integrations', icon: DbIcon },
      { id: 'settings-nodes', link: '/admin/settings-nodes', label: 'Nodes & Servers', icon: Server },
      { id: 'settings-site', link: '/admin/settings-site', label: 'Site Settings', icon: Settings },
    ],
  },
];

export const AdminContext = createContext<any>(null);
export const useAdmin = () => useContext(AdminContext);

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [plans, setPlans] = useState<Record<string, unknown>[]>([]);
  const [addons, setAddons] = useState<Record<string, unknown>[]>([]);
  const [tickets, setTickets] = useState<Record<string, unknown>[]>([]);
  const [invoices, setInvoices] = useState<Record<string, unknown>[]>([]);
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [leads, setLeads] = useState<Record<string, unknown>[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchStats = useCallback(async () => {
    const res = await adminFetch('stats');
    if (res.ok) setStats(await res.json());
  }, []);

  const fetchOrders = useCallback(async () => {
    const res = await adminFetch('get-orders');
    if (res.ok) { const d = await res.json(); setOrders(d.data || []); }
  }, []);

  const fetchPlans = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from('hosting_plans').select('*').order('tier', { ascending: true }).order('sort_order', { ascending: true });
    setPlans(data || []);
  }, []);

  const fetchAddons = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from('hosting_addons').select('*').order('category', { ascending: true }).order('sort_order', { ascending: true });
    setAddons(data || []);
  }, []);

  const fetchTickets = useCallback(async () => {
    const res = await adminFetch('get-tickets');
    if (res.ok) { const d = await res.json(); setTickets(d.data || []); }
  }, []);

  const fetchInvoices = useCallback(async () => {
    const res = await adminFetch('get-invoices');
    if (res.ok) { const d = await res.json(); setInvoices(d.data || []); }
  }, []);

  const fetchLeads = useCallback(async () => {
    const res = await adminFetch('get-leads');
    if (res.ok) { const d = await res.json(); setLeads(d.data || []); }
  }, []);

  const fetchUsers = useCallback(async () => {
    const res = await adminFetch('list-users');
    if (res.ok) { const data = await res.json(); setUsers(data.users || []); }
  }, []);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchStats(), fetchOrders(), fetchPlans(), fetchAddons(), fetchTickets(), fetchInvoices(), fetchUsers(), fetchLeads()]);
    setRefreshing(false);
  }, [fetchStats, fetchOrders, fetchPlans, fetchAddons, fetchTickets, fetchInvoices, fetchUsers, fetchLeads]);

  useEffect(() => {
    // Skip auth check on login/reset/setup pages
    if (pathname.includes('/login') || pathname.includes('/reset') || pathname.includes('/setup')) {
      setLoading(false);
      return;
    }
    
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/admin/login/';
        return;
      }
      setAdmin(prev => {
        if (prev?.email === user.email) return prev;
        return { email: user.email || '', name: 'Administrator' };
      });
      setLoading(false);
    };
    checkUser();
  }, [pathname]);

  // Separate effect for initial data fetch when authenticated
  useEffect(() => {
    if (admin) {
      refreshAll();
    }
  }, [admin, refreshAll]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    setActionLoading(orderId);
    const res = await adminFetch('approve-order', { orderId, newStatus: status });
    if (res.ok) { showToast('success', status === 'active' ? 'Order approved — service provisioned' : `Order marked as ${status}`); fetchOrders(); fetchStats(); }
    else { const d = await res.json().catch(() => ({})); showToast('error', d.error || 'Failed'); }
    setActionLoading(null);
  };

  const refundOrder = async (orderId: string, reason: string) => {
    setActionLoading(orderId);
    const res = await adminFetch('refund-order', { orderId, refundReason: reason });
    if (res.ok) { showToast('success', 'Order refunded and service suspended'); fetchOrders(); fetchStats(); }
    else { const d = await res.json().catch(() => ({})); showToast('error', d.error || 'Refund failed'); }
    setActionLoading(null);
  };

  const togglePlanActive = async (planId: string, current: boolean) => {
    setActionLoading(planId);
    const supabase = createClient();
    const { error } = await supabase.from('hosting_plans').update({ is_active: !current }).eq('id', planId);
    if (error) showToast('error', 'Failed'); else { showToast('success', `Plan ${!current ? 'activated' : 'deactivated'}`); fetchPlans(); fetchStats(); }
    setActionLoading(null);
  };

  const deletePlan = async (planId: string) => {
    if (!confirm('Delete this plan? This cannot be undone.')) return;
    setActionLoading(planId);
    const res = await adminFetch('delete-plan', { planId });
    if (res.ok) { showToast('success', 'Plan deleted'); fetchPlans(); fetchStats(); }
    else showToast('error', 'Delete failed');
    setActionLoading(null);
  };

  const toggleAddonActive = async (addonId: string, current: boolean) => {
    setActionLoading(addonId);
    const supabase = createClient();
    const { error } = await supabase.from('hosting_addons').update({ is_active: !current }).eq('id', addonId);
    if (error) showToast('error', 'Failed'); else { showToast('success', `Add-on ${!current ? 'activated' : 'deactivated'}`); fetchAddons(); fetchStats(); }
    setActionLoading(null);
  };

  const deleteAddon = async (addonId: string) => {
    if (!confirm('Delete this add-on?')) return;
    setActionLoading(addonId);
    const res = await adminFetch('delete-addon', { addonId });
    if (res.ok) { showToast('success', 'Add-on deleted'); fetchAddons(); fetchStats(); }
    else showToast('error', 'Delete failed');
    setActionLoading(null);
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    setActionLoading(ticketId);
    const supabase = createClient();
    const { error } = await supabase.from('support_tickets').update({ status, updated_at: new Date().toISOString() }).eq('id', ticketId);
    if (error) showToast('error', 'Failed'); else { showToast('success', `Ticket ${status}`); fetchTickets(); fetchStats(); }
    setActionLoading(null);
  };


  const badgeMap: Partial<Record<Tab, number>> = {
    orders: stats?.pendingOrders || 0,
    services: stats?.activeServices || 0,
    tickets: stats?.openTickets || 0,
    invoices: stats?.unpaidInvoices || 0,
  };
  navSections.forEach((s) => s.items.forEach((item) => {
    if (badgeMap[item.id] !== undefined) item.badge = badgeMap[item.id];
  }));

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = !searchQuery || (o.plan_name as string)?.toLowerCase().includes(searchQuery.toLowerCase()) || (o.id as string)?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeTabId = pathname.split('/').pop() || 'overview';
  const activeLabel = navSections.flatMap((s) => s.items).find((i) => i.id === activeTabId)?.label || 'Overview';

  const contextValue = {
    admin, loading, stats, orders, plans, addons, tickets, invoices, users, leads,
    searchQuery, setSearchQuery, statusFilter, setStatusFilter, actionLoading, toast,
    refreshing, globalSearch, setGlobalSearch, showToast, fetchStats, fetchOrders,
    fetchPlans, fetchAddons, fetchTickets, fetchInvoices, fetchLeads, fetchUsers,
    refreshAll, updateOrderStatus, refundOrder, togglePlanActive, deletePlan,
    toggleAddonActive, deleteAddon, updateTicketStatus, filteredOrders, statusColors,
  };

  // Auth pages: render ONLY the children, no sidebar/topbar at all
  const isAuthPage = pathname.includes('/login') || pathname.includes('/reset') || pathname.includes('/setup');
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <AdminContext.Provider value={contextValue}>
      <div className="min-h-screen bg-background">
        {/* Toast */}
        {toast && (
          <div className={`fixed top-6 right-6 z-[100] px-5 py-3.5 rounded-xl border text-sm font-medium shadow-xl animate-fade-up flex items-center gap-2.5 ${toast.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-600' : 'bg-red-500/10 border-red-500/30 text-red-600'}`}>
            {toast.type === 'success' ? <ShieldCheck className="h-4 w-4" /> : <XIcon className="h-4 w-4" />}
            {toast.msg}
          </div>
        )}

        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-40">
          <Logo />
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 -mr-2 rounded-lg hover:bg-muted/50 transition-colors">
            {sidebarOpen ? <XIcon className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <div className="flex h-[calc(100vh-65px)] lg:h-screen">
          {/* Sidebar overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          {/* Sidebar */}
          <aside className={`fixed inset-y-0 left-0 z-50 w-[240px] bg-[#0f1115] border-r border-border/10 flex flex-col transition-transform duration-300 ease-out lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            {/* Logo area */}
            <div className="h-14 flex items-center px-4 shrink-0 border-b border-border/10 bg-[#0f1115]">
              <Link href="/admin/overview" className="flex items-center gap-2 hover:opacity-80 transition-opacity group">
                <div className="h-6 w-6 rounded-md bg-signal flex items-center justify-center">
                  <ShieldCheck className="h-3.5 w-3.5 text-black" />
                </div>
                <span className="font-semibold text-sm tracking-tight text-white">
                  Admin Console
                </span>
              </Link>
            </div>

            {/* Nav sections */}
            <nav className="px-2 py-3 flex-1 overflow-y-auto admin-scroll">
              {navSections.map((section) => (
                <div key={section.label} className="mb-4">
                  <p className="px-2 mb-1 text-[#6b7280] text-[10px] uppercase tracking-wider font-semibold">{section.label}</p>
                  <div className="space-y-0.5">
                    {section.items.map((item) => (
                      <Link
                        key={item.id}
                        href={item.link}
                        onClick={() => { setSidebarOpen(false); setSearchQuery(''); setStatusFilter('all'); }}
                        className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px] font-medium transition-colors ${activeTabId === item.id ? 'bg-[#1f2937] text-white' : 'text-[#9ca3af] hover:text-white hover:bg-[#1f2937]/50'}`}
                      >
                        <item.icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-signal/20 text-signal">{item.badge}</span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-border/10 space-y-1 shrink-0 bg-[#0f1115]">
              <div className="flex items-center gap-2 px-2 py-2 mb-2">
                <div className="w-6 h-6 rounded bg-signal/20 flex items-center justify-center text-signal font-semibold text-xs shrink-0">
                  {admin?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white truncate">{admin?.name}</p>
                  <p className="text-[10px] text-[#9ca3af] truncate">{admin?.email}</p>
                </div>
              </div>
              <Link href="/" className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] font-medium text-[#9ca3af] hover:text-white hover:bg-[#1f2937]/50 transition-colors">
                <Globe className="h-3.5 w-3.5" />View Site
              </Link>
              <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] font-medium text-[#9ca3af] hover:text-destructive hover:bg-destructive/10 transition-colors">
                <LogOut className="h-3.5 w-3.5" />Sign Out
              </button>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 flex flex-col min-w-0 bg-muted/20">
            {/* Desktop top bar */}
            <div className="hidden lg:flex items-center justify-between px-6 py-2.5 bg-background border-b border-border sticky top-0 z-30">
              <div className="flex items-center gap-2 text-[13px]">
                <span className="text-muted-foreground font-medium">ELSxGlobal</span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-foreground font-semibold">{activeLabel}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    placeholder="Search resources (Ctrl+K)"
                    className="w-48 xl:w-64 pl-8 pr-3 py-1.5 rounded-md bg-muted/50 border border-border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary focus:w-56 xl:focus:w-72 transition-all"
                  />
                </div>
                <div className="h-4 w-px bg-border mx-1" />
                <button onClick={refreshAll} disabled={refreshing} className="p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50" title="Refresh data">
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                <ThemeToggle />
              </div>
            </div>

            {/* Page content */}
            <main className="flex-1 p-6 w-full min-w-0 overflow-auto">
              <div key={activeTabId} className="admin-page-enter max-w-full">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </AdminContext.Provider>
  );
}
