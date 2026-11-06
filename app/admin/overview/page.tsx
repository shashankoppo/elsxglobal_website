'use client';
import { useAdmin } from '../layout-client';
import { OverviewTab } from '../components/overview-tab';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const context = useAdmin();
  if (!context) return null;
  const { 
    admin, stats, orders, plans, addons, tickets, invoices, users, leads,
    searchQuery, setSearchQuery, statusFilter, setStatusFilter, actionLoading,
    showToast, fetchStats, fetchOrders, fetchPlans, fetchAddons, fetchTickets,
    fetchInvoices, fetchLeads, fetchUsers, refreshAll, updateOrderStatus,
    refundOrder, togglePlanActive, deletePlan, toggleAddonActive, deleteAddon,
    updateTicketStatus, filteredOrders, statusColors
  } = context;
  return <OverviewTab stats={stats} orders={orders} tickets={tickets} onRefresh={refreshAll} statusColors={statusColors} onTab={(t) => router.push('/admin/' + t)} />;
}

