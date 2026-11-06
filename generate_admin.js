const fs = require('fs');
const path = require('path');

const adminPath = path.join(__dirname, 'app', 'admin');

const pages = [
  {
    folder: 'overview',
    component: 'OverviewTab',
    imports: `import { OverviewTab } from '../components/overview-tab';`,
    props: `stats={stats} orders={orders} tickets={tickets} onRefresh={refreshAll} statusColors={statusColors}`
  },
  {
    folder: 'orders',
    component: 'OrdersTab',
    imports: `import { OrdersTab } from '../components/orders-tab';`,
    props: `orders={filteredOrders} searchQuery={searchQuery} setSearchQuery={setSearchQuery} statusFilter={statusFilter} setStatusFilter={setStatusFilter} actionLoading={actionLoading} updateOrderStatus={updateOrderStatus} refundOrder={refundOrder} statusColors={statusColors}`
  },
  {
    folder: 'plans',
    component: 'PlansTab',
    imports: `import { PlansTab } from '../components/plans-addons-tab';`,
    props: `plans={plans} actionLoading={actionLoading} togglePlanActive={togglePlanActive} deletePlan={deletePlan} showToast={showToast} onRefresh={fetchPlans}`
  },
  {
    folder: 'addons',
    component: 'AddonsTab',
    imports: `import { AddonsTab } from '../components/plans-addons-tab';`,
    props: `addons={addons} actionLoading={actionLoading} toggleAddonActive={toggleAddonActive} deleteAddon={deleteAddon} showToast={showToast} onRefresh={fetchAddons}`
  },
  {
    folder: 'coupons',
    component: 'CouponsTab',
    imports: `import { CouponsTab } from '../components/coupons-tab';`,
    props: `showToast={showToast}`
  },
  {
    folder: 'services',
    component: 'ServicesTab',
    imports: `import { ServicesTab } from '../components/tickets-users-tab';`,
    props: `showToast={showToast} onRefresh={fetchStats}`
  },
  {
    folder: 'users',
    component: 'UsersTab',
    imports: `import { UsersTab } from '../components/tickets-users-tab';`,
    props: `users={users}`
  },
  {
    folder: 'tickets',
    component: 'TicketsTab',
    imports: `import { TicketsTab } from '../components/tickets-users-tab';`,
    props: `tickets={tickets} searchQuery={searchQuery} setSearchQuery={setSearchQuery} statusFilter={statusFilter} setStatusFilter={setStatusFilter} actionLoading={actionLoading} updateTicketStatus={updateTicketStatus} admin={admin} showToast={showToast} statusColors={statusColors}`
  },
  {
    folder: 'invoices',
    component: 'InvoicesTab',
    imports: `import { InvoicesTab } from '../components/payments-settings-tab';`,
    props: `invoices={invoices} statusColors={statusColors} showToast={showToast} onRefresh={fetchInvoices}`
  },
  {
    folder: 'leads',
    component: 'LeadsTab',
    imports: `import { LeadsTab } from '../components/payments-settings-tab';`,
    props: `leads={leads} onRefresh={fetchLeads} statusColors={statusColors}`
  },
  {
    folder: 'payments',
    component: 'PaymentsTab',
    imports: `import { PaymentsTab } from '../components/payments-settings-tab';`,
    props: ``
  },
  {
    folder: 'emails',
    component: 'EmailLogTab',
    imports: `import { EmailLogTab } from '../components/payments-settings-tab';`,
    props: ``
  },
  {
    folder: 'settings-payment',
    component: 'PaymentSettingsTab',
    imports: `import { PaymentSettingsTab } from '../components/payments-settings-tab';`,
    props: `showToast={showToast}`
  },
  {
    folder: 'settings-provisioning',
    component: 'ProvisioningSettingsTab',
    imports: `import { ProvisioningSettingsTab } from '../components/provisioning-settings-tab';`,
    props: `showToast={showToast}`
  },
  {
    folder: 'settings-site',
    component: 'SiteSettingsTab',
    imports: `import { SiteSettingsTab } from '../components/payments-settings-tab';`,
    props: `showToast={showToast}`
  },
  {
    folder: 'settings-integrations',
    component: 'IntegrationsTab',
    imports: `import { IntegrationsTab } from '../components/integrations-tab';`,
    props: `showToast={showToast}`
  },
  {
    folder: 'settings-nodes',
    component: 'NodesTab',
    imports: `import { NodesTab } from '../components/nodes-tab';`,
    props: `showToast={showToast}`
  }
];

const template = (page) => `'use client';
import { useAdmin } from '../layout-client';
${page.imports}

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

  return <${page.component} ${page.props} />;
}
`;

pages.forEach(page => {
  const dir = path.join(adminPath, page.folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'page.tsx'), template(page));
  console.log('Created ' + page.folder);
});
