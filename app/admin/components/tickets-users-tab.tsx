'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminFetch, createClient } from './admin-fetch';
import {
  Loader2, Server, RefreshCw, Edit3, Pause, Play, Save, LifeBuoy,
  Search, Check, X as XIcon, ChevronDown, ChevronRight, MessageSquare, Send,
  Users,
} from 'lucide-react';

// ─── SERVICES ────────────────────────────────────────────────
export function ServicesTab({ showToast, onRefresh }: { showToast: (t: 'success' | 'error', m: string) => void; onRefresh: () => void }) {
  const [services, setServices] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchServices = useCallback(async () => {
    const res = await adminFetch('list-services');
    if (res.ok) { const data = await res.json(); setServices(data.data || []); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const updateService = async (serviceId: string, updates: Record<string, unknown>) => {
    setActionLoading(serviceId);
    const res = await adminFetch('update-service', { serviceId, ...updates });
    if (res.ok) { showToast('success', 'Service updated'); fetchServices(); onRefresh(); }
    else showToast('error', 'Update failed');
    setActionLoading(null);
  };

  const saveServiceEdit = async () => {
    if (!editingService) return;
    setSaving(true);
    await updateService(editingService.id as string, {
      status: editingService.status,
      renewal_date: editingService.renewal_date,
      ip_address: editingService.ip_address,
      control_panel_url: editingService.control_panel_url,
      username: editingService.username,
      password: editingService.password,
      ssh_port: editingService.ssh_port,
      web_console_url: editingService.web_console_url,
    });
    setEditingService(null);
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  const svcStatusColors: Record<string, string> = {
    active: 'text-green-600 bg-green-500/10', suspended: 'text-red-600 bg-red-500/10',
    provisioning: 'text-blue-600 bg-blue-500/10', cancelled: 'text-muted-foreground bg-muted/20',
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Compute Instances</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Manage provisioned hosting resources and connection details</p>
        </div>
        {!editingService && (
          <button onClick={fetchServices} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted hover:bg-muted/80 text-[13px] font-medium transition-colors">
            <RefreshCw className="h-3.5 w-3.5" />Refresh
          </button>
        )}
      </div>

      {editingService ? (
        <div className="rounded-lg bg-background border border-border shadow-sm animate-fade-in">
          <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/10">
            <h3 className="text-[14px] font-semibold text-foreground">Edit Instance Configuration</h3>
            <button onClick={() => setEditingService(null)} className="px-3 py-1.5 rounded-md bg-muted text-muted-foreground hover:text-foreground text-[12px] font-medium transition-colors">
              &larr; Back
            </button>
          </div>
          <div className="p-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Status</label>
                <select value={editingService.status as string || 'active'} onChange={(e) => setEditingService({ ...editingService, status: e.target.value })} className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all">
                  <option value="active">Active</option><option value="suspended">Suspended</option><option value="provisioning">Provisioning</option><option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Renewal Date</label>
                <input type="date" value={editingService.renewal_date ? new Date(editingService.renewal_date as string).toISOString().slice(0, 10) : ''} onChange={(e) => setEditingService({ ...editingService, renewal_date: new Date(e.target.value).toISOString() })} className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">IPv4 Address</label>
                <input type="text" value={(editingService.ip_address as string) || ''} onChange={(e) => setEditingService({ ...editingService, ip_address: e.target.value })} className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[13px] font-mono focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Control Panel URL</label>
                <input type="text" value={(editingService.control_panel_url as string) || ''} onChange={(e) => setEditingService({ ...editingService, control_panel_url: e.target.value })} className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border/50">
              <h4 className="text-[12px] font-semibold text-foreground mb-3 uppercase tracking-wider">Connection Credentials</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Username</label>
                  <input type="text" value={(editingService.username as string) || ''} onChange={(e) => setEditingService({ ...editingService, username: e.target.value })} className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[13px] font-mono focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" placeholder="root" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Password</label>
                  <input type="text" value={(editingService.password as string) || ''} onChange={(e) => setEditingService({ ...editingService, password: e.target.value })} className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[13px] font-mono focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">SSH/RDP Port</label>
                  <input type="number" value={(editingService.ssh_port as number) || ''} onChange={(e) => setEditingService({ ...editingService, ssh_port: parseInt(e.target.value) || 22 })} className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[13px] font-mono focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" placeholder="22" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Web Console URL</label>
                  <input type="text" value={(editingService.web_console_url as string) || ''} onChange={(e) => setEditingService({ ...editingService, web_console_url: e.target.value })} className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" placeholder="https://guac.elsxglobal.com/..." />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border/50 flex justify-end">
              <button onClick={saveServiceEdit} disabled={saving} className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors min-w-[120px]">
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Save Changes
              </button>
            </div>
          </div>
        </div>
      ) : services.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/50 p-12 text-center bg-muted/5"><Server className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" /><p className="text-[13px] text-muted-foreground">No instances provisioned. Services are created when orders are approved.</p></div>
      ) : (
        <div className="rounded-lg bg-background border border-border shadow-sm overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20 text-[10px] text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-2 font-medium">Instance</th>
                  <th className="px-4 py-2 font-medium">Network</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Renewal</th>
                  <th className="px-4 py-2 font-medium text-right">Created</th>
                  <th className="px-4 py-2 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[12px]">
                {services.map((service) => (
                  <tr key={service.id as string} className="border-b border-border/30 hover:bg-muted/10 transition-colors last:border-0">
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-foreground">{service.plan_name as string}</p>
                      <p className="text-[11px] text-muted-foreground">{(service.domain as string) || 'No domain'}</p>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
                      {(service.ip_address as string) || '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${svcStatusColors[service.status as string] || svcStatusColors.active}`}>
                        {service.status as string}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {service.renewal_date ? new Date(service.renewal_date as string).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground whitespace-nowrap">
                      {new Date(service.created_at as string).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setEditingService(service)} className="p-1 rounded bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Configure">
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <div className="inline-flex items-center border-l border-border/50 pl-1 ml-1">
                          {service.status === 'active' ? (
                            <button onClick={() => updateService(service.id as string, { status: 'suspended' })} disabled={actionLoading === service.id} className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-600 transition-colors" title="Suspend">
                              {actionLoading === service.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Pause className="h-3.5 w-3.5" />}
                            </button>
                          ) : (
                            <button onClick={() => updateService(service.id as string, { status: 'active' })} disabled={actionLoading === service.id} className="p-1 rounded bg-green-500/10 hover:bg-green-500/20 text-green-600 transition-colors" title="Activate">
                              {actionLoading === service.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                            </button>
                          )}
                        </div>
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

// ─── USERS ───────────────────────────────────────────────────
export function UsersTab({ users: initialUsers }: { users: Record<string, unknown>[] }) {
  const [usersList, setUsersList] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => { setUsersList(initialUsers); }, [initialUsers]);

  const handleToggleSuspend = async (user: Record<string, any>) => {
    setActionLoading(user.user_id as string);
    const supabase = createClient();
    const newStatus = !user.is_suspended;
    await supabase.from('users').update({ is_suspended: newStatus }).eq('id', user.user_id);
    setUsersList(prev => prev.map(u => u.user_id === user.user_id ? { ...u, is_suspended: newStatus } : u));
    setActionLoading(null);
  };

  const handlePasswordReset = async (email: string, userId: string) => {
    setActionLoading(`reset-${userId}`);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email);
    alert('Password reset email sent to ' + email);
    setActionLoading(null);
  };

  const filteredUsers = usersList.filter(u => !searchQuery || (u.email as string)?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Identity & Access</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Manage customer accounts, suspension, and credentials</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Filter by email..." className="w-full pl-8 pr-3 py-1.5 rounded-md bg-background border border-border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" />
        </div>
      </div>
      
      {filteredUsers.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/50 p-12 text-center bg-muted/5"><Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" /><p className="text-[13px] text-muted-foreground">No registered users with orders yet.</p></div>
      ) : (
        <div className="rounded-lg bg-background border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20 text-[10px] text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-2 font-medium">User</th>
                  <th className="px-4 py-2 font-medium">Activity</th>
                  <th className="px-4 py-2 font-medium text-right">Usage</th>
                  <th className="px-4 py-2 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[12px]">
                {filteredUsers.map((user, i) => (
                  <tr key={(user.user_id as string) || i} className="border-b border-border/30 hover:bg-muted/10 transition-colors last:border-0">
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-foreground">{(user.email as string) || '—'}</p>
                      <p className="text-[11px] text-muted-foreground">{user.email_confirmed_at ? 'Verified' : 'Unverified'} {user.is_suspended ? '· Suspended' : ''}</p>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      <p>Joined: {user.created_at ? new Date(user.created_at as string).toLocaleDateString() : (user.joined ? new Date(user.joined as string).toLocaleDateString() : '—')}</p>
                      <p className="text-[11px]">Last login: {user.last_sign_in_at ? new Date(user.last_sign_in_at as string).toLocaleDateString() : '—'}</p>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <p className="font-medium text-foreground">{user.orders as number || 0} orders · Rs {Number(user.total_spent || 0).toLocaleString('en-IN')}</p>
                      <p className="text-[11px] text-muted-foreground">{user.active_services as number || 0} instances · {user.open_tickets as number || 0} tickets</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleToggleSuspend(user)} disabled={actionLoading === user.user_id} className={`px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider transition-colors ${user.is_suspended ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' : 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'}`}>
                          {actionLoading === user.user_id ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : (user.is_suspended ? 'Activate' : 'Suspend')}
                        </button>
                        <button onClick={() => handlePasswordReset(user.email as string, user.user_id as string)} disabled={actionLoading === `reset-${user.user_id}`} className="px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors">
                          {actionLoading === `reset-${user.user_id}` ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : 'Reset'}
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
    </div>
  );
}

// ─── TICKETS ─────────────────────────────────────────────────
export function TicketsTab({ tickets, searchQuery, setSearchQuery, statusFilter, setStatusFilter, actionLoading, updateTicketStatus, admin, showToast, statusColors }: {
  tickets: Record<string, unknown>[]; searchQuery: string; setSearchQuery: (v: string) => void; statusFilter: string; setStatusFilter: (v: string) => void;
  actionLoading: string | null; updateTicketStatus: (id: string, s: string) => void; admin: { email: string; name: string } | null; showToast: (t: 'success' | 'error', m: string) => void; statusColors: Record<string, string>;
}) {
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [ticketReplies, setTicketReplies] = useState<Record<string, unknown>[]>([]);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  const loadTicketReplies = async (ticketId: string) => {
    const supabase = createClient();
    const { data } = await supabase.from('ticket_replies').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true });
    setTicketReplies(data || []);
  };

  const handleTicketExpand = (ticketId: string) => {
    if (expandedTicket === ticketId) { setExpandedTicket(null); setTicketReplies([]); }
    else { setExpandedTicket(ticketId); loadTicketReplies(ticketId); setReplyText(''); }
  };

  const sendTicketReply = async (ticketId: string) => {
    if (!replyText.trim() || !admin) return;
    setReplyLoading(true);
    const res = await adminFetch('reply-ticket', { ticketId, message: replyText, adminEmail: admin.email });
    if (res.ok) { showToast('success', 'Reply sent'); setReplyText(''); loadTicketReplies(ticketId); }
    else showToast('error', 'Failed to send reply');
    setReplyLoading(false);
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch = !searchQuery || (t.subject as string)?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Support Queue</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Triage, reply, and resolve customer tickets</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Filter by subject..." className="w-full pl-8 pr-3 py-1.5 rounded-md bg-background border border-border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-1.5 rounded-md bg-background border border-border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground w-[160px]">
          <option value="all">All Statuses</option><option value="open">Open</option><option value="pending">Pending</option><option value="resolved">Resolved</option><option value="closed">Closed</option>
        </select>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/50 p-12 text-center bg-muted/5"><LifeBuoy className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" /><p className="text-[13px] text-muted-foreground">No tickets matching criteria.</p></div>
      ) : (
        <div className="space-y-2">
          {filteredTickets.map((ticket) => (
            <div key={ticket.id as string} className="rounded-lg bg-background border border-border shadow-sm hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between p-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[13px] font-semibold text-foreground truncate">{ticket.subject as string}</h3>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${statusColors[ticket.status as string] || 'text-muted-foreground bg-muted'}`}>{ticket.status as string}</span>
                    <span className="text-[10px] text-muted-foreground capitalize bg-muted/30 px-1.5 py-0.5 rounded">{ticket.priority as string}</span>
                  </div>
                  <p className="text-[12px] text-muted-foreground line-clamp-1">{ticket.description as string}</p>
                </div>
                <span className="text-[11px] text-muted-foreground whitespace-nowrap ml-4 shrink-0">{new Date(ticket.created_at as string).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 pb-3 flex-wrap">
                {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                  <>
                    <button onClick={() => updateTicketStatus(ticket.id as string, 'resolved')} disabled={actionLoading === ticket.id} className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors">
                      {actionLoading === ticket.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}Resolve
                    </button>
                    <button onClick={() => updateTicketStatus(ticket.id as string, 'closed')} disabled={actionLoading === ticket.id} className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider bg-muted/50 text-muted-foreground hover:bg-muted transition-colors">
                      <XIcon className="h-3 w-3" />Close
                    </button>
                  </>
                )}
                {ticket.status === 'resolved' && (
                  <button onClick={() => updateTicketStatus(ticket.id as string, 'open')} disabled={actionLoading === ticket.id} className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors">
                    <RefreshCw className="h-3 w-3" />Reopen
                  </button>
                )}
                <button onClick={() => handleTicketExpand(ticket.id as string)} className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary hover:bg-primary/20 transition-colors ml-auto">
                  {expandedTicket === ticket.id ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  <MessageSquare className="h-3 w-3" />Thread
                </button>
              </div>

              {expandedTicket === ticket.id && (
                <div className="px-3 pb-3 pt-2 border-t border-border/50 space-y-2">
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {ticketReplies.length > 0 ? ticketReplies.map((reply) => (
                      <div key={reply.id as string} className={`flex ${reply.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-md px-3 py-2 text-[12px] ${reply.sender_type === 'admin' ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50 border border-border'}`}>
                          <p className="text-[10px] text-muted-foreground mb-0.5 capitalize font-semibold">{reply.sender_type as string}</p>
                          <p className="text-foreground">{reply.message as string}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{new Date(reply.created_at as string).toLocaleString()}</p>
                        </div>
                      </div>
                    )) : <p className="text-[11px] text-muted-foreground text-center py-3">No replies yet.</p>}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendTicketReply(ticket.id as string)} placeholder="Type reply..." className="flex-1 px-3 py-1.5 rounded-md bg-background border border-border text-[13px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" />
                    <button onClick={() => sendTicketReply(ticket.id as string)} disabled={replyLoading || !replyText.trim()} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                      {replyLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
