'use client';
import { useAdmin } from '../layout-client';
import { AddonsTab } from '../components/plans-addons-tab';

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

  return <AddonsTab addons={addons} actionLoading={actionLoading} toggleAddonActive={toggleAddonActive} deleteAddon={deleteAddon} showToast={showToast} onRefresh={fetchAddons} />;
}
