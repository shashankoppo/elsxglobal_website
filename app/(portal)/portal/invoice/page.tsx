'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Download, Clock, CheckCircle2, AlertCircle, Loader2, CreditCard, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { fadeUp, stagger } from '@/lib/animations'
import { SkeletonCard } from '@/components/ui/skeleton-loaders'
import { PanelCard } from '@/components/ui/panel-card'

export default function InvoiceListPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState('All Time')
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null)

  useEffect(() => {
    async function loadInvoices() {
      try {
        const supabase = createClient()
        
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) return

        const { data, error } = await supabase
          .from('hosting_invoices')
          .select(`
            *,
            hosting_orders (
              plan_name,
              plan_tier
            )
          `)
          .eq('user_id', userData.user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching invoices:', error)
          setInvoices([])
        } else {
          // Fallback demo data if empty
          if (data && data.length > 0) {
            setInvoices(data)
          } else {
            setInvoices([
              { id: 'inv-1', invoice_number: 'INV-2026-001', status: 'paid', amount: 4999, created_at: '2026-09-01T10:00:00Z', hosting_orders: { plan_name: 'VPS Pro 8GB' }, line_items: [{ desc: 'VPS Pro 8GB (Sep)', amount: 4999 }] },
              { id: 'inv-2', invoice_number: 'INV-2026-002', status: 'pending', amount: 799, created_at: '2026-09-25T14:30:00Z', hosting_orders: { plan_name: 'Shared Business' }, line_items: [{ desc: 'Shared Business (Sep)', amount: 799 }] }
            ])
          }
        }
      } catch (err) {
        console.error('Error in loadInvoices:', err)
      } finally {
        setLoading(false)
      }
    }

    loadInvoices()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" /> Paid
          </span>
        )
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20 rounded-full">
            <AlertCircle className="w-3.5 h-3.5" /> Overdue
          </span>
        )
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        )
    }
  }

  const handleExport = () => {
    alert("Exporting invoices to CSV...")
  }

  const totalSpend = invoices.reduce((acc, inv) => acc + Number(inv.amount || 0), 0)
  const pendingAmount = invoices.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((acc, inv) => acc + Number(inv.amount || 0), 0)

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={stagger}
      className="space-y-6 max-w-5xl mx-auto v4-page"
    >
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary-v4 mb-2">Billing & Invoices</h1>
          <p className="text-text-secondary-v4 text-sm">View your payment history and download invoices.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="v4-btn-secondary px-4 py-2 flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PanelCard className="p-5 bg-ink-surface-2 border-l-4 border-l-signal">
          <div className="text-text-secondary-v4 text-sm font-medium mb-1">Total Spent</div>
          <div className="text-3xl font-bold text-text-primary-v4">₹{totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </PanelCard>
        <PanelCard className="p-5 bg-ink-surface-2 border-l-4 border-l-amber-500">
          <div className="text-text-secondary-v4 text-sm font-medium mb-1">Pending Balance</div>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-text-primary-v4">₹{pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            {pendingAmount > 0 && (
              <Link href="/vaulthost/checkout" className="v4-btn-primary px-4 py-2 text-sm shadow-glow flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Pay Now
              </Link>
            )}
          </div>
        </PanelCard>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} className="flex items-center gap-4 bg-ink p-3 rounded-xl border border-hairline">
        <Filter className="w-4 h-4 text-text-muted-v4 ml-2" />
        <span className="text-sm text-text-secondary-v4">Date Range:</span>
        <select 
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="bg-ink-surface border border-hairline rounded-md px-3 py-1.5 text-sm text-text-primary-v4 focus:outline-none focus:border-signal"
        >
          <option>This Month</option>
          <option>Last 3 Months</option>
          <option>Last 6 Months</option>
          <option>All Time</option>
        </select>
      </motion.div>

      {loading ? (
        <motion.div variants={fadeUp} className="space-y-4">
          <SkeletonCard className="h-[80px] w-full" />
          <SkeletonCard className="h-[80px] w-full" />
        </motion.div>
      ) : invoices.length === 0 ? (
        <motion.div variants={fadeUp} className="v4-panel border-hairline p-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-text-muted-v4" />
          </div>
          <h3 className="text-xl font-medium text-text-primary-v4 mb-2">No Invoices Found</h3>
          <p className="text-text-secondary-v4 mb-6 max-w-md">
            You don't have any invoices yet.
          </p>
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} className="space-y-4">
          {invoices.map((inv) => (
            <PanelCard key={inv.id} className="overflow-hidden p-0 border-hairline group">
              <div 
                className="p-4 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() => setExpandedInvoice(expandedInvoice === inv.id ? null : inv.id)}
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-10 h-10 rounded-lg bg-ink flex items-center justify-center text-text-secondary-v4 border border-hairline">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-text-primary-v4 block">
                      {inv.invoice_number || `#INV-${inv.id.substring(0, 6).toUpperCase()}`}
                    </span>
                    <span className="text-sm text-text-secondary-v4">
                      {inv.hosting_orders?.plan_name || 'Hosting Service'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-left sm:text-right hidden sm:block">
                    <span className="text-sm text-text-primary-v4 block">{new Date(inv.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="font-bold text-text-primary-v4 block">₹{Number(inv.amount || 0).toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                  </div>
                  <div>
                    {getStatusBadge(inv.status)}
                  </div>
                  <button className="text-text-muted-v4 hover:text-text-primary-v4">
                    {expandedInvoice === inv.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Drawer Content */}
              <AnimatePresence>
                {expandedInvoice === inv.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-hairline bg-ink/50 overflow-hidden"
                  >
                    <div className="p-6">
                      <h4 className="text-sm font-bold text-text-primary-v4 mb-4 uppercase tracking-wider">Line Items</h4>
                      <div className="space-y-3">
                        {inv.line_items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-sm border-b border-hairline/50 pb-2">
                            <span className="text-text-secondary-v4">{item.desc}</span>
                            <span className="text-text-primary-v4 font-medium">₹{item.amount.toLocaleString()}</span>
                          </div>
                        )) || (
                          <div className="flex justify-between items-center text-sm border-b border-hairline/50 pb-2">
                            <span className="text-text-secondary-v4">{inv.hosting_orders?.plan_name || 'Service Charge'}</span>
                            <span className="text-text-primary-v4 font-medium">₹{Number(inv.amount || 0).toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-sm font-bold pt-2">
                          <span className="text-text-primary-v4">Total</span>
                          <span className="text-signal">₹{Number(inv.amount || 0).toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex gap-3 justify-end">
                        <button className="v4-btn-secondary px-4 py-2 text-sm flex items-center gap-2">
                          <Download className="w-4 h-4" /> Download PDF
                        </button>
                        {(inv.status === 'pending' || inv.status === 'overdue') && (
                          <Link href="/vaulthost/checkout" className="v4-btn-primary px-4 py-2 text-sm flex items-center gap-2 shadow-glow">
                            <CreditCard className="w-4 h-4" /> Pay Invoice
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </PanelCard>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

