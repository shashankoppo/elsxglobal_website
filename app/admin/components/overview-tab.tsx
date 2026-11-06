'use client';

import {
  RefreshCw, DollarSign, ShoppingCart, Server, CreditCard,
  LifeBuoy, Receipt, Package, Wallet, TrendingUp, TrendingDown,
  ArrowUpRight, Activity, Clock,
} from 'lucide-react';
export interface Stats {
  totalRevenue: number;
  totalOrders: number;
  activeServices: number;
  pendingOrders: number;
  openTickets: number;
  unpaidInvoices: number;
  activePlans: number;
  totalTransactions: number;
  // New trend fields
  revenueThisWeek?: number;
  revenueLastWeek?: number;
  revenueTrend?: number;
  ordersThisWeek?: number;
  ordersLastWeek?: number;
  ordersTrend?: number;
  newUsersThisWeek?: number;
  revenueByTier?: Record<string, number>;
}
export function OverviewTab({ stats, orders, tickets, onRefresh, onTab, statusColors }: {
  stats: Stats | null; orders: Record<string, unknown>[]; tickets: Record<string, unknown>[];
  onRefresh: () => void; onTab: (t: string) => void; statusColors: Record<string, string>;
}) {
  const statCards = [
    { label: 'Total Revenue', value: stats ? `Rs ${stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : 'Rs 0', icon: DollarSign, color: '#10b981', bg: 'rgba(16,185,129,0.1)', trend: stats?.revenueTrend !== undefined ? `${stats.revenueTrend >= 0 ? '+' : ''}${stats.revenueTrend.toFixed(1)}%` : '+0%' },
    { label: 'Total Orders', value: stats?.totalOrders ?? '0', icon: ShoppingCart, color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)', trend: stats?.ordersTrend !== undefined ? `${stats.ordersTrend >= 0 ? '+' : ''}${stats.ordersTrend.toFixed(1)}%` : '+0%' },
    { label: 'Active Services', value: stats?.activeServices ?? '0', icon: Server, color: '#10b981', bg: 'rgba(16,185,129,0.1)', trend: 'Running' },
    { label: 'Pending Orders', value: stats?.pendingOrders ?? '0', icon: CreditCard, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', trend: stats?.pendingOrders ? 'Needs attention' : 'All clear' },
  ];

  const secondaryCards = [
    { label: 'Open Tickets', value: stats?.openTickets ?? '0', icon: LifeBuoy, color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
    { label: 'Unpaid Invoices', value: stats?.unpaidInvoices ?? '0', icon: Receipt, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    { label: 'Active Plans', value: stats?.activePlans ?? '0', icon: Package, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Transactions', value: stats?.totalTransactions ?? '0', icon: Wallet, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  ];

  // Build a simple 7-day activity chart from orders
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const chartData = last7Days.map((day) => {
    const dayOrders = orders.filter((o) => {
      const created = new Date(o.created_at as string);
      return created.toDateString() === day.toDateString();
    });
    return { date: day, count: dayOrders.length, revenue: dayOrders.reduce((sum, o) => sum + ((o.total as number) || 0), 0) };
  });
  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1);

  // Build activity feed from recent orders + tickets
  const activities: { type: 'order' | 'ticket'; title: string; subtitle: string; time: string; color: string; icon: typeof ShoppingCart }[] = [
    ...orders.slice(0, 5).map((o) => ({
      type: 'order' as const, title: `New order: ${o.plan_name}`, subtitle: `Rs ${(o.total as number)?.toLocaleString('en-IN', { maximumFractionDigits: 0 })} · ${o.status}`,
      time: new Date(o.created_at as string).toLocaleDateString(), color: '#0ea5e9', icon: ShoppingCart,
    })),
    ...tickets.slice(0, 5).map((t) => ({
      type: 'ticket' as const, title: `Ticket: ${t.subject}`, subtitle: `Priority: ${t.priority} · ${t.status}`,
      time: new Date(t.created_at as string).toLocaleDateString(), color: '#f59e0b', icon: LifeBuoy,
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Dashboard Overview</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Real-time metrics and system activity</p>
        </div>
        <button onClick={onRefresh} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted hover:bg-muted/80 text-[13px] font-medium transition-colors">
          <RefreshCw className="h-3.5 w-3.5" />Refresh
        </button>
      </div>

      {/* Primary stat cards */}
      <div className="grid grid-cols-4 gap-3">
        {statCards.map((stat, i) => (
          <div key={stat.label} className="p-4 rounded-lg bg-background border border-border shadow-sm flex flex-col justify-between" style={{ animation: `admin-fade-up 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 0.05}s both` }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</span>
              <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-semibold tracking-tight text-foreground">{stat.value}</span>
              <div className={`flex items-center gap-1 text-[11px] font-medium ${stat.trend.startsWith('+') || ['All clear', 'Running'].includes(stat.trend) ? 'text-green-500' : stat.trend.startsWith('-') ? 'text-red-500' : 'text-amber-500'}`}>
                {stat.trend.startsWith('+') || ['All clear', 'Running'].includes(stat.trend) ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {stat.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary stat cards */}
      <div className="grid grid-cols-4 gap-3">
        {secondaryCards.map((stat, i) => (
          <div key={stat.label} className="p-3 rounded-lg bg-muted/20 border border-border/50 flex items-center justify-between" style={{ animation: `admin-fade-up 0.4s cubic-bezier(0.16,1,0.3,1) ${(4 + i) * 0.05}s both` }}>
            <div className="flex items-center gap-2.5">
              <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
              <span className="text-[13px] text-muted-foreground">{stat.label}</span>
            </div>
            <span className="text-[15px] font-semibold text-foreground">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onTab('orders')} 
          className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${stats?.pendingOrders ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'bg-muted hover:bg-muted/80'}`}
        >
          Approve Pending ({stats?.pendingOrders ?? 0})
        </button>
        <button 
          onClick={() => onTab('tickets')} 
          className="px-3 py-1.5 rounded-md text-[12px] font-medium bg-muted hover:bg-muted/80 transition-colors"
        >
          Resolve Tickets ({stats?.openTickets ?? 0})
        </button>
        <button 
          onClick={onRefresh} 
          className="px-3 py-1.5 rounded-md text-[12px] font-medium bg-muted hover:bg-muted/80 transition-colors"
        >
          Sync All Data
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="col-span-2 rounded-lg bg-background border border-border shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-semibold text-foreground">Revenue & Orders (7 Days)</h2>
            <div className="flex items-center gap-1 text-[11px] font-medium text-signal bg-signal/10 px-2 py-0.5 rounded">
              <Activity className="h-3 w-3" /> Live
            </div>
          </div>
          <div className="flex items-end justify-between gap-2 h-[140px]">
            {chartData.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group h-full">
                <div className="relative w-full flex items-end justify-center h-full">
                  <div
                    className="w-full max-w-[32px] rounded-t-sm transition-all group-hover:bg-primary/80"
                    style={{
                      height: `${(day.revenue / maxRevenue) * 100}%`,
                      background: day.revenue > 0 ? 'var(--primary)' : 'var(--muted)',
                      animation: `admin-fade-up 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s both`,
                    }}
                  />
                  <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 pointer-events-none z-10">
                    <div className="bg-[#1f2937] text-white text-[10px] font-medium px-2 py-1 rounded whitespace-nowrap shadow-md">
                      Rs {day.revenue.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground uppercase">{day.date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
              </div>
            ))}
          </div>

          {stats?.revenueByTier && Object.keys(stats.revenueByTier).length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border/50">
              {Object.entries(stats.revenueByTier).map(([tier, amount]) => (
                <div key={tier} className="text-center">
                  <p className="text-[10px] uppercase text-muted-foreground">{tier}</p>
                  <p className="text-[13px] font-semibold">Rs {amount.toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity feed */}
        <div className="rounded-lg bg-background border border-border shadow-sm p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[14px] font-semibold text-foreground">Audit Log</h2>
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 pr-2">
            {activities.length === 0 ? (
              <p className="text-[12px] text-muted-foreground text-center py-8">No events logged</p>
            ) : (
              activities.map((activity, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2 rounded hover:bg-muted/50 transition-colors">
                  <activity.icon className="h-3.5 w-3.5 mt-0.5" style={{ color: activity.color }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-medium text-foreground leading-tight truncate">{activity.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{activity.subtitle}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{activity.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Data grids */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Orders Grid */}
        <div className="rounded-lg bg-background border border-border shadow-sm">
          <div className="flex items-center justify-between p-3 border-b border-border/50">
            <h2 className="text-[13px] font-semibold text-foreground">Recent Orders</h2>
            <button onClick={() => onTab('orders')} className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 text-[10px] text-muted-foreground uppercase tracking-wider bg-muted/20">
                  <th className="px-3 py-2 font-medium">Plan</th>
                  <th className="px-3 py-2 font-medium">Amount</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="text-[12px]">
                {orders.slice(0, 6).map((order) => (
                  <tr key={order.id as string} className="border-b border-border/30 hover:bg-muted/20 transition-colors last:border-0">
                    <td className="px-3 py-2.5 font-medium truncate max-w-[150px]">{order.plan_name as string}</td>
                    <td className="px-3 py-2.5">Rs {(order.total as number)?.toLocaleString('en-IN')}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${statusColors[order.status as string] || 'bg-muted text-muted-foreground'}`}>
                        {order.status as string}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right text-muted-foreground whitespace-nowrap">
                      {new Date(order.created_at as string).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && <p className="text-[12px] text-muted-foreground text-center py-6">No orders found.</p>}
          </div>
        </div>

        {/* Tickets Grid */}
        <div className="rounded-lg bg-background border border-border shadow-sm">
          <div className="flex items-center justify-between p-3 border-b border-border/50">
            <h2 className="text-[13px] font-semibold text-foreground">Active Tickets</h2>
            <button onClick={() => onTab('tickets')} className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 text-[10px] text-muted-foreground uppercase tracking-wider bg-muted/20">
                  <th className="px-3 py-2 font-medium">Subject</th>
                  <th className="px-3 py-2 font-medium">Priority</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="text-[12px]">
                {tickets.slice(0, 6).map((ticket) => (
                  <tr key={ticket.id as string} className="border-b border-border/30 hover:bg-muted/20 transition-colors last:border-0">
                    <td className="px-3 py-2.5 font-medium truncate max-w-[150px]">{ticket.subject as string}</td>
                    <td className="px-3 py-2.5 capitalize">{ticket.priority as string}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${statusColors[ticket.status as string] || 'bg-muted text-muted-foreground'}`}>
                        {ticket.status as string}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right text-muted-foreground whitespace-nowrap">
                      {new Date(ticket.created_at as string).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tickets.length === 0 && <p className="text-[12px] text-muted-foreground text-center py-6">No support tickets.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}






