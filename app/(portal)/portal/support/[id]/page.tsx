'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Clock, AlertCircle, Loader2, MessageSquare } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { fadeUp, stagger } from '@/lib/animations';

export default function TicketDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [ticket, setTicket] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadTicket() {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
          setError('Authentication required');
          setLoading(false);
          return;
        }
        setUser(userData.user);

        let ticketData: any = null;
        let repliesData: any[] = [];

        try {
          const { data, error: fetchErr } = await supabase
            .from('support_tickets')
            .select('*, support_replies(*)')
            .eq('id', id)
            .single();

          if (!fetchErr && data) {
            ticketData = data;
            if (Array.isArray(data.support_replies)) repliesData = data.support_replies;
          } else {
            throw fetchErr;
          }
        } catch {
          const { data: singleTicket, error: singleErr } = await supabase
            .from('support_tickets')
            .select('*')
            .eq('id', id)
            .single();

          if (singleErr || !singleTicket) throw new Error('Ticket not found');
          ticketData = singleTicket;

          const { data: repList } = await supabase
            .from('support_replies')
            .select('*')
            .eq('ticket_id', id)
            .order('created_at', { ascending: true });

          if (repList && repList.length > 0) {
            repliesData = repList;
          } else {
            const { data: fallbackRep } = await supabase
              .from('ticket_replies')
              .select('*')
              .eq('ticket_id', id)
              .order('created_at', { ascending: true });
            if (fallbackRep) repliesData = fallbackRep;
          }
        }

        setTicket(ticketData);
        setReplies(repliesData.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
      } catch (err: any) {
        console.error('Error loading ticket:', err);
        setError('Ticket not found or you do not have permission to view it.');
      } finally {
        setLoading(false);
      }
    }

    if (id) loadTicket();
  }, [id]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !user || !ticket) return;

    setSendingReply(true);
    try {
      const supabase = createClient();
      const newReply = {
        ticket_id: id,
        user_id: user.id,
        message: replyMessage.trim(),
        is_staff: false
      };

      const { data, error: insertError } = await supabase.from('support_replies').insert([newReply]).select();

      if (insertError) {
        console.warn('support_replies insert fallback:', insertError);
        await supabase.from('ticket_replies').insert([{ ticket_id: id, user_id: user.id, message: replyMessage.trim() }]);
      }

      setReplies((prev) => [
        ...prev,
        {
          ...(data?.[0] || newReply),
          id: data?.[0]?.id || `reply_${Date.now()}`,
          created_at: new Date().toISOString()
        }
      ]);
      setReplyMessage('');
    } catch (err) {
      console.error('Failed to send reply:', err);
      alert('Failed to send reply. Please try again.');
    } finally {
      setSendingReply(false);
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
      <div className="v4-page flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-signal mb-4" />
        <p className="text-xs text-text-secondary-v4 font-mono">Loading ticket details...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="v4-page max-w-4xl mx-auto py-12">
        <div className="v4-panel border-hairline p-8 flex flex-col items-center text-center rounded-2xl bg-ink-surface">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-text-primary-v4 mb-2">Error Loading Ticket</h2>
          <p className="text-sm text-text-secondary-v4 mb-6">{error || 'Ticket not found'}</p>
          <Link href="/portal/support" className="v4-btn-primary rounded-btn inline-flex items-center gap-2 text-xs py-2 px-4">
            <ArrowLeft className="w-4 h-4" /> Back to Support
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="v4-page max-w-4xl mx-auto space-y-6">
      <motion.div variants={fadeUp} className="flex items-center justify-between mb-4">
        <Link href="/portal/support" className="inline-flex items-center gap-2 text-xs text-text-secondary-v4 hover:text-signal transition-colors font-mono">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Tickets
        </Link>
      </motion.div>

      {/* Ticket Header */}
      <motion.div variants={fadeUp} className="v4-panel border border-hairline p-6 rounded-2xl bg-ink-surface">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4 pb-4 border-b border-hairline">
          <div>
            <h1 className="text-2xl font-bold text-text-primary-v4 mb-2">
              {ticket.title || ticket.subject || 'Support Ticket'}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted-v4 font-mono">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(ticket.created_at).toLocaleString()}</span>
              <span className="border-l border-hairline pl-3">ID: #{ticket.id.slice(0, 8)}</span>
              <span className="capitalize border-l border-hairline pl-3">
                Priority: <strong className={ticket.priority === 'high' || ticket.priority === 'critical' ? 'text-red-400' : 'text-text-primary-v4'}>{ticket.priority || 'medium'}</strong>
              </span>
            </div>
          </div>
          <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full border ${getStatusBadge(ticket.status)}`}>
            {(ticket.status || 'open').replace('_', ' ')}
          </span>
        </div>
        <div className="text-sm text-text-secondary-v4 whitespace-pre-wrap leading-relaxed bg-ink-surface-2 p-4 rounded-xl border border-hairline">
          {ticket.message || ticket.description || 'No initial description provided.'}
        </div>
      </motion.div>

      {/* Reply Thread */}
      <motion.div variants={fadeUp} className="space-y-4">
        <h3 className="text-base font-bold text-text-primary-v4 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-signal" /> Conversation & Updates
        </h3>

        {replies.length === 0 ? (
          <div className="p-6 rounded-xl bg-ink-surface border border-dashed border-hairline text-center text-xs text-text-muted-v4">
            No replies yet. Our support team will review your ticket shortly.
          </div>
        ) : (
          <div className="space-y-3">
            {replies.map((reply, index) => {
              const isStaff = Boolean(reply.is_staff);
              const initial = isStaff ? 'S' : (user?.email ? user.email.slice(0, 1).toUpperCase() : 'U');
              return (
                <div key={reply.id || index} className={`p-4 rounded-xl border bg-ink-surface flex items-start gap-3.5 ${isStaff ? 'border-signal/30 bg-signal/5' : 'border-hairline'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isStaff ? 'bg-signal text-black font-bold' : 'bg-ink-surface-2 text-text-primary-v4 border border-hairline'}`}>
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-text-primary-v4 flex items-center gap-1.5">
                        {isStaff ? 'ELSx Support Staff' : 'You'}
                        {isStaff && <span className="text-[10px] bg-signal/20 text-signal px-1.5 rounded font-mono">Staff</span>}
                      </span>
                      <span className="text-[11px] text-text-muted-v4 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {reply.created_at ? new Date(reply.created_at).toLocaleString() : 'Just now'}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary-v4 whitespace-pre-wrap leading-relaxed mt-1">{reply.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {ticket.status !== 'closed' && (
          <form onSubmit={handleSendReply} className="v4-panel border border-hairline p-4 rounded-xl bg-ink-surface mt-4">
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Type your reply here..."
              rows={3}
              className="w-full bg-ink-surface-2 border border-hairline rounded-lg text-xs text-text-primary-v4 placeholder:text-text-muted-v4 p-3 outline-none focus:border-signal resize-none"
              required
            />
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                disabled={sendingReply || !replyMessage.trim()}
                className="v4-btn-primary rounded-btn inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold disabled:opacity-50"
              >
                {sendingReply ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Send Reply
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
