'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { SkeletonCard } from '@/components/ui/skeleton-loaders';
import { Mail, Plus, Clock, MessageSquare, Loader2, BookOpen, ChevronRight, LifeBuoy, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeUp, stagger } from '@/lib/animations';

export default function SupportTicketsPage() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();
        if (!authData?.user) { setLoading(false); return; }
        setUser({ id: authData.user.id, email: authData.user.email || '' });

        const { data } = await supabase
          .from('support_tickets')
          .select('*')
          .eq('user_id', authData.user.id)
          .order('created_at', { ascending: false });
        
        setTickets(data || []);
      } catch (e) {
        console.error('Error fetching tickets:', e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim() || !user) return;
    setSubmitting(true);
    setError('');
    try {
      const supabase = createClient();
      let { data, error: insertError } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          title: newTitle.trim(),
          message: newMessage.trim(),
          priority: newPriority,
          status: 'open'
        })
        .select()
        .single();

      if (insertError) {
        const retry = await supabase.from('support_tickets').insert({
          user_id: user.id,
          subject: newTitle.trim(),
          description: newMessage.trim(),
          priority: newPriority,
          status: 'open'
        }).select().single();
        data = retry.data;
        insertError = retry.error;
      }

      if (insertError) {
        setError('Failed to create ticket. Please try again.');
        return;
      }

      if (data) {
        setTickets([data, ...tickets]);
        setShowNew(false);
        setNewTitle('');
        setNewMessage('');
        setNewPriority('medium');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || 'open').toLowerCase().replace(' ', '_');
    switch (s) {
      case 'open': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'in_progress': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'resolved': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'closed': return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
      default: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  if (loading) {
    return (
      <div className="v4-page space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-muted/40" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="v4-page">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-signal font-mono">Portal</span>
            <span className="text-text-muted-v4 text-xs">/</span>
            <span className="text-xs text-text-primary-v4 font-medium">Support</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary-v4 mt-1 flex items-center gap-2.5">
            <LifeBuoy className="h-6 w-6 text-signal" /> Help & Support
          </h1>
          <p className="text-xs text-text-secondary-v4 mt-0.5">Manage your support requests or find answers in our knowledge base.</p>
        </div>
        <button
          onClick={() => setShowNew(!showNew)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-btn v4-btn-primary text-xs font-semibold shadow-glow"
        >
          {showNew ? 'Cancel' : <><Plus className="h-4 w-4" /> New Ticket</>}
        </button>
      </div>

      {!showNew && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {['How to deploy a Worker', 'Setting up custom domains', 'VaultAI Gateway setup guide', 'Upgrading your hosting plan', 'SSL/TLS configuration', 'Billing and payment methods'].map((title, i) => (
            <div key={i} className="p-4 rounded-xl bg-ink-surface hover:bg-ink-surface-2 border border-hairline transition-colors flex flex-col justify-between group">
              <h3 className="text-sm font-semibold text-text-primary-v4 mb-2 flex items-start gap-2">
                <BookOpen className="h-4 w-4 text-signal mt-0.5 shrink-0" /> {title}
              </h3>
              <div className="flex items-center justify-end text-xs text-signal font-medium group-hover:translate-x-1 transition-transform">
                Read More <ChevronRight className="h-3 w-3 ml-1" />
              </div>
            </div>
          ))}
        </div>
      )}

      {showNew && (
        <motion.form variants={fadeUp} onSubmit={handleCreateTicket} className="v4-panel p-6 border-hairline rounded-2xl bg-ink-surface mb-8">
          <h2 className="text-lg font-bold text-text-primary-v4 mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5 text-signal" /> Submit a Ticket
          </h2>
          {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
          <div className="space-y-4 max-w-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-primary-v4 mb-1">Ticket Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full bg-ink-surface-2 border border-hairline rounded-xl px-3 py-2 text-xs text-text-primary-v4 outline-none focus:border-signal"
                  placeholder="Brief summary of your issue"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-primary-v4 mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full bg-ink-surface-2 border border-hairline rounded-xl px-3 py-2 text-xs text-text-primary-v4 outline-none focus:border-signal"
                >
                  <option value="low">Low (P4)</option>
                  <option value="medium">Medium (P3)</option>
                  <option value="high">High (P2)</option>
                  <option value="critical">Critical (P1)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-primary-v4 mb-1">Message</label>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                required
                rows={4}
                className="w-full bg-ink-surface-2 border border-hairline rounded-xl px-3 py-2 text-xs text-text-primary-v4 outline-none focus:border-signal resize-none"
                placeholder="Describe your issue or question in detail..."
              />
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-hairline/50">
              <div className="text-[10px] text-text-muted-v4 font-mono">
                P1: &lt;1hr SLA • P2: &lt;4hr SLA • P3: &lt;24hr SLA • P4: &lt;72hr SLA
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-btn v4-btn-primary text-xs font-semibold disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Submit Ticket
              </button>
            </div>
          </div>
        </motion.form>
      )}

      <motion.div variants={fadeUp} className="space-y-4">
        {tickets.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-2xl bg-ink-surface border border-dashed border-hairline">
            <LifeBuoy className="h-16 w-16 text-text-muted-v4 mx-auto mb-4 opacity-50" />
            <h3 className="text-base font-bold text-text-primary-v4 mb-1">How can we help?</h3>
            <p className="text-xs text-text-secondary-v4 max-w-md mx-auto mb-6">You don&apos;t have any open support tickets.</p>
            <button onClick={() => setShowNew(true)} className="px-4 py-2 rounded-btn v4-btn-secondary text-xs font-semibold border-hairline">
              Open a Ticket
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {tickets.map((ticket) => (
              <Link 
                key={ticket.id} 
                href={`/portal/support/${ticket.id}`}
                className="v4-panel p-4 border border-hairline rounded-xl bg-ink-surface hover:bg-ink-surface-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-ink-surface-2 border-hairline text-signal group-hover:border-signal/50 transition-colors">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary-v4 text-sm group-hover:text-signal transition-colors line-clamp-1">
                      {ticket.title || ticket.subject || 'Support Ticket'}
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] text-text-muted-v4 mt-1 font-mono">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(ticket.created_at).toLocaleDateString()}</span>
                      <span className="border-l border-hairline pl-3">ID: #{ticket.id.slice(0, 8)}</span>
                      <span className="capitalize border-l border-hairline pl-3">
                        Priority: <strong className={ticket.priority === 'high' || ticket.priority === 'critical' ? 'text-red-400' : 'text-text-primary-v4'}>{ticket.priority || 'medium'}</strong>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase border ${getStatusBadge(ticket.status)}`}>
                    {(ticket.status || 'open').replace('_', ' ')}
                  </span>
                  <div className="p-2 rounded-lg bg-ink-surface-2 border border-hairline text-text-muted-v4 group-hover:text-signal transition-colors">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
