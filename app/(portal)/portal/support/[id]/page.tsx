'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Send, Clock, AlertCircle, CheckCircle2, Loader2, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { fadeUp, stagger } from '@/lib/animations'

export default function TicketDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [ticket, setTicket] = useState<any>(null)
  const [replies, setReplies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function loadTicket() {
      try {
        const supabase = createClient()
        
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError || !userData.user) {
          setError('Authentication required')
          setLoading(false)
          return
        }
        
        setUser(userData.user)

        const { data, error } = await supabase
          .from('support_tickets')
          .select('*')
          .eq('id', id)
          .eq('user_id', userData.user.id)
          .single()

        if (error) throw error
        setTicket(data)

        // Try to fetch replies, ignore error if table doesn't exist
        const { data: repliesData, error: repliesError } = await supabase
          .from('ticket_replies')
          .select('*')
          .eq('ticket_id', id)
          .order('created_at', { ascending: true })

        if (!repliesError && repliesData) {
          setReplies(repliesData)
        }
      } catch (err: any) {
        console.error('Error loading ticket:', err)
        setError('Ticket not found or you do not have permission to view it.')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadTicket()
    }
  }, [id])

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyMessage.trim() || !user || !ticket) return

    setSendingReply(true)
    try {
      const supabase = createClient()
      const newReply = {
        ticket_id: id,
        user_id: user.id,
        message: replyMessage.trim()
      }

      const { error } = await supabase
        .from('ticket_replies')
        .insert([newReply])

      if (error) {
        console.error('Error saving reply:', error)
        // If table doesn't exist, we just simulate success or handle gracefully
        if (error.code === '42P01') {
           alert('Reply system is currently unavailable.')
           return
        }
        throw error
      }

      // Add optimistic reply
      setReplies([...replies, { ...newReply, created_at: new Date().toISOString() }])
      setReplyMessage('')
    } catch (err) {
      console.error('Failed to send reply:', err)
      alert('Failed to send reply. Please try again.')
    } finally {
      setSendingReply(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-text-muted-v4 mb-4" />
        <p className="text-text-secondary-v4">Loading ticket...</p>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="v4-panel border-hairline p-8 flex flex-col items-center text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-medium text-text-primary-v4 mb-2">Error Loading Ticket</h2>
        <p className="text-text-secondary-v4 mb-6">{error}</p>
        <Link href="/portal/support" className="v4-btn-primary rounded-btn inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Support
        </Link>
      </div>
    )
  }

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={stagger}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
        <Link 
          href="/portal/support" 
          className="inline-flex items-center gap-2 text-text-secondary-v4 hover:text-text-primary-v4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tickets
        </Link>
      </motion.div>

      <motion.div variants={fadeUp} className="v4-panel border-hairline p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 pb-6 border-b border-white/5">
          <div>
            <h1 className="text-2xl font-medium text-text-primary-v4 mb-2">{ticket.subject}</h1>
            <div className="flex items-center gap-4 text-sm text-text-muted-v4">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date(ticket.created_at).toLocaleDateString()}
              </span>
              <span>Ticket #{ticket.id.slice(0, 8)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1.5 ${
              ticket.status === 'open' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
              ticket.status === 'closed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
              'bg-blue-500/10 text-blue-500 border border-blue-500/20'
            }`}>
              {ticket.status === 'closed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
              {ticket.status?.toUpperCase() || 'OPEN'}
            </span>
            
            <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1.5 ${
              ticket.priority === 'high' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
              ticket.priority === 'medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
              'bg-white/5 text-text-secondary-v4 border border-white/10'
            }`}>
              <AlertCircle className="w-3.5 h-3.5" />
              {ticket.priority?.toUpperCase() || 'NORMAL'}
            </span>
          </div>
        </div>

        <div className="prose prose-invert max-w-none text-text-secondary-v4 whitespace-pre-wrap mb-8">
          {ticket.description}
        </div>
      </motion.div>

      {/* Replies Section */}
      <motion.div variants={fadeUp} className="space-y-6">
        <h3 className="text-lg font-medium text-text-primary-v4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Conversation
        </h3>

        <div className="space-y-4">
          {replies.map((reply, index) => (
            <div 
              key={reply.id || index} 
              className={`v4-panel border-hairline p-5 ${reply.user_id === user?.id ? 'ml-8 md:ml-12 border-white/10' : 'mr-8 md:mr-12 bg-white/[0.02]'}`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="font-medium text-text-primary-v4">
                  {reply.user_id === user?.id ? 'You' : 'Support Team'}
                </span>
                <span className="text-xs text-text-muted-v4 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(reply.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-text-secondary-v4 whitespace-pre-wrap text-sm leading-relaxed">
                {reply.message}
              </p>
            </div>
          ))}
        </div>

        {ticket.status !== 'closed' && (
          <form onSubmit={handleSendReply} className="v4-panel border-hairline p-4 mt-6">
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Type your reply here..."
              className="w-full bg-transparent border-0 text-text-primary-v4 placeholder:text-text-muted-v4 resize-none focus:ring-0 p-2 min-h-[100px]"
              required
            />
            <div className="flex justify-end mt-4 pt-4 border-t border-white/5">
              <button
                type="submit"
                disabled={sendingReply || !replyMessage.trim()}
                className="v4-btn-primary rounded-btn inline-flex items-center gap-2 px-6"
              >
                {sendingReply ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Send Reply
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  )
}
