'use client';
import { useAdmin } from '../layout-client';
import { CouponsTab } from '../components/coupons-tab';

export default function AdminPage() {
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

  return <CouponsTab showToast={showToast} />;
}
